"""أسئلة السيارات من صور Commons (تحتاج pillow، نفس بيئة photos.py).

كل عنصر في sets.json ← cars يحدد بيده:
  file   اسم ملف Commons
  crop   [x, y, w, h] نسبي: الجزء اللي يظهر في السؤال (ليت، شبك، جنط...). بدونه تظهر الصورة كاملة
  masks  [[x, y, w, h], ...] نسبي على الصورة الأصلية: أماكن الشعار أو الكتابة اللي تنطمس
مع الجواب تظهر الصورة الأصلية كاملة بشعارها.
صورة السؤال تنحفظ جاهزة (mode = mask)، فما يتوسع القص مع التلميحات ويكشف الشعار قبل الجواب.
"""
import io

from PIL import Image, ImageDraw, ImageFilter

import wiki
from photos import webp


def hide(img: Image.Image, box) -> Image.Image:
    """يطمس مستطيل: يعبيه بلون محيطه بعد تمويه قوي، بحواف ناعمة عشان ما يبان مكانه"""
    W, H = img.size
    x, y, w, h = box[0] * W, box[1] * H, box[2] * W, box[3] * H
    r = max(w, h)
    # المحيط بس (بدون المستطيل نفسه) يتمَوّه ويعبّي المكان، فما يبقى أي أثر من الشعار
    ring = (max(0, int(x - r * 0.6)), max(0, int(y - r * 0.6)), min(W, int(x + w + r * 0.6)), min(H, int(y + h + r * 0.6)))
    area = img.crop(ring)
    ax, ay = x - ring[0], y - ring[1]
    hole = Image.new("L", area.size, 255)
    ImageDraw.Draw(hole).rectangle([ax, ay, ax + w, ay + h], fill=0)
    filled = area.copy()
    for radius in (r * 0.5, r * 0.3, r * 0.15):
        blur = filled.filter(ImageFilter.GaussianBlur(radius))
        filled = Image.composite(area, blur, hole)  # المحيط يبقى أصلي، والحفرة تاخذ من التمويه
    feather = Image.new("L", area.size, 0)
    ImageDraw.Draw(feather).rectangle([ax, ay, ax + w, ay + h], fill=255)
    feather = feather.filter(ImageFilter.GaussianBlur(max(2, r * 0.08)))
    out = img.copy()
    out.paste(Image.composite(filled.filter(ImageFilter.GaussianBlur(max(1, r * 0.04))), area, feather), ring[:2])
    return out


def build_cars(cfg, file_id, norm_letter):
    out = []
    for it in cfg["items"]:
        try:
            ii = wiki.image_info(it["file"], 1280)
            if not ii:
                print(f"  ✗ {it['answer']}: الملف مو موجود في Commons")
                continue
            img = Image.open(io.BytesIO(wiki.download(ii["thumb"]))).convert("RGB")
        except Exception as e:  # noqa: BLE001  واحد فشل ما يوقف الباقي
            print(f"  ✗ {it['answer']}: {str(e)[:60]}")
            continue
        q = img
        for m in it.get("masks", []):
            q = hide(q, m)
        if it.get("crop"):
            x, y, w, h = it["crop"]
            W, H = q.size
            q = q.crop((round(x * W), round(y * H), round((x + w) * W), round((y + h) * H)))
        key = f"{cfg['key']}:{it['id']}"
        fid = file_id(key)
        out.append({
            "key": key, "category": cfg["category"], "question": it.get("question", cfg["question"]),
            "answer": it["answer"], "letter": norm_letter(it["answer"]), "difficulty": it["difficulty"],
            "clues": it["clues"],
            "files": {f"{fid}_q.webp": webp(q, 1280), f"{fid}_a.webp": webp(img, 1280)},
            "image": {"file": f"images/{fid}_a.webp", "question_file": f"images/{fid}_q.webp", "mode": "mask"},
            "credit": ii["author"], "license": ii["license"], "license_url": ii["license_url"], "source": ii["page"],
        })
        print(f"  ✓ {it['answer']} ({it['id']})")
    return out
