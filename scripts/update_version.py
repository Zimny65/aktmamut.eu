from datetime import datetime
from pathlib import Path
import re

BASE_DIR = Path(__file__).resolve().parent.parent

version = datetime.now().strftime("%Y%m%d%H%M%S")

output_path = BASE_DIR / "assets" / "js" / "app-version.js"
output_path.parent.mkdir(parents=True, exist_ok=True)

HTML_PATHS = [
    BASE_DIR / "index.html",
    BASE_DIR / "expeditions" / "index.html",
    BASE_DIR / "challenges" / "index.html",
    BASE_DIR / "challenges" / "list.html",
    BASE_DIR / "challenges" / "manual.html",
    BASE_DIR / "statistics" / "index.html",
    BASE_DIR / "app" / "index.html",
]


def update_local_asset_versions(html_path: Path, app_version: str) -> int:
    """
    Aktualizuje tylko lokalne linki CSS/JS w atrybutach href/src.
    Nie dotyka URL-i zewnętrznych ani danych JSON/GeoJSON.
    """
    if not html_path.exists():
        print(f"[WARN] HTML not found: {html_path}")
        return 0

    content = html_path.read_text(encoding="utf-8")

    def replace_match(match: re.Match) -> str:
        attr = match.group("attr")
        url = match.group("url")
        path = url.split("?", 1)[0]
        return f'{attr}="{path}?v={app_version}"'

    pattern = re.compile(
        r'(?P<attr>href|src)="(?P<url>/(?!/)[^"]+\.(?:css|js)(?:\?v=[^"]*)?)"'
    )

    new_content, updated_count = pattern.subn(replace_match, content)

    if new_content != content:
        html_path.write_text(new_content, encoding="utf-8")

    print(f"[OK] Checked HTML: {html_path} | updated links: {updated_count}")
    return updated_count


output_path.write_text(
    f'window.APP_VERSION = "{version}";\n',
    encoding="utf-8"
)

print(f"[OK] Version updated: {version}")
print(f"[OK] File: {output_path}")

total_updated = 0
for html_path in HTML_PATHS:
    total_updated += update_local_asset_versions(html_path, version)

print(f"[OK] Total updated HTML links: {total_updated}")
