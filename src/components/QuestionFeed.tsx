import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Question, QuestionQuery } from "../lib/types";
import { useCatalog } from "../hooks/useCatalog";
import { QuestionCard } from "./QuestionCard";
import { ErrorState, EmptyState, SkeletonList } from "./States";
import { questionsLabel } from "../lib/format";

type Props = Omit<QuestionQuery, "page"> & { showCategory?: boolean; emptyText?: string };

/** تغيير الفلاتر يعيد بناء القائمة من الصفر */
export function QuestionFeed(props: Props) {
  return <Feed key={`${props.categoryId ?? ""}|${props.letter ?? ""}|${props.search ?? ""}`} {...props} />;
}

function Feed({ categoryId, letter, search, showCategory, emptyText }: Props) {
  const { categories } = useCatalog();
  const [items, setItems] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    api
      .questions({ categoryId, letter, search, page })
      .then((res) => {
        if (!alive) return;
        setItems((prev) => (page === 0 ? res.items : [...prev, ...res.items]));
        setTotal(res.total);
      })
      .catch((e: Error) => alive && setError(e))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [categoryId, letter, search, page]);

  if (error) return <ErrorState error={error} />;
  if (loading && items.length === 0) return <SkeletonList />;
  if (!items.length) return <EmptyState text={emptyText ?? "ما فيه أسئلة مطابقة."} />;

  const byId = new Map(categories.map((c) => [c.id, c]));
  return (
    <section className="feed" aria-live="polite">
      <p className="feed-count">{questionsLabel(total)}</p>
      {items.map((q, i) => (
        <QuestionCard key={q.id} question={q} number={i + 1} category={showCategory ? byId.get(q.category_id) : undefined} />
      ))}
      {items.length < total && (
        <button className="more" disabled={loading} onClick={() => setPage((p) => p + 1)}>
          {loading ? "جارٍ التحميل…" : "عرض المزيد"}
        </button>
      )}
    </section>
  );
}
