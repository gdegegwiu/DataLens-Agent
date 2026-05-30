# DataLens Agent

DataLens is a small intelligent software agent prototype for Assignment 2. It takes a CSV file, perceives the dataset structure, chooses analysis steps, executes those steps, creates plots, and summarizes findings.

## Repository link

Replace this line after uploading the folder to GitHub:

`https://github.com/your-username/datalens-agent`

## Demo video

Suggested GitHub README link after recording/uploading the two-minute demo:

`demo/datalens_demo.mp4`

A short demo script is included at [demo/demo_script.md](demo/demo_script.md).

## How to run

No installation is required for deterministic local analysis.

### One-click Windows launcher

On Windows, double-click [DataLensAgent.exe](DataLensAgent.exe). It starts the local server and opens the app at `http://127.0.0.1:8787/index.html`.

Keep the launcher window open while using the app. Close that window when you want to stop the local server.

### Manual browser mode

1. Download or clone this repository.
2. Open [index.html](index.html) in a modern browser.
3. Use the language selector to switch between English, Chinese, and Māori.
4. Click the `+` button to load a small public `tips.csv` sample, or upload your own `.csv` file.
5. In `Chosen analysis steps`, tick any extra steps you want, such as missing values, outliers, or trends. You can also choose chart types, including bar, scatter, histogram, pie, and line charts, or type a custom analysis instruction.
6. Click `Run analysis agent`.
7. Review the perceived dataset, chosen analysis steps, execution log, plots, and summary findings.
8. Click `Export analysis JSON` if you want to download the agent run state.

Extra comparison datasets are in [data](data): `iris.csv` and the full `tips.csv` can be uploaded through the file picker to show how the agent adapts to different CSV structures.

## Optional LLM mode

The agent can run without an LLM, but it also supports an LLM planner through `DataLensAgent.exe` or the included local proxy server. The proxy adapts the browser request to the configured relay, including the `https://sorryios.ai/codex` Responses API path.

1. Start the local server:

   ```powershell
   python tools\llm_proxy_server.py
   ```

2. Open `http://127.0.0.1:8787/index.html`.
3. Tick `Use LLM planner and summary`.
4. Keep the API URL as `/api/llm`.
5. Enter the model name. For the Sorryios Codex relay, start with `gpt-5-codex` or the model name shown by that service.
6. Paste the API key in the browser field.
7. Run the analysis.

The proxy forwards `/api/llm` to `https://sorryios.ai/codex` by default. To use a different relay target, set `DATALENS_LLM_URL` before starting the server. The API key is not stored in this repository. It is saved only in the current browser's `localStorage` for convenience. If the relay reports `model_not_found`, the key or account package does not currently have a channel for the selected model; choose a supported model or update the relay account. If the LLM request fails, the app continues with the deterministic local analysis tools.

## Agent capabilities

- Perception: parses CSV, counts rows and columns, infers numeric, categorical, and date fields, and detects missing cells.
- Decision making: uses the optional LLM planner when configured; otherwise chooses analysis steps with deterministic rules based on detected column types and the user's analysis goal.
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
|-- screenshots/
|-- report/
|-- demo/
|   `-- demo_script.md
`-- tools/
    |-- build_report.py
    `-- llm_proxy_server.py
```

## Commit checkpoint guide

The local repository contains checkpoint-style commits showing design evolution and improvements. The final commit switches the project to the DataLens CSV analysis agent.

## Notes for submission

Before final upload, create a GitHub repository, push this folder, update the repository link above, and record or upload the two-minute demo video. The generated PDF report is in [report/Assignment2_DataLens_Report.pdf](report/Assignment2_DataLens_Report.pdf).
