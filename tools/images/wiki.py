"""أدوات Wikidata و Commons لمولّد أسئلة الصور.

الأدب مع Wikimedia: User-Agent واضح، طلب واحد كل ثانية تقريباً، إعادة محاولة مع انتظار، وكاش محلي.
إيميل التواصل يجي من متغير البيئة HRF_CONTACT (ما ينكتب في الكود).
"""
import hashlib
import html
import json
import os
import re
import time
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, "cache")
UA = f"hrf-quiz-images/0.1 (personal trivia game; {os.environ.get('HRF_CONTACT', 'contact not set')})"
_last = [0.0]


def _get(url: str, binary=False, accept=None):
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, hashlib.sha1(url.encode()).hexdigest()[:20])
    if os.path.exists(path):
        data = open(path, "rb").read()
        return data if binary else data.decode("utf-8")
    headers = {"User-Agent": UA}
    if accept:
        headers["Accept"] = accept
    for attempt in range(5):
        wait = float(os.environ.get("HRF_RATE", "2.5")) - (time.time() - _last[0])
        if wait > 0:
            time.sleep(wait)
        _last[0] = time.time()
        try:
            data = urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=90).read()
            open(path, "wb").write(data)
            return data if binary else data.decode("utf-8")
        except Exception as e:  # noqa: BLE001
            if attempt == 4:
                raise
            print(f"  إعادة المحاولة بعد خطأ: {e} ← {url[:120]}")
            retry_after = getattr(e, "headers", None) and e.headers.get("Retry-After")
            time.sleep(int(retry_after) if retry_after and retry_after.isdigit() else 15 * 2 ** attempt)
    raise RuntimeError(url)


def sparql(query: str) -> list[dict]:
    url = "https://query.wikidata.org/sparql?" + urllib.parse.urlencode({"query": query, "format": "json"})
    rows = json.loads(_get(url, accept="application/sparql-results+json"))["results"]["bindings"]
    return [{k: v["value"] for k, v in r.items()} for r in rows]


def qid(uri: str) -> str:
    return uri.rsplit("/", 1)[-1]


def file_title(commons_url: str) -> str:
    """رابط Special:FilePath ← اسم الملف"""
    return urllib.parse.unquote(commons_url.rsplit("/", 1)[-1]).replace("_", " ")


def _clean(s: str | None) -> str:
    if not s:
        return ""
    return html.unescape(re.sub(r"<[^>]+>", "", s)).strip()


def image_info(title: str, width: int = 1280) -> dict | None:
    """رابط الصورة بالمقاس المطلوب + المؤلف والترخيص من extmetadata"""
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({
        "action": "query", "format": "json", "prop": "imageinfo", "titles": f"File:{title}",
        "iiprop": "url|size|extmetadata|mime", "iiurlwidth": width,
    })
    pages = json.loads(_get(url))["query"]["pages"]
    page = next(iter(pages.values()))
    if "imageinfo" not in page:
        return None
    ii = page["imageinfo"][0]
    meta = ii.get("extmetadata", {})
    return {
        "title": title,
        "width": ii["width"], "height": ii["height"], "mime": ii.get("mime"),
        "thumb": ii.get("thumburl") or ii["url"],
        "original": ii["url"],
        "page": ii.get("descriptionurl"),
        "author": _clean(meta.get("Artist", {}).get("value")) or "غير مذكور",
        "license": _clean(meta.get("LicenseShortName", {}).get("value")) or "غير مذكور",
        "license_url": _clean(meta.get("LicenseUrl", {}).get("value")),
    }


def download(url: str) -> bytes:
    # المصغرات صارت تجي من thumb.wikimedia.org، ونفس المسار يشتغل على upload.wikimedia.org (المسموح في الشبكة)
    return _get(url.replace("://thumb.wikimedia.org/", "://upload.wikimedia.org/"), binary=True)
