"""Exercise real fixtures and publish only capabilities that passed locally."""
import json,os,pathlib,subprocess,sys,tempfile,datetime
from importlib.metadata import version
ROOT=pathlib.Path(__file__).resolve().parent.parent
fixture=ROOT/"worker/tests/fixtures"
files=list(fixture.glob("*.*"))+list((fixture/"upstream").glob("*.*"))
passed=set();failures={};results=[]
for path in files:
    ext=path.suffix[1:]
    if ext in {"md","json"}:continue
    with tempfile.TemporaryDirectory() as tmp:
        target=pathlib.Path(tmp)/"result.json"
        try:
            command=[sys.executable,str(ROOT/"worker/extract.py"),str(path),str(target)]
            if sys.platform=="darwin":command=["sandbox-exec","-p","(version 1)(allow default)(deny network*)",*command]
            run=subprocess.run(command,capture_output=True,text=True,timeout=180,cwd=ROOT)
            if run.returncode!=0 or not target.exists():raise ValueError(run.stdout[-500:] or "Parser failed; inspect installed models and dependencies.")
            data=json.loads(target.read_text());assert data["chunks"] and data["text"].strip()
            if path.name.startswith("scanned"):assert "Friday" in data["text"],"OCR did not recover the fixture text"
            passed.add(ext);results.append({"fixture":path.name,"extension":ext,"parser":data["parser"],"chunks":len(data["chunks"]),"tables":len(data["tables"]),"warnings":data["warnings"]});print(f"PASS {path.name}",flush=True)
        except Exception as error:failures[path.name]=str(error);print(f"FAIL {path.name}: {error}",flush=True)
# Every OCR fixture must pass before advertising PDF/image OCR.
if any(name.startswith("scanned") for name in failures):passed-={"pdf","png"}
if "png" in passed:passed.update(["jpg","jpeg","tif","tiff","bmp","webp"])
report={"docling":version("docling"),"testedAt":datetime.datetime.now(datetime.timezone.utc).isoformat(),"extensions":sorted(passed),"fixtures":results,"failures":failures}
data_dir=pathlib.Path(os.getenv("MLAI_DATA_DIR",str(ROOT/".data")));data_dir.mkdir(parents=True,exist_ok=True)
(data_dir/"capabilities.json").write_text(json.dumps(report,indent=2));print(json.dumps({"passed":sorted(passed),"failed":list(failures)}))
if failures:sys.exit(1)
