import { useSearchParams } from "react-router-dom";
import { QuestionFeed } from "../components/QuestionFeed";
import { SearchField } from "../components/SearchField";
import { EmptyState } from "../components/States";

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  return (
    <>
      <header className="page-head">
        <p className="eyebrow">بحث</p>
        <h1>{q ? <>نتائج «{q}»</> : "ابحث في الأسئلة"}</h1>
      </header>
      <div className="filters">
        <SearchField value={q} onChange={(v) => setParams(v ? { q: v } : {}, { replace: true })} autoFocus />
      </div>
      {q.trim() ? (
        <QuestionFeed search={q} showCategory emptyText="ما لقينا شي. جرّب كلمة ثانية." />
      ) : (
        <EmptyState text="اكتب كلمة من السؤال أو الجواب." />
      )}
    </>
  );
}
