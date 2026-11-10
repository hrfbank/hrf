// رسومات الفئات: أسلوب موحّد (خط كحلي، تعبئة تيفاني وأصفر وأبيض) على خلفية فاتحة.
// كل رسمة 200×160. أضف رسمة جديدة بنفس الأسلوب، واربطها بالـ slug في ILLUSTRATIONS.
import type { ReactElement } from "react";

const L = "#0a1a26"; // خط
const T = "#0abab5"; // تيفاني
const Y = "#e4ff1a"; // أصفر
const W = "#ffffff";
const S = { stroke: L, strokeWidth: 5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** الكويت: أبراج الكويت الثلاثة على البحر */
const Kuwait = (
  <>
    <path d="M0 132 Q25 124 50 132 T100 132 T150 132 T200 132 V160 H0Z" fill={T} {...S} />
    <path d="M100 18 V128" {...S} />
    <path d="M72 50 V128 M140 78 V128" {...S} />
    <circle cx="100" cy="58" r="22" fill={Y} {...S} />
    <circle cx="100" cy="84" r="12" fill={T} {...S} />
    <circle cx="72" cy="66" r="15" fill={T} {...S} />
    <path d="M136 78 L144 78 L140 64Z" fill={W} {...S} />
    <path d="M58 128 H156" {...S} />
  </>
);

/** القرآن: مصحف مفتوح على رحل */
const Quran = (
  <>
    <path d="M50 140 L100 104 L150 140" fill="none" {...S} />
    <path d="M58 142 L100 112 M142 142 L100 112" {...S} />
    <path d="M100 52 Q70 36 34 44 V112 Q70 104 100 120 Z" fill={W} {...S} />
    <path d="M100 52 Q130 36 166 44 V112 Q130 104 100 120 Z" fill={W} {...S} />
    <path d="M100 52 V120" {...S} />
    <path d="M48 62 Q70 56 88 64 M48 76 Q70 70 88 78 M48 90 Q70 84 88 92" stroke={T} strokeWidth="5" strokeLinecap="round" fill="none" />
    <path d="M112 64 Q130 56 152 62 M112 78 Q130 70 152 76 M112 92 Q130 84 152 90" stroke={T} strokeWidth="5" strokeLinecap="round" fill="none" />
    <path d="M100 18 l6 12 l13 2 l-10 9 l3 13 l-12 -7 l-12 7 l3 -13 l-10 -9 l13 -2z" fill={Y} {...S} />
  </>
);

/** قصص الأنبياء: سفينة على الموج وحمامة */
const Prophets = (
  <>
    <path d="M0 130 Q25 120 50 130 T100 130 T150 130 T200 130 V160 H0Z" fill={T} {...S} />
    <path d="M40 104 H160 L146 132 H54 Z" fill={Y} {...S} />
    <path d="M62 104 V80 H138 V104" fill={W} {...S} />
    <path d="M56 80 L100 60 L144 80" fill={T} {...S} />
    <rect x="90" y="86" width="20" height="18" rx="3" fill={T} {...S} />
    <path d="M146 30 q12 -10 22 0 q-6 2 -8 8 q-10 4 -16 -2 l-10 4 l6 -8z" fill={W} {...S} />
    <path d="M168 34 q8 2 10 8" fill="none" stroke="#23885c" strokeWidth="5" strokeLinecap="round" />
  </>
);

/** عملات: كومة نقود وعملة كبيرة */
const Currencies = (
  <>
    <ellipse cx="70" cy="132" rx="40" ry="12" fill={Y} {...S} />
    <path d="M30 120 V132 M110 120 V132" {...S} />
    <ellipse cx="70" cy="120" rx="40" ry="12" fill={Y} {...S} />
    <path d="M30 108 V120 M110 108 V120" {...S} />
    <ellipse cx="70" cy="108" rx="40" ry="12" fill={Y} {...S} />
    <circle cx="138" cy="76" r="44" fill={T} {...S} />
    <circle cx="138" cy="76" r="32" fill="none" stroke={W} strokeWidth="5" />
    <path d="M124 70 q14 -16 28 0 q-14 16 -28 0z M138 58 V94" fill="none" stroke={W} strokeWidth="6" strokeLinecap="round" />
  </>
);

export const ILLUSTRATIONS: Record<string, ReactElement> = {
  kuwait: Kuwait,
  quran: Quran,
  prophets: Prophets,
  currencies: Currencies,
};

export function CategoryIllustration({ slug }: { slug: string }) {
  const art = ILLUSTRATIONS[slug];
  if (!art) return null;
  return (
    <svg className="cat-illus" viewBox="0 0 200 160" aria-hidden="true">
      {art}
    </svg>
  );
}
