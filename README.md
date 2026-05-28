# GoalPilot Agent

GoalPilot is a small intelligent software agent prototype for Assignment 2. It accepts a user goal, perceives task facts, decides a planning strategy, produces concrete actions, remembers recent feedback, and applies safety boundaries when a request looks risky.

## Repository link

Replace this line after uploading the folder to GitHub:

`https://github.com/your-username/goalpilot-agent`

## Demo video

Suggested GitHub README link after recording/uploading the two-minute demo:

`demo/goalpilot_demo.mp4`

A short demo script is included at [demo/demo_script.md](demo/demo_script.md).

## How to run

No installation is required.

1. Download or clone this repository.
2. Open [index.html](index.html) in a modern browser.
3. Click the `+` button to load the sample Assignment 2 goal.
4. Click `Generate plan`.
5. Add feedback such as `add testing and screenshots`, then click `Apply feedback`.
6. Click `Mark next done` to show the agent updating task state and memory.

## Agent capabilities

- Perception: extracts category, keywords, due date, deadline pressure, required outputs, and missing information.
- Decision making: chooses a planning strategy based on deadline pressure, available hours, style preference, and safety state.
- Action: creates an ordered plan, revises it from feedback, marks progress, and exports the current run as JSON.
- Memory: stores recent planning and feedback events in `localStorage`.
- Safety: detects unsafe or academically risky requests and redirects to a safe alternative plan.

## Project structure

```text
.
|-- index.html
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

The local repository contains checkpoint-style commits for:

1. Initial prototype implementation.
2. README and documentation materials.
3. Report, screenshots, and final packaging.

## Notes for submission

Before final upload, create a GitHub repository, push this folder, update the repository link above, and record or upload the two-minute demo video. The generated PDF report is in [report/Assignment2_GoalPilot_Report.pdf](report/Assignment2_GoalPilot_Report.pdf).
