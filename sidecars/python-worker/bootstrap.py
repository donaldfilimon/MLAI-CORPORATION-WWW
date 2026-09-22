"""Install model assets and the checksum-verified Tika CLI before user files arrive."""
import pathlib,subprocess,sys,urllib.request,hashlib,shutil
ROOT=pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0,str(ROOT/"worker"))
from extract import java_command,tika_jar
if not shutil.which("soffice"):raise SystemExit("Install LibreOffice and put soffice on PATH, then rerun setup.")
if not java_command() or subprocess.run([java_command(),"-version"],capture_output=True).returncode:raise SystemExit("Install Java 21+ or set MLAI_JAVA to its executable, then rerun setup.")
jar=tika_jar();checksum=jar.with_suffix(".jar.sha512");url="https://downloads.apache.org/tika/3.3.2/tika-app-3.3.2.jar"
jar.parent.mkdir(parents=True,exist_ok=True)
if not checksum.exists():urllib.request.urlretrieve(url+".sha512",checksum)
if not jar.exists():
 temp=jar.with_suffix(".download");urllib.request.urlretrieve(url,temp);temp.replace(jar)
if hashlib.sha512(jar.read_bytes()).hexdigest().lower() not in checksum.read_text().lower():raise SystemExit("Tika checksum mismatch. Remove the downloaded jar and rerun setup.")
subprocess.run([sys.executable,"worker/embed.py","--download"],cwd=ROOT,check=True)
# Only synthetic fixtures may initiate parser model downloads. Actual worker
# extraction runs with remote fetching disabled and OS network denial on macOS.
from extract import extract
for name in ["sample.pdf","scanned.png"]:extract(ROOT/"worker/tests/fixtures"/name)
subprocess.run([sys.executable,"worker/validate_formats.py"],cwd=ROOT,check=True)
print("Document engines, model assets, and advertised formats verified.")
