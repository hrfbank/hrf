"""خرايط «لوكيشن» من Google Static Maps (قرار صاحب اللعبة 2026-11-26: كابتشر من قوقل مع تعديل).

نطلب نفس الخريطة مرتين: مع أسماء الأماكن وبدونها. الفرق بينهم حول نص الخريطة = أيقونة المكان المطلوب واسمه،
فنمسحه بس ونخلي باقي الأسماء (سياق يساعد اللاعب)، ونحط دبوس أحمر.
سؤال: الخريطة بدون اسم المكان + الدبوس. جواب: الخريطة كاملة باسمه + الدبوس.
`also_hide`: نصوص ثانية في الخريطة فيها الجواب (مثل «TGI Friday's | Kuwait Towers») تنمسح بنفس الطريقة، بمستطيلات نسبية.
"""
import io
import os
import urllib.parse
import urllib.request

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

KEY = os.environ.get("GOOGLE_MAPS_KEY", "")
W, H = 640, 400  # ×2 (scale=2) = 1280×800


def static_map(lat, lon, zoom, labels=True) -> Image.Image:
    q = {"center": f"{lat},{lon}", "zoom": zoom, "size": f"{W}x{H}", "scale": 2, "key": KEY}
    url = "https://maps.googleapis.com/maps/api/staticmap?" + urllib.parse.urlencode(q)
    if not labels:
        url += "&style=" + urllib.parse.quote("feature:poi|element:labels|visibility:off")
    return Image.open(io.BytesIO(urllib.request.urlopen(url, timeout=60).read())).convert("RGB")


def pin(img: Image.Image, x, y, s=1.0) -> Image.Image:
    """دبوس أحمر مثل قوقل، رأسه على (x, y)"""
    out = img.copy()
    d = ImageDraw.Draw(out)
    r = 22 * s
    cx, cy = x, y - 2.3 * r
    d.polygon([(x, y), (cx - r * 0.78, cy + r * 0.6), (cx + r * 0.78, cy + r * 0.6)], fill="#c5221f")
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill="#ea4335", outline="#c5221f", width=int(3 * s))
    d.ellipse([cx - r * 0.38, cy - r * 0.38, cx + r * 0.38, cy + r * 0.38], fill="#a50e0e")
    return out


def target_mask(on: Image.Image, off: Image.Image, reach=45) -> np.ndarray:
    """بكسلات أيقونة واسم المكان اللي في النص: الفرق بين الخريطتين، المتصل بنقطة قريبة من النص"""
    a, b = np.asarray(on).astype(int), np.asarray(off).astype(int)
    diff = np.abs(a - b).sum(axis=2) > 12
    grown = ndimage.binary_dilation(diff, iterations=3)  # يوصل حروف الاسم بالأيقونة
    lab, _ = ndimage.label(grown)
    h, w = diff.shape
    cy, cx = h // 2, w // 2
    near = lab[max(0, cy - reach):cy + reach, max(0, cx - reach):cx + reach]
    ids = set(np.unique(near)) - {0}
    return np.isin(lab, list(ids))


def _norm(t: str) -> str:
    import re
    t = re.sub(r"[\u200e\u200f\u0640]", "", t.lower())
    return t.replace("أ", "ا").replace("إ", "ا").replace("آ", "ا").replace("ة", "ه").replace("ى", "ي")


def build_ocr(lat, lon, zoom, keywords):
    """نسخة أدق: يقرا أسماء الخريطة (OCR) ويمسح **كل** اسم فيه الجواب (حتى لو تكرر)،
    والدبوس ينحط على أيقونة الاسم الأقرب للنص. يرجع (سؤال، جواب، سبب الفشل)"""
    import pytesseract
    on, off = static_map(lat, lon, zoom), static_map(lat, lon, zoom, labels=False)
    a, b = np.asarray(on).astype(int), np.asarray(off).astype(int)
    diff = np.abs(a - b).sum(axis=2) > 12
    lab, _ = ndimage.label(ndimage.binary_dilation(diff, iterations=4))
    d = pytesseract.image_to_data(on, lang="eng+ara", output_type=pytesseract.Output.DICT)
    kws = [_norm(k) for k in keywords]
    hit_ids, text_mask = set(), np.zeros(diff.shape, bool)
    for i, t in enumerate(d["text"]):
        t = _norm(t.strip())
        if len(t) < 3 or not any(k in t or (len(t) >= 4 and t in k) for k in kws):
            continue
        x, y, w, h = d["left"][i], d["top"][i], d["width"][i], d["height"][i]
        ids = set(np.unique(lab[y:y + h, x:x + w])) - {0}
        hit_ids |= ids
        text_mask[max(0, y - 4):y + h + 4, max(0, x - 4):x + w + 4] = True
    if not hit_ids:
        return None, None, "ما لقيت اسم المكان في الخريطة"
    m = np.isin(lab, list(hit_ids))
    # الأيقونة = جزء الاسم اللي مو نص، في المجموعة الأقرب لنص الصورة
    H, W = diff.shape
    best = None
    for i in hit_ids:
        icon = (lab == i) & diff & ~ndimage.binary_dilation(text_mask, iterations=6)
        il, n = ndimage.label(icon)
        if not n:
            continue
        sizes = ndimage.sum(icon, il, range(1, n + 1))
        k = int(np.argmax(sizes)) + 1
        if sizes[k - 1] < 150:
            continue
        cy, cx = ndimage.center_of_mass(il == k)
        dist = (cx - W / 2) ** 2 + (cy - H / 2) ** 2
        if best is None or dist < best[0]:
            best = (dist, cx, cy)
    if best is None:
        return None, None, "ما لقيت أيقونة المكان"
    _, cx, cy = best
    q = Image.fromarray(np.where(m[..., None], b, a).astype(np.uint8))
    return pin(q, cx, cy + 14, 1.2), pin(on, cx, cy + 14, 1.2), None


def build(lat, lon, zoom=15, also_hide=()):
    on, off = static_map(lat, lon, zoom), static_map(lat, lon, zoom, labels=False)
    m = target_mask(on, off)
    for x, y, w, h in also_hide:
        H_, W_ = m.shape
        m[int(y * H_):int((y + h) * H_), int(x * W_):int((x + w) * W_)] = True
    q = np.where(m[..., None], np.asarray(off), np.asarray(on)).astype(np.uint8)
    cx, cy = on.width // 2, on.height // 2
    return pin(Image.fromarray(q), cx, cy, 1.2), pin(on, cx, cy, 1.2)


def osm_place(query: str):
    """احتياط إذا Places API مرفوض: إحداثيات المكان من OpenStreetMap (Nominatim، طلب كل ثانية)"""
    import json
    import time
    time.sleep(1.2)
    ua = f"hrf-quiz-images/0.1 (personal trivia game; {os.environ.get('HRF_CONTACT', '')})"
    url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode(
        {"q": query, "format": "json", "limit": 1, "countrycodes": "kw"})
    res = json.loads(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": ua}), timeout=60).read())
    if not res:
        return None
    r = res[0]
    return {"name": r.get("name") or r["display_name"].split(",")[0], "lat": float(r["lat"]), "lon": float(r["lon"]),
            "address": r["display_name"], "url": f"https://www.google.com/maps/search/?api=1&query={r['lat']},{r['lon']}"}


def find_place(query: str):
    """إحداثيات المكان واسمه وعنوانه من Places API (New)، وإذا مرفوض من OpenStreetMap"""
    try:
        return _google_place(query)
    except Exception as e:  # noqa: BLE001
        print(f"    Places ما رد ({str(e)[:40]})، أستخدم OpenStreetMap")
        return osm_place(query)


def _google_place(query: str):
    import json
    body = json.dumps({"textQuery": query, "languageCode": "ar", "regionCode": "KW"}).encode()
    req = urllib.request.Request("https://places.googleapis.com/v1/places:searchText", data=body, headers={
        "Content-Type": "application/json", "X-Goog-Api-Key": KEY,
        "X-Goog-FieldMask": "places.displayName,places.location,places.formattedAddress,places.googleMapsUri"})
    res = json.loads(urllib.request.urlopen(req, timeout=60).read()).get("places", [])
    if not res:
        return None
    p = res[0]
    return {"name": p["displayName"]["text"], "lat": p["location"]["latitude"], "lon": p["location"]["longitude"],
            "address": p.get("formattedAddress", ""), "url": p.get("googleMapsUri", "")}


def build_locations(cfg, file_id, norm_letter):
    """مجموعة sets.json نوعها location: كل عنصر {id, query, question, answer, difficulty, clues, zoom?, also_hide?}"""
    import json
    from photos import webp
    cache_p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cache", "places.json")
    cache = json.load(open(cache_p)) if os.path.exists(cache_p) else {}
    out = []
    for it in cfg["items"]:
        try:
            p = cache.get(it["query"]) or find_place(it["query"])
            if not p:
                print(f"  ✗ {it['answer']}: ما لقيته في قوقل")
                continue
            cache[it["query"]] = p
            q, a = build(p["lat"], p["lon"], it.get("zoom", 15), it.get("also_hide", ()))
        except Exception as e:  # noqa: BLE001
            print(f"  ✗ {it['answer']}: {str(e)[:80]}")
            continue
        key = f"{cfg['key']}:{it['id']}"
        fid = file_id(key)
        out.append({
            "key": key, "category": cfg["category"], "question": it["question"], "answer": it["answer"],
            "letter": norm_letter(it["answer"]), "difficulty": it["difficulty"], "clues": it["clues"],
            "files": {f"{fid}_q.webp": webp(q, 1280), f"{fid}_a.webp": webp(a, 1280)},
            "image": {"file": f"images/{fid}_a.webp", "question_file": f"images/{fid}_q.webp", "mode": "mask",
                      "place": p["name"], "lat": p["lat"], "lon": p["lon"]},
            "credit": "Google", "license": "خرائط Google (قرار صاحب اللعبة)", "source": p["url"],
        })
        print(f"  ✓ {it['answer']} ← {p['name']} ({p['address'][:40]})")
    os.makedirs(os.path.dirname(cache_p), exist_ok=True)
    json.dump(cache, open(cache_p, "w"), ensure_ascii=False, indent=1)
    return out
