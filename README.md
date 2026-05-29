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

No installation is required.

1. Download or clone this repository.
2. Open [index.html](index.html) in a modern browser.
3. Use the language selector to switch between English, Chinese, and Māori.
4. Click the `+` button to load a small public `tips.csv` sample, or upload your own `.csv` file.
5. Click `Run analysis agent`.
6. Review the perceived dataset, chosen analysis steps, execution log, plots, and summary findings.
7. Click `Export analysis JSON` if you want to download the agent run state.

Extra comparison datasets are in [data](data): `iris.csv` and the full `tips.csv` can be uploaded through the file picker to show how the agent adapts to different CSV structures.

## Optional LLM mode

The agent can run without an LLM, but it also supports an OpenAI-compatible chat-completions API.

1. Tick `Use LLM planner and summary`.
2. Keep the default API URL `https://sorryios.ai/codex`, or enter another compatible endpoint.
3. Enter the model name, such as `gpt-4o-mini`.
4. Paste the API key in the browser field.
5. Run the analysis.

The API key is not stored in this repository. It is saved only in the current browser's `localStorage` for convenience. If the LLM request fails, the app continues with the deterministic local analysis tools.

## Agent capabilities

- Perception: parses CSV, counts rows and columns, infers numeric, categorical, and date fields, and detects missing cells.
- Decision making: uses the optional LLM planner when configured; otherwise chooses analysis steps with deterministic rules based on detected column types and the user's analysis goal.
- Tool execution: runs schema inspection, numeric profiling, group comparison, relationship plotting, and summary generation.
- Action: creates a bar chart, scatter plot, execution log, LLM or deterministic natural-language findings, and JSON export.
- Memory: stores recent analysis events in `localStorage`.
- Safety: refuses requests that appear to involve secrets or sensitive identifiers.
- Multilingual UI: supports English, Chinese, and Māori language switching for the web interface and deterministic agent output.

## Project structure

```text
.
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
    `-- build_report.py
```

## Commit checkpoint guide

The local repository contains checkpoint-style commits showing design evolution and improvements. The final commit switches the project to the DataLens CSV analysis agent.

## Notes for submission

Before final upload, create a GitHub repository, push this folder, update the repository link above, and record or upload the two-minute demo video. The generated PDF report is in [report/Assignment2_DataLens_Report.pdf](report/Assignment2_DataLens_Report.pdf).
