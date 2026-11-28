"""صورة الجواب (image.mode = "answer") من ويكيميديا كومنز، للأسئلة النصية.

الاستخدام: commons_answer.py نتائج.jsonl 693="Elissa - August 24, 2012 (2).jpg" ...  ثم  commons_answer.py --merge نتائج.jsonl
كل وسيط: رقم السؤال=اسم ملف كومنز. ياخذ الترخيص والمصوّر من الملف نفسه، ويرفض أي ملف ترخيصه مو حر.
شيك كل صورة بالعين قبل الحفظ النهائي.
"""
import hashlib
import io
import json
import os
import sys

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import wiki  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(HERE))
DB = os.path.join(ROOT, "data", "questions.json")
FREE = ("CC BY", "CC0", "Public domain", "PD", "CC-BY", "Attribution")


def merge(results):
    """يضيف الصور المحفوظة في ملف النتائج للبنك (يقرا ويحفظ مرة وحدة بسرعة)."""
    done = [json.loads(l) for l in open(results, encoding="utf-8") if l.strip()]
    db = json.load(open(DB, encoding="utf-8"))
    by_id = {str(q["id"]): q for q in db["questions"]}
    n = 0
    for r in done:
        q = by_id.get(r.pop("id"))
        if q is not None and not q.get("image"):
            q["image"] = r
            n += 1
    open(DB, "w", encoding="utf-8").write(json.dumps(db, ensure_ascii=False, indent=1) + "\n")
    print("انضاف للبنك:", n)


def main():
    # التنزيل بطيء (ويكيميديا تحجب)، فالنتائج تنكتب بملف جانبي، والدمج بخطوة سريعة بعدين: --merge ملف
    if sys.argv[1] == "--merge":
        return merge(sys.argv[2])
    results = sys.argv[1]
    pairs = dict(a.split("=", 1) for a in sys.argv[2:])
    have = {json.loads(l)["id"] for l in open(results, encoding="utf-8") if l.strip()} if os.path.exists(results) else set()
    for qid, f in pairs.items():
        if qid in have:
            continue
        info = wiki.image_info(f.removeprefix("File:"), 960)  # مقاس قياسي (المقاسات الغريبة تنحجب 429)
        if not info or not info["license"].startswith(FREE):
            print(qid, "رفض: الترخيص", info and info["license"], flush=True)
            continue
        path = f"images/{hashlib.sha1(f'ans:{qid}'.encode()).hexdigest()[:10]}_ans.webp"
        full = os.path.join(ROOT, "public", path)
        if not os.path.exists(full):
            img = Image.open(io.BytesIO(wiki.download(info["thumb"]))).convert("RGB")
            img.thumbnail((900, 900), Image.LANCZOS)
            img.save(full, "WEBP", quality=85, method=6)
        rec = {"id": qid, "file": path, "mode": "answer", "credit": info["author"], "license": info["license"], "source": info["page"]}
        open(results, "a", encoding="utf-8").write(json.dumps(rec, ensure_ascii=False) + "\n")
        print(qid, "←", f, "|", info["license"], "|", info["author"][:60], flush=True)


if __name__ == "__main__":
    main()
