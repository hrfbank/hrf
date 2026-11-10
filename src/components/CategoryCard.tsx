import { Link } from "react-router-dom";
import type { Category } from "../lib/types";
import { questionsLabel, formatNumber } from "../lib/format";
import { CategoryArt } from "./CategoryArt";
import { ILLUSTRATIONS } from "./CategoryIllustrations";

export function CategoryCard({ category, index = 0 }: { category: Category; index?: number }) {
  const style = { animationDelay: `${index * 50}ms` };

  // بطاقة مرسومة: الرسمة + اسم الفئة على شريط، وعدد الأسئلة شارة في الزاوية
  if (ILLUSTRATIONS[category.slug]) {
    return (
      <Link to={`/c/${category.slug}`} className="cat-card poster" style={style} title={category.description ?? undefined}>
        <span className="poster-count" aria-label={questionsLabel(category.question_count)}>
          {formatNumber(category.question_count)} سؤال
        </span>
        <CategoryArt name={category.name} slug={category.slug} />
        <h3 className="poster-name">{category.name}</h3>
      </Link>
    );
  }

  return (
    <Link to={`/c/${category.slug}`} className="cat-card" style={style}>
      <CategoryArt name={category.name} slug={category.slug} />
      <div className="cat-body">
        <h3>{category.name}</h3>
        {category.description && <p>{category.description}</p>}
        <span className="cat-count">{questionsLabel(category.question_count)}</span>
      </div>
    </Link>
  );
}
