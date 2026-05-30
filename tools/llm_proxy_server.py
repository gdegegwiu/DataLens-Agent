from __future__ import annotations

import json
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
HOST = "127.0.0.1"
PORT = int(os.environ.get("DATALENS_PORT", "8787"))
TARGET_URL = os.environ.get("DATALENS_LLM_URL", "https://sorryios.ai/codex").rstrip("/")


def chat_completion_candidates(raw_url: str) -> list[str]:
    clean = raw_url.rstrip("/")
    if clean.endswith("/chat/completions"):
        return [clean]
    if clean.endswith("/v1"):
        return [f"{clean}/chat/completions", clean]
    return [f"{clean}/v1/chat/completions", f"{clean}/chat/completions", clean]


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

        last_error = "LLM proxy request failed"
        for candidate in chat_completion_candidates(TARGET_URL):
            request = Request(
                candidate,
                data=body,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}",
                },
                method="POST",
            )
            try:
                with urlopen(request, timeout=45) as response:
                    payload = response.read()
                    self.send_response(response.status)
                    self.send_header("Content-Type", response.headers.get("Content-Type", "application/json"))
                    self.send_header("Content-Length", str(len(payload)))
                    self.end_headers()
                    self.wfile.write(payload)
                    return
            except HTTPError as error:
                text = error.read().decode("utf-8", errors="replace")
                last_error = f"{error.code} {text[:300]}"
            except (TimeoutError, URLError, OSError) as error:
                last_error = str(error)

        self.send_json({"error": last_error}, status=502)

    def send_json(self, payload: dict[str, object], status: int) -> None:
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


def main() -> None:
    server = ThreadingHTTPServer((HOST, PORT), DataLensHandler)
    print(f"DataLens server: http://{HOST}:{PORT}/index.html")
    print(f"LLM proxy target: {TARGET_URL}")
    print("Press Ctrl+C to stop.")
    server.serve_forever()


if __name__ == "__main__":
    main()
