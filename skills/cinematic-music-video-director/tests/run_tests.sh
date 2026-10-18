#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
python3 -m py_compile scripts/analyze_music.py scripts/align_lyrics.py scripts/validate_timeline.py scripts/qc_video.py
node --check scripts/render.mjs
python3 -m unittest discover -s tests -v
echo "ALL SKILL TESTS PASSED"
