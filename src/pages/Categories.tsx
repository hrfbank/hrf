import { useCatalog } from "../hooks/useCatalog";
import { CategoryCard } from "../components/CategoryCard";
import { EmptyState, ErrorState } from "../components/States";

export function Categories() {
  const { categories, loading, error } = useCatalog();
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
        <div className="cat-grid">
          {categories.map((c, i) => <CategoryCard key={c.id} category={c} index={i} />)}
        </div>
      ) : (
        <EmptyState text="ما فيه مجالات بعد." />
      )}
    </>
  );
}
