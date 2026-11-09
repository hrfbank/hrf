import { useCatalog } from "../hooks/useCatalog";
import { CategoryCard } from "../components/CategoryCard";
import { EmptyState, ErrorState } from "../components/States";

export function Categories() {
  const { categories, loading, error } = useCatalog();
  const ready = categories.filter((c) => c.question_count > 0);
  const upcoming = categories.filter((c) => c.question_count === 0);
  return (
    <>
      <header className="page-head">
        <p className="eyebrow">المجالات</p>
        <h1>اختر مجالاً</h1>
      </header>
      {error ? (
        <ErrorState error={error} />
      ) : loading ? (
        <div className="cat-grid">{Array.from({ length: 6 }, (_, i) => <div key={i} className="skeleton cat-skel" />)}</div>
      ) : categories.length ? (
        <>
          <div className="cat-grid">
            {ready.map((c, i) => <CategoryCard key={c.id} category={c} index={i} />)}
          </div>
          {upcoming.length > 0 && (
            <section className="section">
              <div className="section-head">
                <h2>قيد الإعداد</h2>
              </div>
              <ul className="upcoming">
                {upcoming.map((c) => <li key={c.id}>{c.name}</li>)}
              </ul>
            </section>
          )}
        </>
      ) : (
        <EmptyState text="ما فيه مجالات بعد." />
      )}
    </>
  );
}
