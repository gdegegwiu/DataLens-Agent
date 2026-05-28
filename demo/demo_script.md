# Two-Minute Demo Script

Use this script when recording the demo video for GitHub.

## 0:00-0:20 - Introduce the prototype

Open `index.html` and say:

"This is DataLens, a CSV data analysis agent. It reads a dataset, decides which analysis steps are useful, executes those steps, creates plots, and summarizes findings."

## 0:20-0:45 - Show CSV perception

Click the `+` button to load the sample sales CSV. Point out:

- The agent parses the CSV.
- It detects rows, columns, numeric fields, categorical fields, date fields, and missing cells.
- It records the run in memory.

## 0:45-1:15 - Show decision making and execution

Point to the chosen analysis steps and execution log. Explain:

- The agent chose schema inspection, numeric profiling, category comparison, relationship plotting, and summary generation.
- These are selected automatically from the detected column types.

## 1:15-1:40 - Show plots

Point to the generated charts:

- The bar chart compares the main metric by category.
- The scatter plot shows a relationship between two numeric fields and reports correlation.

## 1:40-2:00 - Show findings and export

Point to the summary findings and click `Export analysis JSON`. Explain that the agent produces a reproducible analysis state that includes dataset facts, decisions, executed tools, and findings.
