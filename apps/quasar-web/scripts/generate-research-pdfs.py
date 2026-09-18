#!/usr/bin/env python3
"""Generate current PDF editions from the public research corpus (Bun + ReportLab + Matplotlib)."""
from io import BytesIO
import hashlib
import json
from pathlib import Path
import subprocess
from xml.sax.saxutils import escape

from matplotlib import mathtext
from matplotlib.font_manager import FontProperties
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image, Preformatted

ROOT = Path(__file__).resolve().parents[1]
DATE = '2026-09-06'
SLUGS = ['wdbx-weighted-backtrace-memory-store', 'multi-persona-routing-policy-weights']


def main():
    result = subprocess.run(['bun', '-e', 'import {research} from "./src/data/categories/research"; console.log(JSON.stringify(research))'], cwd=ROOT, check=True, capture_output=True, text=True)
    corpus = json.loads(result.stdout)
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name='Brand', fontName='Helvetica-Bold', fontSize=10, textColor=colors.HexColor('#147d94'), spaceAfter=16))
    styles['Title'].fontName = 'Helvetica-Bold'
    styles['Title'].fontSize = 22
    styles['Title'].leading = 27
    styles['Title'].alignment = TA_LEFT
    styles['BodyText'].fontSize = 10
    styles['BodyText'].leading = 15
    styles['BodyText'].spaceAfter = 10
    styles['Heading2'].fontSize = 13
    styles['Heading2'].keepWithNext = True
    styles['Heading2'].spaceBefore = 14
    styles.add(ParagraphStyle(name='Source', fontName='Helvetica', fontSize=8, leading=11, spaceAfter=10, wordWrap='CJK'))
    for paper in corpus['publications']:
        if paper['slug'] not in SLUGS:
            continue
        dest = ROOT / 'public/research' / f"{paper['slug']}-{DATE}.pdf"
        page_count = [0]
        def footer(canvas, doc):
            page_count[0] = doc.page
            canvas.saveState()
            canvas.setFont('Helvetica', 8)
            canvas.setFillColor(colors.HexColor('#52606d'))
            canvas.drawString(48, 30, f'MLAI Research | Reviewed {DATE} | Source-audited edition')
            canvas.drawRightString(564, 30, str(doc.page))
            canvas.restoreState()
        doc = SimpleDocTemplate(str(dest), pagesize=(612, 792), rightMargin=48, leftMargin=48, topMargin=45, bottomMargin=48, title=paper['title'], author=paper['authors'], invariant=1)
        story = [Paragraph('MLAI / RESEARCH', styles['Brand']), Paragraph(escape(paper['title']), styles['Title']), Spacer(1, 12), Paragraph(escape(paper['abstract']), styles['BodyText']), Paragraph(escape(f"{paper['status']} · Reviewed {DATE} · {paper['authors']}"), styles['BodyText']), Paragraph(escape(paper['statusNote']), styles['BodyText'])]
        for section in paper['body']:
            if section.get('heading'):
                story.append(Paragraph(escape(section['heading']), styles['Heading2']))
            for paragraph in section.get('paragraphs', []):
                story.append(Paragraph(escape(paragraph), styles['BodyText']))
            for formula in section.get('math', []):
                buffer = BytesIO()
                mathtext.math_to_image('$' + formula + '$', buffer, prop=FontProperties(size=12), dpi=180, format='png')
                buffer.seek(0)
                equation = Image(buffer)
                width, height = equation.imageWidth * 72 / 180, equation.imageHeight * 72 / 180
                scale = min(1, 516 / width)
                equation.drawWidth = width * scale
                equation.drawHeight = height * scale
                equation.hAlign = 'LEFT'
                story.extend([Spacer(1, 5), equation, Spacer(1, 12)])
            for item in section.get('list', []):
                story.append(Paragraph(escape(item), styles['BodyText']))
            for snippet in section.get('code', []):
                story.append(Preformatted(snippet['code'], styles['Code'], maxLineLength=84))
        story.append(Paragraph('Limitations', styles['Heading2']))
        for limitation in paper['limitations']:
            story.append(Paragraph(escape(limitation), styles['BodyText']))
        story.append(PageBreak())
        story.append(Paragraph('MLAI / EVIDENCE & SOURCES', styles['Brand']))
        story.append(Paragraph('Pinned implementation sources', styles['Heading2']))
        for source in paper['sources']:
            story.append(Paragraph(escape(source['title']) + '<br/>' + '<link href="' + escape(source['url']) + '">' + escape(source['url']) + '</link>', styles['Source']))
        story.append(Paragraph('This edition supersedes the June 2026 PDF. The original remains available as historical material; its broader claims must not be treated as current implementation evidence.', styles['BodyText']))
        doc.build(story, onFirstPage=footer, onLaterPages=footer)
        attachment = dict(title=f'Corrected source-audited PDF · {DATE}', url=f'/research/{dest.name}', edition='current', date=DATE, sha256=hashlib.sha256(dest.read_bytes()).hexdigest(), pages=page_count[0])
        paper['attachments'] = [attachment] + [a for a in paper['attachments'] if a['edition'] == 'historical']
        print(f'{dest.name}: {page_count[0]} pages, {attachment["sha256"]}')
    inventory_path = ROOT / 'docs/research-inventory.md'
    inventory = inventory_path.read_text()
    table_start = inventory.index('| PDF | Edition | SHA-256 | Pages |')
    table_end = inventory.index('\nCurrent edition validation:', table_start)
    table = '| PDF | Edition | SHA-256 | Pages |\n|---|---|---|---|\n'
    for paper in corpus['publications']:
        for attachment in paper['attachments']:
            table += f"| {attachment['url']} | {attachment['edition']} | `{attachment['sha256']}` | {attachment['pages']} |\n"
    inventory_path.write_text(inventory[:table_start] + table + inventory[table_end:])
    (ROOT/'src/data/categories/research-records.ts').write_text("import type { Research } from '../schemas';\n\nexport const researchRecords: Research = " + json.dumps(corpus, indent=2, ensure_ascii=False) + ';\n')


if __name__ == '__main__':
    main()
