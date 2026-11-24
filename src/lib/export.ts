// تصدير جدول الأسئلة: Excel (xlsx) و PDF، بدون مكتبات خارجية.
// xlsx = ملفات XML داخل zip (بدون ضغط). PDF = صفحات مرسومة على canvas
// (المتصفح يرسم العربي صح) ومحطوطة كصور JPEG داخل ملف PDF.

export type ExportRow = { id: number; letter: string; question: string; answer: string };

// ---------- ZIP (store) ----------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(data: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) c = CRC_TABLE[(c ^ data[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function zip(files: { name: string; text: string }[]): Blob {
  const enc = new TextEncoder();
  const parts: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const f of files) {
    const name = enc.encode(f.name);
    const data = enc.encode(f.text);
    const crc = crc32(data);
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(8, 0, true); // بدون ضغط
    local.setUint16(12, 0x21, true); // تاريخ 1980-01-01
    local.setUint32(14, crc, true);
    local.setUint32(18, data.length, true);
    local.setUint32(22, data.length, true);
    local.setUint16(26, name.length, true);
    parts.push(new Uint8Array(local.buffer), name, data);

    const cd = new DataView(new ArrayBuffer(46));
    cd.setUint32(0, 0x02014b50, true);
    cd.setUint16(4, 20, true);
    cd.setUint16(6, 20, true);
    cd.setUint16(14, 0x21, true);
    cd.setUint32(16, crc, true);
    cd.setUint32(20, data.length, true);
    cd.setUint32(24, data.length, true);
    cd.setUint16(28, name.length, true);
    cd.setUint32(42, offset, true);
    central.push(new Uint8Array(cd.buffer), name);
    offset += 30 + name.length + data.length;
  }
  const cdSize = central.reduce((s, p) => s + p.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, cdSize, true);
  end.setUint32(16, offset, true);
  return new Blob([...parts, ...central, new Uint8Array(end.buffer)] as BlobPart[], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

// ---------- XLSX ----------
const xml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function buildXlsx(rows: ExportRow[], sheetName: string): Blob {
  const header = ["رقم السؤال", "الحرف", "السؤال", "الجواب"];
  const cell = (ref: string, v: string | number, style = 0) =>
    typeof v === "number"
      ? `<c r="${ref}" s="${style}"><v>${v}</v></c>`
      : `<c r="${ref}" t="inlineStr" s="${style}"><is><t xml:space="preserve">${xml(v)}</t></is></c>`;
  const cols = ["A", "B", "C", "D"];
  const lines = [
    `<row r="1">${header.map((h, i) => cell(`${cols[i]}1`, h, 1)).join("")}</row>`,
    ...rows.map((r, i) => {
      const n = i + 2;
      return `<row r="${n}">${cell(`A${n}`, r.id, 2)}${cell(`B${n}`, r.letter, 2)}${cell(`C${n}`, r.question, 3)}${cell(`D${n}`, r.answer, 3)}</row>`;
    }),
  ];
  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetViews><sheetView rightToLeft="1" workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<cols><col min="1" max="1" width="12" customWidth="1"/><col min="2" max="2" width="8" customWidth="1"/><col min="3" max="3" width="80" customWidth="1"/><col min="4" max="4" width="26" customWidth="1"/></cols>
<sheetData>${lines.join("")}</sheetData>
</worksheet>`;
  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="2"><font><sz val="12"/><name val="Arial"/></font><font><b/><sz val="12"/><name val="Arial"/></font></fonts>
<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFD9F2F1"/></patternFill></fill></fills>
<borders count="1"><border/></borders>
<cellStyleXfs count="1"><xf/></cellStyleXfs>
<cellXfs count="4">
<xf/>
<xf fontId="1" fillId="2" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf applyAlignment="1"><alignment horizontal="center" vertical="top"/></xf>
<xf applyAlignment="1"><alignment wrapText="1" vertical="top" readingOrder="2"/></xf>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;
  const safeName = xml(sheetName.replace(/[\\/?*[\]:]/g, " ").slice(0, 31) || "الأسئلة");
  return zip([
    {
      name: "[Content_Types].xml",
      text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`,
    },
    {
      name: "_rels/.rels",
      text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    },
    {
      name: "xl/workbook.xml",
      text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${safeName}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    },
    { name: "xl/worksheets/sheet1.xml", text: sheet },
    { name: "xl/styles.xml", text: styles },
  ]);
}

// ---------- PDF ----------
const PAGE_W = 1240; // A4 بدقة 150 نقطة لكل إنش
const PAGE_H = 1754;
const MARGIN = 70;
const FONT = '"IBM Plex Sans Arabic", Tahoma, Arial, sans-serif';
// أعمدة من اليمين: رقم، حرف، سؤال، جواب
const COLS = [
  { key: "id", w: 140, title: "رقم السؤال" },
  { key: "letter", w: 90, title: "الحرف" },
  { key: "question", w: 0, title: "السؤال" },
  { key: "answer", w: 260, title: "الجواب" },
] as const;

function wrap(ctx: CanvasRenderingContext2D, text: string, width: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(next).width > width && cur) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

function renderPages(rows: ExportRow[], title: string): HTMLCanvasElement[] {
  const inner = PAGE_W - MARGIN * 2;
  const qWidth = inner - COLS.reduce((s, c) => s + c.w, 0);
  const widths = COLS.map((c) => (c.w || qWidth));
  const pad = 14;
  const lineH = 34;
  const pages: HTMLCanvasElement[] = [];
  let ctx: CanvasRenderingContext2D;
  let y = 0;

  const newPage = () => {
    const c = document.createElement("canvas");
    c.width = PAGE_W;
    c.height = PAGE_H;
    ctx = c.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, PAGE_W, PAGE_H);
    ctx.direction = "rtl";
    ctx.textBaseline = "top";
    pages.push(c);
    y = MARGIN;
    if (pages.length === 1) {
      ctx.fillStyle = "#0c1e2b";
      ctx.font = `700 40px ${FONT}`;
      ctx.textAlign = "right";
      ctx.fillText(title, PAGE_W - MARGIN, y);
      y += 70;
    }
    // رأس الجدول
    ctx.fillStyle = "#d9f2f1";
    ctx.fillRect(MARGIN, y, inner, 52);
    ctx.fillStyle = "#0c1e2b";
    ctx.font = `700 24px ${FONT}`;
    let x = PAGE_W - MARGIN;
    COLS.forEach((c, i) => {
      ctx.textAlign = "center";
      ctx.fillText(c.title, x - widths[i] / 2, y + 12);
      x -= widths[i];
    });
    y += 52;
  };

  newPage();
  ctx!.font = `22px ${FONT}`;
  rows.forEach((r, idx) => {
    ctx.font = `22px ${FONT}`;
    const cells = [String(r.id), r.letter, r.question, r.answer];
    const wrapped = cells.map((t, i) => (i < 2 ? [t] : wrap(ctx, t, widths[i] - pad * 2)));
    const h = Math.max(...wrapped.map((l) => l.length)) * lineH + pad * 2;
    if (y + h > PAGE_H - MARGIN) {
      newPage();
      ctx.font = `22px ${FONT}`;
    }
    if (idx % 2 === 1) {
      ctx.fillStyle = "#f3faf9";
      ctx.fillRect(MARGIN, y, inner, h);
    }
    ctx.strokeStyle = "#cfe3e1";
    ctx.lineWidth = 1;
    ctx.strokeRect(MARGIN, y, inner, h);
    ctx.fillStyle = "#0c1e2b";
    let x = PAGE_W - MARGIN;
    wrapped.forEach((lines, i) => {
      ctx.textAlign = i < 2 ? "center" : "right";
      ctx.font = i === 3 ? `700 22px ${FONT}` : `22px ${FONT}`;
      const tx = i < 2 ? x - widths[i] / 2 : x - pad;
      lines.forEach((ln, k) => ctx.fillText(ln, tx, y + pad + k * lineH));
      x -= widths[i];
    });
    y += h;
  });
  // ترقيم الصفحات
  pages.forEach((c, i) => {
    const p = c.getContext("2d")!;
    p.direction = "rtl";
    p.fillStyle = "#5b717c";
    p.font = `20px ${FONT}`;
    p.textAlign = "center";
    p.fillText(`صفحة ${i + 1} من ${pages.length}`, PAGE_W / 2, PAGE_H - MARGIN / 2 - 10);
  });
  return pages;
}

function dataUrlBytes(url: string): Uint8Array {
  const bin = atob(url.split(",")[1]);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function buildPdf(rows: ExportRow[], title: string): Promise<Blob> {
  try {
    await document.fonts.load(`22px "IBM Plex Sans Arabic"`);
    await document.fonts.load(`700 22px "IBM Plex Sans Arabic"`);
  } catch {
    /* الخط الاحتياطي يكفي */
  }
  const pages = renderPages(rows, title);
  const enc = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [];
  let pos = 0;
  const push = (b: Uint8Array) => {
    chunks.push(b);
    pos += b.length;
  };
  const text = (s: string) => push(enc.encode(s));
  const W = 595.28;
  const H = 841.89;
  const n = pages.length;
  // أرقام الكائنات: 1 الكتالوج، 2 الصفحات، ثم لكل صفحة: صفحة، صورة، محتوى
  const pageObj = (i: number) => 3 + i * 3;
  text("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  const obj = (num: number, body: () => void) => {
    offsets[num] = pos;
    text(`${num} 0 obj\n`);
    body();
    text("\nendobj\n");
  };
  obj(1, () => text("<< /Type /Catalog /Pages 2 0 R >>"));
  obj(2, () =>
    text(`<< /Type /Pages /Count ${n} /Kids [${pages.map((_, i) => `${pageObj(i)} 0 R`).join(" ")}] >>`),
  );
  pages.forEach((c, i) => {
    const jpg = dataUrlBytes(c.toDataURL("image/jpeg", 0.85));
    const p = pageObj(i);
    obj(p, () =>
      text(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /XObject << /Im${i} ${p + 1} 0 R >> >> /Contents ${p + 2} 0 R >>`,
      ),
    );
    obj(p + 1, () => {
      text(
        `<< /Type /XObject /Subtype /Image /Width ${c.width} /Height ${c.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`,
      );
      push(jpg);
      text("\nendstream");
    });
    const content = `q ${W} 0 0 ${H} 0 0 cm /Im${i} Do Q`;
    obj(p + 2, () => text(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`));
  });
  const total = 3 + n * 3;
  const xref = pos;
  text(`xref\n0 ${total}\n0000000000 65535 f \n`);
  for (let i = 1; i < total; i++) text(`${String(offsets[i]).padStart(10, "0")} 00000 n \n`);
  text(`trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(chunks as BlobPart[], { type: "application/pdf" });
}

// ---------- الحفظ ----------
type Downloads = { save(r: { filename: string; data: Blob }): Promise<{ status: string }> };
type ClaudeHost = { use(name: string): Promise<unknown> };

/** داخل Claude: قدرة downloads. خارجها (التطوير المحلي): رابط تنزيل عادي */
export async function saveFile(filename: string, blob: Blob): Promise<"saved" | "declined" | "failed"> {
  const host = (window as unknown as { claude?: ClaudeHost }).claude;
  if (host?.use) {
    const downloads = (await host.use("downloads")) as Downloads | null;
    if (!downloads) return "failed";
    try {
      await downloads.save({ filename, data: blob });
      return "saved";
    } catch (e) {
      return (e as { code?: string })?.code === "declined" ? "declined" : "failed";
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return "saved";
}
