import { Link } from "react-router-dom";
import { lettersFor, useCatalog } from "../hooks/useCatalog";
import { LetterGrid } from "../components/LetterGrid";
import { CategoryCard } from "../components/CategoryCard";
import { DailyQuestion } from "../components/DailyQuestion";
import { ErrorState } from "../components/States";
import { formatNumber } from "../lib/format";

const HERO_LETTERS = ["ح", "ر", "و", "ف"];

export function Home() {
  const { categories, letterCounts, loading, error } = useCatalog();
  const total = categories.reduce((sum, c) => sum + c.question_count, 0);
  const counts = lettersFor(letterCounts);
  const lettersUsed = Object.values(counts).filter(Boolean).length;

  return (
    <>
      <section className="hero">
        <div className="hero-text">
          <p className="eyebrow">بنك أسئلة ثقافية مدققة</p>
          <h1>
            لكل حرف <em>سؤال</em>،
            <br />
            ولكل سؤال جواب يبدأ به.
          </h1>
          <p className="lead">تصفّح الأسئلة حسب المجال أو الحرف، واكشف الجواب متى ما كنت جاهز.</p>
          <div className="hero-actions">
            <Link to="/categories" className="btn primary">تصفّح المجالات</Link>
            <Link to="/letters" className="btn ghost">اختر حرفاً</Link>
          </div>
        </div>
        <div className="hero-tiles" aria-hidden="true">
          {HERO_LETTERS.map((l, i) => (
            <span key={l} className={`hero-tile t${i}`}>{l}</span>
          ))}
        </div>
      </section>

      {error ? (
        <ErrorState error={error} />
      ) : (
        <dl className="stats">
          <div><dt>سؤال مدقق</dt><dd>{loading ? "…" : formatNumber(total)}</dd></div>
          <div><dt>فئة فيها أسئلة</dt><dd>{loading ? "…" : formatNumber(categories.filter((c) => c.question_count > 0).length)}</dd></div>
          <div><dt>حرف مغطّى من ٢٨</dt><dd>{loading ? "…" : formatNumber(lettersUsed)}</dd></div>
        </dl>
      )}

      <DailyQuestion />

      <section className="section">
        <div className="section-head">
          <h2>المجالات</h2>
          <Link to="/categories" className="link">عرض الكل</Link>
        </div>
        <div className="cat-grid">
          {categories.filter((c) => c.question_count > 0).sort((a, b) => b.question_count - a.question_count).slice(0, 6).map((c, i) => <CategoryCard key={c.id} category={c} index={i} />)}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>تصفّح بالحرف</h2>
        </div>
        <LetterGrid counts={counts} hrefFor={(l) => `/letter/${l}`} />
      </section>
    </>
  );
}
