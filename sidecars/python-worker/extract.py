"""Local document extraction. Stdout is a single JSON result, never a log stream."""
from __future__ import annotations
import csv, email, importlib.util, io, json, os, pathlib, re, shutil, sys, subprocess, tempfile, zipfile
from email import policy
from importlib.metadata import version, PackageNotFoundError

TEXT_EXTENSIONS = {"txt", "md", "markdown", "py", "rs", "ts", "tsx", "js", "jsx", "css", "sql", "log", "yaml", "yml", "toml", "json", "xml", "tex", "adoc"}
NATIVE = TEXT_EXTENSIONS | {"csv", "html", "htm", "eml"}
DOCLING = {"pdf", "docx", "xlsx", "pptx", "odt", "ods", "odp", "epub", "pages", "png", "jpg", "jpeg", "tiff", "tif", "bmp", "webp", "msg"}
LEGACY = {"doc", "xls", "ppt"}
TIKA = {"numbers", "key", "rtf", "msg"}
ROOT = pathlib.Path(__file__).resolve().parent.parent

def java_command():
    configured = os.getenv("MLAI_JAVA")
    for path in [configured, "/opt/homebrew/opt/openjdk@21/bin/java", shutil.which("java")]:
        if path and pathlib.Path(path).is_file(): return path
    return None

def tika_jar(): return pathlib.Path(os.getenv("MLAI_TIKA_JAR", str(ROOT / ".tools/tika-app-3.3.2.jar")))

def capabilities():
    try: parser_version = version("docling")
    except PackageNotFoundError: parser_version = None
    report_path = pathlib.Path(os.getenv("MLAI_DATA_DIR", str(ROOT / ".data"))) / "capabilities.json"
    try: report = json.loads(report_path.read_text())
    except (OSError, ValueError): report = {}
    tested = set(report.get("extensions", [])) if report.get("docling") == parser_version else set()
    semantic = False
    try:
        from embed import model_path
        model_path(); semantic = True
    except Exception: pass
    return {"native": sorted(NATIVE), "structured": sorted((DOCLING | TIKA) & tested), "legacy": sorted(LEGACY & tested) if shutil.which("soffice") else [], "tika": tika_jar().is_file() and bool(java_command()), "ocr": "pdf" in tested and "png" in tested, "parser": "docling", "version": parser_version, "semantic": semantic, "testedAt": report.get("testedAt"), "untested": sorted((DOCLING | LEGACY | TIKA) - tested)}

def preflight(path):
    head = path.open("rb").read(16)
    ext = path.suffix.lower().lstrip(".")
    if ext in NATIVE and (head.startswith((b"%PDF", b"PK\x03\x04", b"\xd0\xcf\x11\xe0"))): raise ValueError("File contents do not match the declared text format.")
    if zipfile.is_zipfile(path):
        with zipfile.ZipFile(path) as archive:
            infos=archive.infolist()
            if len(infos)>20000 or sum(i.file_size for i in infos)>300*1024*1024: raise ValueError("The archive expands beyond the processing limit.")
            if any(i.flag_bits & 1 for i in infos): raise ValueError("The document archive is encrypted.")
    if ext == "pdf":
        from pypdf import PdfReader
        reader=PdfReader(path)
        if reader.is_encrypted: raise ValueError("This PDF is encrypted. Upload an unlocked copy.")

def tika_extract(path, result):
    if not tika_jar().is_file() or not java_command(): raise ValueError("Apache Tika and Java must be installed for this format.")
    completed=subprocess.run([java_command(), "-Xmx768m", "-jar", str(tika_jar()), "--html", str(path)],capture_output=True,timeout=90)
    if completed.returncode: raise ValueError("Apache Tika could not parse this file. It may be corrupt or encrypted.")
    from bs4 import BeautifulSoup
    soup=BeautifulSoup(completed.stdout,"html.parser")
    for node in soup(["script","style","iframe","object"]): node.decompose()
    result["text"]=soup.get_text("\n",strip=True)
    result["chunks"]=chunks_from_text(result["text"])
    for i,table in enumerate(soup.find_all("table")):
        rows=[[c.get_text(" ",strip=True) for c in row.find_all(["td","th"])] for row in table.find_all("tr")]
        result["tables"].append({"name":f"Table {i+1}","rows":rows,"location":{"table":i+1}})
    result["parser"]="tika"; result["version"]="3.3.2"
    result["warnings"].append("Tika extraction preserves text and available tables; exact page and layout locations may be unavailable.")
    return result


def chunks_from_text(text, location=None):
    paragraphs = re.split(r"\n\s*\n", text.strip())
    chunks = []
    for paragraph in paragraphs:
        for start in range(0, len(paragraph), 1800):
            part = paragraph[start:start + 2000].strip()
            if part: chunks.append({"content": part, "location": location or {"section": len(chunks) + 1}})
    return chunks

def extract(path: pathlib.Path):
    preflight(path)
    ext = path.suffix.lower().lstrip(".")
    result = {"chunks": [], "tables": [], "outline": [], "warnings": [], "parser": "native", "version": "1", "text": ""}
    if ext in TIKA:
        result = tika_extract(path, result)
    elif ext in LEGACY:
        target = {"doc":"docx","xls":"xlsx","ppt":"pptx"}[ext]
        if not shutil.which("soffice"): raise ValueError("LibreOffice is not installed.")
        with tempfile.TemporaryDirectory(prefix="mlai-convert-") as temp:
            tmp=pathlib.Path(temp); profile=tmp/"profile"; (profile/"user").mkdir(parents=True)
            (profile/"user/registrymodifications.xcu").write_text('<oor:items xmlns:oor="http://openoffice.org/2001/registry"><item oor:path="/org.openoffice.Office.Common/Security/Scripting"><prop oor:name="MacroSecurityLevel" oor:op="fuse"><value>3</value></prop></item><item oor:path="/org.openoffice.Office.Common/Security/Scripting"><prop oor:name="DisableMacrosExecution" oor:op="fuse"><value>true</value></prop></item></oor:items>')
            converted=subprocess.run([shutil.which("soffice"), f"-env:UserInstallation={profile.as_uri()}","--headless","--norestore","--convert-to",target,"--outdir",str(tmp),str(path)],capture_output=True,timeout=60)
            destination=tmp/(path.stem+"."+target)
            if converted.returncode or not destination.is_file(): raise ValueError("LibreOffice could not convert this legacy document.")
            result=extract(destination)
            result["parser"]="libreoffice+"+result["parser"]
            result["warnings"].append("Legacy Office conversion may change layout. Compare the extracted content with the original.")
    elif ext in NATIVE:
        raw = path.read_text(encoding="utf-8-sig", errors="replace")
        if "\x00" in raw: raise ValueError("The file contains binary content, not readable text.")
        if "\ufffd" in raw: result["warnings"].append("Some characters could not be decoded as UTF-8.")
        if ext in {"html", "htm"}:
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(raw, "html.parser")
            for element in soup(["script", "style", "iframe", "object"]): element.decompose()
            raw = soup.get_text("\n", strip=True)
        elif ext == "eml":
            message = email.message_from_string(raw, policy=policy.default)
            body = message.get_body(preferencelist=("plain", "html"))
            raw = f"Subject: {message.get('subject', '')}\n\n{body.get_content() if body else ''}"
            if body and body.get_content_type() == "text/html":
                from bs4 import BeautifulSoup
                raw = BeautifulSoup(raw, "html.parser").get_text("\n", strip=True)
        elif ext == "csv":
            rows = list(csv.reader(io.StringIO(raw)))
            result["tables"] = [{"name": "Table 1", "rows": rows[:10000], "location": {"sheet": 1}}]
            result["chunks"] = [{"content": " | ".join(row), "location": {"row": i + 1}} for i, row in enumerate(rows) if any(row)]
        result["text"] = raw
        result["outline"] = [line.lstrip("# ") for line in raw.splitlines() if re.match(r"^#{1,6} ", line)][:100]
        if not result["chunks"]: result["chunks"] = chunks_from_text(raw)
    else:
        from docling.document_converter import DocumentConverter
        from docling.datamodel.pipeline_options import PdfPipelineOptions
        from docling.datamodel.base_models import InputFormat
        from docling.document_converter import PdfFormatOption, ImageFormatOption
        opts = PdfPipelineOptions()
        opts.do_ocr = True
        opts.do_table_structure = True
        opts.enable_remote_services = False
        converter = DocumentConverter(format_options={InputFormat.PDF: PdfFormatOption(pipeline_options=opts), InputFormat.IMAGE: ImageFormatOption(pipeline_options=opts)})
        converted = converter.convert(path, raises_on_error=False)
        status = str(converted.status).lower()
        if "failure" in status: raise ValueError("Document conversion failed. It may be corrupt, encrypted, or unsupported by the installed parser.")
        document = converted.document
        result["text"] = document.export_to_markdown()
        result["parser"] = "docling"
        result["version"] = version("docling")
        if "partial" in status: result["warnings"].append("The parser reported a partial conversion. Review the extracted content.")
        for item, _ in document.iterate_items():
            content = getattr(item, "text", "")
            provenance = getattr(item, "prov", [])
            location = {("slide" if ext == "pptx" else "sheet" if ext == "xlsx" else "page"): provenance[0].page_no} if provenance else {"section": len(result["chunks"]) + 1}
            if getattr(item, "label", "") in {"section_header", "title"} and content: result["outline"].append(content)
            if content: result["chunks"].extend(chunks_from_text(content, location))
        for i, table in enumerate(document.tables):
            frame = table.export_to_dataframe(doc=document)
            rows = [list(map(str, frame.columns))] + frame.fillna("").astype(str).values.tolist()
            prov = getattr(table, "prov", [])
            location = {("slide" if ext == "pptx" else "sheet" if ext == "xlsx" else "page"): prov[0].page_no} if prov else {"table": i + 1}
            result["tables"].append({"name": f"Table {i + 1}", "rows": rows[:10000], "location": location})
            result["chunks"].extend(chunks_from_text("\n".join(" | ".join(r) for r in rows), location))
        if not result["chunks"]: result["chunks"] = chunks_from_text(result["text"])
    if not result["text"].strip() or not result["chunks"]: raise ValueError("No readable content was extracted. Scanned content may require an OCR language pack.")
    if len(result["chunks"]) > 10000:
        result["chunks"] = result["chunks"][:10000]
        result["warnings"].append("Extraction exceeded the 10,000-chunk limit; only the first portion is indexed.")
    return result

def main():
    if len(sys.argv) == 2 and sys.argv[1] == "--capabilities": print(json.dumps(capabilities())); return
    path = pathlib.Path(sys.argv[1]).resolve()
    destination = pathlib.Path(sys.argv[2]).resolve()
    try:
        # Library progress/logging is deliberately kept out of the JSON transport.
        result = extract(path)
        destination.write_text(json.dumps(result, ensure_ascii=False), encoding="utf8")
        print(json.dumps({"ok": True}))
    except Exception as error:
        message = str(error)[:500] if isinstance(error, ValueError) else "Document parsing failed. The file may be corrupt, encrypted, or unsupported by the installed parser."
        print(json.dumps({"ok": False, "error": message}))
        sys.exit(1)

if __name__ == "__main__": main()
