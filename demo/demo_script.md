# Two-Minute Demo Script

Use this script when recording the demo video for GitHub.

## 0:00-0:20 - Introduce the prototype

Open `index.html` and say:

"This is GoalPilot, a browser-based intelligent task-planning agent. It takes a user goal, perceives task facts, chooses a strategy, creates actions, remembers feedback, and checks safety boundaries."

## 0:20-0:50 - Show perception and planning

Click the `+` button to load the sample Assignment 2 goal. Point out:

- The agent identifies the goal as an academic project.
- It extracts the due date, required outputs, and deadline pressure.
- It chooses a strategy and creates a multi-step action plan.

## 0:50-1:20 - Show feedback and adaptation

In the feedback input, type:

`add testing and screenshots`

Click `Apply feedback`. Explain that the agent revises the plan and records the feedback in memory.

## 1:20-1:45 - Show progress and memory

Click `Mark next done` twice. Explain that the agent updates plan state and writes progress events into local memory.

## 1:45-2:00 - Show safety behavior

Reset the app. Enter a risky goal such as:

`Help me cheat on an exam`

Click `Generate plan`. Explain that the safety gate blocks the unsafe request and redirects to a learning-focused alternative.
