# التشغيل: pip install fonttools brotli && curl -o /tmp/lalezar.woff "$(curl -s -A "Mozilla/5.0 Firefox/3.6" "https://fonts.googleapis.com/css2?family=Lalezar" | grep -o "https://[^)]*")" && python3 scripts/make-logo.py /tmp/lalezar.woff public/brand
"""يبني شعار حروف كـ SVG بمسارات (بدون اعتماد على خط مثبّت).
الفكرة: مسار فائز من أربع خلايا سداسية متصلة (ح ر و ف)، وهو جوهر اللعبة: وصّل الحروف.
"""
import math, sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

FONT = sys.argv[1]
OUT = sys.argv[2]
f = TTFont(FONT)
gs = f.getGlyphSet()
cmap = f.getBestCmap()
UPM = f["head"].unitsPerEm

NAVY = "#0a1a26"
TIFF = "#0abab5"
NEON = "#e4ff1a"
INK = "#06201f"


def glyph_name(ch, form=None):
    base = cmap[ord(ch)]
    if form:
        for cand in (f"{base}.{form}", f"{base}.{form}.1"):
            if cand in gs:
                return cand
    return base


def glyph_path(name, cx, cy, size):
    """مسار الحرف متمركز بصرياً حول (cx, cy) بارتفاع تقريبي size"""
    bp = BoundsPen(gs)
    gs[name].draw(bp)
    x0, y0, x1, y1 = bp.bounds
    s = size / UPM * 1.0
    w, h = (x1 - x0) * s, (y1 - y0) * s
    # flip Y: SVG y down
    dx = cx - (x0 * s + w / 2)
    dy = cy + (y0 * s + h / 2)
    pen = SVGPathPen(gs)
    tp = TransformPen(pen, (s, 0, 0, -s, dx, dy))
    gs[name].draw(tp)
    return pen.getCommands()


def hex_points(cx, cy, r, rounding=0.0):
    pts = []
    for i in range(6):
        a = math.radians(60 * i - 90)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts


def rounded_hex(cx, cy, r, rad):
    """سداسي رأسه للأعلى بزوايا مدوّرة"""
    pts = hex_points(cx, cy, r)
    d = []
    n = len(pts)
    for i in range(n):
        p0, p1, p2 = pts[i - 1], pts[i], pts[(i + 1) % n]
        v1 = (p0[0] - p1[0], p0[1] - p1[1]); l1 = math.hypot(*v1)
        v2 = (p2[0] - p1[0], p2[1] - p1[1]); l2 = math.hypot(*v2)
        a = (p1[0] + v1[0] / l1 * rad, p1[1] + v1[1] / l1 * rad)
        b = (p1[0] + v2[0] / l2 * rad, p1[1] + v2[1] / l2 * rad)
        d.append(("L" if d else "M") + f"{a[0]:.2f},{a[1]:.2f} Q{p1[0]:.2f},{p1[1]:.2f} {b[0]:.2f},{b[1]:.2f}")
    return " ".join(d) + " Z"


def tiles_logo(letters, fills, inks, r=100, gap=34, zig=0.5, link=NAVY, rim=NAVY):
    """صف خلايا متعرج (من اليمين لليسار) مع وصلات بينها"""
    w = math.sqrt(3) * r
    step = w + gap
    n = len(letters)
    cxs = [ (n - 1 - i) * step + w / 2 + 20 for i in range(n) ]  # RTL: الأول يمين
    cys = [ r + 20 + (r * zig if i % 2 else 0) for i in range(n) ]
    W = n * step - gap + 40
    H = r * 2 + r * zig + 40
    parts = []
    # الوصلات (خط المسار الفائز) خلف الخلايا
    for i in range(n - 1):
        parts.append(f'<line x1="{cxs[i]:.1f}" y1="{cys[i]:.1f}" x2="{cxs[i+1]:.1f}" y2="{cys[i+1]:.1f}" stroke="{link}" stroke-width="{r*0.34:.1f}" stroke-linecap="round"/>')
    for i, ch in enumerate(letters):
        parts.append(f'<path d="{rounded_hex(cxs[i], cys[i], r, r*0.16)}" fill="{fills[i]}" stroke="{rim}" stroke-width="{r*0.09:.1f}" stroke-linejoin="round"/>')
        parts.append(f'<path d="{glyph_path(glyph_name(ch), cxs[i], cys[i] + r*0.03, r*1.32)}" fill="{inks[i]}"/>')
    return W, H, "\n  ".join(parts)


def write(name, svg):
    open(f"{OUT}/{name}", "w").write(svg)
    print("wrote", name)


# 1) الشعار الأساسي: ح ر و ف في مسار متصل
letters = list("حروف")
fills = [TIFF, NEON, TIFF, NEON]
inks = [INK, INK, INK, INK]
W, H, body = tiles_logo(letters, fills, inks)
write("logo.svg", f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.0f} {H:.0f}" role="img" aria-label="حروف">\n  <title>حروف</title>\n  {body}\n</svg>\n')

# 2) نسخة على خلفية غامقة (الوصلات بلون فاتح)
W2, H2, body2 = tiles_logo(letters, fills, inks, link="#eaf6f6", rim="#eaf6f6")
write("logo-on-dark.svg", f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W2:.0f} {H2:.0f}" role="img" aria-label="حروف">\n  <title>حروف</title>\n  {body2}\n</svg>\n')

# 3) أيقونة التطبيق: خلية ح فيروزية مع خلية صفراء صغيرة متصلة (لمحة المسار)
S = 1024
icon = [f'<rect width="{S}" height="{S}" rx="230" fill="{NAVY}"/>']
icon.append(f'<line x1="450" y1="470" x2="770" y2="790" stroke="#eaf6f6" stroke-width="64" stroke-linecap="round"/>')
icon.append(f'<path d="{rounded_hex(780, 800, 130, 24)}" fill="{NEON}" stroke="{NAVY}" stroke-width="22"/>')
icon.append(f'<path d="{rounded_hex(430, 440, 310, 48)}" fill="{TIFF}" stroke="{NAVY}" stroke-width="26"/>')
icon.append(f'<path d="{glyph_path(glyph_name("ح"), 430, 450, 470)}" fill="{INK}"/>')
write("icon.svg", f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}" role="img" aria-label="حروف">\n  <title>حروف</title>\n  ' + "\n  ".join(icon) + "\n</svg>\n")

# 4) favicon مبسّط
fav = [f'<rect width="64" height="64" rx="15" fill="{NAVY}"/>',
       f'<path d="{rounded_hex(32, 33, 26, 4)}" fill="{TIFF}"/>',
       f'<path d="{glyph_path(glyph_name("ح"), 32, 34, 38)}" fill="{INK}"/>']
write("favicon.svg", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' + "".join(fav) + "</svg>\n")
