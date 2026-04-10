#!/usr/bin/env python3
"""Remove injected lakns.com mobile redirect from legacy static HTML."""
import sys
from pathlib import Path

BLOCK = """<script>
(function(){
    if (/Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent)) {
        location.href = "https://lakns.com/link?z=9557727&var=orchuulga&ymid={CLICK_ID}";
    }
})();
</script>"""


def main() -> None:
    root = Path(__file__).resolve().parent.parent / "static" / "legacy"
    for path in sorted(root.rglob("*.html")):
        text = path.read_text(encoding="utf-8")
        if BLOCK not in text:
            continue
        new = text.replace(BLOCK, "")
        path.write_text(new, encoding="utf-8")
        print(f"stripped: {path.relative_to(root.parent.parent)}")


if __name__ == "__main__":
    main()
