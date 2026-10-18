#!/usr/bin/env bash
set -u
echo "== cinematic-music-video-director doctor =="
for c in node npm ffmpeg ffprobe python3; do printf '%-8s ' "$c"; command -v "$c" || echo MISSING; done
node -e "import('puppeteer-core').then(()=>console.log('puppeteer-core OK')).catch(()=>console.log('puppeteer-core MISSING'))" 2>/dev/null
python3 - <<'PY' 2>/dev/null || echo "python audio deps MISSING (need numpy scipy soundfile librosa)"
import numpy, scipy, soundfile, librosa
print("audio deps OK", numpy.__version__, librosa.__version__)
PY
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
[ -x "$CHROME" ] && echo "chrome OK" || echo "chrome not at default macOS path; pass --chrome"
df -h . | tail -1 | awk '{print "disk available:", $4}'
