import json, subprocess, sys, tempfile, unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / "scripts"

def make_project(tmp, gap=False):
    am = {
        "duration": 4.0, "fps": 24,
        "tempo": {"beats": [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5]},
        "sections": [{"id": "a", "start": 0, "end": 4}],
        "lyrics": {"lines": [{"phrase_start": 1.0, "text": "line one"}]},
    }
    tl = {"fps": 24, "total_frames": 96, "shots": [
        {"id": "S01", "start_frame": 0, "end_frame": 48, "lyric_refs": ["L01"]},
        {"id": "S02", "start_frame": 48 if not gap else 50, "end_frame": 96, "lyric_refs": []},
    ]}
    (tmp / "am.json").write_text(json.dumps(am))
    (tmp / "tl.json").write_text(json.dumps(tl))
    return tmp / "am.json", tmp / "tl.json"

class TimelineTests(unittest.TestCase):
    def run_validator(self, tmp, gap=False):
        am, tl = make_project(tmp, gap)
        return subprocess.run([sys.executable, str(SCRIPTS / "validate_timeline.py"),
            "--timeline", str(tl), "--audiomap", str(am), "--out", str(tmp / "r.md")],
            capture_output=True, text=True)

    def test_contiguous_passes(self):
        with tempfile.TemporaryDirectory() as d:
            r = self.run_validator(Path(d))
            self.assertEqual(r.returncode, 0, r.stdout + r.stderr)

    def test_gap_fails(self):
        with tempfile.TemporaryDirectory() as d:
            r = self.run_validator(Path(d), gap=True)
            self.assertNotEqual(r.returncode, 0)

class ParseTests(unittest.TestCase):
    def test_lrc_and_srt(self):
        sys.path.insert(0, str(SCRIPTS))
        import align_lyrics as al
        self.assertEqual(al.parse_lrc("[00:12.720]hello\n[00:19.550]world")[0][0], 12.72)
        srt = "1\n00:00:01,000 --> 00:00:02,500\n你好\n"
        self.assertAlmostEqual(al.parse_srt(srt)[0][0], 1.0)
        self.assertAlmostEqual(al.parse_srt(srt)[0][1], 2.5)

if __name__ == "__main__":
    unittest.main()
