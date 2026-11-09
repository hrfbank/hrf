import { useState } from "react";
import { api } from "../lib/api";
import { useAsync } from "../hooks/useAsync";

const today = () => new Date().toISOString().slice(0, 10);

export function DailyQuestion() {
  const day = today();
  const { data: q, loading } = useAsync(() => api.dailyQuestion(day), [day]);
  const [open, setOpen] = useState(false);

  if (loading) return <div className="daily skeleton-daily" aria-busy="true" />;
  if (!q) return null;

  return (
    <section className={`daily${open ? " open" : ""}`} aria-labelledby="daily-title">
      <div className="daily-letter" aria-hidden="true">{q.letter}</div>
      <div className="daily-body">
        <h2 id="daily-title">سؤال اليوم</h2>
        <p className="daily-q">{q.question}</p>
        <button type="button" className="daily-btn" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? "إخفاء الجواب" : "اكشف الجواب"}
        </button>
        <p className="daily-a" hidden={!open}>
          {q.answer}
        </p>
      </div>
    </section>
  );
}
