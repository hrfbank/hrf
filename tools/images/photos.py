"""أسئلة الصور الحقيقية (Wikidata + Commons). تشتغل ببيئة Python فيها mediapipe و pillow:

    python3 -m venv /tmp/imgvenv && /tmp/imgvenv/bin/pip install mediapipe pillow
    /tmp/imgvenv/bin/python tools/images/build.py celeb

الصورة الأصلية تنحفظ WebP (أطول ضلع ١٦٠٠، جودة ٨٥، بدون EXIF) واسمها عشوائي.
سؤال المشهور = قصّة على العينين (crop) تتوسع مع التلميحات لين الصورة كاملة.
"""
import io
import os

from PIL import Image

import wiki

MODEL = os.environ.get("HRF_FACE_MODEL", "/tmp/face_landmarker.task")
MODEL_URL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
# نقاط MediaPipe: زوايا العينين الخارجية والداخلية، وطرف الأنف
R_OUT, R_IN, L_IN, L_OUT, NOSE = 33, 133, 362, 263, 1
BROW = [70, 105, 107, 336, 334, 300]
ASPECT = 16 / 10  # نفس إطار الصورة في اللعبة


def _landmarker():
    from mediapipe.tasks.python import BaseOptions, vision
    if not os.path.exists(MODEL):
        open(MODEL, "wb").write(wiki.download(MODEL_URL))
    opts = vision.FaceLandmarkerOptions(base_options=BaseOptions(model_asset_path=MODEL), num_faces=3,
                                         min_face_detection_confidence=0.6)
    return vision.FaceLandmarker.create_from_options(opts)


def webp(img: Image.Image, longest=1600) -> bytes:
    img = img.convert("RGB")
    img.thumbnail((longest, longest), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, "WEBP", quality=85, method=6)  # الحفظ من جديد يمسح EXIF
    return buf.getvalue()


def eyes_crop(img: Image.Image, det, level: str):
    """قصّة نسبية حول العينين بنسبة إطار اللعبة. ترجع (crop, سبب الرفض)"""
    import mediapipe as mp
    W, H = img.size
    res = det.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=__import__("numpy").asarray(img.convert("RGB"))))
    faces = res.face_landmarks
    if len(faces) != 1:
        return None, f"عدد الوجوه {len(faces)}"
    lm = faces[0]
    px = lambda i: (lm[i].x * W, lm[i].y * H)  # noqa: E731
    ro, li, lo, nose = px(R_OUT), px(L_IN), px(L_OUT), px(NOSE)
    ri = px(R_IN)
    span = abs(lo[0] - ro[0])
    xs = [p.x * W for p in lm]
    face_w = max(xs) - min(xs)
    if face_w < 300:
        return None, f"الوجه صغير ({int(face_w)}px)"
    # مواجه للكاميرا: الأنف في النص بين العينين تقريباً
    mid = (ri[0] + li[0]) / 2
    if abs(nose[0] - mid) > span * 0.12:
        return None, "الوجه مو مواجه للكاميرا"
    cx = (ro[0] + lo[0]) / 2
    cy = (ro[1] + lo[1]) / 2
    if level == "hard":  # عين وحدة قريب
        eye_w = abs(ri[0] - ro[0])
        w = eye_w * 2.2
        cx = (ro[0] + ri[0]) / 2
    elif level == "easy":  # العينين مع الحواجب وأعلى الأنف
        w = span * 1.9
        cy = cy + span * 0.08
    else:  # العينين
        w = span * 1.45
    h = w / ASPECT
    if w < 260:
        return None, "القصّة تحتاج تكبير زايد"
    x, y = cx - w / 2, cy - h / 2
    if x < 0 or y < 0 or x + w > W or y + h > H:
        return None, "القصّة طالعة برا الصورة"
    return {"x": round(x / W, 4), "y": round(y / H, 4), "w": round(w / W, 4), "h": round(h / H, 4)}, None


def build_celebs(cfg, file_id, norm_letter):
    qids = [p[0] for p in cfg["picks"]]
    rows = wiki.sparql("""SELECT ?p ?img ?g (GROUP_CONCAT(DISTINCT ?occL; separator="، ") AS ?occs)
      (SAMPLE(?ctryL) AS ?ctry) WHERE {
      VALUES ?p { %s }
      ?p wdt:P18 ?img. OPTIONAL { ?p wdt:P21 ?g }
      OPTIONAL { ?p wdt:P106 ?o. ?o rdfs:label ?occL FILTER(lang(?occL)="ar") }
      OPTIONAL { ?p wdt:P27 ?c. ?c rdfs:label ?ctryL FILTER(lang(?ctryL)="ar") }
    } GROUP BY ?p ?img ?g""" % " ".join(f"wd:{q}" for q in qids))
    info = {}
    for r in rows:
        info.setdefault(wiki.qid(r["p"]), r)
    det = _landmarker()
    out = []
    for pick in cfg["picks"]:
        qid, answer, difficulty = pick[0], pick[1], pick[2]
        level = {1: "easy", 2: "medium", 3: "hard"}[difficulty]
        r = info.get(qid)
        if not r:
            print(f"  ✗ {answer}: ما فيه صورة في Wikidata")
            continue
        title = pick[3] if len(pick) > 3 else wiki.file_title(r["img"])
        ii = wiki.image_info(title)
        if not ii or min(ii["width"], ii["height"]) < 800:
            print(f"  ✗ {answer}: الصورة صغيرة أو ناقصة")
            continue
        img = Image.open(io.BytesIO(wiki.download(ii["original"])))
        img.thumbnail((1600, 1600), Image.LANCZOS)
        crop, why = eyes_crop(img, det, level)
        if not crop:
            print(f"  ✗ {answer}: {why}")
            continue
        female = r.get("g", "").endswith("Q6581072")
        clues = []
        if r.get("ctry"):
            clues.append(f"{'جنسيتها' if female else 'جنسيته'}: {r['ctry']}.")
        occs = [o for o in (r.get("occs") or "").split("، ") if o][:3]
        if occs:
            clues.append(f"{'من مهنها' if female else 'من مهنه'}: {'، '.join(occs)}.")
        fid = file_id(f"{cfg['key']}:{qid}")
        out.append({
            "key": f"{cfg['key']}:{qid}",
            "category": cfg["category"],
            "question": cfg["question"],
            "answer": answer,
            "letter": norm_letter(answer),
            "difficulty": difficulty,
            "clues": clues[:3],
            "files": {f"{fid}_a.webp": webp(img)},
            "image": {"file": f"images/{fid}_a.webp", "mode": "crop", "crop": crop, "wikidata": qid},
            "credit": ii["author"], "license": ii["license"], "license_url": ii["license_url"], "source": ii["page"],
        })
        print(f"  ✓ {answer} ({level})")
    return out
