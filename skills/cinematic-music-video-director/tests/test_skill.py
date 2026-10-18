#!/usr/bin/env python3
"""Layout and frontmatter checks. No browser, no audio."""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = [
    "SKILL.md",
    "LESSONS.md",
    "THIRD_PARTY_NOTICES.md",
    "references/story.md",
    "references/visual-language.md",
    "references/pipeline.md",
    "references/qc.md",
    "scripts/analyze_music.py",
    "scripts/render.mjs",
    "scripts/qc_video.py",
    "templates/shot.schema.json",
    "templates/storyboard.md",
]


def main() -> int:
    missing = [r for r in REQUIRED if not (ROOT / r).exists()]
    text = (ROOT / "SKILL.md").read_text(encoding="utf-8")
    m = re.match(r"---\n(.*?)\n---", text, re.S)
    if not m:
        print("SKILL.md has no YAML frontmatter")
        return 1
    fm = m.group(1)
    if not re.search(r"^name:\s*cinematic-music-video-director\s*$", fm, re.M):
        print("bad or missing name")
        return 1
    if "description:" not in fm:
        print("missing description")
        return 1
    body = text.split("---", 2)[-1]
    if len(body.splitlines()) > 500:
        print("SKILL.md body is over 500 lines")
        return 1
    if missing:
        print("missing:", ", ".join(missing))
        return 1
    print("skill layout ok")
    return 0


if __name__ == "__main__":
    sys.exit(main())
