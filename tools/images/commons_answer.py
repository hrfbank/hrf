"""صورة الجواب (image.mode = "answer") من ويكيميديا كومنز، للأسئلة النصية.

الاستخدام: /tmp/imgvenv/bin/python tools/images/commons_answer.py 693="Elissa - August 24, 2012 (2).jpg" ...
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


def main():
    pairs = dict(a.split("=", 1) for a in sys.argv[1:])
    for qid, f in pairs.items():
        info = wiki.image_info(f.removeprefix("File:"), 960)  # مقاس قياسي (المقاسات الغريبة تنحجب 429)
        if not info or not info["license"].startswith(FREE):
            print(qid, "رفض: الترخيص", info and info["license"], flush=True)
            continue
        img = Image.open(io.BytesIO(wiki.download(info["thumb"]))).convert("RGB")
        img.thumbnail((900, 900), Image.LANCZOS)
        path = f"images/{hashlib.sha1(f'ans:{qid}'.encode()).hexdigest()[:10]}_ans.webp"
        img.save(os.path.join(ROOT, "public", path), "WEBP", quality=85, method=6)
        # يقرا البنك ويحفظه لكل صورة، عشان ما يمسح تعديلات صارت وهو شغال (التنزيل بطيء)
        db = json.load(open(DB, encoding="utf-8"))
        q = next(x for x in db["questions"] if str(x["id"]) == qid)
        q["image"] = {"file": path, "mode": "answer", "credit": info["author"], "license": info["license"], "source": info["page"]}
        open(DB, "w", encoding="utf-8").write(json.dumps(db, ensure_ascii=False, indent=1) + "\n")
        print(qid, q["answer"], "←", f, "|", info["license"], "|", info["author"][:60], flush=True)


if __name__ == "__main__":
    main()
