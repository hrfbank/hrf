import { Link, useParams, useSearchParams } from "react-router-dom";
import { lettersFor, useCatalog } from "../hooks/useCatalog";
import { CategoryArt } from "../components/CategoryArt";
import { LetterGrid } from "../components/LetterGrid";
import { QuestionFeed } from "../components/QuestionFeed";
import { SearchField } from "../components/SearchField";
import { EmptyState, SkeletonList } from "../components/States";
import { isLetter } from "../lib/letters";
import { questionsLabel } from "../lib/format";

export function CategoryPage() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const { categories, letterCounts, loading } = useCatalog();
  const category = categories.find((c) => c.slug === slug);

  if (loading) return <SkeletonList />;
  if (!category) return <EmptyState text="المجال غير موجود." />;

  const letterParam = params.get("letter") ?? undefined;
  const letter = isLetter(letterParam) ? letterParam : undefined;
  const search = params.get("q") ?? "";

  function update(key: string, value: string | undefined) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }

  return (
    <>
      <nav className="crumbs" aria-label="مسار الصفحة">
        <Link to="/categories">المجالات</Link>
        <span aria-hidden="true">‹</span>
        <span>{category.name}</span>
      </nav>
      <header className="cat-hero">
        <CategoryArt name={category.name} slug={category.slug} />
        <div>
          <h1>{category.name}</h1>
          {category.description && <p className="lead">{category.description}</p>}
          <span className="cat-count">{questionsLabel(category.question_count)}</span>
        </div>
      </header>

      <div className="filters">
        <SearchField value={search} onChange={(v) => update("q", v)} placeholder={`ابحث في ${category.name}`} />
        <LetterGrid
          size="sm"
          counts={lettersFor(letterCounts, category.id)}
          active={letter}
          onSelect={(l) => update("letter", l)}
        />
        {letter && (
          <button className="clear" onClick={() => update("letter", undefined)}>
            إلغاء فلتر الحرف «{letter}»
          </button>
        )}
      </div>

      <QuestionFeed categoryId={category.id} letter={letter} search={search} />
    </>
  );
}
