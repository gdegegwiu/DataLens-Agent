# DataLens Agent

DataLens is a small intelligent software agent prototype for Assignment 2. It takes a CSV file, perceives the dataset structure, chooses analysis steps, executes those steps, creates plots, and summarizes findings.



## How to run

No installation is required for deterministic local analysis.

### One-click Windows launcher

On Windows, double-click [DataLensAgent.exe](DataLensAgent.exe). It starts the local web server, starts the local LLM proxy, and opens the app at `http://127.0.0.1:8787/index.html`.

Keep the launcher window open while using the app. Close that window when you want to stop the local server.

### Manual browser mode

1. Download or clone this repository.
2. Open [index.html](index.html) in a modern browser.
3. Use the language selector to switch between English, Chinese, and Māori.
4. Click the `+` button to load a small public `tips.csv` sample, or drag and drop your own `.csv` file into the upload zone.
5. Leave `Agent auto-decision` enabled if you want the agent to choose analysis steps and chart types from the CSV schema. Turn it off only if you want to manually choose steps and plots.
6. Click `Run analysis agent`.
7. Review the perceived dataset, chosen analysis steps, execution log, plots, and summary findings.
8. Click `Export analysis JSON` if you want to download the agent run state.

Extra comparison datasets are in [data](data): `iris.csv` and the full `tips.csv` can be uploaded through the file picker to show how the agent adapts to different CSV structures.

## Optional LLM mode

The agent can run without an LLM, but it also supports an LLM planner through `DataLensAgent.exe` or the included local proxy server. By default, the proxy uses Alibaba Cloud Model Studio / DashScope's OpenAI-compatible endpoint.

### Use your own Alibaba Cloud API key

1. Start the app with [DataLensAgent.exe](DataLensAgent.exe), or start the local server manually:

   ```powershell
   python tools\llm_proxy_server.py
   ```

2. Open `http://127.0.0.1:8787/index.html`.
3. Tick `Use LLM planner and summary`.
4. Keep the model as `qwen-plus`, or enter another model enabled in your Alibaba Cloud Model Studio workspace.
5. Paste your Model Studio / DashScope API key in the browser field.
6. Run the analysis.

The web page intentionally does not show the API base URL. Browser requests always go to the local `/api/llm` proxy, and the proxy forwards them to Alibaba Cloud. This avoids browser CORS problems and prevents API keys from being committed to Git.

### Change API endpoint, region, or provider

By default, the proxy forwards `/api/llm` to:

```text
https://dashscope.aliyuncs.com/compatible-mode/v1
```

Alibaba Cloud's OpenAI-compatible Model Studio API uses a base URL, API key, and model name. The Beijing endpoint is `https://dashscope.aliyuncs.com/compatible-mode/v1`; other documented endpoints include Singapore `https://dashscope-intl.aliyuncs.com/compatible-mode/v1`, US Virginia `https://dashscope-us.aliyuncs.com/compatible-mode/v1`, and Hong Kong `https://cn-hongkong.dashscope.aliyuncs.com/compatible-mode/v1`. See Alibaba Cloud's official OpenAI-compatible Model Studio documentation: <https://www.alibabacloud.com/help/en/model-studio/compatibility-of-openai-with-dashscope>.

To use another endpoint, start the app from PowerShell with `DATALENS_LLM_URL`:

```powershell
$env:DATALENS_LLM_URL="https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
.\DataLensAgent.exe
```

For manual Python mode:

```powershell
$env:DATALENS_LLM_URL="https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
python tools\llm_proxy_server.py
```

To use another OpenAI-compatible provider, set `DATALENS_LLM_URL` to that provider's base URL, keep the web page API URL hidden/defaulted to `/api/llm`, enter that provider's model name in the `Model` field, and paste that provider's API key in the browser.

The API key is not stored in this repository. It is saved only in the current browser's `localStorage` for convenience. If the LLM request fails, the app continues with the deterministic local analysis tools.

## Agent capabilities

- Perception: parses CSV, counts rows and columns, infers numeric, categorical, and date fields, and detects missing cells.
- Decision making: auto-selects analysis steps and chart types from detected column types by default; when LLM mode is configured, the LLM can refine the plan and final narrative, with deterministic fallback.
- Tool execution: runs selected schema inspection, numeric profiling, group comparison, relationship plotting, missing-value checks, outlier scans, trend analysis, custom notes, and summary generation.
- Action: creates selected chart types, chart-specific notes, execution log, LLM or deterministic natural-language findings, and JSON export.
- Memory: stores recent analysis events in `localStorage`.
- Safety: refuses requests that appear to involve secrets or sensitive identifiers.
- Multilingual UI: supports English, Chinese, and Māori language switching for the web interface and deterministic agent output.

## Project structure

```text
.
|-- DataLensAgent.exe
|-- index.html
|-- data/
|   |-- iris.csv
|   `-- tips.csv
|-- src/
|   |-- agent.js
|   `-- styles.css
|-- assets/
|   `-- system-design.svg
|-- Demo_video/
|   `-- DEMO.mp4
|-- screenshots/
|-- report/
|-- demo/
|   `-- demo_script.md
`-- tools/
    |-- build_report.py
    `-- llm_proxy_server.py
```
