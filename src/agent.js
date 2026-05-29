const storageKey = "datalens.memory.v1";
const llmStorageKey = "datalens.llm.config.v1";
const languageStorageKey = "datalens.language.v1";

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

let currentLanguage = localStorage.getItem(languageStorageKey) || "en";

const translations = {
  en: {
    "eyebrow.assignment": "Assignment 2 Prototype",
    "app.subtitle": "A CSV data analysis agent that perceives a dataset, chooses analysis steps, executes them, creates plots, and summarizes findings.",
    "label.language": "Language",
    "section.perception": "Perception",
    "heading.csvInput": "CSV input",
    "button.sample": "Load sample CSV",
    "label.uploadCsv": "Upload CSV",
    "label.analysisGoal": "Analysis goal",
    "placeholder.question": "Example: Find which region and channel perform best, identify trends, and summarize useful business actions.",
    "label.csvText": "CSV preview or pasted CSV",
    "placeholder.csv": "Paste CSV data here, or click + to load the sample dataset.",
    "aria.llmConfig": "LLM configuration",
    "label.useLlm": "Use LLM planner and summary",
    "label.llmUrl": "LLM API URL",
    "label.model": "Model",
    "label.apiKey": "API key",
    "placeholder.apiKey": "Paste your API key here. It is stored only in this browser.",
    "hint.llm": "The key is never committed to the project. If the LLM call fails, the agent falls back to deterministic analysis tools.",
    "button.run": "Run analysis agent",
    "button.reset": "Reset",
    "aria.agentOutput": "Agent output",
    "section.reasoning": "Reasoning and action",
    "heading.workspace": "Agent workspace",
    "button.export": "Export analysis JSON",
    "heading.perceived": "Perceived dataset",
    "heading.decision": "Decision",
    "heading.steps": "Chosen analysis steps",
    "heading.execution": "Execution log",
    "heading.summary": "Summary",
    "aria.chartsMemory": "Charts and memory",
    "section.actions": "Actions",
    "heading.plotsMemory": "Plots and memory",
    "heading.mainPlot": "Main plot",
    "heading.relationshipPlot": "Relationship plot",
    "aria.mainChart": "Main generated chart",
    "aria.relationshipChart": "Relationship chart",
    "heading.safety": "Safety check",
    "heading.memory": "Memory",
    "empty.noCsv": "No CSV has been analyzed yet.",
    "empty.decision": "The agent is waiting for a dataset.",
    "empty.steps": "The agent will choose analysis steps after reading the CSV.",
    "empty.execution": "No analysis tool has run yet.",
    "empty.findings": "No findings yet.",
    "empty.memory": "Memory is empty.",
    "empty.noPlan": "No plan",
    "status.ready": "Ready",
    "status.parsing": "Parsing CSV",
    "status.askingLlm": "Asking LLM",
    "status.blocked": "Blocked",
    "status.executing": "Executing tools",
    "status.askingSummary": "Asking LLM for summary",
    "status.complete": "Complete",
    "status.error": "Error",
    "safety.ok": "No risky data instruction detected. Analysis can proceed.",
    "safety.blocked": "The request may involve sensitive data. The agent will not process secrets or personal identifiers.",
    "decision.safeStrategy": "stop analysis and ask for anonymized data",
    "decision.default": "profile the dataset, summarize numeric columns, compare categories, create plots, and generate findings",
    "decision.full": "combine category comparison, metric trend analysis, relationship plotting, and plain-language findings",
    "decision.metricDimension": "compare the main metric across categories, inspect numeric distributions, and summarize top drivers",
    "decision.metricOnly": "profile numeric metrics, detect outliers, and summarize distribution patterns",
    "decision.rationale": "Question: \"{question}\" Rows: {rows}; numeric columns: {numeric}; categorical columns: {categorical}.",
    "decision.defaultQuestion": "Summarize the dataset and identify useful findings.",
    "decision.llmRationale": "LLM planner selected {count} tool step(s) from the perceived CSV schema. {rationale}",
    "decision.llmFallback": "{rationale} LLM planner was unavailable, so the deterministic planner was used.",
    "llm.used": " LLM mode: used for planning and final narrative.",
    "llm.fallback": " LLM mode: fallback used{error}.",
    "llm.off": " LLM mode: off.",
    "confidence": "{value}% confidence",
    "fact.rows": "Rows: {value}",
    "fact.columns": "Columns: {value}",
    "fact.numeric": "Numeric columns: {value}",
    "fact.categorical": "Categorical columns: {value}",
    "fact.dates": "Date columns: {value}",
    "fact.missing": "Missing cells: {value}",
    "none": "none",
    "type.numeric": "numeric",
    "type.categorical": "categorical",
    "type.date": "date",
    "step.inspect.title": "Inspect schema and data quality",
    "step.inspect.detail": "Count rows, columns, detected types, and missing cells.",
    "step.numeric.title": "Profile numeric metrics",
    "step.numeric.detail": "Calculate totals, averages, minimums, maximums, and spread for numeric fields.",
    "step.group.title": "Compare {metric} by {dimension}",
    "step.group.detail": "Aggregate the main metric by the strongest categorical dimension and draw a bar chart.",
    "step.relationship.title": "Plot relationship between {x} and {y}",
    "step.relationship.detail": "Create a scatter plot and calculate correlation between two numeric fields.",
    "step.summary.title": "Summarize findings",
    "step.summary.detail": "Turn the computed results into concise, business-readable conclusions.",
    "step.safety.title": "Stop unsafe analysis",
    "step.safety.detail": "{message}",
    "tool.label": "Tool {index}: {tool}",
    "tag.executed": "Executed",
    "tool.inspect.summary": "Detected {rows} rows, {columns} columns, and {missing} missing cells.",
    "finding.structure": "Dataset structure: {types}. Missing cells: {missing}.",
    "tool.numeric.summary": "Profiled {count} numeric column(s).",
    "finding.numeric": "{column}: total {sum}, average {mean}, range {min}-{max}",
    "finding.noNumeric": "No numeric columns were available for profiling.",
    "tool.group.summary": "Aggregated {metric} by {dimension} and generated the main bar chart.",
    "finding.groupTop": "{label} leads {dimension} with {value} total {metric}.",
    "finding.groupBottom": "{label} has the lowest total {metric} at {value}.",
    "tool.relationship.summary": "Created a relationship plot for {x} and {y}.",
    "finding.relationship": "{x} and {y} have a correlation of {r} in this dataset.",
    "finding.recommend": "Recommended action: focus first on {label}, because it contributes the strongest {metric} result.",
    "finding.qualityMissing": "Data quality note: clean missing values before using these results for high-stakes decisions.",
    "finding.qualityClean": "Data quality note: the sample used by the agent has no missing cells.",
    "finding.method": "The agent selected steps automatically from detected column types, then executed them to produce plots and a summary.",
    "tool.summary.summary": "Generated final natural-language findings.",
    "tool.safety.summary": "Stopped analysis because the request may involve sensitive data.",
    "memory.loaded": "Loaded {rows} rows and chose {steps} analysis steps{llm}",
    "memory.withLlm": " with LLM",
    "memory.executed": "Executed {tools} tools and generated {findings} findings",
    "sample.question": "Compare restaurant bills and tips by day, identify relationships, and summarize useful findings.",
    "upload.question": "Analyze this uploaded CSV and summarize the most important patterns.",
    "fallback.question": "Summarize this CSV and identify useful findings.",
    "canvas.main": "Main plot will appear here",
    "canvas.relationship": "Relationship plot will appear here",
    "chart.by": "{metric} by {dimension}",
    "chart.correlation": "correlation r = {r}",
    "error.csv": "The CSV needs a header row and at least one data row.",
    "llm.summary.step": "Generate LLM narrative summary",
    "llm.summary.success": "LLM rewrote the computed results into final findings.",
    "llm.summary.fail": "LLM summary failed, deterministic findings kept: {error}",
    "llm.prompt.plan": "You are the planning brain of a CSV data analysis agent. Choose a short executable analysis plan using only the allowed tool names. Return strict JSON only, with keys: strategy, rationale, confidence, steps. Each step must have title, detail, and tool. Respond in English. Allowed tools: {tools}.",
    "llm.prompt.summary": "You summarize CSV analysis results for a user. Return strict JSON only: {\"findings\":[\"...\"]}. Keep findings concrete and based only on provided computed results. Respond in English.",
    "llm.stepDefault": "Run this selected analysis tool."
  },
  zh: {
    "eyebrow.assignment": "作业 2 原型",
    "app.subtitle": "一个 CSV 数据分析代理：感知数据集、选择分析步骤、执行工具、生成图表并总结发现。",
    "label.language": "语言",
    "section.perception": "感知",
    "heading.csvInput": "CSV 输入",
    "button.sample": "加载示例 CSV",
    "label.uploadCsv": "上传 CSV",
    "label.analysisGoal": "分析目标",
    "placeholder.question": "示例：找出哪些类别表现最好，识别趋势，并总结可执行建议。",
    "label.csvText": "CSV 预览或粘贴 CSV",
    "placeholder.csv": "在这里粘贴 CSV，或点击 + 加载示例数据集。",
    "aria.llmConfig": "LLM 配置",
    "label.useLlm": "使用 LLM 规划和总结",
    "label.llmUrl": "LLM API 地址",
    "label.model": "模型",
    "label.apiKey": "API key",
    "placeholder.apiKey": "在这里粘贴 API key。它只保存在当前浏览器中。",
    "hint.llm": "key 不会提交到项目中。如果 LLM 调用失败，代理会回退到确定性的本地分析工具。",
    "button.run": "运行分析代理",
    "button.reset": "重置",
    "aria.agentOutput": "代理输出",
    "section.reasoning": "推理与行动",
    "heading.workspace": "代理工作区",
    "button.export": "导出分析 JSON",
    "heading.perceived": "感知到的数据集",
    "heading.decision": "决策",
    "heading.steps": "选择的分析步骤",
    "heading.execution": "执行日志",
    "heading.summary": "总结",
    "aria.chartsMemory": "图表和记忆",
    "section.actions": "行动",
    "heading.plotsMemory": "图表和记忆",
    "heading.mainPlot": "主图表",
    "heading.relationshipPlot": "关系图",
    "aria.mainChart": "生成的主图表",
    "aria.relationshipChart": "关系图表",
    "heading.safety": "安全检查",
    "heading.memory": "记忆",
    "empty.noCsv": "还没有分析 CSV。",
    "empty.decision": "代理正在等待数据集。",
    "empty.steps": "代理读取 CSV 后会选择分析步骤。",
    "empty.execution": "还没有运行分析工具。",
    "empty.findings": "还没有发现。",
    "empty.memory": "记忆为空。",
    "empty.noPlan": "无计划",
    "status.ready": "就绪",
    "status.parsing": "正在解析 CSV",
    "status.askingLlm": "正在询问 LLM",
    "status.blocked": "已阻止",
    "status.executing": "正在执行工具",
    "status.askingSummary": "正在让 LLM 总结",
    "status.complete": "完成",
    "status.error": "错误",
    "safety.ok": "未检测到有风险的数据指令，可以继续分析。",
    "safety.blocked": "该请求可能涉及敏感数据。代理不会处理密钥或个人身份信息。",
    "decision.safeStrategy": "停止分析并要求使用匿名化数据",
    "decision.default": "分析数据概况、总结数值列、比较类别、创建图表并生成发现",
    "decision.full": "结合类别比较、指标趋势分析、关系图和自然语言发现",
    "decision.metricDimension": "按类别比较主要指标、检查数值分布，并总结关键驱动因素",
    "decision.metricOnly": "分析数值指标、检测异常值，并总结分布模式",
    "decision.rationale": "问题：“{question}” 行数：{rows}；数值列：{numeric}；分类列：{categorical}。",
    "decision.defaultQuestion": "总结数据集并找出有用发现。",
    "decision.llmRationale": "LLM 规划器根据感知到的 CSV schema 选择了 {count} 个工具步骤。{rationale}",
    "decision.llmFallback": "{rationale} LLM 规划器不可用，因此使用确定性规划器。",
    "llm.used": " LLM 模式：已用于规划和最终叙述。",
    "llm.fallback": " LLM 模式：已使用回退方案{error}。",
    "llm.off": " LLM 模式：关闭。",
    "confidence": "{value}% 置信度",
    "fact.rows": "行数：{value}",
    "fact.columns": "列数：{value}",
    "fact.numeric": "数值列：{value}",
    "fact.categorical": "分类列：{value}",
    "fact.dates": "日期列：{value}",
    "fact.missing": "缺失单元格：{value}",
    "none": "无",
    "type.numeric": "数值",
    "type.categorical": "分类",
    "type.date": "日期",
    "step.inspect.title": "检查 schema 和数据质量",
    "step.inspect.detail": "统计行数、列数、检测到的类型和缺失单元格。",
    "step.numeric.title": "分析数值指标",
    "step.numeric.detail": "计算数值字段的总和、平均值、最小值、最大值和范围。",
    "step.group.title": "按 {dimension} 比较 {metric}",
    "step.group.detail": "按最强的分类维度聚合主要指标，并绘制柱状图。",
    "step.relationship.title": "绘制 {x} 与 {y} 的关系",
    "step.relationship.detail": "创建散点图，并计算两个数值字段之间的相关性。",
    "step.summary.title": "总结发现",
    "step.summary.detail": "把计算结果转化为简洁、易读的结论。",
    "step.safety.title": "停止不安全分析",
    "step.safety.detail": "{message}",
    "tool.label": "工具 {index}：{tool}",
    "tag.executed": "已执行",
    "tool.inspect.summary": "检测到 {rows} 行、{columns} 列、{missing} 个缺失单元格。",
    "finding.structure": "数据结构：{types}。缺失单元格：{missing}。",
    "tool.numeric.summary": "分析了 {count} 个数值列。",
    "finding.numeric": "{column}：总和 {sum}，平均值 {mean}，范围 {min}-{max}",
    "finding.noNumeric": "没有可用于分析的数值列。",
    "tool.group.summary": "已按 {dimension} 聚合 {metric}，并生成主柱状图。",
    "finding.groupTop": "{label} 在 {dimension} 中领先，{metric} 总计为 {value}。",
    "finding.groupBottom": "{label} 的 {metric} 总计最低，为 {value}。",
    "tool.relationship.summary": "已创建 {x} 与 {y} 的关系图。",
    "finding.relationship": "{x} 与 {y} 在此数据集中的相关系数为 {r}。",
    "finding.recommend": "建议：优先关注 {label}，因为它贡献了最强的 {metric} 结果。",
    "finding.qualityMissing": "数据质量提示：在用于高风险决策前，请先清理缺失值。",
    "finding.qualityClean": "数据质量提示：此示例数据没有缺失单元格。",
    "finding.method": "代理根据检测到的列类型自动选择步骤，然后执行工具生成图表和总结。",
    "tool.summary.summary": "已生成最终自然语言发现。",
    "tool.safety.summary": "由于请求可能涉及敏感数据，分析已停止。",
    "memory.loaded": "已加载 {rows} 行，并选择 {steps} 个分析步骤{llm}",
    "memory.withLlm": "（使用 LLM）",
    "memory.executed": "已执行 {tools} 个工具，并生成 {findings} 条发现",
    "sample.question": "按日期比较餐厅账单和小费，识别关系，并总结有用发现。",
    "upload.question": "分析这个上传的 CSV，并总结最重要的模式。",
    "fallback.question": "总结这个 CSV，并找出有用发现。",
    "canvas.main": "主图表会显示在这里",
    "canvas.relationship": "关系图会显示在这里",
    "chart.by": "{metric} 按 {dimension}",
    "chart.correlation": "相关系数 r = {r}",
    "error.csv": "CSV 需要包含表头行和至少一行数据。",
    "llm.summary.step": "生成 LLM 叙述总结",
    "llm.summary.success": "LLM 已将计算结果改写为最终发现。",
    "llm.summary.fail": "LLM 总结失败，保留确定性发现：{error}",
    "llm.prompt.plan": "你是 CSV 数据分析代理的规划模块。只能使用允许的工具名，选择一个简短且可执行的分析计划。只返回严格 JSON，字段为 strategy、rationale、confidence、steps。每个 step 必须包含 title、detail、tool。请用中文回答。允许的工具：{tools}。",
    "llm.prompt.summary": "你为用户总结 CSV 分析结果。只返回严格 JSON：{\"findings\":[\"...\"]}。发现必须具体，并且只能基于提供的计算结果。请用中文回答。",
    "llm.stepDefault": "运行这个已选择的分析工具。"
  },
  mi: {
    "eyebrow.assignment": "Tauira Mahi 2",
    "app.subtitle": "He kaiāwhina tātari CSV: ka mātaki i te raraunga, ka kōwhiri hipanga tātari, ka whakahaere taputapu, ka waihanga tūtohi, ka whakarāpopoto kitenga.",
    "label.language": "Reo",
    "section.perception": "Aromātai",
    "heading.csvInput": "Tāuru CSV",
    "button.sample": "Utaina te CSV tauira",
    "label.uploadCsv": "Tukuake CSV",
    "label.analysisGoal": "Whāinga tātari",
    "placeholder.question": "Tauira: Kimihia ngā kāwai kaha rawa, ngā ia, me ngā mahi whaihua.",
    "label.csvText": "Arokite CSV, whakapiri CSV rānei",
    "placeholder.csv": "Whakapiria te CSV ki konei, pāwhiria rānei + hei uta tauira.",
    "aria.llmConfig": "Tautuhinga LLM",
    "label.useLlm": "Whakamahia te LLM mō te whakamahere me te whakarāpopoto",
    "label.llmUrl": "URL API LLM",
    "label.model": "Tauira",
    "label.apiKey": "Kī API",
    "placeholder.apiKey": "Whakapirihia tō kī API ki konei. Ka tiakina ki tēnei pūtirotiro anake.",
    "hint.llm": "Kāore te kī e tukuna ki te kaupapa. Ki te hinga te LLM, ka hoki te kaiāwhina ki ngā taputapu tātari pūmau.",
    "button.run": "Whakahaere kaiāwhina tātari",
    "button.reset": "Tautuhi anō",
    "aria.agentOutput": "Putanga kaiāwhina",
    "section.reasoning": "Whakaaro me te mahi",
    "heading.workspace": "Wāhi mahi kaiāwhina",
    "button.export": "Kaweake JSON tātari",
    "heading.perceived": "Raraunga kua kitea",
    "heading.decision": "Whakataunga",
    "heading.steps": "Ngā hipanga tātari kua kōwhiria",
    "heading.execution": "Rangitaki whakahaere",
    "heading.summary": "Whakarāpopoto",
    "aria.chartsMemory": "Tūtohi me te maumahara",
    "section.actions": "Mahi",
    "heading.plotsMemory": "Tūtohi me te maumahara",
    "heading.mainPlot": "Tūtohi matua",
    "heading.relationshipPlot": "Tūtohi hononga",
    "aria.mainChart": "Tūtohi matua kua hangaia",
    "aria.relationshipChart": "Tūtohi hononga",
    "heading.safety": "Arowhai haumaru",
    "heading.memory": "Maumahara",
    "empty.noCsv": "Kāore anō kia tātarihia he CSV.",
    "empty.decision": "E tatari ana te kaiāwhina ki tētahi raraunga.",
    "empty.steps": "Ka kōwhiri te kaiāwhina i ngā hipanga i muri i te pānui CSV.",
    "empty.execution": "Kāore anō kia rere he taputapu tātari.",
    "empty.findings": "Kāore anō he kitenga.",
    "empty.memory": "Kāore he maumahara.",
    "empty.noPlan": "Kāore he mahere",
    "status.ready": "Kua rite",
    "status.parsing": "E pānui ana i te CSV",
    "status.askingLlm": "E pātai ana ki te LLM",
    "status.blocked": "Kua aukatia",
    "status.executing": "E whakahaere ana i ngā taputapu",
    "status.askingSummary": "E tono whakarāpopoto ana ki te LLM",
    "status.complete": "Kua oti",
    "status.error": "Hapa",
    "safety.ok": "Kāore he tohutohu raraunga mōrearea i kitea. Ka taea te tātari.",
    "safety.blocked": "Tērā pea he raraunga tairongo kei roto i te tono. Kāore te kaiāwhina e tukatuka kupuhipa, tuakiri rānei.",
    "decision.safeStrategy": "aukati te tātari me te tono raraunga kua whakatapuakoretia",
    "decision.default": "arotake i te raraunga, whakarāpopoto tīwae tau, whakataurite kāwai, hanga tūtohi, whakaputa kitenga",
    "decision.full": "whakakotahi i te whakataurite kāwai, te ia tau, te tūtohi hononga, me ngā kitenga reo māmā",
    "decision.metricDimension": "whakataurite i te ine matua puta noa i ngā kāwai, tirotiro tohatoha tau, me te whakarāpopoto take matua",
    "decision.metricOnly": "arotake i ngā ine tau, kimi uara rerekē, me te whakarāpopoto tauira tohatoha",
    "decision.rationale": "Pātai: \"{question}\" Rārangi: {rows}; tīwae tau: {numeric}; tīwae kāwai: {categorical}.",
    "decision.defaultQuestion": "Whakarāpopotohia te raraunga me ngā kitenga whaihua.",
    "decision.llmRationale": "I kōwhiri te LLM i ngā hipanga taputapu {count} mai i te hanganga CSV kua kitea. {rationale}",
    "decision.llmFallback": "{rationale} Kāore te LLM i wātea, nō reira i whakamahia te whakamahere pūmau.",
    "llm.used": " Aratau LLM: i whakamahia mō te whakamahere me te kōrero whakamutunga.",
    "llm.fallback": " Aratau LLM: kua whakamahia te ara hoki{error}.",
    "llm.off": " Aratau LLM: kua weto.",
    "confidence": "{value}% māia",
    "fact.rows": "Rārangi: {value}",
    "fact.columns": "Tīwae: {value}",
    "fact.numeric": "Tīwae tau: {value}",
    "fact.categorical": "Tīwae kāwai: {value}",
    "fact.dates": "Tīwae rā: {value}",
    "fact.missing": "Pūtau ngaro: {value}",
    "none": "kāore",
    "type.numeric": "tau",
    "type.categorical": "kāwai",
    "type.date": "rā",
    "step.inspect.title": "Tirohia te schema me te kounga raraunga",
    "step.inspect.detail": "Tatauria ngā rārangi, ngā tīwae, ngā momo kua kitea, me ngā pūtau ngaro.",
    "step.numeric.title": "Arotake i ngā ine tau",
    "step.numeric.detail": "Tātaihia te tapeke, toharite, iti rawa, nui rawa, me te whānui o ngā tīwae tau.",
    "step.group.title": "Whakataurite {metric} mā {dimension}",
    "step.group.detail": "Whakarōpūhia te ine matua mā te kāwai kaha, ā, tuhia he tūtohi pae.",
    "step.relationship.title": "Tūtohi hononga mō {x} me {y}",
    "step.relationship.detail": "Hangaia he tūtohi marara, ā, tātaihia te hononga o ngā tīwae tau e rua.",
    "step.summary.title": "Whakarāpopoto kitenga",
    "step.summary.detail": "Hurihia ngā hua tātai hei whakatau māmā, pānui-ngāwari.",
    "step.safety.title": "Aukati tātari mōrearea",
    "step.safety.detail": "{message}",
    "tool.label": "Taputapu {index}: {tool}",
    "tag.executed": "Kua rere",
    "tool.inspect.summary": "I kitea {rows} rārangi, {columns} tīwae, me {missing} pūtau ngaro.",
    "finding.structure": "Hanganga raraunga: {types}. Pūtau ngaro: {missing}.",
    "tool.numeric.summary": "I arotakengia {count} tīwae tau.",
    "finding.numeric": "{column}: tapeke {sum}, toharite {mean}, whānui {min}-{max}",
    "finding.noNumeric": "Kāore he tīwae tau hei arotake.",
    "tool.group.summary": "I whakarōpūhia {metric} mā {dimension}, ā, i hangaia te tūtohi pae matua.",
    "finding.groupTop": "Ko {label} te mea kaha i {dimension}, me te tapeke {metric} {value}.",
    "finding.groupBottom": "Ko {label} te tapeke {metric} iti rawa, arā {value}.",
    "tool.relationship.summary": "I hangaia he tūtohi hononga mō {x} me {y}.",
    "finding.relationship": "Ko te hononga o {x} me {y} i tēnei raraunga he {r}.",
    "finding.recommend": "Tohutohu: arotahi tuatahi ki {label}, nā te mea koirā te hua {metric} kaha rawa.",
    "finding.qualityMissing": "Kounga raraunga: horoia ngā uara ngaro i mua i ngā whakataunga nui.",
    "finding.qualityClean": "Kounga raraunga: kāore he pūtau ngaro i te tauira.",
    "finding.method": "I kōwhiri aunoa te kaiāwhina i ngā hipanga mai i ngā momo tīwae, kātahi ka whakahaere taputapu hei whakaputa tūtohi me te whakarāpopoto.",
    "tool.summary.summary": "Kua hangaia ngā kitenga reo māori whakamutunga.",
    "tool.safety.summary": "I aukatia te tātari nā te mea tērā pea he raraunga tairongo.",
    "memory.loaded": "Kua utaina {rows} rārangi, kua kōwhiria {steps} hipanga tātari{llm}",
    "memory.withLlm": " mā te LLM",
    "memory.executed": "Kua whakahaerehia {tools} taputapu, kua hangaia {findings} kitenga",
    "sample.question": "Whakatauritea ngā pire kai me ngā tīp mā te rā, kimi hononga, ā, whakarāpopotohia ngā kitenga whaihua.",
    "upload.question": "Tātarihia tēnei CSV kua tukuake, ā, whakarāpopotohia ngā tauira matua.",
    "fallback.question": "Whakarāpopotohia tēnei CSV me ngā kitenga whaihua.",
    "canvas.main": "Ka puta te tūtohi matua ki konei",
    "canvas.relationship": "Ka puta te tūtohi hononga ki konei",
    "chart.by": "{metric} mā {dimension}",
    "chart.correlation": "hononga r = {r}",
    "error.csv": "Me whai te CSV i tētahi rārangi pane me tētahi rārangi raraunga kotahi neke atu.",
    "llm.summary.step": "Hanga whakarāpopoto LLM",
    "llm.summary.success": "Kua tuhi anō te LLM i ngā hua tātai hei kitenga whakamutunga.",
    "llm.summary.fail": "I hinga te whakarāpopoto LLM, kua puritia ngā kitenga pūmau: {error}",
    "llm.prompt.plan": "Ko koe te roro whakamahere o tētahi kaiāwhina tātari CSV. Kōwhiria he mahere poto, ka taea te whakahaere, mā ngā ingoa taputapu kua whakaaetia anake. Whakahokia he JSON anake me ngā kī: strategy, rationale, confidence, steps. Me whai title, detail, tool ia step. Whakautua ki te reo Māori. Ngā taputapu: {tools}.",
    "llm.prompt.summary": "Whakarāpopotohia ngā hua tātari CSV mō te kaiwhakamahi. Whakahokia he JSON anake: {\"findings\":[\"...\"]}. Me noho ngā kitenga ki ngā hua kua tukuna. Whakautua ki te reo Māori.",
    "llm.stepDefault": "Whakahaerehia tēnei taputapu tātari kua kōwhiria."
  }
};

if (!translations[currentLanguage]) {
  currentLanguage = "en";
}

const elements = {
  form: document.querySelector("#analysisForm"),
  languageSelect: document.querySelector("#languageSelect"),
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

function t(key, params = {}) {
  const template = translations[currentLanguage]?.[key] || translations.en[key] || key;
  return template.replace(/\{(\w+)\}/g, (_, name) => params[name] ?? "");
}

function setStatus(key) {
  elements.status.textContent = t(key);
}

function applyLanguage() {
  document.documentElement.lang = currentLanguage === "zh" ? "zh-CN" : currentLanguage;
  elements.languageSelect.value = currentLanguage;

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.setAttribute("placeholder", t(node.dataset.i18nPlaceholder));
  });
  document.querySelectorAll("[data-i18n-title]").forEach((node) => {
    node.setAttribute("title", t(node.dataset.i18nTitle));
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
    node.setAttribute("aria-label", t(node.dataset.i18nAriaLabel));
  });

  if (agent.current) {
    render(agent.current, agent.memory);
    redrawCharts(agent.current);
    setStatus(agent.current.safety.blocked ? "status.blocked" : "status.complete");
  } else {
    clearCanvas(elements.barChart, t("canvas.main"));
    clearCanvas(elements.scatterChart, t("canvas.relationship"));
    render(null, agent.memory);
  }
}

const agent = {
  memory: loadMemory(),
  current: null,

  async run(input) {
    setStatus("status.parsing");
    const safety = this.checkSafety(input.question);
    const parsed = parseCsv(input.csv);
    const perception = this.perceive(parsed);
    let decision = this.decide(perception, input.question, safety);
    let plan = this.chooseSteps(perception, safety);
    const llm = { enabled: input.llm.enabled, used: false, error: "" };

    if (!safety.blocked && input.llm.enabled && input.llm.apiKey) {
      setStatus("status.askingLlm");
      try {
        const llmPlan = await requestLlmPlan(perception, input.question, input.llm);
        plan = normalizeLlmSteps(llmPlan.steps, plan);
        decision = {
          strategy: llmPlan.strategy || decision.strategy,
          confidence: clamp(Number(llmPlan.confidence) || decision.confidence, 0.5, 0.98),
          rationale: t("decision.llmRationale", { count: plan.length, rationale: llmPlan.rationale || decision.rationale })
        };
        llm.used = true;
      } catch (error) {
        llm.error = error.message;
        decision = {
          ...decision,
          rationale: t("decision.llmFallback", { rationale: decision.rationale })
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
    this.remember(t("memory.loaded", { rows: perception.rowCount, steps: plan.length, llm: llm.used ? t("memory.withLlm") : "" }));
    render(state, this.memory);

    if (safety.blocked) {
      setStatus("status.blocked");
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
          message: t("safety.blocked")
        }
      : {
          blocked: false,
          risk: "none",
          message: t("safety.ok")
        };
  },

  decide(perception, question, safety) {
    if (safety.blocked) {
      return {
        strategy: t("decision.safeStrategy"),
        confidence: 0.76,
        rationale: safety.message
      };
    }

    const hasMetric = Boolean(perception.likelyMetric);
    const hasDimension = Boolean(perception.likelyDimension);
    const hasDate = Boolean(perception.likelyDate);
    const questionText = question.trim() || t("decision.defaultQuestion");

    let strategy = t("decision.default");
    if (hasMetric && hasDimension && hasDate) {
      strategy = t("decision.full");
    } else if (hasMetric && hasDimension) {
      strategy = t("decision.metricDimension");
    } else if (hasMetric) {
      strategy = t("decision.metricOnly");
    }

    const confidence = Math.min(0.95, 0.52 + (hasMetric ? 0.15 : 0) + (hasDimension ? 0.12 : 0) + (hasDate ? 0.08 : 0) + (perception.rowCount >= 10 ? 0.08 : 0));

    return {
      strategy,
      confidence,
      rationale: t("decision.rationale", { question: questionText, rows: perception.rowCount, numeric: perception.numeric.length, categorical: perception.categorical.length })
    };
  },

  chooseSteps(perception, safety) {
    if (safety.blocked) {
      return [
        {
          title: t("step.safety.title"),
          detail: t("step.safety.detail", { message: safety.message }),
          tool: "safety_filter"
        }
      ];
    }

    const steps = [
      {
        title: t("step.inspect.title"),
        detail: t("step.inspect.detail"),
        tool: "inspect_schema"
      },
      {
        title: t("step.numeric.title"),
        detail: t("step.numeric.detail"),
        tool: "numeric_profile"
      }
    ];

    if (perception.likelyDimension && perception.likelyMetric) {
      steps.push({
        title: t("step.group.title", { metric: perception.likelyMetric.name, dimension: perception.likelyDimension.name }),
        detail: t("step.group.detail"),
        tool: "group_compare"
      });
    }

    if (perception.numeric.length >= 2) {
      steps.push({
        title: t("step.relationship.title", { x: perception.numeric[0].name, y: perception.numeric[1].name }),
        detail: t("step.relationship.detail"),
        tool: "relationship_plot"
      });
    }

    steps.push({
      title: t("step.summary.title"),
      detail: t("step.summary.detail"),
      tool: "summarize_findings"
    });

    return steps;
  },

  async executePlan(llmConfig) {
    if (!this.current) {
      return;
    }

    setStatus("status.executing");
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
      setStatus("status.askingSummary");
      try {
        const llmFindings = await requestLlmSummary(this.current, llmConfig);
        if (llmFindings.length) {
          this.current.findings = llmFindings;
          this.current.executionLog.push({
            tool: "llm_summary",
            step: t("llm.summary.step"),
            summary: t("llm.summary.success")
          });
        }
      } catch (error) {
        this.current.llm.error = error.message;
        this.current.executionLog.push({
          tool: "llm_summary",
          step: t("llm.summary.step"),
          summary: t("llm.summary.fail", { error: error.message })
        });
      }
    }

    this.remember(t("memory.executed", { tools: this.current.plan.length, findings: this.current.findings.length }));
    setStatus("status.complete");
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
    clearCanvas(elements.barChart, t("canvas.main"));
    clearCanvas(elements.scatterChart, t("canvas.relationship"));
    render(null, this.memory);
  }
};

const tools = {
  safety_filter(state) {
    return {
      summary: t("tool.safety.summary"),
      findings: [state.safety.message]
    };
  },

  inspect_schema(state) {
    const typeText = state.perception.columns.map((column) => `${column.name}: ${typeLabel(column.type)}`).join(", ");
    return {
      summary: t("tool.inspect.summary", { rows: state.perception.rowCount, columns: state.perception.columnCount, missing: state.perception.missingCells }),
      findings: [t("finding.structure", { types: typeText, missing: state.perception.missingCells })]
    };
  },

  numeric_profile(state) {
    const lines = state.perception.numeric.map((column) => {
      const values = getNumericValues(state.rows, column.name);
      const stats = describe(values);
      column.stats = stats;
      return t("finding.numeric", { column: column.name, sum: formatNumber(stats.sum), mean: formatNumber(stats.mean), min: formatNumber(stats.min), max: formatNumber(stats.max) });
    });

    return {
      summary: t("tool.numeric.summary", { count: state.perception.numeric.length }),
      findings: lines.length ? lines : [t("finding.noNumeric")]
    };
  },

  group_compare(state) {
    const dimension = state.perception.likelyDimension;
    const metric = state.perception.likelyMetric;
    const grouped = aggregateByCategory(state.rows, dimension.name, metric.name);
    state.charts.grouped = { dimension: dimension.name, metric: metric.name, grouped };
    drawBarChart(elements.barChart, grouped, t("chart.by", { metric: metric.name, dimension: dimension.name }), metric.name);

    const top = grouped[0];
    const bottom = grouped[grouped.length - 1];

    return {
      summary: t("tool.group.summary", { metric: metric.name, dimension: dimension.name }),
      findings: [
        t("finding.groupTop", { label: top.label, dimension: dimension.name, value: formatNumber(top.value), metric: metric.name }),
        t("finding.groupBottom", { label: bottom.label, value: formatNumber(bottom.value), metric: metric.name })
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
      summary: t("tool.relationship.summary", { x: xColumn.name, y: yColumn.name }),
      findings: [t("finding.relationship", { x: xColumn.name, y: yColumn.name, r: formatNumber(r) })]
    };
  },

  summarize_findings(state) {
    const metric = state.perception.likelyMetric;
    const dimension = state.perception.likelyDimension;
    const findings = [];

    if (metric && dimension && state.charts.grouped) {
      const top = state.charts.grouped.grouped[0];
      findings.push(t("finding.recommend", { label: top.label, metric: metric.name }));
    }

    if (state.perception.missingCells > 0) {
      findings.push(t("finding.qualityMissing"));
    } else {
      findings.push(t("finding.qualityClean"));
    }

    findings.push(t("finding.method"));

    return {
      summary: t("tool.summary.summary"),
      findings
    };
  }
};

function redrawCharts(state) {
  if (state?.charts?.grouped) {
    drawBarChart(
      elements.barChart,
      state.charts.grouped.grouped,
      t("chart.by", { metric: state.charts.grouped.metric, dimension: state.charts.grouped.dimension }),
      state.charts.grouped.metric
    );
  } else {
    clearCanvas(elements.barChart, t("canvas.main"));
  }

  if (state?.charts?.relationship) {
    const xName = state.charts.relationship.x;
    const yName = state.charts.relationship.y;
    const points = state.rows
      .map((row) => ({ x: toNumber(row[xName]), y: toNumber(row[yName]) }))
      .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
    drawScatterChart(elements.scatterChart, points, xName, yName, state.charts.relationship.correlation);
  } else {
    clearCanvas(elements.scatterChart, t("canvas.relationship"));
  }
}

function render(state, memory) {
  renderMemory(memory);

  if (!state) {
    setStatus("status.ready");
    elements.factsList.replaceChildren(li(t("empty.noCsv")));
    elements.decisionText.textContent = t("empty.decision");
    const emptyStep = li(t("empty.steps"));
    emptyStep.className = "empty-state";
    elements.planList.replaceChildren(emptyStep);
    elements.executionLog.replaceChildren(li(t("empty.execution")));
    elements.summaryList.replaceChildren(li(t("empty.findings")));
    elements.confidenceBadge.textContent = t("empty.noPlan");
    elements.safetyText.textContent = t("safety.ok");
    elements.safetyBox.classList.remove("warning");
    elements.safetyBox.classList.add("safe");
    return;
  }

  elements.safetyText.textContent = state.safety.message;
  elements.safetyBox.classList.toggle("warning", state.safety.blocked);
  elements.safetyBox.classList.toggle("safe", !state.safety.blocked);

  const facts = [
    t("fact.rows", { value: state.perception.rowCount }),
    t("fact.columns", { value: state.perception.columnCount }),
    t("fact.numeric", { value: state.perception.numeric.map((item) => item.name).join(", ") || t("none") }),
    t("fact.categorical", { value: state.perception.categorical.map((item) => item.name).join(", ") || t("none") }),
    t("fact.dates", { value: state.perception.dates.map((item) => item.name).join(", ") || t("none") }),
    t("fact.missing", { value: state.perception.missingCells })
  ];
  elements.factsList.replaceChildren(...facts.map((fact) => li(fact)));
  const llmNote = state.llm?.used
    ? t("llm.used")
    : state.llm?.enabled
      ? t("llm.fallback", { error: state.llm.error ? ` (${state.llm.error})` : "" })
      : t("llm.off");
  elements.decisionText.textContent = `${state.decision.strategy}. ${state.decision.rationale}${llmNote}`;
  elements.confidenceBadge.textContent = t("confidence", { value: Math.round(state.decision.confidence * 100) });

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
    tool.textContent = t("tool.label", { index: index + 1, tool: step.tool });
    content.append(title, detail, tool);

    const tag = document.createElement("span");
    tag.className = "step-tag";
    tag.textContent = t("tag.executed");
    item.append(content, tag);
    return item;
  }));

  renderExecution(state.executionLog);
  renderFindings(state.findings);
}

function renderExecution(entries) {
  if (!entries.length) {
    elements.executionLog.replaceChildren(li(t("empty.execution")));
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
    elements.summaryList.replaceChildren(li(t("empty.findings")));
    return;
  }

  elements.summaryList.replaceChildren(...findings.map((finding) => li(finding)));
}

function renderMemory(memory) {
  if (!memory.length) {
    elements.memoryList.replaceChildren(li(t("empty.memory")));
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
    throw new Error(t("error.csv"));
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
  ctx.fillText(t("chart.correlation", { r: formatNumber(r) }), margin.left + 180, 25);

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
      content: t("llm.prompt.plan", { tools: allowedTools.join(", ") })
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
      content: t("llm.prompt.summary")
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
          detail: String(step.detail || t("llm.stepDefault")).slice(0, 180),
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

function typeLabel(type) {
  return t(`type.${type}`);
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
    question: elements.question.value.trim() || t("fallback.question"),
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

elements.languageSelect.addEventListener("change", () => {
  currentLanguage = elements.languageSelect.value;
  localStorage.setItem(languageStorageKey, currentLanguage);
  applyLanguage();
});

elements.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await agent.run(readInput());
  } catch (error) {
    setStatus("status.error");
    elements.decisionText.textContent = error.message;
  }
});

elements.csvFile.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) {
    return;
  }
  elements.csvText.value = await file.text();
  elements.question.value ||= t("upload.question");
});

elements.sampleButton.addEventListener("click", () => {
  elements.csvText.value = sampleCsv;
  elements.question.value = t("sample.question");
  agent.run(readInput()).catch((error) => {
    setStatus("status.error");
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
applyLanguage();
