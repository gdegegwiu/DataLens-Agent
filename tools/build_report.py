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
PDF_PATH = REPORT_DIR / "Assignment2_GoalPilot_Report.pdf"


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
    "body": ParagraphStyle(
        "body",
        fontName="Helvetica",
        fontSize=9.2,
        leading=12.2,
        textColor=INK,
        spaceAfter=4,
    ),
    "small": ParagraphStyle(
        "small",
        fontName="Helvetica",
        fontSize=7.8,
        leading=9.6,
        textColor=MUTED,
    ),
    "h2": ParagraphStyle(
        "h2",
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=14,
        textColor=INK,
    ),
}


def draw_paragraph(c: canvas.Canvas, text: str, x: float, y: float, width: float, style_name: str = "body") -> float:
    para = Paragraph(text, styles[style_name])
    _, height = para.wrap(width, 120)
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


def draw_section_label(c: canvas.Canvas, text: str, x: float, y: float) -> None:
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
    c.setFont("Helvetica", 7.4)
    lines = body.split("\n")
    for i, line in enumerate(lines[:2]):
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

    box_w = 91
    box_h = 52
    positions = {
        "User UI": (x + 22, y + 93),
        "Perception": (x + 153, y + 152),
        "Safety Gate": (x + 292, y + 152),
        "Memory": (x + 153, y + 34),
        "Planner": (x + 292, y + 34),
        "Actions": (x + 428, y + 93),
    }
    fills = {
        "User UI": colors.HexColor("#eaf1ff"),
        "Perception": colors.white,
        "Safety Gate": colors.HexColor("#fff0ee"),
        "Memory": colors.HexColor("#fff5e6"),
        "Planner": colors.HexColor("#edf8f3"),
        "Actions": colors.HexColor("#eaf1ff"),
    }
    strokes = {
        "User UI": BLUE,
        "Perception": LINE,
        "Safety Gate": RED,
        "Memory": AMBER,
        "Planner": GREEN,
        "Actions": BLUE,
    }
    bodies = {
        "User UI": "goal, context\nfeedback",
        "Perception": "extract facts\nand outputs",
        "Safety Gate": "block or redirect\nrisky goals",
        "Memory": "recent plans\nand feedback",
        "Planner": "strategy and\nstep selection",
        "Actions": "plan, revise\nexport state",
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

    draw_arrow(c, mid_right("User UI"), mid_left("Perception"))
    draw_arrow(c, mid_right("Perception"), mid_left("Safety Gate"))
    draw_arrow(c, mid_bottom("Safety Gate"), mid_top("Planner"))
    draw_arrow(c, mid_right("Memory"), mid_left("Planner"))
    draw_arrow(c, mid_right("Planner"), mid_left("Actions"))
    draw_arrow(c, (positions["Actions"][0] + 30, positions["Actions"][1]), (positions["Memory"][0] + 20, positions["Memory"][1]), GREEN)

    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7.3)
    c.drawCentredString(x + w / 2, y + 13, "Feedback updates memory, then the planner revises the next action.")


def prepare_report_images() -> dict[str, Path]:
    crops = {
        "plan": ("01-sample-plan.png", (300, 130, 965, 1285)),
        "feedback": ("02-feedback-memory.png", (290, 135, 1245, 1600)),
        "safety": ("03-safety-redirection.png", (290, 135, 1245, 1050)),
    }
    output = {}
    for name, (filename, crop) in crops.items():
        source = SCREENSHOT_DIR / filename
        target = SCREENSHOT_DIR / f"report-{name}.png"
        with Image.open(source) as image:
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
    draw_title(c, "GoalPilot Agent Report", "An intelligent personal task-planning agent prototype", 1)
    y = PAGE_H - 1.25 * inch
    y = draw_paragraph(c, "<b>GitHub repository:</b> https://github.com/your-username/goalpilot-agent (replace with the uploaded repository URL before submission)", MARGIN, y, PAGE_W - 2 * MARGIN)
    y = draw_paragraph(c, "<b>Prototype:</b> A browser-based agent that transforms a user goal into a concrete, adaptive action plan.", MARGIN, y - 4, PAGE_W - 2 * MARGIN)

    draw_section_label(c, "System Design", MARGIN, y - 16)
    draw_architecture(c, MARGIN, y - 236, PAGE_W - 2 * MARGIN, 205)

    y = y - 258
    draw_section_label(c, "Design Explanation", MARGIN, y)
    y -= 14
    text = (
        "GoalPilot follows a classic agent loop. The UI collects the user's goal, deadline, available hours, planning style, and feedback. "
        "The perception module extracts task category, keywords, required outputs, missing information, and deadline pressure. "
        "The safety gate checks for harmful or academically risky requests before planning. The planner chooses a strategy and decomposes the goal into ordered steps. "
        "The action manager renders the plan, applies feedback, marks progress, and exports JSON. Memory stores recent events in localStorage so the agent can revise future behavior."
    )
    y = draw_paragraph(c, text, MARGIN, y, PAGE_W - 2 * MARGIN)

    draw_section_label(c, "Agent Concepts Used", MARGIN, y - 12)
    y -= 28
    bullets = [
        "<b>Perception:</b> converts raw text input into structured facts.",
        "<b>Decision making:</b> selects a planning strategy from deadline pressure, outputs, time, and style.",
        "<b>Action:</b> generates, revises, completes, and exports a task plan.",
        "<b>Memory:</b> remembers the latest plans, feedback, and progress events.",
        "<b>Safety:</b> redirects unsafe or academic-integrity violating goals to legitimate alternatives.",
    ]
    for bullet in bullets:
        y = draw_paragraph(c, f"- {bullet}", MARGIN + 8, y, PAGE_W - 2 * MARGIN - 8)


def page_two(c: canvas.Canvas, images: dict[str, Path]) -> None:
    draw_title(c, "Screenshots and System Behavior", "Evidence of perception, decision making, action, memory, and safety", 2)
    y = PAGE_H - 1.25 * inch
    y = draw_paragraph(c, "The screenshots below show the prototype running through three representative scenarios: normal planning, feedback-driven replanning, and safety redirection.", MARGIN, y, PAGE_W - 2 * MARGIN)

    top_y = y - 218
    image_in_frame(c, images["plan"], MARGIN, top_y, 245, 200)
    image_in_frame(c, images["feedback"], MARGIN + 265, top_y, 245, 200)
    draw_paragraph(c, "<b>1. Generated plan:</b> the agent perceives the Assignment 2 goal, classifies it as an academic project, extracts outputs, and creates an ordered plan.", MARGIN, top_y - 12, 245, "small")
    draw_paragraph(c, "<b>2. Feedback and memory:</b> after feedback, the plan gains testing, evidence, and safety documentation steps; progress updates are stored in memory.", MARGIN + 265, top_y - 12, 245, "small")

    safety_y = top_y - 242
    image_in_frame(c, images["safety"], MARGIN, safety_y, 260, 190)
    explanation_x = MARGIN + 278
    draw_section_label(c, "How It Works", explanation_x, safety_y + 174)
    detail_y = safety_y + 158
    steps = [
        "<b>Input:</b> the user provides a goal and constraints.",
        "<b>Reasoning:</b> the agent extracts facts, estimates urgency, checks safety, then selects a strategy.",
        "<b>Output:</b> the agent produces actionable steps with tags such as Perceive, Design, Act, Verify, and Safety.",
        "<b>Adaptation:</b> feedback inserts or removes steps, while completed steps update the state.",
        "<b>Safety:</b> unsafe requests, such as cheating, are redirected to ethical learning alternatives.",
    ]
    for step in steps:
        detail_y = draw_paragraph(c, f"- {step}", explanation_x, detail_y, PAGE_W - MARGIN - explanation_x)

    draw_paragraph(c, "<b>3. Safety redirection:</b> the safety gate refuses academic misconduct and changes the action plan to a legitimate support path.", MARGIN, safety_y - 12, 260, "small")


def main() -> None:
    REPORT_DIR.mkdir(exist_ok=True)
    images = prepare_report_images()
    c = canvas.Canvas(str(PDF_PATH), pagesize=letter)
    c.setTitle("Assignment 2 - GoalPilot Agent Report")
    page_one(c)
    c.showPage()
    page_two(c, images)
    c.save()
    print(PDF_PATH)


if __name__ == "__main__":
    main()
