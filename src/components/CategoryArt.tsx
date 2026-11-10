import { hash } from "../lib/hash";
import { CategoryIllustration, ILLUSTRATIONS } from "./CategoryIllustrations";

const TONES = ["henna", "sea", "saffron", "palm", "rose", "indigo"] as const;

export function toneFor(slug: string) {
  return TONES[hash(slug) % TONES.length];
}

/** أول حرف من اسم المجال، بدون "ال" */
export function initialOf(name: string) {
  const trimmed = name.trim().replace(/^ال(?=\S{2,})/, "");
  return trimmed.charAt(0).replace(/[أإآ]/, "ا");
}

/** غلاف المجال: حرف كبير فوق نقش النجمة الثمانية */
export function CategoryArt({ name, slug }: { name: string; slug: string }) {
  const id = `star-${slug}`;
  if (ILLUSTRATIONS[slug]) {
    return (
      <div className="cat-art illustrated" aria-hidden="true">
        <CategoryIllustration slug={slug} />
      </div>
    );
  }
  return (
    <div className={`cat-art tone-${toneFor(slug)}`} aria-hidden="true">
      <svg className="cat-pattern" width="100%" height="100%">
        <defs>
          <pattern id={id} width="44" height="44" patternUnits="userSpaceOnUse">
            <path d="M22 6 26.6 15.4 37 17 29.5 24.3 31.3 34.6 22 29.7 12.7 34.6 14.5 24.3 7 17 17.4 15.4Z" />
            <rect x="19" y="19" width="6" height="6" transform="rotate(45 22 22)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
      <span className="cat-initial">{initialOf(name)}</span>
    </div>
  );
}
