import json
import os
import re
import sys
import urllib.request
import urllib.parse
import subprocess
from datetime import timedelta

def extract_bvid(u):
    m = re.search(r"BV[0-9A-Za-z]+", u)
    return m.group(0) if m else None

def http_get(url, headers=None):
    req = urllib.request.Request(url, headers=headers or {})
    with urllib.request.urlopen(req) as resp:
        return resp.read()

def json_get(url, headers=None):
    data = http_get(url, headers)
    return json.loads(data.decode("utf-8"))

def get_view_info(bvid):
    url = f"https://api.bilibili.com/x/web-interface/view?bvid={bvid}"
    headers = {"User-Agent": "Mozilla/5.0"}
    return json_get(url, headers)

def pick_cid(view_json, page_index):
    pages = view_json.get("data", {}).get("pages", [])
    if not pages:
        cid = view_json.get("data", {}).get("cid")
        return cid
    idx = max(0, min(page_index, len(pages) - 1))
    return pages[idx].get("cid")

def get_player_subtitles(bvid, cid):
    url = f"https://api.bilibili.com/x/player/v2?cid={cid}&bvid={bvid}"
    headers = {"User-Agent": "Mozilla/5.0"}
    return json_get(url, headers)

def fetch_subtitle_json(url):
    headers = {"User-Agent": "Mozilla/5.0"}
    return json_get(url, headers)

def collect_subtitles(player_json):
    subs = player_json.get("data", {}).get("subtitle", {}).get("subtitles", [])
    result = []
    for s in subs:
        result.append({
            "lan": s.get("lan"),
            "lan_doc": s.get("lan_doc"),
            "url": s.get("subtitle_url")
        })
    return result

def choose_subtitle(subs, prefer):
    if not subs:
        return None
    if prefer == "ai":
        for s in subs:
            if s.get("lan") and "ai" in s.get("lan"):
                return s
    for s in subs:
        if s.get("lan_doc") and ("中文" in s.get("lan_doc") or "简体" in s.get("lan_doc") or s.get("lan") == "zh-CN"):
            return s
    return subs[0]

def parse_subtitle_body(body_json):
    items = body_json.get("body", [])
    segments = []
    for it in items:
        segments.append({
            "start": float(it.get("from", 0.0)),
            "end": float(it.get("to", 0.0)),
            "text": str(it.get("content", "")).strip()
        })
    return segments

def format_ts(sec):
    td = timedelta(seconds=int(sec))
    s = str(td)
    if td.days > 0:
        return s
    if len(s.split(":")) == 2:
        return "00:" + s
    return s

def make_md(meta, segments, source):
    lines = []
    lines.append(f"# {meta.get('title','')}")
    lines.append("")
    lines.append(f"- 来源: {meta.get('url','')}")
    lines.append(f"- 作者: {meta.get('owner','')}")
    lines.append(f"- BV号: {meta.get('bvid','')}")
    lines.append(f"- 字幕来源: {source}")
    lines.append("")
    lines.append("## 正文")
    for seg in segments:
        lines.append(f"- `{format_ts(seg['start'])}`–`{format_ts(seg['end'])}` {seg['text']}")
    return "\n".join(lines)

def ensure_dir(p):
    if not os.path.exists(p):
        os.makedirs(p)

def write_md(md_text, out_dir, name):
    ensure_dir(out_dir)
    path = os.path.join(out_dir, name)
    with open(path, "w", encoding="utf-8") as f:
        f.write(md_text)
    return path

def try_download_audio(url, out_dir):
    ensure_dir(out_dir)
    cmd = ["yt-dlp", "-f", "ba", "-o", os.path.join(out_dir, "%(id)s.%(ext)s"), url]
    try:
        r = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False, encoding="utf-8")
        return out_dir if r.returncode == 0 else None
    except Exception:
        return None

def transcribe_with_openai(audio_path, api_key, model="whisper-1"):
    try:
        import requests
    except Exception:
        return None
    headers = {"Authorization": f"Bearer {api_key}"}
    files = {"file": open(audio_path, "rb")}
    data = {"model": model}
    resp = requests.post("https://api.openai.com/v1/audio/transcriptions", headers=headers, files=files, data=data, timeout=600)
    if resp.status_code != 200:
        return None
    j = resp.json()
    text = j.get("text") or ""
    if not text:
        return None
    return [{"start": 0, "end": 0, "text": text}]

def run(url, page, prefer, out_dir, api_key):
    bvid = extract_bvid(url)
    if not bvid:
        print("未识别到BV号")
        return None
    view = get_view_info(bvid)
    data = view.get("data", {})
    cid = pick_cid(view, page)
    if not cid:
        print("未获取到CID")
        return None
    player = get_player_subtitles(bvid, cid)
    subs = collect_subtitles(player)
    meta = {"title": data.get("title"), "owner": (data.get("owner") or {}).get("name", ""), "bvid": bvid, "url": url}
    if subs:
        chosen = choose_subtitle(subs, prefer)
        body = fetch_subtitle_json(chosen.get("url"))
        segs = parse_subtitle_body(body)
        md = make_md(meta, segs, chosen.get("lan_doc") or chosen.get("lan") or "内置")
        name = f"{bvid}.md"
        path = write_md(md, out_dir, name)
        return path
    audio_dir = try_download_audio(url, os.path.join(out_dir, "audio"))
    if not audio_dir:
        print("音频下载失败或未安装yt-dlp")
        return None
    files = [f for f in os.listdir(audio_dir) if f.endswith((".m4a", ".mp3", ".aac", ".wav"))]
    if not files:
        print("未找到音频文件")
        return None
    audio_path = os.path.join(audio_dir, files[0])
    if not api_key:
        print("未提供OpenAI API密钥")
        return None
    segs = transcribe_with_openai(audio_path, api_key)
    if not segs:
        print("转写失败")
        return None
    md = make_md(meta, segs, "AI转写")
    name = f"{bvid}.md"
    path = write_md(md, out_dir, name)
    return path

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python main.py <B站视频链接> [--page=N] [--prefer=ai|native] [--out=output] [--key=APIKEY]")
        sys.exit(1)
    url = sys.argv[1]
    page = 0
    prefer = "ai"
    out_dir = "output"
    api_key = None
    for a in sys.argv[2:]:
        if a.startswith("--page="):
            page = int(a.split("=", 1)[1])
        elif a.startswith("--prefer="):
            prefer = a.split("=", 1)[1]
        elif a.startswith("--out="):
            out_dir = a.split("=", 1)[1]
        elif a.startswith("--key="):
            api_key = a.split("=", 1)[1]
    api_key = api_key or os.environ.get("OPENAI_API_KEY")
    p = run(url, page, prefer, out_dir, api_key)
    if p:
        print(p)