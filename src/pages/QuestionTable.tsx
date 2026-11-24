import { useMemo, useState } from "react";
import { bank } from "../lib/api";
import { LetterGrid } from "../components/LetterGrid";
import { formatNumber, questionsLabel } from "../lib/format";
import { buildPdf, buildXlsx, saveFile, type ExportRow } from "../lib/export";

/** جدول الأسئلة لصاحب اللعبة: فئة ← كل أسئلتها مع الرقم والحرف والجواب، وتصدير Excel و PDF */
export function QuestionTable() {
  const { questions, categories } = bank;
  const ready = categories.filter((c) => c.question_count > 0);
  const [catId, setCatId] = useState<number | undefined>(ready[0]?.id);
  const [letter, setLetter] = useState<string | undefined>();
  const [random, setRandom] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [busy, setBusy] = useState<"" | "xlsx" | "pdf">("");
  const [note, setNote] = useState("");

  const category = categories.find((c) => c.id === catId);
  const inCat = useMemo(
    () => questions.filter((q) => !catId || q.category_id === catId),
    [questions, catId],
  );
  const rows = useMemo(
    () => inCat.filter((q) => !letter || q.letter === letter).sort((a, b) => a.letter.localeCompare(b.letter, "ar") || a.id - b.id),
    [inCat, letter],
  );
  const counts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const q of inCat) out[q.letter] = (out[q.letter] ?? 0) + 1;
    return out;
  }, [inCat]);
  const picked = rows.find((q) => q.id === random);

  const title = `${category?.name ?? "كل الفئات"}${letter ? ` · حرف ${letter}` : ""}`;
  const fileBase = `حروف - ${title.replace(/·/g, "-")}`;

  function choose(id: number | undefined) {
    setCatId(id);
    setLetter(undefined);
    setRandom(null);
  }

  function pickRandom() {
    if (!rows.length) return;
    let next = rows[Math.floor(Math.random() * rows.length)].id;
    if (rows.length > 1) while (next === random) next = rows[Math.floor(Math.random() * rows.length)].id;
    setRandom(next);
    setShowAnswer(false);
  }

  async function exportAs(kind: "xlsx" | "pdf") {
    setBusy(kind);
    setNote("");
    const data: ExportRow[] = rows.map((q) => ({ id: q.id, letter: q.letter, question: q.question, answer: q.answer }));
    try {
      const blob = kind === "xlsx" ? buildXlsx(data, title) : await buildPdf(data, `حروف - ${title.replace(/·/g, "-")} (${questionsLabel(data.length)})`);
      const result = await saveFile(`${fileBase}.${kind}`, blob);
      if (result === "failed") setNote("ما قدرنا نحفظ الملف هنا. جرّب تفتح الصفحة في المتصفح.");
    } catch {
      setNote("صار خطأ أثناء تجهيز الملف.");
    } finally {
      setBusy("");
    }
  }

  return (
    <>
      <header className="page-head">
        <p className="eyebrow">لصاحب اللعبة</p>
        <h1>جدول الأسئلة</h1>
        <p className="lead">اختر فئة تطلع لك كل أسئلتها برقمها وحرفها وجوابها، ونزّلها Excel أو PDF.</p>
      </header>

      <div className="qt-cats" role="tablist" aria-label="الفئات">
        <button type="button" role="tab" aria-selected={!catId} className={`qt-cat${!catId ? " active" : ""}`} onClick={() => choose(undefined)}>
          الكل <span>{formatNumber(questions.length)}</span>
        </button>
        {ready.map((c) => (
          <button key={c.id} type="button" role="tab" aria-selected={catId === c.id} className={`qt-cat${catId === c.id ? " active" : ""}`} onClick={() => choose(c.id)}>
            {c.name} <span>{formatNumber(c.question_count)}</span>
          </button>
        ))}
      </div>

      <div className="filters">
        <LetterGrid size="sm" counts={counts} active={letter} onSelect={(l) => { setLetter(l); setRandom(null); }} />
        {letter && (
          <button className="clear" onClick={() => setLetter(undefined)}>
            إلغاء فلتر الحرف «{letter}»
          </button>
        )}
      </div>

      <div className="qt-bar">
        <h2>
          {title} <span className="cat-count">{questionsLabel(rows.length)}</span>
        </h2>
        <div className="qt-actions">
          <button type="button" className="btn primary" onClick={pickRandom} disabled={!rows.length}>
            سؤال عشوائي
          </button>
          <button type="button" className="btn ghost" onClick={() => exportAs("xlsx")} disabled={!rows.length || !!busy}>
            {busy === "xlsx" ? "يجهّز…" : "تنزيل Excel"}
          </button>
          <button type="button" className="btn ghost" onClick={() => exportAs("pdf")} disabled={!rows.length || !!busy}>
            {busy === "pdf" ? "يجهّز…" : "تنزيل PDF"}
          </button>
        </div>
      </div>
      {note && <p className="qt-note" role="status">{note}</p>}

      {picked && (
        <div className="qt-random" aria-live="polite">
          <span className="qt-letter">{picked.letter}</span>
          <div>
            <p className="qt-meta">سؤال رقم {formatNumber(picked.id)}</p>
            <p className="qt-q">{picked.question}</p>
            {showAnswer ? (
              <p className="qt-a">{picked.answer}</p>
            ) : (
              <button type="button" className="btn ghost" onClick={() => setShowAnswer(true)}>أظهر الجواب</button>
            )}
          </div>
        </div>
      )}

      <div className="qt-wrap">
        <table className="qt-table">
          <thead>
            <tr>
              <th scope="col">رقم السؤال</th>
              <th scope="col">الحرف</th>
              <th scope="col">السؤال</th>
              <th scope="col">الجواب</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((q) => (
              <tr key={q.id} className={q.id === random ? "hit" : undefined}>
                <td className="num">{formatNumber(q.id)}</td>
                <td className="let">{q.letter}</td>
                <td>{q.question}</td>
                <td className="ans">{q.answer}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="qt-note">ما فيه أسئلة هنا.</p>}
      </div>
    </>
  );
}
