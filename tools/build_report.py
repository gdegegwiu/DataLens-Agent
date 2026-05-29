from __future__ import annotations

import math
from pathlib import Path

from PIL import Image
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[1]
REPORT_DIR = ROOT / "report"
SCREENSHOT_DIR = ROOT / "screenshots"
PDF_PATH = REPORT_DIR / "Assignment2_DataLens_Report.pdf"


PAGE_W, PAGE_H = letter
MARGIN = 0.55 * inch
INK = colors.HexColor("#172033")
MUTED = colors.HexColor("#5c667a")
BLUE = colors.HexColor("#2754c5")
GREEN = colors.HexColor("#177a5b")
AMBER = colors.HexColor("#a76100")
RED = colors.HexColor("#b42318")
LINE = colors.HexColor("#c8d3e3")
SOFT = colors.HexColor("#f5f7fb")


styles = {
    "body": ParagraphStyle("body", fontName="Helvetica", fontSize=9.1, leading=12.1, textColor=INK),
    "small": ParagraphStyle("small", fontName="Helvetica", fontSize=7.8, leading=9.5, textColor=MUTED),
}


def draw_paragraph(c: canvas.Canvas, text: str, x: float, y: float, width: float, style_name: str = "body") -> float:
    para = Paragraph(text, styles[style_name])
    _, height = para.wrap(width, 160)
    para.drawOn(c, x, y - height)
    return y - height


def draw_title(c: canvas.Canvas, title: str, subtitle: str, page: int) -> None:
    c.setFillColor(BLUE)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(MARGIN, PAGE_H - 0.42 * inch, "Assignment 2")
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(MARGIN, PAGE_H - 0.68 * inch, title)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 8.6)
    c.drawString(MARGIN, PAGE_H - 0.88 * inch, subtitle)
    c.setStrokeColor(LINE)
    c.line(MARGIN, PAGE_H - 1.02 * inch, PAGE_W - MARGIN, PAGE_H - 1.02 * inch)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 8)
    c.drawRightString(PAGE_W - MARGIN, 0.35 * inch, f"Page {page} of 2")


def draw_section(c: canvas.Canvas, text: str, x: float, y: float) -> None:
    c.setFillColor(BLUE)
    c.setFont("Helvetica-Bold", 11.5)
    c.drawString(x, y, text)


def draw_box(c: canvas.Canvas, x: float, y: float, w: float, h: float, title: str, body: str, fill: colors.Color, stroke: colors.Color) -> None:
    c.setFillColor(fill)
    c.setStrokeColor(stroke)
    c.roundRect(x, y, w, h, 7, fill=1, stroke=1)
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 9.2)
    c.drawCentredString(x + w / 2, y + h - 18, title)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7.5)
    for i, line in enumerate(body.split("\n")[:2]):
        c.drawCentredString(x + w / 2, y + h - 32 - 10 * i, line)


def draw_arrow(c: canvas.Canvas, start: tuple[float, float], end: tuple[float, float], color: colors.Color = colors.HexColor("#2f4b7c")) -> None:
    x1, y1 = start
    x2, y2 = end
    c.setStrokeColor(color)
    c.setLineWidth(1.4)
    c.line(x1, y1, x2, y2)
    angle = math.atan2(y2 - y1, x2 - x1)
    size = 6
    points = [
        (x2, y2),
        (x2 - size * math.cos(angle - 0.45), y2 - size * math.sin(angle - 0.45)),
        (x2 - size * math.cos(angle + 0.45), y2 - size * math.sin(angle + 0.45)),
    ]
    path = c.beginPath()
    path.moveTo(*points[0])
    path.lineTo(*points[1])
    path.lineTo(*points[2])
    path.close()
    c.setFillColor(color)
    c.drawPath(path, fill=1, stroke=0)


def draw_architecture(c: canvas.Canvas, x: float, y: float, w: float, h: float) -> None:
    c.setFillColor(SOFT)
    c.setStrokeColor(LINE)
    c.roundRect(x, y, w, h, 8, fill=1, stroke=1)

    box_w = 92
    box_h = 52
    positions = {
        "CSV Input": (x + 22, y + 93),
        "Perception": (x + 153, y + 152),
        "Safety Gate": (x + 292, y + 152),
        "LLM Planner": (x + 153, y + 34),
        "Tool Layer": (x + 292, y + 34),
        "Outputs": (x + 428, y + 93),
    }
    fills = {
        "CSV Input": colors.HexColor("#eaf1ff"),
        "Perception": colors.white,
        "Safety Gate": colors.HexColor("#fff0ee"),
        "LLM Planner": colors.HexColor("#fff5e6"),
        "Tool Layer": colors.HexColor("#edf8f3"),
        "Outputs": colors.HexColor("#eaf1ff"),
    }
    strokes = {
        "CSV Input": BLUE,
        "Perception": LINE,
        "Safety Gate": RED,
        "LLM Planner": AMBER,
        "Tool Layer": GREEN,
        "Outputs": BLUE,
    }
    bodies = {
        "CSV Input": "upload, paste\nor sample",
        "Perception": "parse CSV\ninfer types",
        "Safety Gate": "check sensitive\ndata requests",
        "LLM Planner": "choose stats,\nplots, summary",
        "Tool Layer": "aggregate, stats\ncorrelation",
        "Outputs": "plots, findings\nJSON export",
    }

    for title, (bx, by) in positions.items():
        draw_box(c, bx, by, box_w, box_h, title, bodies[title], fills[title], strokes[title])

    def mid_right(name: str) -> tuple[float, float]:
        bx, by = positions[name]
        return bx + box_w, by + box_h / 2

    def mid_left(name: str) -> tuple[float, float]:
        bx, by = positions[name]
        return bx, by + box_h / 2

    def mid_top(name: str) -> tuple[float, float]:
        bx, by = positions[name]
        return bx + box_w / 2, by + box_h

    def mid_bottom(name: str) -> tuple[float, float]:
        bx, by = positions[name]
        return bx + box_w / 2, by

    draw_arrow(c, mid_right("CSV Input"), mid_left("Perception"))
    draw_arrow(c, mid_right("Perception"), mid_left("Safety Gate"))
    draw_arrow(c, mid_bottom("Safety Gate"), mid_top("Tool Layer"))
    draw_arrow(c, mid_right("LLM Planner"), mid_left("Tool Layer"))
    draw_arrow(c, mid_right("Tool Layer"), mid_left("Outputs"))
    draw_arrow(c, mid_bottom("CSV Input"), mid_left("LLM Planner"), GREEN)

    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7.3)
    c.drawCentredString(x + w / 2, y + 13, "LLM planning is optional; local tools execute the selected analysis.")


def prepare_report_images() -> dict[str, Path]:
    source = SCREENSHOT_DIR / "01-datalens-analysis.png"
    crops = {
        "workspace": (380, 185, 1045, 1240),
        "charts": (1060, 190, 1415, 1210),
        "summary": (400, 1980, 1045, 3070),
    }
    output = {}
    with Image.open(source) as image:
        for name, crop in crops.items():
            target = SCREENSHOT_DIR / f"report-datalens-{name}.png"
            image.crop(crop).save(target)
            output[name] = target
    return output


def image_in_frame(c: canvas.Canvas, path: Path, x: float, y: float, w: float, h: float) -> None:
    with Image.open(path) as image:
        iw, ih = image.size
    scale = min(w / iw, h / ih)
    draw_w = iw * scale
    draw_h = ih * scale
    c.setFillColor(colors.white)
    c.setStrokeColor(LINE)
    c.roundRect(x, y, w, h, 6, fill=1, stroke=1)
    c.drawImage(str(path), x + (w - draw_w) / 2, y + (h - draw_h) / 2, draw_w, draw_h, preserveAspectRatio=True, mask="auto")


def page_one(c: canvas.Canvas) -> None:
    draw_title(c, "DataLens Agent Report", "CSV analysis agent that chooses steps, creates plots, and summarizes findings", 1)
    y = PAGE_H - 1.25 * inch
    y = draw_paragraph(c, "<b>GitHub repository:</b> https://github.com/your-username/datalens-agent (replace with the uploaded repository URL before submission)", MARGIN, y, PAGE_W - 2 * MARGIN)
    y = draw_paragraph(c, "<b>Prototype:</b> A browser-based data analysis agent that accepts pasted or uploaded CSV data and runs an end-to-end analysis loop.", MARGIN, y - 4, PAGE_W - 2 * MARGIN)

    draw_section(c, "System Design", MARGIN, y - 16)
    draw_architecture(c, MARGIN, y - 236, PAGE_W - 2 * MARGIN, 205)

    y -= 258
    draw_section(c, "Design Explanation", MARGIN, y)
    y -= 14
    text = (
        "DataLens follows a perceive-decide-act agent loop. The user provides a CSV and an analysis goal. "
        "The perception module parses the CSV, infers numeric, categorical, and date columns, and checks missing values. "
        "The safety gate blocks requests that appear to involve secrets or sensitive identifiers. "
        "The optional LLM planner selects suitable analysis steps from the dataset shape, user goal, and checked options; if it is unavailable, deterministic rules select local tools. "
        "The tool layer executes schema inspection, numeric profiling, category aggregation, relationship plotting, missing-value checks, outlier scans, trend checks, custom notes, and summary generation."
    )
    y = draw_paragraph(c, text, MARGIN, y, PAGE_W - 2 * MARGIN)

    draw_section(c, "Agent Concepts Used", MARGIN, y - 12)
    y -= 28
    bullets = [
        "<b>Perception:</b> parses CSV rows and infers column types.",
        "<b>Decision making:</b> optionally uses an LLM planner, with deterministic fallback, to choose or refine selected analysis steps.",
        "<b>Action:</b> executes local analysis tools, draws charts on canvas, handles optional custom instructions, and can use the LLM to rewrite the final summary.",
        "<b>Memory:</b> records loaded datasets, LLM/fallback status, and executed tool runs in localStorage.",
        "<b>Safety:</b> refuses analysis requests involving secrets or sensitive identifiers.",
    ]
    for bullet in bullets:
        y = draw_paragraph(c, f"- {bullet}", MARGIN + 8, y, PAGE_W - 2 * MARGIN - 8)


def page_two(c: canvas.Canvas, images: dict[str, Path]) -> None:
    draw_title(c, "Screenshots and System Behavior", "Evidence of CSV perception, step choice, plotting, execution, and summary", 2)
    y = PAGE_H - 1.25 * inch
    y = draw_paragraph(c, "The screenshots below show the DataLens agent running a small public tips CSV sample. The agent combines detected fields with selected analysis options, then executes each step.", MARGIN, y, PAGE_W - 2 * MARGIN)

    top_y = y - 220
    image_in_frame(c, images["workspace"], MARGIN, top_y, 250, 200)
    image_in_frame(c, images["charts"], MARGIN + 270, top_y, 240, 200)
    draw_paragraph(c, "<b>1. Perception and decisions:</b> the agent detects 24 rows with numeric and categorical fields, then chooses analysis steps.", MARGIN, top_y - 12, 250, "small")
    draw_paragraph(c, "<b>2. Plot actions:</b> the agent creates a category comparison bar chart and a relationship scatter plot with correlation.", MARGIN + 270, top_y - 12, 240, "small")

    lower_y = top_y - 250
    image_in_frame(c, images["summary"], MARGIN, lower_y, 260, 200)
    detail_x = MARGIN + 280
    draw_section(c, "How It Works", detail_x, lower_y + 184)
    detail_y = lower_y + 166
    steps = [
        "<b>Input:</b> user uploads, pastes, or loads a sample CSV.",
        "<b>Perception:</b> CSV parser builds records and infers data types.",
        "<b>Decision:</b> the agent uses checked options and detected fields to choose profiling, aggregation, plotting, quality, custom, and summary steps.",
        "<b>Execution:</b> each selected tool runs and writes to the execution log.",
        "<b>Output:</b> charts, findings, memory, and JSON export make the result reproducible.",
    ]
    for step in steps:
        detail_y = draw_paragraph(c, f"- {step}", detail_x, detail_y, PAGE_W - MARGIN - detail_x)

    draw_paragraph(c, "<b>3. Summary:</b> findings explain top categories, numeric profiles, correlation, and recommended business action.", MARGIN, lower_y - 12, 260, "small")


def main() -> None:
    REPORT_DIR.mkdir(exist_ok=True)
    images = prepare_report_images()
    c = canvas.Canvas(str(PDF_PATH), pagesize=letter)
    c.setTitle("Assignment 2 - DataLens Agent Report")
    page_one(c)
    c.showPage()
    page_two(c, images)
    c.save()
    print(PDF_PATH)


if __name__ == "__main__":
    main()
