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
    if face_w < 150:
        return None, f"الوجه صغير ({int(face_w)}px)"
    # مواجه للكاميرا: الأنف في النص بين العينين تقريباً
    mid = (ri[0] + li[0]) / 2
    if abs(nose[0] - mid) > span * 0.12:
        return None, "الوجه مو مواجه للكاميرا"
    cx = (ro[0] + lo[0]) / 2
    cy = (ro[1] + lo[1]) / 2
    # شريط عريض فيه العينين والحواجب (مثل مسابقات «منو المشهور»)
    if level == "hard":  # عين وحدة قريب
        eye_w = abs(ri[0] - ro[0])
        w = eye_w * 2.2
        h = w / 1.6
        cx = (ro[0] + ri[0]) / 2
    elif level == "easy":  # العينين والحواجب وأعلى الأنف
        w = span * 1.8
        h = w / 1.9
        cy = cy - span * 0.05
    else:  # العينين والحواجب
        w = span * 1.55
        h = w / 2.2
        cy = cy - span * 0.1
    if w < 170:
        return None, "القصّة تحتاج تكبير زايد"
    x, y = cx - w / 2, cy - h / 2
    if x < 0 or y < 0 or x + w > W or y + h > H:
        return None, "القصّة طالعة برا الصورة"
    return {"x": round(x / W, 4), "y": round(y / H, 4), "w": round(w / W, 4), "h": round(h / H, 4), "aspect": round(w / h, 3)}, None


def _openverse(name: str) -> list[dict]:
    """صور مرخصة ترخيص مفتوح من Openverse (تجمع Flickr و Wikimedia وغيرها)"""
    import json
    import urllib.parse
    url = "https://api.openverse.org/v1/images/?" + urllib.parse.urlencode({"q": name, "page_size": 30})
    try:
        res = json.loads(wiki._get(url)).get("results", [])
    except Exception as e:  # noqa: BLE001
        print(f"    Openverse ما رد: {e}")
        return []
    tokens = [t.lower() for t in name.replace("-", " ").split() if len(t) > 3]
    out = []
    for r in res:
        title = (r.get("title") or "").lower().replace("-", " ").replace("_", " ")
        if tokens and not any(t in title for t in tokens):
            continue  # غالباً شخص ثاني
        if min(r.get("width") or 0, r.get("height") or 0) < 500:
            continue
        lic = r.get("license", "")
        name_l = {"cc0": "CC0", "pdm": "Public domain"}.get(lic, f"CC {lic.upper()} {r.get('license_version') or ''}".strip())
        out.append({"url": r["url"], "width": r["width"], "height": r["height"], "author": r.get("creator") or "غير مذكور",
                    "license": name_l, "license_url": r.get("license_url") or "", "page": r.get("foreign_landing_url") or r["url"]})
    return sorted(out, key=lambda c: -min(c["width"], c["height"]))


def _candidates(r: dict, en: str) -> list[dict]:
    """كل الصور المرشحة لمشهور: صورة Wikidata الرئيسية ثم نتائج Openverse، الأكبر أول"""
    cands = []
    if r.get("img"):
        try:
            ii = wiki.image_info(wiki.file_title(r["img"]))
            if ii and min(ii["width"], ii["height"]) >= 500:
                cands.append({"url": ii["original"], "width": ii["width"], "height": ii["height"], "author": ii["author"],
                              "license": ii["license"], "license_url": ii["license_url"], "page": ii["page"]})
        except Exception as e:  # noqa: BLE001
            print(f"    Commons ما رد: {e}")
    if en:
        seen = {c["url"] for c in cands}
        cands += [c for c in _openverse(en) if c["url"] not in seen][:6]
    return cands


def build_celebs(cfg, file_id, norm_letter):
    qids = [p[0] for p in cfg["picks"]]
    rows = wiki.sparql("""SELECT ?p ?img ?g ?en (GROUP_CONCAT(DISTINCT ?occL; separator="، ") AS ?occs)
      (SAMPLE(?ctryL) AS ?ctry) WHERE {
      VALUES ?p { %s }
      OPTIONAL { ?p wdt:P18 ?img } OPTIONAL { ?p wdt:P21 ?g }
      OPTIONAL { ?p rdfs:label ?en FILTER(lang(?en)="en") }
      OPTIONAL { ?p wdt:P106 ?o. ?o rdfs:label ?occL FILTER(lang(?occL)="ar") }
      OPTIONAL { ?p wdt:P27 ?c. ?c rdfs:label ?ctryL FILTER(lang(?ctryL)="ar") }
    } GROUP BY ?p ?img ?g ?en""" % " ".join(f"wd:{q}" for q in qids))
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
            print(f"  ✗ {answer}: ما لقيته في Wikidata")
            continue
        chosen, reasons = None, []
        for c in _candidates(r, r.get("en", "")):
            try:
                img = Image.open(io.BytesIO(wiki.download(c["url"])))
                img.thumbnail((1600, 1600), Image.LANCZOS)
            except Exception as e:  # noqa: BLE001
                reasons.append(f"تنزيل: {str(e)[:40]}")
                continue
            crop, why = eyes_crop(img, det, level)
            if crop:
                chosen = (c, img, crop)
                break
            reasons.append(why)
        if not chosen:
            print(f"  ✗ {answer}: {'، '.join(reasons) or 'ما فيه صورة كبيرة كفاية'}")
            continue
        c, img, crop = chosen
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
            "image": {"file": f"images/{fid}_a.webp", "mode": "crop", "aspect": crop.pop("aspect"), "crop": crop, "wikidata": qid},
            "credit": c["author"], "license": c["license"], "license_url": c["license_url"], "source": c["page"],
        })
        print(f"  ✓ {answer} ({level})")
    return out
