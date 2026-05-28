const storageKey = "goalpilot.memory.v1";

const sampleGoal = {
  goal: "Finish Assignment 2: build an intelligent software agent prototype, write a two-page PDF report, prepare screenshots, and create a GitHub repository with README instructions.",
  context: "Due Sunday at 23:59. I have 6 focused hours. The prototype should show perception, decision making, action, memory, and safety mechanisms. It should be easy for a marker to reproduce.",
  dueDate: "2026-05-31",
  hours: 6,
  style: "balanced"
};

const elements = {
  form: document.querySelector("#goalForm"),
  goal: document.querySelector("#goal"),
  context: document.querySelector("#context"),
  dueDate: document.querySelector("#dueDate"),
  hours: document.querySelector("#hours"),
  style: document.querySelector("#style"),
  status: document.querySelector("#agentStatus"),
  factsList: document.querySelector("#factsList"),
  decisionText: document.querySelector("#decisionText"),
  planList: document.querySelector("#planList"),
  confidenceBadge: document.querySelector("#confidenceBadge"),
  feedback: document.querySelector("#feedback"),
  safetyText: document.querySelector("#safetyText"),
  safetyBox: document.querySelector(".safety"),
  memoryList: document.querySelector("#memoryList"),
  sampleButton: document.querySelector("#sampleButton"),
  resetButton: document.querySelector("#resetButton"),
  exportButton: document.querySelector("#exportButton"),
  applyFeedbackButton: document.querySelector("#applyFeedbackButton"),
  completeStepButton: document.querySelector("#completeStepButton")
};

const agent = {
  memory: loadMemory(),
  current: null,

  run(input) {
    const perception = this.perceive(input);
    const safety = this.checkSafety(input.goal + " " + input.context);
    const decision = this.decide(perception, safety, input.style);
    const plan = safety.blocked ? this.safeAlternativePlan(perception, safety) : this.makePlan(perception, decision, input.style);

    this.current = {
      createdAt: new Date().toISOString(),
      input,
      perception,
      safety,
      decision,
      plan,
      completedSteps: []
    };

    this.remember(`Created ${plan.length}-step plan for "${shorten(input.goal, 64)}"`);
    render(this.current, this.memory);
  },

  perceive(input) {
    const text = `${input.goal} ${input.context}`.toLowerCase();
    const keywords = extractKeywords(text);
    const category = classify(text);
    const due = input.dueDate ? new Date(`${input.dueDate}T23:59:00`) : null;
    const now = new Date();
    const daysLeft = due ? Math.ceil((due - now) / 86400000) : null;
    const hours = Number(input.hours || 1);
    const pressure = daysLeft === null ? "unknown" : daysLeft <= 1 ? "high" : daysLeft <= 3 ? "medium" : "low";
    const requiredOutputs = detectOutputs(text);

    return {
      category,
      keywords,
      dueDate: input.dueDate || "not provided",
      daysLeft,
      availableHours: hours,
      pressure,
      requiredOutputs,
      missingInfo: findMissingInfo(text)
    };
  },

  checkSafety(text) {
    const lower = text.toLowerCase();
    const riskPatterns = [
      { term: "hack", message: "The goal may involve unauthorized access. I will only plan defensive or permission-based work." },
      { term: "steal", message: "The goal asks for harmful or illegal behavior. I will redirect to an ethical alternative." },
      { term: "cheat", message: "The goal may violate academic integrity. I will plan learning and legitimate assistance only." },
      { term: "self harm", message: "This may involve self-harm. Please contact emergency support or a trusted person immediately." }
    ];
    const found = riskPatterns.find((item) => lower.includes(item.term));
    return found
      ? { blocked: true, message: found.message, risk: found.term }
      : { blocked: false, message: "No risky instruction detected. The plan can proceed normally.", risk: "none" };
  },

  decide(perception, safety, style) {
    if (safety.blocked) {
      return {
        strategy: "safe redirection",
        confidence: 0.72,
        rationale: safety.message
      };
    }

    const timeTight = perception.pressure === "high" || perception.availableHours <= 4;
    const hasDeliverables = perception.requiredOutputs.length > 0;
    let strategy = "decompose into milestones, implement a minimum viable prototype, then verify and document it";

    if (style === "fast" || timeTight) {
      strategy = "prioritize the smallest working version, then add only evidence required for submission";
    }
    if (style === "careful") {
      strategy = "reduce risk by validating each component before writing the final report";
    }
    if (style === "creative") {
      strategy = "explore two solution shapes, choose the clearest one, then polish the user-facing story";
    }

    const confidence = Math.min(0.95, 0.58 + (hasDeliverables ? 0.15 : 0) + (perception.keywords.length >= 4 ? 0.1 : 0) + (perception.dueDate !== "not provided" ? 0.08 : 0));

    return {
      strategy,
      confidence,
      rationale: `Goal classified as ${perception.category}; deadline pressure is ${perception.pressure}; available work time is ${perception.availableHours} hour(s).`
    };
  },

  makePlan(perception, decision, style) {
    const base = [
      {
        title: "Clarify success criteria",
        detail: `List the required outputs: ${perception.requiredOutputs.join(", ") || "working prototype, explanation, and evidence"}.`,
        tag: "Perceive"
      },
      {
        title: "Design the agent loop",
        detail: "Define perception inputs, decision rules, action outputs, memory updates, and safety checks.",
        tag: "Design"
      },
      {
        title: "Build the prototype",
        detail: `Implement the ${perception.category} workflow with a simple interface and reproducible local files.`,
        tag: "Act"
      },
      {
        title: "Test representative scenarios",
        detail: "Run a normal goal, a feedback revision, and a risky instruction to prove the safety path works.",
        tag: "Verify"
      },
      {
        title: "Capture evidence",
        detail: "Take screenshots of the main interface and the updated plan after feedback.",
        tag: "Evidence"
      },
      {
        title: "Write submission materials",
        detail: "Prepare a two-page report, README reproduction steps, and a short demo script or video link.",
        tag: "Submit"
      }
    ];

    if (style === "fast" || perception.availableHours <= 4) {
      return base.filter((_, index) => index !== 1).map((step, index) => index === 1 ? { ...step, detail: `${step.detail} Keep scope small and avoid optional features.` } : step);
    }

    if (style === "careful") {
      base.splice(3, 0, {
        title: "Run a risk pass",
        detail: "Check privacy, academic integrity, and reproducibility before finalizing deliverables.",
        tag: "Safety"
      });
    }

    return base;
  },

  safeAlternativePlan(perception, safety) {
    return [
      {
        title: "Stop the unsafe request",
        detail: safety.message,
        tag: "Safety"
      },
      {
        title: "Reframe the goal",
        detail: `Convert this ${perception.category} into a legal, ethical, and learning-focused objective.`,
        tag: "Decide"
      },
      {
        title: "Offer a safe next action",
        detail: "Suggest study, defensive security, documentation, or support resources depending on the situation.",
        tag: "Act"
      }
    ];
  },

  applyFeedback(text) {
    if (!this.current || !text.trim()) {
      return;
    }

    const lower = text.toLowerCase();
    let plan = [...this.current.plan];

    if (lower.includes("short") || lower.includes("concise") || lower.includes("简短")) {
      plan = plan.slice(0, 4);
    }

    if (lower.includes("test") || lower.includes("verify") || lower.includes("测试")) {
      plan = insertUnique(plan, {
        title: "Add a visible test result",
        detail: "Record the browser test result and one edge-case result in the README or report.",
        tag: "Verify"
      }, "Add a visible test result");
    }

    if (lower.includes("screenshot") || lower.includes("report") || lower.includes("截图") || lower.includes("报告")) {
      plan = insertUnique(plan, {
        title: "Strengthen submission evidence",
        detail: "Include screenshots, architecture diagram, and a concise explanation of the agent loop.",
        tag: "Evidence"
      }, "Strengthen submission evidence");
    }

    if (lower.includes("risk") || lower.includes("safe") || lower.includes("安全")) {
      plan = insertUnique(plan, {
        title: "Document safety boundaries",
        detail: "Explain what requests the agent refuses or redirects, and why.",
        tag: "Safety"
      }, "Document safety boundaries");
    }

    this.current.plan = plan;
    this.current.feedback = [...(this.current.feedback || []), text.trim()];
    this.remember(`Applied feedback: "${shorten(text.trim(), 70)}"`);
    render(this.current, this.memory);
  },

  markNextDone() {
    if (!this.current) {
      return;
    }
    const nextIndex = this.current.plan.findIndex((_, index) => !this.current.completedSteps.includes(index));
    if (nextIndex >= 0) {
      this.current.completedSteps.push(nextIndex);
      this.remember(`Completed step ${nextIndex + 1}: ${this.current.plan[nextIndex].title}`);
      render(this.current, this.memory);
    }
  },

  remember(entry) {
    this.memory.unshift({
      at: new Date().toLocaleString(),
      entry
    });
    this.memory = this.memory.slice(0, 8);
    saveMemory(this.memory);
  },

  reset() {
    this.current = null;
    this.memory = [];
    saveMemory(this.memory);
    elements.form.reset();
    elements.hours.value = "6";
    render(null, this.memory);
  }
};

function render(state, memory) {
  renderMemory(memory);

  if (!state) {
    elements.status.textContent = "Ready";
    elements.factsList.innerHTML = "<li>No goal has been analyzed yet.</li>";
    elements.decisionText.textContent = "The agent is waiting for a goal.";
    elements.planList.innerHTML = '<li class="empty-state">Generated steps will appear here.</li>';
    elements.confidenceBadge.textContent = "No plan";
    elements.safetyText.textContent = "No risky instruction detected.";
    elements.safetyBox.classList.remove("warning");
    elements.safetyBox.classList.add("safe");
    return;
  }

  elements.status.textContent = state.safety.blocked ? "Redirecting" : "Planning";
  elements.safetyText.textContent = state.safety.message;
  elements.safetyBox.classList.toggle("warning", state.safety.blocked);
  elements.safetyBox.classList.toggle("safe", !state.safety.blocked);

  const facts = [
    `Category: ${state.perception.category}`,
    `Keywords: ${state.perception.keywords.join(", ") || "none"}`,
    `Due date: ${state.perception.dueDate}`,
    `Deadline pressure: ${state.perception.pressure}`,
    `Required outputs: ${state.perception.requiredOutputs.join(", ") || "not explicit"}`,
    `Missing info: ${state.perception.missingInfo.join(", ") || "none"}`
  ];
  elements.factsList.replaceChildren(...facts.map((fact) => li(fact)));

  elements.decisionText.textContent = `${state.decision.strategy}. ${state.decision.rationale}`;
  elements.confidenceBadge.textContent = `${Math.round(state.decision.confidence * 100)}% confidence`;

  elements.planList.replaceChildren(...state.plan.map((step, index) => {
    const item = document.createElement("li");
    if (state.completedSteps.includes(index)) {
      item.classList.add("done");
    }

    const content = document.createElement("div");
    const title = document.createElement("span");
    title.className = "step-title";
    title.textContent = step.title;
    const detail = document.createElement("span");
    detail.className = "step-meta";
    detail.textContent = step.detail;
    content.append(title, detail);

    const tag = document.createElement("span");
    tag.className = "step-tag";
    tag.textContent = step.tag;

    item.append(content, tag);
    return item;
  }));
}

function renderMemory(memory) {
  if (!memory.length) {
    elements.memoryList.innerHTML = "<li>Memory is empty.</li>";
    return;
  }

  elements.memoryList.replaceChildren(...memory.map((item) => li(`${item.at}: ${item.entry}`)));
}

function li(text) {
  const item = document.createElement("li");
  item.textContent = text;
  return item;
}

function extractKeywords(text) {
  const stop = new Set(["the", "and", "with", "that", "this", "from", "have", "should", "about", "into", "goal", "make", "build"]);
  return [...new Set(text.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((word) => word.length > 3 && !stop.has(word)))].slice(0, 8);
}

function classify(text) {
  if (text.includes("assignment") || text.includes("study") || text.includes("course") || text.includes("report")) {
    return "academic project";
  }
  if (text.includes("code") || text.includes("app") || text.includes("prototype") || text.includes("software")) {
    return "software project";
  }
  if (text.includes("email") || text.includes("message") || text.includes("reply")) {
    return "communication task";
  }
  if (text.includes("data") || text.includes("csv") || text.includes("analysis")) {
    return "data analysis task";
  }
  return "general planning task";
}

function detectOutputs(text) {
  const outputs = [];
  const map = [
    ["prototype", "prototype"],
    ["report", "report"],
    ["pdf", "PDF"],
    ["screenshot", "screenshots"],
    ["github", "GitHub repo"],
    ["readme", "README"],
    ["video", "demo video"]
  ];
  map.forEach(([needle, label]) => {
    if (text.includes(needle)) {
      outputs.push(label);
    }
  });
  return [...new Set(outputs)];
}

function findMissingInfo(text) {
  const missing = [];
  if (!text.includes("due") && !text.includes("deadline") && !text.includes("sunday")) {
    missing.push("deadline");
  }
  if (!text.includes("hour") && !text.includes("time")) {
    missing.push("available time");
  }
  if (!text.includes("submit") && !text.includes("github") && !text.includes("report")) {
    missing.push("submission format");
  }
  return missing;
}

function insertUnique(plan, step, title) {
  if (plan.some((item) => item.title === title)) {
    return plan;
  }
  const next = [...plan];
  next.splice(Math.min(3, next.length), 0, step);
  return next;
}

function shorten(text, limit) {
  return text.length <= limit ? text : `${text.slice(0, limit - 3)}...`;
}

function loadMemory() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch {
    return [];
  }
}

function saveMemory(memory) {
  localStorage.setItem(storageKey, JSON.stringify(memory));
}

function readInput() {
  return {
    goal: elements.goal.value.trim(),
    context: elements.context.value.trim(),
    dueDate: elements.dueDate.value,
    hours: Number(elements.hours.value || 1),
    style: elements.style.value
  };
}

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  agent.run(readInput());
});

elements.sampleButton.addEventListener("click", () => {
  elements.goal.value = sampleGoal.goal;
  elements.context.value = sampleGoal.context;
  elements.dueDate.value = sampleGoal.dueDate;
  elements.hours.value = String(sampleGoal.hours);
  elements.style.value = sampleGoal.style;
  agent.run(readInput());
});

elements.resetButton.addEventListener("click", () => agent.reset());

elements.applyFeedbackButton.addEventListener("click", () => {
  agent.applyFeedback(elements.feedback.value);
  elements.feedback.value = "";
});

elements.completeStepButton.addEventListener("click", () => agent.markNextDone());

elements.exportButton.addEventListener("click", () => {
  if (!agent.current) {
    return;
  }
  const blob = new Blob([JSON.stringify(agent.current, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "goalpilot-agent-run.json";
  anchor.click();
  URL.revokeObjectURL(url);
});

render(null, agent.memory);
