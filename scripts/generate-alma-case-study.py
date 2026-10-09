"""Bundle the Alma catalog sources for the in-app case study reader.

Requires openpyxl for the two source workbooks: pip install openpyxl
Run from the repository root: python scripts/generate-alma-case-study.py
"""

import csv
import json
from pathlib import Path

from openpyxl import load_workbook


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "src/data/almaCaseStudyDocuments.json"
SOURCES = [
    ("case-study-index", "Case study guide", "Start here", "1_Case_Study/README.md"),
    ("backgrounder", "Company backgrounder", "Company and decision", "1_Case_Study/alma-backgrounder.md"),
    ("business-case", "Assessment business case", "Company and decision", "1_Case_Study/alma-business-case.md"),
    ("fact-sheet", "Canonical fact sheet", "Company and decision", "0_Methodology/Alma-Fact-Sheet.md"),
    ("financials", "Q1 2026 financials", "Data and workpapers", "1_Case_Study/alma-financials-q1-2026.xlsx"),
    ("kpi-trends", "KPI trends", "Data and workpapers", "1_Case_Study/alma-kpi-trends.xlsx"),
    ("controls", "Control implementations", "Data and workpapers", "1_Case_Study/alma-controls.csv"),
    ("assessments", "Quarterly assessments", "Data and workpapers", "1_Case_Study/alma-assessments.csv"),
    ("scoring", "Scoring rubric and methodology", "Methodology", "0_Methodology/Scoring-Rubric-and-Methodology.md"),
    ("observation-template", "Observation template", "Methodology", "0_Methodology/Observation-Template.md"),
    ("schema", "Canonical schema", "Methodology", "0_Methodology/Canonical-Schema.md"),
    ("instructor-key", "Instructor key", "Methodology", "0_Methodology/Instructor-Key.md"),
    ("methodology-index", "Methodology guide", "Methodology", "0_Methodology/README.md"),
]


def display_value(cell):
    value = cell.value
    if value is None:
        return ""
    if isinstance(value, (int, float)):
        fmt = cell.number_format
        if "%" in fmt:
            return f"{value * 100:,.1f}".rstrip("0").rstrip(".") + "%"
        number = f"{value:,.0f}" if value == int(value) else f"{value:,.2f}".rstrip("0").rstrip(".")
        return ("$" if "$" in fmt else "") + number
    return str(value)


def build_document(doc_id, title, group, relative_path):
    source_path = f"ASSESSMENT_CATALOG/{relative_path}"
    path = ROOT / source_path
    document = {
        "id": doc_id,
        "title": title,
        "group": group,
        "sourcePath": source_path,
        "format": path.suffix[1:],
    }
    if path.suffix == ".md":
        document["content"] = path.read_text(encoding="utf-8")
    elif path.suffix == ".csv":
        with path.open(encoding="utf-8-sig", newline="") as source:
            document["rows"] = list(csv.reader(source))
    elif path.suffix == ".xlsx":
        workbook = load_workbook(path, read_only=True, data_only=True)
        document["sheets"] = [
            {
                "name": sheet.title,
                "rows": [[display_value(cell) for cell in row] for row in sheet],
            }
            for sheet in workbook.worksheets
        ]
        workbook.close()
    return document


if __name__ == "__main__":
    documents = [build_document(*source) for source in SOURCES]
    OUTPUT.write_text(json.dumps(documents, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Bundled {len(documents)} Alma documents into {OUTPUT.relative_to(ROOT)}")
