from __future__ import annotations

import json
import os
import sys
import threading
import time
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


if getattr(sys, "frozen", False):
    ROOT = Path(sys.executable).resolve().parent
else:
    ROOT = Path(__file__).resolve().parents[1]
HOST = "127.0.0.1"
PORT = int(os.environ.get("DATALENS_PORT", "8787"))
TARGET_URL = os.environ.get("DATALENS_LLM_URL", "https://sorryios.ai/codex").rstrip("/")


def llm_endpoint_candidates(raw_url: str) -> list[tuple[str, str]]:
    clean = raw_url.rstrip("/")
    candidates: list[tuple[str, str]] = []

    def add(kind: str, url: str) -> None:
        item = (kind, url)
        if item not in candidates:
            candidates.append(item)

    if clean.endswith("/responses"):
        add("responses", clean)
        return candidates
    if clean.endswith("/chat/completions"):
        add("chat", clean)
        return candidates
    if clean.endswith("/v1"):
        add("responses", f"{clean}/responses")
        add("chat", f"{clean}/chat/completions")
        return candidates

    add("responses", f"{clean}/v1/responses")
    add("responses", f"{clean}/responses")
    add("chat", f"{clean}/v1/chat/completions")
    add("chat", f"{clean}/chat/completions")
    add("chat", clean)
    return candidates


def chat_payload_to_responses(payload: dict[str, object]) -> bytes:
    response_payload: dict[str, object] = {
        "model": payload.get("model"),
        "input": messages_to_prompt(payload.get("messages", [])),
    }
    if payload.get("temperature") is not None:
        response_payload["temperature"] = payload["temperature"]
    if payload.get("max_tokens") is not None:
        response_payload["max_output_tokens"] = payload["max_tokens"]
    if payload.get("max_completion_tokens") is not None:
        response_payload["max_output_tokens"] = payload["max_completion_tokens"]
    return json.dumps(response_payload).encode("utf-8")


def messages_to_prompt(messages: object) -> str:
    if not isinstance(messages, list):
        return str(messages)

    parts: list[str] = []
    for item in messages:
        if not isinstance(item, dict):
            continue
        role = str(item.get("role", "user")).upper()
        content = message_content_to_text(item.get("content", ""))
        if content:
            parts.append(f"{role}:\n{content}")
    return "\n\n".join(parts)


def message_content_to_text(content: object) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts: list[str] = []
        for item in content:
            if isinstance(item, str):
                parts.append(item)
            elif isinstance(item, dict):
                text = item.get("text") or item.get("content")
                if text:
                    parts.append(str(text))
        return "\n".join(parts)
    return str(content)


def responses_to_chat_payload(body: bytes) -> dict[str, object]:
    data = json.loads(body.decode("utf-8", errors="replace"))
    content = extract_response_text(data)
    if not content:
        raise ValueError("Responses API returned no message content")
    return {
        "choices": [
            {
                "message": {
                    "role": "assistant",
                    "content": content,
                }
            }
        ],
        "raw_response": data,
    }


def extract_response_text(value: object) -> str:
    if isinstance(value, str):
        return value
    if not isinstance(value, dict):
        return ""

    for key in ("output_text", "content"):
        text = value.get(key)
        if isinstance(text, str) and text.strip():
            return text

    choices = value.get("choices")
    if isinstance(choices, list) and choices:
        first = choices[0]
        if isinstance(first, dict):
            message = first.get("message")
            if isinstance(message, dict):
                text = extract_response_text(message)
                if text:
                    return text

    output = value.get("output")
    if isinstance(output, list):
        parts: list[str] = []
        for item in output:
            if isinstance(item, dict):
                content = item.get("content")
                if isinstance(content, list):
                    for block in content:
                        if isinstance(block, dict):
                            text = block.get("text") or block.get("content")
                            if isinstance(text, str):
                                parts.append(text)
                        elif isinstance(block, str):
                            parts.append(block)
                text = item.get("text")
                if isinstance(text, str):
                    parts.append(text)
        if parts:
            return "\n".join(parts).strip()

    return ""


def compact_error(text: str) -> str:
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        return text[:300]

    error = data.get("error")
    if isinstance(error, dict):
        message = error.get("message")
        if isinstance(message, str):
            return message[:300]
    if isinstance(error, str):
        return error[:300]
    msg = data.get("msg") or data.get("message")
    if isinstance(msg, str):
        return msg[:300]
    return text[:300]


def best_error(errors: list[str]) -> str:
    for error in errors:
        if "404" not in error:
            return error
    return errors[-1] if errors else "LLM proxy request failed"


class DataLensHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        super().end_headers()

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.end_headers()

    def do_POST(self) -> None:
        if self.path.rstrip("/") != "/api/llm":
            self.send_error(404, "Unknown endpoint")
            return

        length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(length)
        api_key = self.headers.get("Authorization", "").replace("Bearer ", "", 1).strip()
        if not api_key:
            self.send_json({"error": "Missing Authorization bearer token"}, status=401)
            return

        try:
            incoming_payload = json.loads(body.decode("utf-8"))
        except json.JSONDecodeError:
            self.send_json({"error": "Invalid JSON request body"}, status=400)
            return
        if not isinstance(incoming_payload, dict):
            self.send_json({"error": "JSON request body must be an object"}, status=400)
            return

        errors: list[str] = []
        for kind, candidate in llm_endpoint_candidates(TARGET_URL):
            outgoing_body = chat_payload_to_responses(incoming_payload) if kind == "responses" else body
            request = Request(
                candidate,
                data=outgoing_body,
                headers={
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": f"Bearer {api_key}",
                    "User-Agent": "Mozilla/5.0 DataLensAgent/1.0",
                },
                method="POST",
            )
            try:
                with urlopen(request, timeout=45) as response:
                    payload = response.read()
                    if kind == "responses":
                        try:
                            self.send_json(responses_to_chat_payload(payload), status=response.status)
                            return
                        except (json.JSONDecodeError, ValueError) as error:
                            errors.append(f"{kind} {candidate}: {error}")
                            continue
                    self.send_response(response.status)
                    self.send_header("Content-Type", response.headers.get("Content-Type", "application/json"))
                    self.send_header("Content-Length", str(len(payload)))
                    self.end_headers()
                    self.wfile.write(payload)
                    return
            except HTTPError as error:
                text = error.read().decode("utf-8", errors="replace")
                errors.append(f"{kind} {candidate}: {error.code} {compact_error(text)}")
            except (TimeoutError, URLError, OSError) as error:
                errors.append(f"{kind} {candidate}: {error}")

        self.send_json({"error": best_error(errors)}, status=502)

    def send_json(self, payload: dict[str, object], status: int) -> None:
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


def main() -> None:
    url = f"http://{HOST}:{PORT}/index.html"
    try:
        server = ThreadingHTTPServer((HOST, PORT), DataLensHandler)
    except OSError:
        print(f"DataLens appears to be running already: {url}")
        open_browser(url)
        input("Press Enter to close this launcher window.")
        return

    print(f"DataLens server: {url}")
    print(f"LLM proxy target: {TARGET_URL}")
    print("Press Ctrl+C to stop.")
    if "--no-open" not in sys.argv:
        threading.Thread(target=open_browser, args=(url,), daemon=True).start()
    server.serve_forever()


def open_browser(url: str) -> None:
    time.sleep(0.8)
    webbrowser.open(url)


if __name__ == "__main__":
    main()
