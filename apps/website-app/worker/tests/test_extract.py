import importlib.util, pathlib, json, zipfile
import pytest
ROOT=pathlib.Path(__file__).resolve().parents[1]
import sys
sys.path.insert(0,str(ROOT))
from extract import extract, NATIVE, preflight

@pytest.mark.parametrize("ext", sorted(NATIVE))
def test_native_formats_and_no_remote_resources(tmp_path,ext):
    content = "MLAI architecture keeps sources.\n\nReview due Friday."
    if ext in {"html","htm"}: content='<h1>MLAI architecture keeps sources.</h1><script>SECRET_EXECUTION</script><img src="https://never-contact.invalid/a"><p>Review due Friday.</p>'
    elif ext=="eml": content="Subject: MLAI architecture\nContent-Type: text/plain; charset=utf-8\n\nReview due Friday."
    elif ext=="csv": content="Product,Deadline\nMLAI,Friday"
    path=tmp_path/("sample."+ext);path.write_text(content)
    result=extract(path)
    assert "MLAI" in result["text"] and result["chunks"]
    assert "SECRET_EXECUTION" not in result["text"]
    assert all(c["location"] for c in result["chunks"])

def test_empty_binary_and_encrypted_rejected(tmp_path):
    path=tmp_path/"empty.txt";path.write_text("")
    with pytest.raises(ValueError,match="No readable"):extract(path)
    path.write_bytes(b"binary\x00content")
    with pytest.raises(ValueError,match="binary"):extract(path)
    path.write_bytes(b"%PDF-1.7")
    with pytest.raises(ValueError,match="match"):extract(path)
    from pypdf import PdfWriter
    pdf=PdfWriter();pdf.add_blank_page(width=600,height=800);pdf.encrypt("test-only-password")
    encrypted=tmp_path/"encrypted.pdf";pdf.write(encrypted)
    with pytest.raises(ValueError,match="encrypted"):extract(encrypted)

def test_office_tables_and_source_structure():
    result=extract(ROOT/"tests/fixtures/sample.docx")
    assert result["parser"]=="docling"
    assert "Abbey" in result["text"]
    assert any("Rust" in str(t["rows"]) for t in result["tables"])
    assert result["outline"]

def test_archive_expansion_is_bounded(tmp_path):
    # Metadata is checked before any format parser sees the archive.
    path=tmp_path/"bad.docx"
    with zipfile.ZipFile(path,"w") as z:
        for i in range(20001):z.writestr(str(i),"")
    with pytest.raises(ValueError,match="processing limit"):preflight(path)
