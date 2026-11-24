#!/usr/bin/env python3
"""مولّد أسئلة الصور لحروف (بدون مكتبات خارجية).

الاستخدام:  python3 tools/images/build.py [مفتاح المجموعة ...]

يقرأ tools/images/sets.json، ينزّل البيانات (ويخزنها في tools/images/cache)،
يرسم الصور SVG في public/images بأسماء عشوائية (hash)، ويضيف الأسئلة أو يحدّثها
في data/questions.json بحالة pending، لين يعتمدها صاحب اللعبة من صفحة المراجعة.
"""
import hashlib
import json
import math
import os
import re
import sys
import time
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
HERE = os.path.join(ROOT, "tools", "images")
CACHE = os.path.join(HERE, "cache")
IMAGES = os.path.join(ROOT, "public", "images")
DB = os.path.join(ROOT, "data", "questions.json")
TODAY = time.strftime("%Y-%m-%d")

# ألوان هوية حروف (مثل styles.css)
TEAL = "#0abab5"
INK = "#14202b"
LAND = "#d5e6e4"
SEA = "#eef7f6"
MARK = "#e4ff1a"

CONTINENT_AR = {
    "Asia": "آسيا", "Africa": "أفريقيا", "Europe": "أوروبا", "North America": "أمريكا الشمالية",
    "South America": "أمريكا الجنوبية", "Oceania": "أوقيانوسيا",
}
SUBREGION_AR = {
    "Western Asia": "غرب آسيا", "Southern Asia": "جنوب آسيا", "Eastern Asia": "شرق آسيا",
    "South-Eastern Asia": "جنوب شرق آسيا", "Central Asia": "آسيا الوسطى",
    "Northern Africa": "شمال أفريقيا", "Eastern Africa": "شرق أفريقيا", "Western Africa": "غرب أفريقيا",
    "Middle Africa": "وسط أفريقيا", "Southern Africa": "جنوب أفريقيا",
    "Southern Europe": "جنوب أوروبا", "Northern Europe": "شمال أوروبا", "Western Europe": "غرب أوروبا",
    "Eastern Europe": "شرق أوروبا", "Caribbean": "البحر الكاريبي", "Central America": "أمريكا الوسطى",
    "South America": "أمريكا الجنوبية", "Northern America": "أمريكا الشمالية",
    "Australia and New Zealand": "أستراليا ونيوزيلندا",
}


# ---------- أدوات عامة ----------
def fetch(url: str) -> bytes:
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, hashlib.sha1(url.encode()).hexdigest()[:16])
    if os.path.exists(path):
        return open(path, "rb").read()
    req = urllib.request.Request(url, headers={"User-Agent": "hrf-quiz-images/0.1"})
    for attempt in range(4):
        try:
            data = urllib.request.urlopen(req, timeout=60).read()
            open(path, "wb").write(data)
            time.sleep(1)  # طلب واحد كل ثانية تقريباً
            return data
        except Exception as e:  # noqa: BLE001
            if attempt == 3:
                raise
            print(f"  إعادة المحاولة ({e})")
            time.sleep(2 ** attempt)
    raise RuntimeError(url)


def file_id(key: str) -> str:
    """اسم ملف عشوائي ثابت: ما يكشف الجواب ولا المصدر"""
    return hashlib.sha256(f"hrf-img|{key}".encode()).hexdigest()[:10]


def strip_al(w: str) -> str:
    return w[2:] if w.startswith("ال") else w


def norm_letter(answer: str) -> str:
    w = answer.strip()
    if w.startswith("ال") and len(w) > 3:
        w = w[2:]
    return {"أ": "ا", "إ": "ا", "آ": "ا"}.get(w[0], w[0])


def rings_of(geom) -> list:
    """كل الحلقات الخارجية والداخلية كقوائم (lon, lat)"""
    if geom["type"] == "Polygon":
        return [r for r in geom["coordinates"]]
    return [r for poly in geom["coordinates"] for r in poly]


def bbox(rings):
    xs = [p[0] for r in rings for p in r]
    ys = [p[1] for r in rings for p in r]
    return min(xs), min(ys), max(xs), max(ys)


class Frame:
    """إسقاط بسيط (equirectangular مصحح بخط العرض) يحط الـ bbox داخل مربع"""

    def __init__(self, box, size=800, pad=60, lat0=None):
        x0, y0, x1, y1 = box
        self.k = math.cos(math.radians(lat0 if lat0 is not None else (y0 + y1) / 2))
        w, h = (x1 - x0) * self.k, (y1 - y0)
        self.s = (size - 2 * pad) / max(w, h, 1e-9)
        self.ox = pad + ((size - 2 * pad) - w * self.s) / 2 - x0 * self.k * self.s
        self.oy = pad + ((size - 2 * pad) - h * self.s) / 2 + y1 * self.s

    def pt(self, lon, lat):
        return lon * self.k * self.s + self.ox, self.oy - lat * self.s

    def path(self, rings, min_step=0.8, digits=1) -> str:
        out = []
        for r in rings:
            pts, last = [], None
            for lon, lat in r:
                x, y = self.pt(lon, lat)
                if last and abs(x - last[0]) < min_step and abs(y - last[1]) < min_step:
                    continue
                pts.append((x, y))
                last = (x, y)
            if len(pts) < 3:
                continue
            out.append("M" + "L".join(f"{x:.{digits}f},{y:.{digits}f}" for x, y in pts) + "Z")
        return "".join(out)


def svg(body: str, w=800, h=800) -> str:
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">{body}</svg>'


def area_km2(rings) -> float:
    total = 0.0
    for r in rings:
        lat0 = math.radians(sum(p[1] for p in r) / len(r))
        pts = [(p[0] * 111.32 * math.cos(lat0), p[1] * 110.57) for p in r]
        a = sum(pts[i][0] * pts[i - 1][1] - pts[i - 1][0] * pts[i][1] for i in range(len(pts))) / 2
        total += a
    return abs(total)


def neighbours(items, key_fn, rings_fn, digits=4):
    """جيران = يتشاركون نقطتين حدوديتين أو أكثر"""
    owners = {}
    for it in items:
        k = key_fn(it)
        for r in rings_fn(it):
            for lon, lat in r:
                owners.setdefault((round(lon, digits), round(lat, digits)), set()).add(k)
    shared = {}
    for ks in owners.values():
        if len(ks) > 1:
            for a in ks:
                for b in ks:
                    if a != b:
                        shared[(a, b)] = shared.get((a, b), 0) + 1
    out = {}
    for (a, b), n in shared.items():
        if n >= 2:
            out.setdefault(a, set()).add(b)
    return out


def direction(lat, lon, lat0=29.375, lon0=47.98):
    """اتجاه نقطة من مدينة الكويت بثمانية اتجاهات"""
    ang = math.degrees(math.atan2(lat - lat0, (lon - lon0) * math.cos(math.radians(lat0))))
    names = ["شرق", "شمال شرق", "شمال", "شمال غرب", "غرب", "جنوب غرب", "جنوب", "جنوب شرق"]
    return names[round(ang / 45) % 8]


def biggest(names, size_of, exclude=()):
    """الجار الأكبر مساحة: تلميح أوضح من جار صغير مثل الفاتيكان"""
    names = [n for n in names if n not in exclude]
    return max(names, key=size_of) if names else None


def write_image(name: str, content) -> str:
    os.makedirs(IMAGES, exist_ok=True)
    if isinstance(content, bytes):
        open(os.path.join(IMAGES, name), "wb").write(content)
    else:
        open(os.path.join(IMAGES, name), "w", encoding="utf-8").write(content)
    return f"images/{name}"


# ---------- الأنواع ----------
def build_kuwait_areas(cfg):
    data = json.loads(fetch(cfg["data_url"]))
    feats = data["features"]
    by_name = {f["properties"]["neighborhoodarabic"].strip(): f for f in feats}
    nb = neighbours(feats, lambda f: f["properties"]["neighborhoodarabic"].strip(), lambda f: rings_of(f["geometry"]))
    all_rings = [r for f in feats for r in rings_of(f["geometry"])]
    kw_box = bbox(all_rings)
    out = []
    for name, difficulty in cfg["picks"]:
        f = by_name.get(name)
        if not f:
            print(f"  ✗ ما لقيت المنطقة «{name}»")
            continue
        p = f["properties"]
        rings = rings_of(f["geometry"])
        island = name.startswith("جزيرة ")
        answer = name.replace("جزيرة ", "", 1) if island else name
        fid = file_id(f"{cfg['key']}:{p['nhood_no']}")
        fr = Frame(bbox(rings))
        shape = fr.path(rings)
        q_svg = svg(f'<path d="{shape}" fill="{TEAL}" stroke="{INK}" stroke-width="5" stroke-linejoin="round" fill-rule="evenodd"/>')

        # الجواب: نفس الشكل + الجيران حوله + خريطة الكويت الصغيرة
        x0, y0, x1, y1 = bbox(rings)
        around = []
        for g in feats:
            gb = bbox(rings_of(g["geometry"]))
            if gb[2] < x0 - (x1 - x0) or gb[0] > x1 + (x1 - x0) or gb[3] < y0 - (y1 - y0) or gb[1] > y1 + (y1 - y0):
                continue
            if g is f:
                continue
            around.append(fr.path(rings_of(g["geometry"]), 3, 0))
        ins = Frame(kw_box, size=230, pad=14)
        kuwait = ins.path(all_rings, 1.5, 0)
        cx, cy = ins.pt(p["centroid_x"], p["centroid_y"])
        a_svg = svg(
            f'<rect width="800" height="800" fill="{SEA}"/>'
            f'<path d="{"".join(around)}" fill="{LAND}" stroke="#ffffff" stroke-width="3"/>'
            f'<path d="{shape}" fill="{TEAL}" stroke="{INK}" stroke-width="5" stroke-linejoin="round" fill-rule="evenodd"/>'
            f'<g transform="translate(556 14)"><rect width="230" height="230" rx="22" fill="#ffffff" stroke="{INK}" stroke-width="4"/>'
            f'<path d="{kuwait}" fill="{LAND}"/><circle cx="{cx:.1f}" cy="{cy:.1f}" r="11" fill="{MARK}" stroke="{INK}" stroke-width="4"/></g>'
        )
        gov = p["governoratearabic"].strip()
        near = [n for n in nb.get(name, set()) if not re.search(r"\d|بر |مصفاة|مقبرة|معسكرات|ضجيج|صناعية|الصناعيه", n)]
        big = biggest(near, lambda n: area_km2(rings_of(by_name[n]["geometry"])))
        clues = ["تحمل نفس اسم محافظتها." if strip_al(answer) in gov else f"تقع في {gov}."]
        if big:
            clues.append(f"من المناطق اللي تجاورها: {big}.")
        if island:
            clues.append(f"تقع {direction(p['centroid_y'], p['centroid_x'])} مدينة الكويت.")
        km = area_km2(rings)
        clues.append(f"مساحتها تقريباً {round(km) if km >= 10 else round(km, 1)} كم².")
        out.append({
            "key": f"{cfg['key']}:{p['nhood_no']}",
            "category": cfg["category"],
            "question": cfg["island_question"] if island else cfg["question"],
            "answer": answer,
            "letter": norm_letter(answer),
            "difficulty": difficulty,
            "clues": clues[:3],
            "files": {f"{fid}_q.svg": q_svg, f"{fid}_a.svg": a_svg},
            "image": {"file": f"images/{fid}_a.svg", "question_file": f"images/{fid}_q.svg", "mode": "shape"},
        })
    return out


def build_countries(cfg):
    data = json.loads(fetch(cfg["data_url"]))
    feats = data["features"]
    code = lambda f: f["properties"]["ISO_A2_EH"]  # noqa: E731
    by_code = by_iso(feats)
    nb = neighbours(feats, code, lambda f: rings_of(f["geometry"]), digits=3)
    out = []
    for iso, answer, difficulty in cfg["picks"]:
        f = by_code.get(iso)
        if not f:
            print(f"  ✗ ما لقيت الدولة {iso}")
            continue
        p = f["properties"]
        rings = rings_of(f["geometry"])
        # الجزر البعيدة الصغيرة تخرب الإطار: نركز على الجزء الرئيسي
        main = max(rings, key=lambda r: area_km2([r]))
        mx0, my0, mx1, my1 = bbox([main])
        keep = [r for r in rings if area_km2([r]) > area_km2([main]) * 0.02 or (
            mx0 - 8 < bbox([r])[0] < mx1 + 8 and my0 - 8 < bbox([r])[1] < my1 + 8)]
        fid = file_id(f"{cfg['key']}:{iso}")
        fr = Frame(bbox(keep))
        shape = fr.path(keep)
        q_svg = svg(f'<path d="{shape}" fill="{TEAL}" stroke="{INK}" stroke-width="5" stroke-linejoin="round" fill-rule="evenodd"/>')
        x0, y0, x1, y1 = bbox(keep)
        dx, dy = (x1 - x0) * 0.6 + 2, (y1 - y0) * 0.6 + 2
        view = (x0 - dx, y0 - dy, x1 + dx, y1 + dy)
        fa = Frame(view, pad=0)
        around = []
        for g in feats:
            if g is f:
                continue
            gr = rings_of(g["geometry"])
            gb = bbox(gr)
            if gb[2] < view[0] or gb[0] > view[2] or gb[3] < view[1] or gb[1] > view[3]:
                continue
            around.append(fa.path(gr, 3, 0))
        a_svg = svg(
            f'<rect width="800" height="800" fill="{SEA}"/>'
            f'<path d="{"".join(around)}" fill="{LAND}" stroke="#ffffff" stroke-width="2"/>'
            f'<path d="{fa.path(rings)}" fill="{TEAL}" stroke="{INK}" stroke-width="4" stroke-linejoin="round" fill-rule="evenodd"/>'
        )
        clues = [f"تقع في قارة {CONTINENT_AR.get(p['CONTINENT'], p['CONTINENT'])}."]
        sub = SUBREGION_AR.get(p["SUBREGION"])
        if sub and sub != CONTINENT_AR.get(p["CONTINENT"]) and strip_al(answer) not in sub:
            clues.append(f"منطقتها: {sub}.")
        clues.append(neighbour_clue(iso, nb, by_code))
        out.append({
            "key": f"{cfg['key']}:{iso}",
            "category": cfg["category"],
            "question": cfg["question"],
            "answer": answer,
            "letter": norm_letter(answer),
            "difficulty": difficulty,
            "clues": clues[:3],
            "files": {f"{fid}_q.svg": q_svg, f"{fid}_a.svg": a_svg},
            "image": {"file": f"images/{fid}_a.svg", "question_file": f"images/{fid}_q.svg", "mode": "shape"},
        })
    return out


EXCLUDE = {"IL", "-99"}


def by_iso(feats):
    """رمز الدولة ← الدولة نفسها. بعض الأقاليم تشارك الدولة رمزها (أستراليا وجزر أشمور)، فناخذ الأكبر"""
    out = {}
    for f in feats:
        k = f["properties"]["ISO_A2_EH"]
        if k not in out or area_km2(rings_of(f["geometry"])) > area_km2(rings_of(out[k]["geometry"])):
            out[k] = f
    return out


def neighbour_clue(iso, nb, by_code):
    big = biggest([n for n in nb.get(iso, set()) if n in by_code],
                  lambda n: area_km2(rings_of(by_code[n]["geometry"])), EXCLUDE)
    return f"من جيرانها: {by_code[big]['properties']['NAME_AR']}." if big else "ما لها حدود برية مع أي دولة."


def build_flags(cfg):
    countries = json.loads(fetch(
        "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson"))
    by_code = by_iso(countries["features"])
    props = {k: f["properties"] for k, f in by_code.items()}
    nb = neighbours(countries["features"], lambda f: f["properties"]["ISO_A2_EH"], lambda f: rings_of(f["geometry"]), digits=3)
    out = []
    for pick in cfg["picks"]:
        iso, answer, difficulty, mode = pick[:4]
        raw = fetch(cfg["file_url"].format(code=iso.lower())).decode("utf-8")
        raw = re.sub(r"<!--.*?-->", "", raw, flags=re.S)
        raw = re.sub(r'\s(id|xml:space)="[^"]*"', lambda m: m.group(0) if m.group(1) == "id" else "", raw)
        fid = file_id(f"{cfg['key']}:{iso}")
        image = {"file": f"images/{fid}_a.svg", "mode": mode}
        if mode == "crop":
            x, y, w, h = pick[4]
            image["crop"] = {"x": x, "y": y, "w": w, "h": h}
        p = props.get(iso, {})
        clues = [f"تقع في قارة {CONTINENT_AR.get(p.get('CONTINENT'), '؟')}."]
        sub = SUBREGION_AR.get(p.get("SUBREGION"))
        if sub and sub != CONTINENT_AR.get(p.get("CONTINENT")):
            clues.append(f"منطقتها: {sub}.")
        clues.append(neighbour_clue(iso, nb, by_code))
        out.append({
            "key": f"{cfg['key']}:{iso}",
            "category": cfg["category"],
            "question": cfg["question"],
            "answer": answer,
            "letter": norm_letter(answer),
            "difficulty": difficulty,
            "clues": clues[:3],
            "files": {f"{fid}_a.svg": raw},
            "image": image,
        })
    return out


def build_logos(cfg):
    """شعارات من simple-icons (npm). السؤال: جزء من الشعار (crop) أو الشعار بدون ألوان (grayscale)"""
    import io
    import tarfile
    tgz = fetch(cfg["package_url"])
    tar = tarfile.open(fileobj=io.BytesIO(tgz))
    meta = json.loads(tar.extractfile("package/data/simple-icons.json").read())
    icons = meta if isinstance(meta, list) else meta["icons"]
    hexes = {}
    for i in icons:
        slug = i.get("slug") or re.sub(r"[^a-z0-9]", "", i["title"].lower())
        hexes[slug] = i["hex"]
    out = []
    for pick in cfg["picks"]:
        slug, answer, category, difficulty, mode = pick[:5]
        raw = tar.extractfile(f"package/icons/{slug}.svg").read().decode()
        path = re.search(r'<path d="([^"]+)"', raw).group(1)
        color = "#" + hexes.get(slug, "14202b")
        # ٢٤×٢٤ ← لوحة ٨٠٠×٨٠٠ بهامش
        body = f'<rect width="800" height="800" fill="#ffffff"/><g transform="translate(130 130) scale(22.5)"><path d="{path}" fill="{color}"/></g>'
        fid = file_id(f"{cfg['key']}:{slug}")
        image = {"file": f"images/{fid}_a.svg", "mode": mode}
        if mode == "crop":
            x, y, w = pick[5] if len(pick) > 5 else (0.3, 0.32, 0.4)
            image["crop"] = {"x": x, "y": y, "w": w, "h": round(w * 0.625, 4)}
        out.append({
            "key": f"{cfg['key']}:{slug}", "category": category, "question": cfg["questions"][category],
            "answer": answer, "letter": norm_letter(answer), "difficulty": difficulty,
            "clues": pick[6] if len(pick) > 6 else [],
            "files": {f"{fid}_a.svg": svg(body)}, "image": image,
        })
    return out


def _intrinsic(data: bytes, url: str):
    """مقاس الشعار الأصلي: viewBox للـ SVG، والبكسلات للصور"""
    if data.lstrip()[:5] in (b"<?xml", b"<svg ") or b"<svg" in data[:500]:
        head = data[:4000].decode("utf-8", "ignore")
        vb = re.search(r'viewBox="\s*([-\d.]+)[ ,]+([-\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)', head)
        if vb:
            return "image/svg+xml", tuple(float(v) for v in vb.groups())
        w = re.search(r'\swidth="([\d.]+)', head)
        h = re.search(r'\sheight="([\d.]+)', head)
        return "image/svg+xml", (0.0, 0.0, float(w.group(1)), float(h.group(1)))
    import io
    from PIL import Image
    im = Image.open(io.BytesIO(data))
    return f"image/{(im.format or 'png').lower()}", (0.0, 0.0, float(im.width), float(im.height))


def build_logo_symbols(cfg):
    """شعارات بالطريقة المعروفة: السؤال = رمز الشعار بس (بدون الاسم)، الجواب = الشعار كامل بالاسم.
    الرمز يتحدد بمستطيل نسبي [x, y, w, h] من الشعار. الملفات SVG تلف الشعار الأصلي (بدون إعادة رسم)."""
    import base64
    out = []
    for pick in cfg["picks"]:
        key, answer, difficulty, url, rect = pick[:5]
        clues = pick[5] if len(pick) > 5 else []
        data = fetch(url)
        mime, (vx, vy, vw, vh) = _intrinsic(data, url)
        href = f"data:{mime};base64,{base64.b64encode(data).decode()}"
        img = f'<image href="{href}" x="{vx}" y="{vy}" width="{vw}" height="{vh}" preserveAspectRatio="none"/>'

        def frame(x, y, w, h, pad, clip=False):
            cx, cy, cw, ch = x, y, w, h
            px = max(w, h) * pad
            x, y, w, h = x - px, y - px, w + 2 * px, h + 2 * px
            # إطار اللعبة ١٦:١٠: نوسّع الضلع القصير عشان الشعار يبقى بالنص
            if w / h < 1.6:
                nw = h * 1.6
                x, w = x - (nw - w) / 2, nw
            else:
                nh = w / 1.6
                y, h = y - (nh - h) / 2, nh
            body = img
            if clip:  # أي شي برا مستطيل الرمز (حروف الاسم) ما يبين
                body = (f'<defs><clipPath id="s"><rect x="{cx:.2f}" y="{cy:.2f}" width="{cw:.2f}" height="{ch:.2f}"/></clipPath></defs>'
                        f'<g clip-path="url(#s)">{img}</g>')
            return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x:.2f} {y:.2f} {w:.2f} {h:.2f}" width="1600" height="1000">'
                    f'<rect x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}" fill="#ffffff"/>{body}</svg>')

        rx, ry, rw, rh = rect
        q_svg = frame(vx + rx * vw, vy + ry * vh, rw * vw, rh * vh, 0.35, clip=True)
        a_svg = frame(vx, vy, vw, vh, 0.12)
        fid = file_id(f"{cfg['key']}:{key}")
        out.append({
            "key": f"{cfg['key']}:{key}", "category": cfg["category"], "question": cfg["question"],
            "answer": answer, "letter": norm_letter(answer), "difficulty": difficulty, "clues": clues,
            "files": {f"{fid}_q.svg": q_svg, f"{fid}_a.svg": a_svg},
            "image": {"file": f"images/{fid}_a.svg", "question_file": f"images/{fid}_q.svg", "mode": "mask"},
            "source": pick[6] if len(pick) > 6 else url,
        })
    return out


def build_logo_colors(cfg):
    """«ما هما اللونان الأساسيان في شعار ...؟»: الشعار بدون ألوان، والجواب يرجّع ألوانه.
    يستخدم نفس ملف الشعار الكامل من مجموعة brand (ما ينكتب ملف جديد)."""
    out = []
    for key, name, colors, difficulty, clues in cfg["picks"]:
        fid = file_id(f"{cfg['from']}:{key}")
        if not os.path.exists(os.path.join(IMAGES, f"{fid}_a.svg")):
            print(f"  ✗ {name}: شعاره مو موجود (شغّل مجموعة {cfg['from']} أول)")
            continue
        out.append({
            "key": f"{cfg['key']}:{key}", "category": cfg["category"],
            "question": cfg["question"].format(name=name),
            "answer": colors, "letter": norm_letter(colors), "difficulty": difficulty, "clues": clues,
            "files": {}, "image": {"file": f"images/{fid}_a.svg", "mode": "grayscale"},
        })
    return out


def build_celebrities(cfg):
    sys.path.insert(0, HERE)
    import photos  # يحتاج mediapipe (انظر photos.py)
    return photos.build_celebs(cfg, file_id, norm_letter)


KINDS = {"kuwait_area_shape": build_kuwait_areas, "country_shape": build_countries, "flag": build_flags,
         "celebrity_eyes": build_celebrities, "logo": build_logos,
         "logo_symbol": build_logo_symbols, "logo_colors": build_logo_colors}


def main():
    sets = json.load(open(os.path.join(HERE, "sets.json"), encoding="utf-8"))["sets"]
    only = set(sys.argv[1:])
    db = json.load(open(DB, encoding="utf-8"))
    by_key = {q.get("image", {}).get("key"): q for q in db["questions"] if q.get("image", {}).get("key")}
    next_id = max(q["id"] for q in db["questions"]) + 1
    added = updated = 0
    for cfg in sets:
        if only and cfg["key"] not in only:
            continue
        print(f"▶ {cfg['key']} ({cfg['kind']})")
        for item in KINDS[cfg["kind"]](cfg):
            for name, content in item["files"].items():
                write_image(name, content)
            image = {**item["image"], "key": item["key"], "credit": item.get("credit", cfg.get("credit")),
                     "license": item.get("license", cfg.get("license")), "source": item.get("source", cfg.get("source_url"))}
            if item.get("license_url"):
                image["license_url"] = item["license_url"]
            q = by_key.get(item["key"])
            fields = {
                "category": item["category"], "question": item["question"], "clues": item["clues"],
                "answer": item["answer"], "letter": item["letter"], "difficulty": item["difficulty"],
                "source": item.get("source", cfg.get("source_url")), "image": image,
            }
            if q:
                if q["status"] == "pending":
                    q.update(fields)
                    updated += 1
            else:
                q = {"id": next_id, **fields, "status": "pending", "verified_at": None,
                     "review_note": "سؤال صورة: ينتظر مراجعة صاحب اللعبة"}
                q = {k: q[k] for k in ["id", "category", "question", "clues", "answer", "letter", "difficulty",
                                       "status", "source", "verified_at", "review_note", "image"]}
                db["questions"].append(q)
                by_key[item["key"]] = q
                next_id += 1
                added += 1
    open(DB, "w", encoding="utf-8").write(json.dumps(db, ensure_ascii=False, indent=1) + "\n")
    print(f"أُضيف {added}، تحدّث {updated}")


if __name__ == "__main__":
    main()
