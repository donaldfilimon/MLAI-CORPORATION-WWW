#!/usr/bin/env python3
"""Static preview mirror of the Swift routes. No new facts."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PREV = ROOT / "preview"
CSS = "../Public/css/theme.css"

NAV = [
    ("index.html", "Home", "/"),
    ("wdbx.html", "WDBX", "/wdbx"),
    ("abi.html", "ABI", "/abi"),
    ("abbey.html", "Abbey", "/abbey"),
    ("platform.html", "Platform", "/platform"),
    ("architecture.html", "Architecture", "/architecture"),
    ("company.html", "Company", "/company"),
    ("investors.html", "Investors", "/investors"),
    ("research.html", "Research", "/research"),
    ("services.html", "Services", "/services"),
    ("contact.html", "Contact", "/contact"),
]

NEXT = {
    "/": [("wdbx.html", "WDBX", "The vector store that lives with the data."), ("abi.html", "ABI", "GPU compute and orchestration on the same chip.")],
    "/wdbx": [("abi.html", "ABI Framework", "The kernels that make distance cheap."), ("architecture.html", "Architecture", "How storage sits on compute.")],
    "/abi": [("abbey.html", "Abbey", "The assistant layer that uses the stack."), ("wdbx.html", "WDBX", "Where embeddings persist.")],
    "/abbey": [("platform.html", "Platform", "Trace, control, eval, runtime."), ("research.html", "Research", "Scoring model and audit chain.")],
    "/platform": [("architecture.html", "Architecture", "The whole-stack flow."), ("services.html", "Services", "How teams engage.")],
    "/architecture": [("research.html", "Research", "Formal model behind retrieval."), ("wdbx.html", "WDBX", "Index and WAL in detail.")],
    "/company": [("investors.html", "Investors", "Thesis, labeled as a thesis."), ("contact.html", "Contact", "Mail goes to engineers.")],
    "/investors": [("research.html", "Research", "What is proven vs targeted."), ("company.html", "Company", "Origin and approach.")],
    "/research": [("architecture.html", "Architecture", "Where the formulas land."), ("platform.html", "Platform", "Evaluation mesh.")],
    "/services": [("contact.html", "Contact", "Start with a note to engineering."), ("platform.html", "Platform", "What a deployment actually contains.")],
    "/contact": [],
}

ACCENT = {
    "/": "#00D4FF",
    "/wdbx": "#00D4FF",
    "/abi": "#7C3AED",
    "/abbey": "#10B981",
    "/platform": "#7C3AED",
    "/architecture": "#00D4FF",
    "/company": "#10B981",
    "/investors": "#7C3AED",
    "/research": "#00D4FF",
    "/services": "#10B981",
    "/contact": "#00D4FF",
}


def nav(current):
    bits = []
    for href, label, key in NAV:
        cur = ' aria-current="page"' if key == current else ""
        cls = ' class="contact-btn"' if key == "/contact" else ""
        bits.append(f'<a href="{href}"{cur}{cls}>{label}</a>')
    return "\n        ".join(bits)


def stats(rows):
    out = []
    for value, label, prov in rows:
        glyph = {"measured": "●", "target": "○", "reported": "◆"}[prov]
        out.append(
            f'<div class="stat surface accent-edge"><div class="metric">{value}</div>'
            f'<div class="label">{label}</div>'
            f'<div class="prov prov-{prov}">{glyph} {prov}</div></div>'
        )
    return "\n        ".join(out)


def cards(items):
    return "\n        ".join(
        f'<article class="card surface surface-hover"><h3>{t}</h3><p>{b}</p></article>'
        for t, b in items
    )


def faq(items):
    return "\n        ".join(
        f"<details><summary>{q}</summary><p class='answer'>{a}</p></details>"
        for q, a in items
    )


def nextup(current):
    links = NEXT.get(current) or []
    if not links:
        return ""
    inner = "\n        ".join(
        f'<a class="card surface surface-hover accent-edge next-card" href="{href}"><h3>{label}</h3><p>{desc}</p></a>'
        for href, label, desc in links
    )
    return f"""
    <section class="section">
      <div class="wrap">
        <p class="eyebrow"><span class="tick"></span>Next</p>
        <h2>Keep going</h2>
        <div class="grid-2">
        {inner}
        </div>
      </div>
    </section>"""


def page(current, title, desc, kicker, h1, lead, inner):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <link rel="stylesheet" href="{CSS}">
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="wrap nav-bar">
      <a class="logo" href="index.html" aria-label="MLAI home"><span>MLAI</span></a>
      <nav class="nav-links" aria-label="Primary">
        {nav(current)}
      </nav>
      <details class="nav-toggle">
        <summary>Menu</summary>
        <nav class="nav-sheet" aria-label="Mobile">
        {nav(current)}
        </nav>
      </details>
    </div>
  </header>
  <main id="main" style="--accent:{ACCENT[current]}">
    <section class="section">
      <div class="wrap">
        <p class="eyebrow"><span class="tick"></span>{kicker}</p>
        <h1>{h1}</h1>
        <p class="lead">{lead}</p>
      </div>
    </section>
    {inner}
    {nextup(current)}
  </main>
  <hr class="brand-seam">
  <footer class="site-footer">
    <div class="wrap footer-grid">
      <p>MLAI</p>
      <p>Privacy-first AI infrastructure for Apple Silicon.</p>
      <p>Built on Apple's public frameworks — Metal, Accelerate, Core ML.</p>
      <p>Machine Learning Advanced Innovations, Inc. · Orlando, FL · Apache-2.0 · Zig 0.17-dev</p>
    </div>
  </footer>
</body>
</html>
"""


PAGES = {}

PAGES["index.html"] = page(
    "/",
    "MLAI — privacy-first AI infrastructure",
    "Privacy-first AI infrastructure for Apple Silicon.",
    "Thesis",
    "Privacy-first AI infrastructure for Apple Silicon.",
    "Most AI runs in someone else's cloud. MLAI is built on the opposite premise: inference, index, and data on the same chip.",
    f"""
    <section class="section tight"><div class="wrap stats-4">
      {stats([
        ("2.3 ms","WDBX p50 search latency","measured"),
        ("98.2%","WDBX Recall@10","measured"),
        ("84×","ABI MatMul 1024×1024","measured"),
        ("295×","ABI MatMul 4096×4096 benchmark track","target"),
      ])}
    </div></section>
    <section class="section tight"><div class="wrap"><p class="legend">● measured · ○ target · ◆ reported</p></div></section>
    <section class="section tight"><div class="wrap"><blockquote class="quote">We built one model to answer them all. It buckled under the weight of everything. So we built three — Abbey to understand you, Aviva the truth unfiltered, Abi to hold them in balance. On WDBX. Private by default. Yours alone. This is MLAI.</blockquote></div></section>
    <section class="section"><div class="wrap">
      <p class="eyebrow"><span class="tick"></span>Stack</p>
      <h2>Three layers, one chip</h2>
      <div class="grid-3">
        {cards([
          ("WDBX","Storage. HNSW, MVCC, hash-chained WAL. Cyan."),
          ("ABI","Compute. Tensors and Metal kernels. Violet."),
          ("Abbey","Application. Personas and local memory. Emerald."),
        ])}
      </div>
    </div></section>
    <section class="section"><div class="wrap">
      <h2>Questions worth answering plainly</h2>
      <div class="faq-list">
        {faq([
          ("What is measured versus a target?","A measured figure was reproduced on MLAI hardware. A target is an engineering goal. The 295× GPU number is a target."),
          ("Do you partner with Apple?","Built on Apple's public frameworks — Metal, Accelerate, Core ML."),
          ("Where does computation run?","Privacy is a property of where the computation physically runs."),
          ("What license is the core?","Apache-2.0. Zig is 0.17-dev."),
        ])}
      </div>
    </div></section>
    """,
)

PAGES["wdbx.html"] = page(
    "/wdbx", "WDBX — vector storage",
    "Logarithmic search on device.",
    "Storage", "WDBX",
    "A query enters at the top, greedily walks toward its nearest neighbor, drops a layer, and repeats. The result is logarithmic search. This structure is HNSW.",
    f"""
    <section class="section tight"><div class="wrap stats-4">
      {stats([
        ("2.3 ms","p50 search latency","measured"),
        ("98.2%","Recall@10","measured"),
        ("16.5K","QPS stress-test objective","target"),
        ("0.8 ms","p50 at 1M vectors","target"),
      ])}
    </div></section>
    <section class="section"><div class="wrap">
      <h2>FAQ</h2>
      <div class="faq-list">{faq([
        ("Is 16.5K QPS measured?","No. That figure is a stress-test objective, tagged a target."),
        ("Why not expand the acronym?","Two expansions exist in source materials. Neither is canonical here."),
      ])}</div>
    </div></section>
    """,
)

PAGES["abi.html"] = page(
    "/abi", "ABI Framework — compute",
    "Tensors and Metal kernels.",
    "Compute", "ABI Framework",
    "ABI is the compute layer. Tensors, Metal kernels, and zero-copy unified-memory pipelines live here so WDBX never ships vectors across a network to do math.",
    f"""
    <section class="section tight"><div class="wrap stats-4">
      {stats([
        ("5×","MatMul 128×128","measured"),
        ("84×","MatMul 1024×1024","measured"),
        ("13×","10-layer neural net","measured"),
        ("295×","MatMul 4096×4096 benchmark track","target"),
      ])}
    </div></section>
    <section class="section"><div class="wrap"><div class="faq-list">{faq([
      ("Is 295× a result?","No. MatMul 4096×4096 is a benchmark-track objective, tagged a target."),
      ("Which Zig version?","0.17-dev."),
    ])}</div></div></section>
    """,
)

PAGES["abbey.html"] = page(
    "/abbey", "Abbey — assistant layer",
    "Three personas, local memory.",
    "Application", "Abbey, Aviva, Abi",
    "Abbey is the assistant layer. Three personas share one core and one local memory.",
    f"""
    <section class="section tight"><div class="wrap stats-4">
      {stats([
        ("0.92","Abbey empathy score","reported"),
        ("90.5%","Abbey technical accuracy","reported"),
        ("30%","Aviva latency reduction vs hedged responses","reported"),
        ("40%","Aviva content density gain","reported"),
      ])}
    </div></section>
    <section class="section"><div class="wrap"><div class="grid-3">{cards([
      ("Abbey","Empathic polymath."),
      ("Aviva","Unfiltered expert."),
      ("Abi","Adaptive moderator."),
    ])}</div></div></section>
    """,
)

PAGES["platform.html"] = page(
    "/platform", "Platform — inspectable autonomy",
    "Trace, control, eval, runtime.",
    "Platform", "Autonomy you can inspect",
    "Four layers wrap orchestration so autonomy is inspectable.",
    f"""<section class="section"><div class="wrap"><div class="grid-2">{cards([
      ("Trace","Retrieval paths, policy checks, model decisions, tool calls."),
      ("Control","Plan, review, execute, escalate, or abstain."),
      ("Evaluation","Faithfulness, latency, safety, injection, review burden."),
      ("Runtime","Cloud, VPC, on-premise, offline-first."),
    ])}</div></div></section>""",
)

PAGES["architecture.html"] = page(
    "/architecture", "Architecture — one chip",
    "Inference, index, and data on the same chip.",
    "Architecture", "Same chip, four layers above silicon",
    "The inference, the index, and the data live on the same chip.",
    f"""<section class="section"><div class="wrap"><div class="grid-2">{cards([
      ("Silicon","Unified memory and the Neural Engine. Hardware spec, not an MLAI claim."),
      ("ABI","Tensors, Metal kernels, zero-copy pipelines."),
      ("WDBX","HNSW, MVCC, hash-chained WAL."),
      ("Abbey + Platform","Personas and inspectable runtime."),
    ])}</div></div></section>""",
)

PAGES["company.html"] = page(
    "/company", "Company — MLAI",
    "Delaware C-Corp in Orlando.",
    "Company", "Machine Learning Advanced Innovations, Inc.",
    "A Delaware C-Corp in Orlando. The work is private-by-default infrastructure, not a cloud wrapper.",
    f"""
    <section class="section tight"><div class="wrap stats-4">
      {stats([
        ("8+","years ML / systems","measured"),
        ("15%","LLVM compile-time reduction shipped","measured"),
        ("5","languages in production","measured"),
      ])}
    </div></section>
    <section class="section tight"><div class="wrap"><blockquote class="quote">Care first. Clarity always. Competence throughout.</blockquote></div></section>
    """,
)

PAGES["investors.html"] = page(
    "/investors", "Investors — thesis and targets",
    "Forward figures are targets.",
    "Investors", "A labeled bet",
    "The bet is privacy-first AI infrastructure purpose-built for Apple Silicon unified memory. Forward ARR and unit-economics figures on this page are targets.",
    f"""
    <section class="section tight"><div class="wrap stats-4">
      {stats([
        ("$1.5M","Pre-Seed raise","target"),
        ("$240K","18-month ARR milestone","target"),
        ("$50K+","ACV","target"),
        ("85%+","gross margin","target"),
      ])}
    </div></section>
    """,
)

PAGES["research.html"] = page(
    "/research", "Research — scoring and audit",
    "Four-term retrieval score.",
    "Research", "A score with four terms",
    "Retrieval is scored, not hoped. Similarity, recency, causal hop, and source authority multiply.",
    f"""<section class="section"><div class="wrap"><div class="grid-2">{cards([
      ("σ similarity","Cosine over HNSW."),
      ("τ recency","Temporal half-life decay."),
      ("γ causal hop","max(0.25, 0.6^h)."),
      ("π authority","Inferred 0.30 through system-pinned 1.00."),
    ])}</div></div></section>""",
)

PAGES["services.html"] = page(
    "/services", "Services — how to work together",
    "Engineering time, named plainly.",
    "Services", "Engineering time, named plainly",
    "Open-core first. Pro and Enterprise when a team needs a contract and a runtime they can inspect.",
    f"""<section class="section"><div class="wrap"><div class="grid-2">{cards([
      ("Core","Apache-2.0."),
      ("Pro","Listed at $99/mo."),
      ("Enterprise","Listed $50K–250K."),
      ("Cloud","Usage-based."),
    ])}</div></div></section>""",
)

PAGES["contact.html"] = page(
    "/contact", "Contact — MLAI",
    "Mail goes to engineers.",
    "Contact", "Mail goes to engineers.",
    "Say what you are trying to run locally and where it currently leaves the device.",
    f"""<section class="section"><div class="wrap grid-2">{cards([
      ("GitHub","github.com/donaldfilimon"),
      ("X","x.com/donaldfilimonx"),
      ("Site","donaldfilimon.com"),
      ("ABI docs","donaldfilimon.github.io/abi"),
    ])}</div></section>""",
)


def main():
    PREV.mkdir(parents=True, exist_ok=True)
    for name, html in PAGES.items():
        path = PREV / name
        path.write_text(html)
        print("wrote", path)


if __name__ == "__main__":
    main()
