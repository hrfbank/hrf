import type { Crop, QuestionImage as Img } from "../lib/types";
import { GAME_CONFIG } from "../game/config";

const FULL: Crop = { x: 0, y: 0, w: 1, h: 1 };

/** يقرّب القصّة من الصورة الكاملة بنسبة t (٠ = القصّة، ١ = كاملة) */
function lerp(a: Crop, b: Crop, t: number): Crop {
  const m = (p: number, q: number) => p + (q - p) * t;
  return { x: m(a.x, b.x), y: m(a.y, b.y), w: m(a.w, b.w), h: m(a.h, b.h) };
}

type Props = { image: Img; /** كم تلميح انكشف */ step: number; steps: number; revealed: boolean };

/**
 * صورة السؤال. قبل الجواب تنعرض مخفية حسب mode:
 * crop = جزء يتوسع مع التلميحات، grayscale = بدون ألوان،
 * shape / mask / silhouette = نسخة معدّلة جاهزة (question_file).
 * مع الجواب: الصورة الأصلية كاملة (file).
 */
export function QuestionImage({ image, step, steps, revealed }: Props) {
  const { crop } = image;
  const mode = image.mode ?? (crop ? "crop" : undefined);
  const caption = (
    <figcaption>
      {image.license === "own" ? "صورة خاصة" : `المصدر: ${image.credit} · ${image.license}`}
      {image.source && (
        <>
          {" · "}
          <a href={image.source} target="_blank" rel="noopener noreferrer">الرابط</a>
        </>
      )}
    </figcaption>
  );

  if (revealed || !mode) {
    return (
      <figure className={`q-image${mode ? " revealed" : ""}`}>
        <img src={image.file} alt={revealed ? image.alt ?? "صورة الجواب" : "صورة السؤال"} loading="lazy" />
        {caption}
      </figure>
    );
  }

  if (mode === "crop" && crop) {
    const progressive = GAME_CONFIG.features.imageReveal.progressive;
    const t = progressive && steps > 0 ? Math.min(step / (steps + 1), 1) : 0;
    const c = lerp(crop, FULL, t);
    const pos = (v: number, size: number) => (size >= 1 ? 0 : (v / (1 - size)) * 100);
    return (
      <figure className="q-image cropped">
        <div
          className="q-crop"
          role="img"
          aria-label="جزء من صورة"
          style={{
            ...(image.aspect ? { aspectRatio: String(image.aspect) } : {}),
            backgroundImage: `url("${image.file}")`,
            backgroundSize: `${100 / c.w}% auto`,
            backgroundPosition: `${pos(c.x, c.w)}% ${pos(c.y, c.h)}%`,
          }}
        />
        {caption}
      </figure>
    );
  }

  const src = image.question_file ?? image.file;
  return (
    <figure className={`q-image mode-${mode}`}>
      <img src={src} alt="صورة السؤال" loading="lazy" />
      {caption}
    </figure>
  );
}
