from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

version = datetime.now().strftime("%Y%m%d%H%M%S")

output_path = BASE_DIR / "assets" / "js" / "app-version.js"
output_path.parent.mkdir(parents=True, exist_ok=True)

output_path.write_text(
    f'window.APP_VERSION = "{version}";\n',
    encoding="utf-8"
)

print(f"[OK] Version updated: {version}")
print(f"[OK] File: {output_path}")