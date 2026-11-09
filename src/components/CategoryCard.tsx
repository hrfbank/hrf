import { Link } from "react-router-dom";
import type { Category } from "../lib/types";
import { questionsLabel } from "../lib/format";
import { CategoryArt } from "./CategoryArt";

export function CategoryCard({ category, index = 0 }: { category: Category; index?: number }) {
  return (
    <Link to={`/c/${category.slug}`} className="cat-card" style={{ animationDelay: `${index * 50}ms` }}>
      <CategoryArt name={category.name} slug={category.slug} />
      <div className="cat-body">
        <h3>{category.name}</h3>
        {category.description && <p>{category.description}</p>}
        <span className="cat-count">{questionsLabel(category.question_count)}</span>
      </div>
    </Link>
  );
}
