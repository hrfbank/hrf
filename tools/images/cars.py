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
    """يمسح مستطيل (شعار، لوحة، كتابة) ويعبيه من محيطه (inpainting).
    ما يستخدم أي بكسل من داخل المستطيل، فما يبقى أثر لشكل الشعار مثل التمويه."""
    import cv2
    import numpy as np
    W, H = img.size
    x0, y0 = int(box[0] * W), int(box[1] * H)
    x1, y1 = int((box[0] + box[2]) * W), int((box[1] + box[3]) * H)
    arr = cv2.cvtColor(np.asarray(img.convert("RGB")), cv2.COLOR_RGB2BGR)
    mask = np.zeros(arr.shape[:2], np.uint8)
    mask[y0:y1, x0:x1] = 255
    out = cv2.inpaint(arr, mask, max(3, (x1 - x0) // 6), cv2.INPAINT_TELEA)
    # تمويه خفيف داخل المكان بس، عشان ما يطلع فيه خطوط من الحواف
    soft = cv2.GaussianBlur(out, (0, 0), max(1.5, (x1 - x0) / 25))
    feather = cv2.GaussianBlur(mask, (0, 0), 3).astype(np.float32)[..., None] / 255
    out = (out * (1 - feather) + soft * feather).astype(np.uint8)
    return Image.fromarray(cv2.cvtColor(out, cv2.COLOR_BGR2RGB))


def cover(img: Image.Image, box) -> Image.Image:
    """يغطي مستطيل بلون واحد بزوايا ناعمة (مثل لوحة السيارة في أمثلة صاحب اللعبة). box = [x, y, w, h, "#لون"]"""
    W, H = img.size
    x, y, w, h, color = box
    if color == "auto":  # لون المحيط (الوسيط) عشان يطلع مثل خلفية العلبة
        import numpy as np
        a = np.asarray(img.convert("RGB"))
        x0, y0, x1, y1 = int(x * W), int(y * H), int((x + w) * W), int((y + h) * H)
        p = 6
        ring = np.concatenate([a[max(0, y0 - p):y0, x0:x1].reshape(-1, 3), a[y1:y1 + p, x0:x1].reshape(-1, 3),
                               a[y0:y1, max(0, x0 - p):x0].reshape(-1, 3), a[y0:y1, x1:x1 + p].reshape(-1, 3)])
        color = tuple(int(v) for v in np.median(ring, axis=0))
    out = img.copy()
    ImageDraw.Draw(out).rounded_rectangle([x * W, y * H, (x + w) * W, (y + h) * H], radius=max(2, int(h * H * 0.12)), fill=color)
    return out


_REMBG = []


def silhouette(img: Image.Image) -> Image.Image:
    """ظل السيارة (لون واحد على أبيض) للسيارات المشهورة: السؤال الظل، والجواب نفس الصورة كاملة.
    يحتاج rembg (نموذج isnet-general-use ينزل أول مرة)."""
    from rembg import new_session, remove
    if not _REMBG:
        _REMBG.append(new_session("isnet-general-use"))
    a = remove(img, session=_REMBG[0]).split()[3].point(lambda v: 255 if v > 128 else 0)
    out = Image.new("RGB", img.size, "white")
    out.paste((28, 28, 34), mask=a)
    return out


def build_cars(cfg, file_id, norm_letter):
    out = []
    for it in cfg["items"]:
        try:
            if it.get("url"):  # صورة من مصدر ثاني (مثل Open Food Facts للمنتجات)
                import urllib.request
                req = urllib.request.Request(it["url"], headers={"User-Agent": "hrf-quiz-images/0.1 (personal trivia game)"})
                img = Image.open(io.BytesIO(urllib.request.urlopen(req, timeout=60).read())).convert("RGB")
                img.thumbnail((1280, 1280), Image.LANCZOS)
                ii = {"author": it["credit"], "license": it["license"], "license_url": it.get("license_url", ""),
                      "page": it["source"]}
            else:
                ii = wiki.image_info(it["file"], 1280)
            if not ii:
                print(f"  ✗ {it['answer']}: الملف مو موجود في Commons")
                continue
            if not it.get("url"):
                img = Image.open(io.BytesIO(wiki.download(ii["thumb"]))).convert("RGB")
        except Exception as e:  # noqa: BLE001  واحد فشل ما يوقف الباقي
            print(f"  ✗ {it['answer']}: {str(e)[:60]}")
            continue
        q = silhouette(img) if it.get("silhouette") else img
        for m in it.get("masks", []):
            q = cover(q, m) if len(m) > 4 else hide(q, m)
        if it.get("crop"):
            x, y, w, h = it["crop"]
            W, H = q.size
            q = q.crop((round(x * W), round(y * H), round((x + w) * W), round((y + h) * H)))
        ans = img
        if it.get("answer_file"):  # صورة جواب مختلفة (ملاحظة صاحب اللعبة: لا تعيد صورة السؤال)
            try:
                aii = wiki.image_info(it["answer_file"], 1280)
                ans = Image.open(io.BytesIO(wiki.download(aii["thumb"]))).convert("RGB")
                ii = {**ii, "author": f"{ii['author']} / {aii['author']}", "page": aii["page"]}
            except Exception as e:  # noqa: BLE001
                print(f"  ✗ {it['answer']}: صورة الجواب: {str(e)[:50]}")
                continue
        key = f"{cfg['key']}:{it['id']}"
        fid = file_id(key)
        out.append({
            "key": key, "category": cfg["category"], "question": it.get("question", cfg["question"]),
            "answer": it["answer"], "letter": norm_letter(it["answer"]), "difficulty": it["difficulty"],
            "clues": it["clues"],
            "files": {f"{fid}_q.webp": webp(q, 1280), f"{fid}_a.webp": webp(ans, 1280)},
            "image": {"file": f"images/{fid}_a.webp", "question_file": f"images/{fid}_q.webp", "mode": "mask"},
            "credit": ii["author"], "license": ii["license"], "license_url": ii["license_url"], "source": ii["page"],
        })
        print(f"  ✓ {it['answer']} ({it['id']})")
    return out
