import { useEffect, useMemo, useState } from "react";
import { pendingImages, type ReviewItem } from "../lib/api";
import { QuestionImage } from "../components/QuestionImage";
import { formatNumber } from "../lib/format";

type Decision = { decision: "approve" | "reject"; difficulty: number; note?: string };
type Decisions = Record<number, Decision>;

type DocSnap = { id: string; data(): Record<string, unknown> | undefined };
type ReviewDb = {
  collection(path: string): {
    doc(id: string): { set(d: Record<string, unknown>): Promise<void>; delete(): Promise<void> };
    onSnapshot(next: (s: { docs: DocSnap[] }) => void, err?: (e: unknown) => void): () => void;
  };
};
type ClaudeHost = { use(name: string): Promise<unknown> };

const COLLECTION = "image_review";
const LOCAL = "hrf-image-review";
const DIFF = ["سهل", "متوسط", "صعب"];

/** القرارات تنحفظ داخل الصفحة (قدرة db) عشان Claude يقراها ويطبقها على بنك الأسئلة */
function useDecisions() {
  const [decisions, setDecisions] = useState<Decisions>(() => {
    try {
      return JSON.parse(localStorage.getItem(LOCAL) ?? "{}");
    } catch {
      return {};
    }
  });
  const [db, setDb] = useState<ReviewDb | null>(null);
  const [status, setStatus] = useState<"loading" | "online" | "local">("loading");

  useEffect(() => {
    let unsub: (() => void) | undefined;
    let done = false;
    const host = (window as unknown as { claude?: ClaudeHost }).claude;
    const timer = setTimeout(() => !done && setStatus("local"), 10000);
    if (!host?.use) {
      setStatus("local");
      return () => clearTimeout(timer);
    }
    host.use("db").then((d) => {
      done = true;
      clearTimeout(timer);
      if (!d) return setStatus("local");
      const store = d as ReviewDb;
      setDb(store);
      setStatus("online");
      unsub = store.collection(COLLECTION).onSnapshot(
        (snap) => {
          const next: Decisions = {};
          for (const doc of snap.docs) {
            const v = doc.data() as Decision | undefined;
            if (v) next[Number(doc.id)] = v;
          }
          setDecisions(next);
        },
        () => setStatus("local"),
      );
    });
    return () => {
      clearTimeout(timer);
      unsub?.();
    };
  }, []);

  async function decide(id: number, value: Decision | null) {
    const next = { ...decisions };
    if (value) next[id] = value;
    else delete next[id];
    setDecisions(next);
    try {
      localStorage.setItem(LOCAL, JSON.stringify(next));
    } catch {
      /* التخزين المحلي اختياري */
    }
    if (db) {
      const ref = db.collection(COLLECTION).doc(String(id));
      await (value ? ref.set({ ...value, at: new Date().toISOString() }) : ref.delete());
    }
  }

  return { decisions, decide, status };
}

function ReviewCard({ item, decision, onDecide }: { item: ReviewItem; decision?: Decision; onDecide: (d: Decision | null) => void }) {
  const [difficulty, setDifficulty] = useState(decision?.difficulty ?? item.difficulty);
  const [note, setNote] = useState(decision?.note ?? "");
  const state = decision?.decision;
  return (
    <article className={`rv-card${state ? ` ${state}` : ""}`}>
      <header className="rv-head">
        <span className="chip">{item.category_name}</span>
        <span className="rv-id">#{formatNumber(item.id)}</span>
        {state && <span className={`rv-badge ${state}`}>{state === "approve" ? "معتمد" : "مرفوض"}</span>}
      </header>
      <p className="rv-q">{item.question}</p>
      <div className="rv-pair">
        <div>
          <p className="rv-label">السؤال</p>
          {item.image && <QuestionImage image={item.image} step={0} steps={item.clues.length} revealed={false} />}
        </div>
        <div>
          <p className="rv-label">الجواب</p>
          {item.image && <QuestionImage image={item.image} step={0} steps={item.clues.length} revealed />}
        </div>
      </div>
      <p className="rv-answer">
        <span className="rv-letter">{item.letter}</span> {item.answer}
      </p>
      <ol className="rv-clues">
        {item.clues.map((c, i) => <li key={i}>{c}</li>)}
      </ol>
      <div className="rv-diff" role="radiogroup" aria-label="الصعوبة">
        {DIFF.map((d, i) => (
          <button key={d} type="button" role="radio" aria-checked={difficulty === i + 1} className={difficulty === i + 1 ? "on" : ""} onClick={() => setDifficulty(i + 1)}>
            {d}
          </button>
        ))}
      </div>
      <input className="rv-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="ملاحظة (مثلاً: غيّر التلميح، أو القص صغير)" />
      <div className="rv-actions">
        <button type="button" className="btn primary" onClick={() => onDecide({ decision: "approve", difficulty, note: note || undefined })}>
          اعتماد
        </button>
        <button type="button" className="btn danger" onClick={() => onDecide({ decision: "reject", difficulty, note: note || undefined })}>
          رفض
        </button>
        {state && (
          <button type="button" className="btn ghost" onClick={() => onDecide(null)}>
            تراجع
          </button>
        )}
      </div>
    </article>
  );
}

export function ReviewImages() {
  const { decisions, decide, status } = useDecisions();
  const [filter, setFilter] = useState<"todo" | "approve" | "reject" | "all">("todo");
  const [cat, setCat] = useState<string>("");
  const cats = useMemo(() => [...new Set(pendingImages.map((q) => q.category_name))], []);
  const counts = {
    todo: pendingImages.filter((q) => !decisions[q.id]).length,
    approve: pendingImages.filter((q) => decisions[q.id]?.decision === "approve").length,
    reject: pendingImages.filter((q) => decisions[q.id]?.decision === "reject").length,
    all: pendingImages.length,
  };
  const items = pendingImages.filter(
    (q) =>
      (!cat || q.category_name === cat) &&
      (filter === "all" || (filter === "todo" ? !decisions[q.id] : decisions[q.id]?.decision === filter)),
  );
  const tabs: [typeof filter, string][] = [["todo", "ينتظر"], ["approve", "معتمد"], ["reject", "مرفوض"], ["all", "الكل"]];

  return (
    <>
      <header className="page-head">
        <p className="eyebrow">لصاحب اللعبة</p>
        <h1>مراجعة أسئلة الصور</h1>
        <p className="lead">شوف صورة السؤال وصورة الجواب، واعتمد أو ارفض. المعتمد يدخل اللعب بعد ما يطبّقه Claude على بنك الأسئلة.</p>
        <p className="rv-status" role="status">
          {status === "online" ? "قراراتك تنحفظ تلقائياً." : status === "loading" ? "يجهّز الحفظ…" : "الحفظ في هذا الجهاز بس (افتح الصفحة داخل Claude عشان توصلني القرارات)."}
        </p>
      </header>

      <div className="qt-cats" role="tablist" aria-label="الحالة">
        {tabs.map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={filter === k} className={`qt-cat${filter === k ? " active" : ""}`} onClick={() => setFilter(k)}>
            {label} <span>{formatNumber(counts[k])}</span>
          </button>
        ))}
      </div>
      <div className="qt-cats" aria-label="الفئة">
        <button type="button" className={`qt-cat${!cat ? " active" : ""}`} onClick={() => setCat("")}>كل الفئات</button>
        {cats.map((c) => (
          <button key={c} type="button" className={`qt-cat${cat === c ? " active" : ""}`} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="rv-list">
        {items.map((q) => (
          <ReviewCard key={q.id} item={q} decision={decisions[q.id]} onDecide={(d) => decide(q.id, d)} />
        ))}
        {!items.length && <p className="qt-note">ما فيه أسئلة هنا.</p>}
      </div>
    </>
  );
}
