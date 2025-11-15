import json
import unittest
from pathlib import Path

import importlib.util
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

spec = importlib.util.spec_from_file_location("app_main", str(ROOT / "main.py"))
app = importlib.util.module_from_spec(spec)
spec.loader.exec_module(app)

class TestParsing(unittest.TestCase):
    def test_parse_subtitle_body(self):
        sample = {
            "body": [
                {"content": "大家好", "from": 0, "to": 1},
                {"content": "欢迎观看视频", "from": 1, "to": 3}
            ]
        }
        segs = app.parse_subtitle_body(sample)
        self.assertEqual(len(segs), 2)
        self.assertEqual(segs[0]["text"], "大家好")
        self.assertEqual(segs[1]["end"], 3.0)

    def test_make_md(self):
        meta = {"title": "示例", "owner": "UP", "bvid": "BV123", "url": "https://www.bilibili.com/video/BV123"}
        segs = [{"start": 0, "end": 1, "text": "A"}, {"start": 1, "end": 2, "text": "B"}]
        md = app.make_md(meta, segs, "内置")
        self.assertIn("# 示例", md)
        self.assertIn("- BV号: BV123", md)
        self.assertIn("`00:00:00`–`00:00:01` A", md)

if __name__ == "__main__":
    unittest.main()