const storageKey = "datalens.memory.v1";
const llmStorageKey = "datalens.llm.config.v1";

const sampleCsv = `total_bill,tip,sex,smoker,day,time,size
16.99,1.01,Female,No,Sun,Dinner,2
10.34,1.66,Male,No,Sun,Dinner,3
21.01,3.5,Male,No,Sun,Dinner,3
23.68,3.31,Male,No,Sun,Dinner,2
24.59,3.61,Female,No,Sun,Dinner,4
25.29,4.71,Male,No,Sun,Dinner,4
20.65,3.35,Male,No,Sat,Dinner,3
17.92,4.08,Male,No,Sat,Dinner,2
20.29,2.75,Female,No,Sat,Dinner,2
15.77,2.23,Female,No,Sat,Dinner,2
39.42,7.58,Male,No,Sat,Dinner,4
19.82,3.18,Male,No,Sat,Dinner,2
27.2,4,Male,No,Thur,Lunch,4
22.76,3,Male,No,Thur,Lunch,2
17.29,2.71,Male,No,Thur,Lunch,2
19.44,3,Male,Yes,Thur,Lunch,2
16.66,3.4,Male,No,Thur,Lunch,2
10.07,1.83,Female,No,Thur,Lunch,1
28.97,3,Male,Yes,Fri,Dinner,2
22.49,3.5,Male,No,Fri,Dinner,2
5.75,1,Female,Yes,Fri,Dinner,2
16.32,4.3,Female,Yes,Fri,Dinner,2
22.75,3.25,Female,No,Fri,Dinner,2
40.17,4.73,Male,Yes,Fri,Dinner,4`;

const elements = {
  form: document.querySelector("#analysisForm"),
  csvFile: document.querySelector("#csvFile"),
  csvText: document.querySelector("#csvText"),
  question: document.querySelector("#question"),
  useLlm: document.querySelector("#useLlm"),
  llmUrl: document.querySelector("#llmUrl"),
  llmModel: document.querySelector("#llmModel"),
  llmKey: document.querySelector("#llmKey"),
  status: document.querySelector("#agentStatus"),
  factsList: document.querySelector("#factsList"),
  decisionText: document.querySelector("#decisionText"),
  planList: document.querySelector("#planList"),
  confidenceBadge: document.querySelector("#confidenceBadge"),
  executionLog: document.querySelector("#executionLog"),
  summaryList: document.querySelector("#summaryList"),
  safetyText: document.querySelector("#safetyText"),
  safetyBox: document.querySelector(".safety"),
  memoryList: document.querySelector("#memoryList"),
  sampleButton: document.querySelector("#sampleButton"),
  resetButton: document.querySelector("#resetButton"),
  exportButton: document.querySelector("#exportButton"),
  barChart: document.querySelector("#barChart"),
  scatterChart: document.querySelector("#scatterChart")
};

const agent = {
  memory: loadMemory(),
  current: null,

  async run(input) {
    elements.status.textContent = "Parsing CSV";
    const safety = this.checkSafety(input.question);
    const parsed = parseCsv(input.csv);
    const perception = this.perceive(parsed);
    let decision = this.decide(perception, input.question, safety);
    let plan = this.chooseSteps(perception, safety);
    const llm = { enabled: input.llm.enabled, used: false, error: "" };

    if (!safety.blocked && input.llm.enabled && input.llm.apiKey) {
      elements.status.textContent = "Asking LLM";
      try {
        const llmPlan = await requestLlmPlan(perception, input.question, input.llm);
        plan = normalizeLlmSteps(llmPlan.steps, plan);
        decision = {
          strategy: llmPlan.strategy || decision.strategy,
          confidence: clamp(Number(llmPlan.confidence) || decision.confidence, 0.5, 0.98),
          rationale: `LLM planner selected ${plan.length} tool step(s) from the perceived CSV schema. ${llmPlan.rationale || decision.rationale}`
        };
        llm.used = true;
      } catch (error) {
        llm.error = error.message;
        decision = {
          ...decision,
          rationale: `${decision.rationale} LLM planner was unavailable, so the deterministic planner was used.`
        };
      }
    }

    const state = {
      createdAt: new Date().toISOString(),
      question: input.question,
      rows: parsed.rows,
      columns: parsed.headers,
      perception,
      safety,
      decision,
      plan,
      llm,
      executionLog: [],
      findings: [],
      charts: {}
    };

    this.current = state;
    this.remember(`Loaded ${perception.rowCount} rows and chose ${plan.length} analysis steps${llm.used ? " with LLM" : ""}`);
    render(state, this.memory);

    if (safety.blocked) {
      elements.status.textContent = "Blocked";
      return;
    }

    await this.executePlan(input.llm);
  },

  perceive(parsed) {
    const columns = parsed.headers.map((name) => inferColumn(name, parsed.rows));
    const numeric = columns.filter((column) => column.type === "numeric");
    const categorical = columns.filter((column) => column.type === "categorical");
    const dates = columns.filter((column) => column.type === "date");
    const missingCells = parsed.rows.reduce((count, row) => count + parsed.headers.filter((header) => isBlank(row[header])).length, 0);

    return {
      rowCount: parsed.rows.length,
      columnCount: parsed.headers.length,
      columns,
      numeric,
      categorical,
      dates,
      missingCells,
      likelyMetric: pickMetric(numeric),
      likelyDimension: pickDimension(categorical),
      likelyDate: dates[0] || null
    };
  },

  checkSafety(question) {
    const lower = question.toLowerCase();
    const risky = ["private key", "password", "ssn", "credit card", "secret token"];
    const found = risky.find((term) => lower.includes(term));

    return found
      ? {
          blocked: true,
          risk: found,
          message: "The request may involve sensitive data. The agent will not process secrets or personal identifiers."
        }
      : {
          blocked: false,
          risk: "none",
          message: "No risky data instruction detected. Analysis can proceed."
        };
  },

  decide(perception, question, safety) {
    if (safety.blocked) {
      return {
        strategy: "stop analysis and ask for anonymized data",
        confidence: 0.76,
        rationale: safety.message
      };
    }

    const hasMetric = Boolean(perception.likelyMetric);
    const hasDimension = Boolean(perception.likelyDimension);
    const hasDate = Boolean(perception.likelyDate);
    const questionText = question.trim() || "Summarize the dataset and identify useful findings.";

    let strategy = "profile the dataset, summarize numeric columns, compare categories, create plots, and generate findings";
    if (hasMetric && hasDimension && hasDate) {
      strategy = "combine category comparison, metric trend analysis, relationship plotting, and plain-language findings";
    } else if (hasMetric && hasDimension) {
      strategy = "compare the main metric across categories, inspect numeric distributions, and summarize top drivers";
    } else if (hasMetric) {
      strategy = "profile numeric metrics, detect outliers, and summarize distribution patterns";
    }

    const confidence = Math.min(0.95, 0.52 + (hasMetric ? 0.15 : 0) + (hasDimension ? 0.12 : 0) + (hasDate ? 0.08 : 0) + (perception.rowCount >= 10 ? 0.08 : 0));

    return {
      strategy,
      confidence,
      rationale: `Question: "${questionText}" Rows: ${perception.rowCount}; numeric columns: ${perception.numeric.length}; categorical columns: ${perception.categorical.length}.`
    };
  },

  chooseSteps(perception, safety) {
    if (safety.blocked) {
      return [
        {
          title: "Stop unsafe analysis",
          detail: safety.message,
          tool: "safety_filter"
        }
      ];
    }

    const steps = [
      {
        title: "Inspect schema and data quality",
        detail: "Count rows, columns, detected types, and missing cells.",
        tool: "inspect_schema"
      },
      {
        title: "Profile numeric metrics",
        detail: "Calculate totals, averages, minimums, maximums, and spread for numeric fields.",
        tool: "numeric_profile"
      }
    ];

    if (perception.likelyDimension && perception.likelyMetric) {
      steps.push({
        title: `Compare ${perception.likelyMetric.name} by ${perception.likelyDimension.name}`,
        detail: "Aggregate the main metric by the strongest categorical dimension and draw a bar chart.",
        tool: "group_compare"
      });
    }

    if (perception.numeric.length >= 2) {
      steps.push({
        title: `Plot relationship between ${perception.numeric[0].name} and ${perception.numeric[1].name}`,
        detail: "Create a scatter plot and calculate correlation between two numeric fields.",
        tool: "relationship_plot"
      });
    }

    steps.push({
      title: "Summarize findings",
      detail: "Turn the computed results into concise, business-readable conclusions.",
      tool: "summarize_findings"
    });

    return steps;
  },

  async executePlan(llmConfig) {
    if (!this.current) {
      return;
    }

    elements.status.textContent = "Executing tools";
    this.current.executionLog = [];
    this.current.findings = [];
    this.current.charts = {};

    this.current.plan.forEach((step) => {
      const result = tools[step.tool](this.current);
      this.current.executionLog.push({
        tool: step.tool,
        step: step.title,
        summary: result.summary
      });
      this.current.findings.push(...result.findings);
    });

    if (this.current.llm.used && llmConfig?.apiKey) {
      elements.status.textContent = "Asking LLM for summary";
      try {
        const llmFindings = await requestLlmSummary(this.current, llmConfig);
        if (llmFindings.length) {
          this.current.findings = llmFindings;
          this.current.executionLog.push({
            tool: "llm_summary",
            step: "Generate LLM narrative summary",
            summary: "LLM rewrote the computed results into final findings."
          });
        }
      } catch (error) {
        this.current.llm.error = error.message;
        this.current.executionLog.push({
          tool: "llm_summary",
          step: "Generate LLM narrative summary",
          summary: `LLM summary failed, deterministic findings kept: ${error.message}`
        });
      }
    }

    this.remember(`Executed ${this.current.plan.length} tools and generated ${this.current.findings.length} findings`);
    elements.status.textContent = "Complete";
    render(this.current, this.memory);
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
    const llmConfig = readLlmConfig();
    this.current = null;
    this.memory = [];
    saveMemory(this.memory);
    elements.form.reset();
    elements.useLlm.checked = llmConfig.enabled;
    elements.llmUrl.value = llmConfig.url;
    elements.llmModel.value = llmConfig.model;
    elements.llmKey.value = llmConfig.apiKey;
    clearCanvas(elements.barChart, "Main plot will appear here");
    clearCanvas(elements.scatterChart, "Relationship plot will appear here");
    render(null, this.memory);
  }
};

const tools = {
  safety_filter(state) {
    return {
      summary: "Stopped analysis because the request may involve sensitive data.",
      findings: [state.safety.message]
    };
  },

  inspect_schema(state) {
    const typeText = state.perception.columns.map((column) => `${column.name}: ${column.type}`).join(", ");
    return {
      summary: `Detected ${state.perception.rowCount} rows, ${state.perception.columnCount} columns, and ${state.perception.missingCells} missing cells.`,
      findings: [`Dataset structure: ${typeText}. Missing cells: ${state.perception.missingCells}.`]
    };
  },

  numeric_profile(state) {
    const lines = state.perception.numeric.map((column) => {
      const values = getNumericValues(state.rows, column.name);
      const stats = describe(values);
      column.stats = stats;
      return `${column.name}: total ${formatNumber(stats.sum)}, average ${formatNumber(stats.mean)}, range ${formatNumber(stats.min)}-${formatNumber(stats.max)}`;
    });

    return {
      summary: `Profiled ${state.perception.numeric.length} numeric column(s).`,
      findings: lines.length ? lines : ["No numeric columns were available for profiling."]
    };
  },

  group_compare(state) {
    const dimension = state.perception.likelyDimension;
    const metric = state.perception.likelyMetric;
    const grouped = aggregateByCategory(state.rows, dimension.name, metric.name);
    state.charts.grouped = { dimension: dimension.name, metric: metric.name, grouped };
    drawBarChart(elements.barChart, grouped, `${metric.name} by ${dimension.name}`, metric.name);

    const top = grouped[0];
    const bottom = grouped[grouped.length - 1];

    return {
      summary: `Aggregated ${metric.name} by ${dimension.name} and generated the main bar chart.`,
      findings: [
        `${top.label} leads ${dimension.name} with ${formatNumber(top.value)} total ${metric.name}.`,
        `${bottom.label} has the lowest total ${metric.name} at ${formatNumber(bottom.value)}.`
      ]
    };
  },

  relationship_plot(state) {
    const xColumn = state.perception.numeric[0];
    const yColumn = state.perception.numeric[1];
    const points = state.rows
      .map((row) => ({ x: toNumber(row[xColumn.name]), y: toNumber(row[yColumn.name]) }))
      .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
    const r = correlation(points.map((point) => point.x), points.map((point) => point.y));
    state.charts.relationship = { x: xColumn.name, y: yColumn.name, correlation: r };
    drawScatterChart(elements.scatterChart, points, xColumn.name, yColumn.name, r);

    return {
      summary: `Created a relationship plot for ${xColumn.name} and ${yColumn.name}.`,
      findings: [`${xColumn.name} and ${yColumn.name} have a correlation of ${formatNumber(r)} in this dataset.`]
    };
  },

  summarize_findings(state) {
    const metric = state.perception.likelyMetric;
    const dimension = state.perception.likelyDimension;
    const findings = [];

    if (metric && dimension && state.charts.grouped) {
      const top = state.charts.grouped.grouped[0];
      findings.push(`Recommended action: focus first on ${top.label}, because it contributes the strongest ${metric.name} result.`);
    }

    if (state.perception.missingCells > 0) {
      findings.push("Data quality note: clean missing values before using these results for high-stakes decisions.");
    } else {
      findings.push("Data quality note: the sample used by the agent has no missing cells.");
    }

    findings.push("The agent selected steps automatically from detected column types, then executed them to produce plots and a summary.");

    return {
      summary: "Generated final natural-language findings.",
      findings
    };
  }
};

function render(state, memory) {
  renderMemory(memory);

  if (!state) {
    elements.status.textContent = "Ready";
    elements.factsList.innerHTML = "<li>No CSV has been analyzed yet.</li>";
    elements.decisionText.textContent = "The agent is waiting for a dataset.";
    elements.planList.innerHTML = '<li class="empty-state">The agent will choose analysis steps after reading the CSV.</li>';
    elements.executionLog.innerHTML = "<li>No analysis tool has run yet.</li>";
    elements.summaryList.innerHTML = "<li>No findings yet.</li>";
    elements.confidenceBadge.textContent = "No plan";
    elements.safetyText.textContent = "No risky data instruction detected.";
    elements.safetyBox.classList.remove("warning");
    elements.safetyBox.classList.add("safe");
    return;
  }

  elements.safetyText.textContent = state.safety.message;
  elements.safetyBox.classList.toggle("warning", state.safety.blocked);
  elements.safetyBox.classList.toggle("safe", !state.safety.blocked);

  const facts = [
    `Rows: ${state.perception.rowCount}`,
    `Columns: ${state.perception.columnCount}`,
    `Numeric columns: ${state.perception.numeric.map((item) => item.name).join(", ") || "none"}`,
    `Categorical columns: ${state.perception.categorical.map((item) => item.name).join(", ") || "none"}`,
    `Date columns: ${state.perception.dates.map((item) => item.name).join(", ") || "none"}`,
    `Missing cells: ${state.perception.missingCells}`
  ];
  elements.factsList.replaceChildren(...facts.map((fact) => li(fact)));
  const llmNote = state.llm?.used
    ? " LLM mode: used for planning and final narrative."
    : state.llm?.enabled
      ? ` LLM mode: fallback used${state.llm.error ? ` (${state.llm.error})` : ""}.`
      : " LLM mode: off.";
  elements.decisionText.textContent = `${state.decision.strategy}. ${state.decision.rationale}${llmNote}`;
  elements.confidenceBadge.textContent = `${Math.round(state.decision.confidence * 100)}% confidence`;

  elements.planList.replaceChildren(...state.plan.map((step, index) => {
    const item = document.createElement("li");
    if (state.executionLog[index]) {
      item.classList.add("done");
    }

    const content = document.createElement("div");
    const title = document.createElement("span");
    title.className = "step-title";
    title.textContent = step.title;
    const detail = document.createElement("span");
    detail.className = "step-meta";
    detail.textContent = step.detail;
    const tool = document.createElement("span");
    tool.className = "step-tool";
    tool.textContent = `Tool ${index + 1}: ${step.tool}`;
    content.append(title, detail, tool);

    const tag = document.createElement("span");
    tag.className = "step-tag";
    tag.textContent = "Executed";
    item.append(content, tag);
    return item;
  }));

  renderExecution(state.executionLog);
  renderFindings(state.findings);
}

function renderExecution(entries) {
  if (!entries.length) {
    elements.executionLog.innerHTML = "<li>No analysis tool has run yet.</li>";
    return;
  }

  elements.executionLog.replaceChildren(...entries.map((entry) => {
    const item = document.createElement("li");
    const title = document.createElement("span");
    title.className = "log-title";
    title.textContent = `${entry.tool}: ${entry.step}`;
    const summary = document.createElement("span");
    summary.className = "step-meta";
    summary.textContent = entry.summary;
    item.append(title, summary);
    return item;
  }));
}

function renderFindings(findings) {
  if (!findings.length) {
    elements.summaryList.innerHTML = "<li>No findings yet.</li>";
    return;
  }

  elements.summaryList.replaceChildren(...findings.map((finding) => li(finding)));
}

function renderMemory(memory) {
  if (!memory.length) {
    elements.memoryList.innerHTML = "<li>Memory is empty.</li>";
    return;
  }

  elements.memoryList.replaceChildren(...memory.map((item) => li(`${item.at}: ${item.entry}`)));
}

function parseCsv(text) {
  const rows = [];
  let current = "";
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(current.trim());
      current = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }
      row.push(current.trim());
      if (row.some((cell) => cell !== "")) {
        rows.push(row);
      }
      row = [];
      current = "";
    } else {
      current += char;
    }
  }

  if (current.length || row.length) {
    row.push(current.trim());
    if (row.some((cell) => cell !== "")) {
      rows.push(row);
    }
  }

  if (rows.length < 2) {
    throw new Error("The CSV needs a header row and at least one data row.");
  }

  const headers = rows[0].map((header, index) => header || `Column_${index + 1}`);
  const dataRows = rows.slice(1).map((cells) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = cells[index] ?? "";
    });
    return record;
  });

  return { headers, rows: dataRows };
}

function inferColumn(name, rows) {
  const values = rows.map((row) => row[name]).filter((value) => !isBlank(value));
  const numericCount = values.filter((value) => Number.isFinite(toNumber(value))).length;
  const dateCount = values.filter((value) => !Number.isNaN(Date.parse(value))).length;
  const uniqueCount = new Set(values).size;
  let type = "categorical";

  if (values.length && numericCount / values.length >= 0.85) {
    type = "numeric";
  } else if (values.length && dateCount / values.length >= 0.85) {
    type = "date";
  }

  return { name, type, uniqueCount, missing: rows.length - values.length };
}

function pickMetric(numeric) {
  const preferred = ["revenue", "sales", "profit", "amount", "score", "units", "cost"];
  return numeric.find((column) => preferred.some((term) => column.name.toLowerCase().includes(term))) || numeric[0] || null;
}

function pickDimension(categorical) {
  return categorical
    .filter((column) => column.uniqueCount > 1 && column.uniqueCount <= 12)
    .sort((a, b) => b.uniqueCount - a.uniqueCount)[0] || categorical[0] || null;
}

function aggregateByCategory(rows, categoryName, metricName) {
  const totals = new Map();
  rows.forEach((row) => {
    const category = row[categoryName] || "Unknown";
    const value = toNumber(row[metricName]);
    if (Number.isFinite(value)) {
      totals.set(category, (totals.get(category) || 0) + value);
    }
  });

  return [...totals.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

function getNumericValues(rows, columnName) {
  return rows.map((row) => toNumber(row[columnName])).filter((value) => Number.isFinite(value));
}

function describe(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((total, value) => total + value, 0);
  return {
    count: values.length,
    sum,
    mean: values.length ? sum / values.length : 0,
    min: sorted[0] ?? 0,
    max: sorted[sorted.length - 1] ?? 0
  };
}

function correlation(xs, ys) {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) {
    return 0;
  }

  const meanX = xs.reduce((sum, value) => sum + value, 0) / n;
  const meanY = ys.reduce((sum, value) => sum + value, 0) / n;
  let numerator = 0;
  let xVariance = 0;
  let yVariance = 0;

  for (let i = 0; i < n; i += 1) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    numerator += dx * dy;
    xVariance += dx * dx;
    yVariance += dy * dy;
  }

  const denominator = Math.sqrt(xVariance * yVariance);
  return denominator ? numerator / denominator : 0;
}

function drawBarChart(canvas, data, title, metricName) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  drawCanvasBackground(ctx, width, height);

  const margin = { top: 44, right: 24, bottom: 72, left: 64 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const max = Math.max(...data.map((item) => item.value), 1);
  const barW = plotW / data.length * 0.64;

  ctx.fillStyle = "#172033";
  ctx.font = "700 16px Segoe UI, Arial";
  ctx.fillText(title, margin.left, 26);

  ctx.strokeStyle = "#c8d3e3";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(margin.left, margin.top);
  ctx.lineTo(margin.left, margin.top + plotH);
  ctx.lineTo(margin.left + plotW, margin.top + plotH);
  ctx.stroke();

  data.forEach((item, index) => {
    const x = margin.left + (plotW / data.length) * index + (plotW / data.length - barW) / 2;
    const barH = plotH * (item.value / max);
    const y = margin.top + plotH - barH;
    ctx.fillStyle = "#2754c5";
    ctx.fillRect(x, y, barW, barH);
    ctx.fillStyle = "#5c667a";
    ctx.font = "12px Segoe UI, Arial";
    ctx.save();
    ctx.translate(x + barW / 2, margin.top + plotH + 14);
    ctx.rotate(-Math.PI / 5);
    ctx.fillText(item.label, -20, 0);
    ctx.restore();
    ctx.fillText(formatCompact(item.value), x - 2, y - 6);
  });

  ctx.fillStyle = "#5c667a";
  ctx.font = "12px Segoe UI, Arial";
  ctx.fillText(metricName, 8, 22);
}

function drawScatterChart(canvas, points, xName, yName, r) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  drawCanvasBackground(ctx, width, height);

  const margin = { top: 42, right: 24, bottom: 52, left: 64 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  ctx.fillStyle = "#172033";
  ctx.font = "700 15px Segoe UI, Arial";
  ctx.fillText(`${xName} vs ${yName}`, margin.left, 25);
  ctx.fillStyle = "#5c667a";
  ctx.font = "12px Segoe UI, Arial";
  ctx.fillText(`correlation r = ${formatNumber(r)}`, margin.left + 180, 25);

  ctx.strokeStyle = "#c8d3e3";
  ctx.beginPath();
  ctx.moveTo(margin.left, margin.top);
  ctx.lineTo(margin.left, margin.top + plotH);
  ctx.lineTo(margin.left + plotW, margin.top + plotH);
  ctx.stroke();

  points.forEach((point) => {
    const x = margin.left + scale(point.x, minX, maxX, plotW);
    const y = margin.top + plotH - scale(point.y, minY, maxY, plotH);
    ctx.fillStyle = "rgba(23, 122, 91, 0.78)";
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = "#5c667a";
  ctx.font = "12px Segoe UI, Arial";
  ctx.fillText(xName, margin.left + plotW - 70, height - 15);
  ctx.save();
  ctx.translate(18, margin.top + 68);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(yName, 0, 0);
  ctx.restore();
}

function drawCanvasBackground(ctx, width, height) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#d8dfec";
  ctx.strokeRect(0, 0, width, height);
}

function clearCanvas(canvas, message) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCanvasBackground(ctx, canvas.width, canvas.height);
  ctx.fillStyle = "#5c667a";
  ctx.font = "14px Segoe UI, Arial";
  ctx.fillText(message, 24, 42);
}

function scale(value, min, max, size) {
  if (max === min) {
    return size / 2;
  }
  return ((value - min) / (max - min)) * size;
}

function toNumber(value) {
  if (typeof value === "number") {
    return value;
  }
  return Number(String(value).replace(/[$,%\s]/g, ""));
}

function isBlank(value) {
  return value === null || value === undefined || String(value).trim() === "";
}

function formatNumber(value) {
  return Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatCompact(value) {
  return Number(value).toLocaleString(undefined, { notation: "compact", maximumFractionDigits: 1 });
}

async function requestLlmPlan(perception, question, config) {
  const allowedTools = ["inspect_schema", "numeric_profile", "group_compare", "relationship_plot", "summarize_findings"];
  const schema = {
    rows: perception.rowCount,
    columns: perception.columns.map((column) => ({
      name: column.name,
      type: column.type,
      uniqueCount: column.uniqueCount,
      missing: column.missing
    })),
    likelyMetric: perception.likelyMetric?.name || null,
    likelyDimension: perception.likelyDimension?.name || null
  };
  const messages = [
    {
      role: "system",
      content: [
        "You are the planning brain of a CSV data analysis agent.",
        "Choose a short executable analysis plan using only the allowed tool names.",
        "Return strict JSON only, with keys: strategy, rationale, confidence, steps.",
        "Each step must have title, detail, and tool.",
        `Allowed tools: ${allowedTools.join(", ")}.`
      ].join(" ")
    },
    {
      role: "user",
      content: JSON.stringify({ question, dataset: schema }, null, 2)
    }
  ];
  const text = await callChatCompletion(config, messages, 0.2);
  return parseLlmJson(text);
}

async function requestLlmSummary(state, config) {
  const messages = [
    {
      role: "system",
      content: "You summarize CSV analysis results for a user. Return strict JSON only: {\"findings\":[\"...\"]}. Keep findings concrete and based only on provided computed results."
    },
    {
      role: "user",
      content: JSON.stringify({
        question: state.question,
        schema: state.perception.columns.map((column) => ({ name: column.name, type: column.type })),
        executionLog: state.executionLog,
        deterministicFindings: state.findings,
        charts: state.charts
      }, null, 2)
    }
  ];
  const text = await callChatCompletion(config, messages, 0.3);
  const data = parseLlmJson(text);
  return Array.isArray(data.findings) ? data.findings.slice(0, 8).map(String) : [];
}

async function callChatCompletion(config, messages, temperature) {
  const urls = chatCompletionCandidates(config.url);
  let lastError = "";

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model,
          messages,
          temperature
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        lastError = `${response.status} ${errorText.slice(0, 160)}`;
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || data.output_text || data.content;
      if (!content) {
        throw new Error("LLM response did not contain message content");
      }
      return content;
    } catch (error) {
      lastError = error.message;
    }
  }

  throw new Error(lastError || "LLM request failed");
}

function chatCompletionCandidates(rawUrl) {
  const clean = rawUrl.replace(/\/+$/, "");
  if (clean.endsWith("/chat/completions")) {
    return [clean];
  }
  if (clean.endsWith("/v1")) {
    return [`${clean}/chat/completions`, clean];
  }
  return [`${clean}/v1/chat/completions`, `${clean}/chat/completions`, clean];
}

function parseLlmJson(text) {
  const trimmed = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error("LLM returned non-JSON content");
  }
}

function normalizeLlmSteps(steps, fallback) {
  const allowed = new Set(["inspect_schema", "numeric_profile", "group_compare", "relationship_plot", "summarize_findings"]);
  const clean = Array.isArray(steps)
    ? steps
        .filter((step) => allowed.has(step.tool))
        .map((step) => ({
          title: String(step.title || step.tool).slice(0, 90),
          detail: String(step.detail || "Run this selected analysis tool.").slice(0, 180),
          tool: step.tool
        }))
    : [];

  if (!clean.length) {
    return fallback;
  }

  if (!clean.some((step) => step.tool === "summarize_findings")) {
    clean.push(fallback.find((step) => step.tool === "summarize_findings"));
  }

  return clean.filter(Boolean);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function li(text) {
  const item = document.createElement("li");
  item.textContent = text;
  return item;
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
  const llm = readLlmConfig();
  saveLlmConfig(llm);
  return {
    csv: elements.csvText.value.trim(),
    question: elements.question.value.trim() || "Summarize this CSV and identify useful findings.",
    llm
  };
}

function readLlmConfig() {
  return {
    enabled: Boolean(elements.useLlm.checked),
    url: elements.llmUrl.value.trim(),
    model: elements.llmModel.value.trim() || "gpt-4o-mini",
    apiKey: elements.llmKey.value.trim()
  };
}

function saveLlmConfig(config) {
  localStorage.setItem(llmStorageKey, JSON.stringify({
    enabled: config.enabled,
    url: config.url,
    model: config.model,
    apiKey: config.apiKey
  }));
}

function hydrateLlmConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem(llmStorageKey) || "{}");
    if (typeof saved.enabled === "boolean") {
      elements.useLlm.checked = saved.enabled;
    }
    if (saved.url) {
      elements.llmUrl.value = saved.url;
    }
    if (saved.model) {
      elements.llmModel.value = saved.model;
    }
    if (saved.apiKey) {
      elements.llmKey.value = saved.apiKey;
    }
  } catch {
    // Ignore invalid saved config and keep defaults.
  }
}

elements.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await agent.run(readInput());
  } catch (error) {
    elements.status.textContent = "Error";
    elements.decisionText.textContent = error.message;
  }
});

elements.csvFile.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) {
    return;
  }
  elements.csvText.value = await file.text();
  elements.question.value ||= "Analyze this uploaded CSV and summarize the most important patterns.";
});

elements.sampleButton.addEventListener("click", () => {
  elements.csvText.value = sampleCsv;
  elements.question.value = "Compare restaurant bills and tips by day, identify relationships, and summarize useful findings.";
  agent.run(readInput()).catch((error) => {
    elements.status.textContent = "Error";
    elements.decisionText.textContent = error.message;
  });
});

elements.resetButton.addEventListener("click", () => agent.reset());

elements.exportButton.addEventListener("click", () => {
  if (!agent.current) {
    return;
  }
  const exportState = {
    ...agent.current,
    rows: `${agent.current.rows.length} rows omitted from compact export`
  };
  const blob = new Blob([JSON.stringify(exportState, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "datalens-analysis.json";
  anchor.click();
  URL.revokeObjectURL(url);
});

hydrateLlmConfig();
clearCanvas(elements.barChart, "Main plot will appear here");
clearCanvas(elements.scatterChart, "Relationship plot will appear here");
render(null, agent.memory);
