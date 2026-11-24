"""خرايط «لوكيشن»: دبوس أحمر على مكان، والسؤال «ما اسم هذا المكان؟».

الخريطة من بلاطات CARTO (بيانات OpenStreetMap)، والإسناد: © OpenStreetMap contributors © CARTO.
الإحداثيات من Nominatim (OpenStreetMap). كل شي ينحفظ في الكاش.
السؤال: الخريطة + الدبوس. الجواب: نفس الخريطة + الدبوس + اسم المكان جنبه.
"""
import io
import json
import math
import urllib.parse

from PIL import Image, ImageDraw, ImageFont

import wiki

TILE = "https://a.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}@2x.png"
W, H = 1600, 1000
FONT_PATHS = ["/usr/share/fonts/truetype/noto/NotoSansArabic-Bold.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"]


def geocode(query: str):
    url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode(
        {"q": query, "format": "json", "limit": 1, "countrycodes": "kw"})
    res = json.loads(wiki._get(url))
    return (float(res[0]["lat"]), float(res[0]["lon"])) if res else None


def _world(lat, lon, z):
    """إحداثيات البكسل العالمية (بلاطة ٥١٢ لأنها @2x)"""
    n = 2 ** z * 512
    x = (lon + 180) / 360 * n
    s = math.sin(math.radians(lat))
    y = (0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi)) * n
    return x, y


def base_map(lat, lon, z=16, shift=(0, 0)):
    """خريطة W×H حول النقطة. shift يحرّك المركز شوي عشان الدبوس ما يكون دايماً بالنص بالضبط"""
    cx, cy = _world(lat, lon, z)
    cx, cy = cx + shift[0], cy + shift[1]
    x0, y0 = cx - W / 2, cy - H / 2
    img = Image.new("RGB", (W, H), "#f2efe9")
    for tx in range(int(x0 // 512), int((x0 + W) // 512) + 1):
        for ty in range(int(y0 // 512), int((y0 + H) // 512) + 1):
            data = wiki._get(TILE.format(z=z, x=tx, y=ty), binary=True)
            tile = Image.open(io.BytesIO(data)).convert("RGB")
            img.paste(tile, (int(tx * 512 - x0), int(ty * 512 - y0)))
    px, py = _world(lat, lon, z)
    return img, (px - x0, py - y0)


def draw_pin(img, at, label=None):
    d = ImageDraw.Draw(img)
    x, y = at
    r = 26
    # دبوس على شكل قطرة: دائرة + مثلث رأسه على النقطة
    d.polygon([(x - r * 0.78, y - r * 1.55), (x + r * 0.78, y - r * 1.55), (x, y)], fill="#ea4335")
    d.ellipse([x - r, y - r * 2.6, x + r, y - r * 0.6], fill="#ea4335", outline="#b31412", width=3)
    d.ellipse([x - r * 0.38, y - r * 1.98, x + r * 0.38, y - r * 1.22], fill="#a50e0e")
    if label:
        font = next((ImageFont.truetype(p, 40) for p in FONT_PATHS if _exists(p)), ImageFont.load_default())
        text = _shape(label)
        tx, ty = x + r + 12, y - r * 1.6 - 22
        for dx in (-3, 0, 3):
            for dy in (-3, 0, 3):
                d.text((tx + dx, ty + dy), text, font=font, fill="white")
        d.text((tx, ty), text, font=font, fill="#c5221f")
    return img


def _exists(p):
    import os
    return os.path.exists(p)


def _shape(text: str) -> str:
    """Pillow بدون raqm ما يوصل الحروف العربية: نستخدم arabic_reshaper و bidi إذا موجودين"""
    try:
        import arabic_reshaper
        from bidi.algorithm import get_display
        return get_display(arabic_reshaper.reshape(text))
    except ImportError:
        return text
