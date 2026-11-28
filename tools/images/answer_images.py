"""صورة تطلع مع الجواب للأسئلة النصية (image.mode = "answer")، مثل سين جيم.

الاستخدام: /tmp/imgvenv/bin/python tools/images/answer_images.py
يمر على أسئلة الفئات اللي في TARGETS، ويدور في TMDB على صورة الشخص أو بوستر المسلسل/المسرحية،
ويحفظها public/images/<id>_ans.webp ويضيف image للسؤال. ما يلمس سؤال عنده صورة.
النتيجة لازم تنشاف بالعين (scripts: /tmp/claude-0/answer_sheet.jpg) قبل الحفظ النهائي.
"""
import hashlib
import io
import json
import os
import sys
import urllib.parse
import urllib.request

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
DB = os.path.join(ROOT, "data", "questions.json")
KEY = os.environ.get("TMDB_KEY", "")
# الفئة ← نوع البحث في TMDB
TARGETS = {"actors": "person", "gulf-series": "tv", "kuwaiti-plays": "movie", "songs": "person"}


def get(url):
    return json.loads(urllib.request.urlopen(url, timeout=30).read())


def tmdb_image(kind, query, en=None):
    """أول نتيجة لها صورة. person ← profile_path، tv/movie ← poster_path"""
    for q in [x for x in (en, query) if x]:
        url = f"https://api.themoviedb.org/3/search/{kind}?" + urllib.parse.urlencode(
            {"query": q, "api_key": KEY, "language": "ar"})
        for r in get(url).get("results", [])[:3]:
            path = r.get("profile_path") if kind == "person" else r.get("poster_path")
            if path:
                return f"https://image.tmdb.org/t/p/w780{path}", f"https://www.themoviedb.org/{kind}/{r['id']}", r.get("name") or r.get("title")
    return None


def main():
    # كل وسيط: رقم السؤال، أو «رقم=اسم» للبحث باسم غير الجواب (مثل ألبوم ← صاحبه)
    override = dict(a.split("=", 1) for a in sys.argv[1:] if "=" in a)
    only = {a.split("=", 1)[0] for a in sys.argv[1:]}
    db = json.load(open(DB, encoding="utf-8"))
    report = []
    for q in db["questions"]:
        kind = TARGETS.get(q["category"])
        if not kind or q.get("image") or q["status"] != "verified" or (only and str(q["id"]) not in only):
            continue
        hit = tmdb_image(kind, override.get(str(q["id"]), q["answer"]))
        if not hit:
            report.append((q["id"], q["answer"], "ما لقيت"))
            continue
        url, page, name = hit
        img = Image.open(io.BytesIO(urllib.request.urlopen(url, timeout=60).read())).convert("RGB")
        img.thumbnail((900, 900), Image.LANCZOS)
        fid = hashlib.sha1(f"ans:{q['id']}".encode()).hexdigest()[:10]
        path = f"images/{fid}_ans.webp"
        img.save(os.path.join(ROOT, "public", path), "WEBP", quality=85, method=6)
        q["image"] = {"file": path, "mode": "answer", "credit": "TMDB", "license": "TMDB (قرار صاحب اللعبة)", "source": page}
        report.append((q["id"], q["answer"], name))
    open(DB, "w", encoding="utf-8").write(json.dumps(db, ensure_ascii=False, indent=1) + "\n")
    for r in report:
        print(*r)


if __name__ == "__main__":
    main()
