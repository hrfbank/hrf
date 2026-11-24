"""خرايط «لوكيشن»: دبوس أحمر على مكان، والسؤال «ما اسم هذا المكان؟».

نرسم الخريطة بأنفسنا من بيانات OpenStreetMap (عن طريق Overpass)، عشان نتحكم في الأسماء:
السؤال يعرض أسماء الشوارع والأماكن اللي حوله بس، بدون اسم المكان المطلوب. والجواب يضيف اسمه جنب الدبوس.
اليابسة والبحر من حدود مناطق الكويت (Kuwait-GeoJSON). الإسناد: © OpenStreetMap contributors.
"""
import io
import json
import math
import os
import urllib.parse

from PIL import Image, ImageDraw, ImageFont

import wiki

HERE = os.path.dirname(os.path.abspath(__file__))
OVERPASS = "https://maps.mail.ru/osm/tools/overpass/api/interpreter"
W, H = 1600, 1000
MPP = 0.75  # متر لكل بكسل (الخريطة تغطي تقريباً ١٫٢ كم × ٧٥٠ م)
FONT = os.path.join(HERE, "fonts", "IBMPlexSansArabic-Regular.ttf")
FONT_B = os.path.join(HERE, "fonts", "IBMPlexSansArabic-SemiBold.ttf")
C = {"land": "#f5f3ef", "sea": "#a8d8f0", "park": "#cdeccf", "casing": "#d5d8dc", "road": "#ffffff",
     "major": "#fde9a9", "major_casing": "#e6c56a", "label": "#5f6368", "poi": "#7b61ff"}
MAJOR = {"motorway", "trunk", "primary", "motorway_link", "trunk_link"}
WIDTH = {"motorway": 22, "trunk": 20, "primary": 18, "secondary": 15, "tertiary": 13, "motorway_link": 12,
         "trunk_link": 12, "primary_link": 11, "residential": 10, "unclassified": 10, "service": 6, "living_street": 8}


def geocode(query: str):
    url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode(
        {"q": query, "format": "json", "limit": 1, "countrycodes": "kw"})
    res = json.loads(wiki._get(url))
    return (float(res[0]["lat"]), float(res[0]["lon"])) if res else None


class View:
    def __init__(self, lat, lon, shift=(0, 0)):
        self.lat0, self.lon0 = lat, lon
        self.kx = 111320 * math.cos(math.radians(lat)) / MPP
        self.ky = 110540 / MPP
        self.ox, self.oy = W / 2 + shift[0], H / 2 + shift[1]

    def px(self, lat, lon):
        return self.ox + (lon - self.lon0) * self.kx, self.oy - (lat - self.lat0) * self.ky

    def bbox(self, pad=1.15):
        dlon = W / 2 / self.kx * pad + abs(self.ox - W / 2) / self.kx
        dlat = H / 2 / self.ky * pad + abs(self.oy - H / 2) / self.ky
        return self.lat0 - dlat, self.lon0 - dlon, self.lat0 + dlat, self.lon0 + dlon


def overpass(v: View):
    """استعلامين صغار بدل واحد كبير (الخادم يقطع الاستعلامات الثقيلة)"""
    s, w, n, e = v.bbox()
    bb = f"({s:.5f},{w:.5f},{n:.5f},{e:.5f})"
    queries = [
        f'[out:json][timeout:50];(way["highway"~"^(motorway|trunk|primary|secondary|tertiary|residential|unclassified|motorway_link|trunk_link|primary_link|living_street)$"]{bb};'
        f'way["leisure"~"^(park|garden|pitch|stadium)$"]{bb};);out geom;',
        f'[out:json][timeout:50];(nwr["name"]["amenity"]{bb};nwr["name"]["shop"]{bb};nwr["name"]["tourism"]{bb};'
        f'nwr["name"]["leisure"]{bb};nwr["name"]["office"]{bb};);out center;',
    ]
    out = []
    for q in queries:
        out += json.loads(wiki._get(OVERPASS + "?" + urllib.parse.urlencode({"data": q})))["elements"]
    return out


def _font(size, bold=False):
    return ImageFont.truetype(FONT_B if bold else FONT, size, layout_engine=ImageFont.Layout.RAQM)


def _name(tags):
    return tags.get("name:ar") or tags.get("name") or ""


def render(lat, lon, land_rings, target_names=(), target_label=None, shift=(0, 0)):
    """ترجع صورة الخريطة. target_names: أسماء المكان المطلوب (ما تنكتب على الخريطة أبداً)"""
    v = View(lat, lon, shift)
    img = Image.new("RGB", (W, H), C["sea"])
    d = ImageDraw.Draw(img)
    for ring in land_rings:
        pts = [v.px(la, lo) for lo, la in ring]
        if any(-W < x < 2 * W and -H < y < 2 * H for x, y in pts):
            d.polygon(pts, fill=C["land"])
    els = overpass(v)
    for el in els:  # الحدائق والملاعب
        t = el.get("tags", {})
        if t.get("leisure") in ("park", "garden", "pitch", "stadium") and el.get("geometry") and el["type"] == "way":
            d.polygon([v.px(p["lat"], p["lon"]) for p in el["geometry"]], fill=C["park"])
    roads = [el for el in els if el["type"] == "way" and "highway" in el.get("tags", {}) and el.get("geometry")]
    roads.sort(key=lambda el: el["tags"]["highway"] in MAJOR)
    for layer in ("casing", "fill"):
        for el in roads:
            hw = el["tags"]["highway"]
            w = WIDTH.get(hw, 0)
            if not w:
                continue
            pts = [v.px(p["lat"], p["lon"]) for p in el["geometry"]]
            major = hw in MAJOR
            if layer == "casing":
                d.line(pts, fill=C["major_casing" if major else "casing"], width=w + 4, joint="curve")
            else:
                d.line(pts, fill=C["major" if major else "road"], width=w, joint="curve")
    # الأسماء: شوارع رئيسية + أماكن قريبة، بدون المكان المطلوب
    banned = {n.strip().lower() for n in target_names if n}
    placed = []
    f_poi, f_road = _font(22), _font(20)

    def free(box):
        return all(box[2] < b[0] or box[0] > b[2] or box[3] < b[1] or box[1] > b[3] for b in placed)

    tx, ty = v.px(lat, lon)
    placed.append((tx - 150, ty - 120, tx + 150, ty + 40))  # حول الدبوس ما نكتب شي
    for el in els:
        t = el.get("tags", {})
        nm = _name(t)
        if not nm or "highway" in t or any(b and (b in nm.lower() or b in (t.get("name", "").lower())) for b in banned):
            continue
        c = el.get("center") or ({"lat": el["lat"], "lon": el["lon"]} if "lat" in el else None)
        if not c:
            continue
        x, y = v.px(c["lat"], c["lon"])
        if math.hypot(x - tx, y - ty) < 70:  # قريب جداً من الدبوس: غالباً المكان نفسه
            continue
        if not (40 < x < W - 40 and 40 < y < H - 40) or len(nm) > 28:
            continue
        bw = d.textlength(nm, font=f_poi)
        box = (x - 10, y - 14, x + 16 + bw, y + 16)
        if not free(box):
            continue
        placed.append(box)
        d.ellipse([x - 9, y - 9, x + 9, y + 9], fill=C["poi"], outline="white", width=3)
        d.text((x + 14, y), nm, font=f_poi, fill=C["poi"], anchor="lm", stroke_width=4, stroke_fill="white")
    for el in roads:
        t = el["tags"]
        nm = _name(t)
        if not nm or t["highway"] in ("service", "footway"):
            continue
        g = el["geometry"]
        mid = g[len(g) // 2]
        x, y = v.px(mid["lat"], mid["lon"])
        bw = d.textlength(nm, font=f_road)
        box = (x - bw / 2, y - 12, x + bw / 2, y + 12)
        if not (0 < box[0] and box[2] < W and 0 < y < H) or not free(box):
            continue
        placed.append(box)
        d.text((x, y), nm, font=f_road, fill=C["label"], anchor="mm", stroke_width=4, stroke_fill="white")
    draw_pin(img, (tx, ty), target_label)
    d.text((W - 12, H - 10), "© OpenStreetMap contributors", font=_font(16), fill="#80868b", anchor="rd")
    return img


def draw_pin(img, at, label=None):
    d = ImageDraw.Draw(img)
    x, y = at
    r = 30
    cy = y - r * 1.9
    d.polygon([(x - r * 0.86, cy + r * 0.5), (x + r * 0.86, cy + r * 0.5), (x, y)], fill="#ea4335")
    d.ellipse([x - r, cy - r, x + r, cy + r], fill="#ea4335")
    d.ellipse([x - r * 0.36, cy - r * 0.36, x + r * 0.36, cy + r * 0.36], fill="#a50e0e")
    if label:
        d.text((x + r + 10, cy), label, font=_font(38, bold=True), fill="#c5221f", anchor="lm",
               stroke_width=5, stroke_fill="white")
    return img
