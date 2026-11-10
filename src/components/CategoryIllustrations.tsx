// رسومات الفئات بأسلوب موحّد: رسم كرتوني مسطح بحدود كحلية سميكة، عنصر بطل واحد
// في المنتصف، وظل بسيط بدرجة أغمق، على خلفية تيفاني فاتحة.
// كل رسمة 300×240. أضف فئة: دالة مشهد بنفس الأسلوب، واربطها بالـ slug في SCENES.
import type { ReactElement } from "react";

const O = "#14202b"; // حدود
const TIF = "#0abab5";
const TIF_D = "#078e8a";
const NEON = "#e4ff1a";
const NEON_D = "#b9d10e";
const WHITE = "#ffffff";
const CREAM = "#fff6e0";
const GOLD = "#f5c242";
const GOLD_D = "#d39a1c";
const WOOD = "#b8743a";
const WOOD_D = "#8a5226";

const line = (w = 6) => ({ stroke: O, strokeWidth: w, strokeLinejoin: "round" as const, strokeLinecap: "round" as const });

/** خلفية البطاقة: تيفاني فاتح مع موجة أفتح */
const Backdrop = (
  <>
    <rect width="300" height="240" fill="#cdeeed" />
    <path d="M0 160 Q90 120 170 150 T300 120 V240 H0Z" fill="#e2f6f5" />
    <circle cx="250" cy="44" r="60" fill="#e2f6f5" />
  </>
);

// ---------------- الكويت: أبراج الكويت ----------------
const Kuwait = (
  <>
    <path d="M30 214 Q150 196 270 214 V240 H30Z" fill={TIF} {...line(5)} />
    <path d="M60 222 q10 -6 20 0 M200 224 q10 -6 20 0" fill="none" {...line(4)} />
    {/* البرج الثالث */}
    <path d="M210 210 V92" fill="none" {...line(7)} />
    <path d="M203 104 L210 70 L217 104Z" fill={WHITE} {...line(4)} />
    {/* البرج الثاني */}
    <path d="M178 210 V66" fill="none" {...line(7)} />
    <circle cx="178" cy="118" r="22" fill="#2f86d6" {...line(5)} />
    <path d="M160 112 Q178 104 196 112" fill="none" stroke={WHITE} strokeWidth="4" strokeLinecap="round" />
    {/* البرج الرئيسي */}
    <path d="M120 210 V16" fill="none" {...line(8)} />
    <circle cx="120" cy="84" r="36" fill="#2f86d6" {...line(6)} />
    <path d="M90 76 Q120 64 150 76" fill="none" stroke={WHITE} strokeWidth="5" strokeLinecap="round" />
    <circle cx="120" cy="84" r="36" fill="none" stroke="#1d5f9e" strokeWidth="0" />
    <path d="M86 96 Q120 106 154 96" fill="none" stroke="#1d5f9e" strokeWidth="5" strokeLinecap="round" />
    <circle cx="120" cy="146" r="18" fill="#2f86d6" {...line(5)} />
    <circle cx="110" cy="76" r="6" fill={WHITE} opacity="0.8" />
    <path d="M96 210 H236" fill="none" {...line(6)} />
  </>
);

// ---------------- القرآن: مصحف مفتوح على رحل ----------------
const Quran = (
  <>
    {/* الرحل */}
    <path d="M104 220 L196 140 M196 220 L104 140" fill="none" stroke={WOOD_D} strokeWidth="18" strokeLinecap="round" />
    <path d="M104 220 L196 140 M196 220 L104 140" fill="none" {...line(4)} strokeWidth={0} />
    <path d="M96 222 L104 214 L114 222 M186 222 L196 214 L204 222" fill="none" {...line(5)} />
    <path d="M99 214 L201 146 M201 214 L99 146" fill="none" stroke={WOOD} strokeWidth="12" strokeLinecap="round" />
    {/* الغلاف */}
    <path d="M150 84 Q110 62 52 70 V170 Q110 160 150 182 Q190 160 248 170 V70 Q190 62 150 84Z" fill="#1f7a55" {...line(6)} />
    {/* الصفحات */}
    <path d="M150 84 Q112 66 62 74 V162 Q112 154 150 172Z" fill={CREAM} {...line(5)} />
    <path d="M150 84 Q188 66 238 74 V162 Q188 154 150 172Z" fill={CREAM} {...line(5)} />
    <path d="M150 84 V172" fill="none" {...line(5)} />
    {/* زخرفة الصفحتين */}
    <rect x="80" y="92" width="52" height="58" rx="6" fill="none" stroke={GOLD_D} strokeWidth="4" />
    <rect x="168" y="92" width="52" height="58" rx="6" fill="none" stroke={GOLD_D} strokeWidth="4" />
    <path d="M90 108 h32 M90 120 h32 M90 132 h32 M178 108 h32 M178 120 h32 M178 132 h32" stroke={TIF_D} strokeWidth="4" strokeLinecap="round" />
    {/* نجمة */}
    <path d="M150 18 l7 14 15 2 -11 10 3 15 -14 -8 -14 8 3 -15 -11 -10 15 -2z" fill={NEON} {...line(4)} />
  </>
);

// ---------------- قصص الأنبياء: السفينة والحمامة ----------------
const Prophets = (
  <>
    <path d="M10 218 Q80 196 150 214 T290 210 V240 H10Z" fill={TIF} {...line(5)} />
    {/* البيت */}
    <path d="M98 128 V96 H202 V128" fill={WOOD} {...line(6)} />
    <path d="M88 98 L150 64 L212 98Z" fill={WOOD_D} {...line(6)} />
    <rect x="138" y="104" width="24" height="22" rx="3" fill={NEON} {...line(5)} />
    {/* الهيكل */}
    <path d="M44 128 H256 Q246 184 200 194 H100 Q54 184 44 128Z" fill={WOOD} {...line(7)} />
    <path d="M56 150 H244 M70 172 H230" fill="none" stroke={WOOD_D} strokeWidth="5" strokeLinecap="round" />
    {/* الحمامة */}
    <path d="M30 56 q20 -20 44 -4 q-8 2 -12 12 q-18 10 -30 0 l-16 6 l8 -12z" fill={WHITE} {...line(5)} />
    <circle cx="64" cy="52" r="2.5" fill={O} />
    <path d="M74 54 q14 2 20 14" fill="none" stroke="#2f8a3f" strokeWidth="5" strokeLinecap="round" />
    <path d="M82 56 q6 -9 12 -5 q-3 8 -12 5z" fill="#57b05e" {...line(3)} />
  </>
);

// ---------------- كرة قدم عالمية: المرمى والكرة ----------------
const Football = (
  <>
    <path d="M0 196 H300 V240 H0Z" fill="#45b05e" {...line(0)} />
    <path d="M0 196 H300" fill="none" {...line(5)} />
    <path d="M40 214 H260" fill="none" stroke={WHITE} strokeWidth="5" strokeLinecap="round" />
    {/* المرمى */}
    <path d="M44 196 V54 H256 V196" fill="none" {...line(10)} />
    <path d="M44 196 V54 H256 V196" fill="none" stroke={WHITE} strokeWidth="5" />
    <path d="M74 56 V194 M104 56 V194 M134 56 V194 M164 56 V194 M194 56 V194 M224 56 V194 M46 84 H254 M46 114 H254 M46 144 H254 M46 172 H254" stroke="#9fb4c4" strokeWidth="2.5" />
    {/* الكرة */}
    <circle cx="150" cy="150" r="44" fill={WHITE} {...line(7)} />
    <path d="M150 128 l20 14 -8 24 h-24 l-8 -24z" fill={O} />
    <path d="M150 128 V106 M170 142 l20 -8 M162 166 l12 18 M138 166 l-12 18 M130 142 l-20 -8" fill="none" {...line(5)} />
    <circle cx="136" cy="128" r="6" fill="#e9f2f7" />
    {/* حركة */}
    <path d="M206 128 h40 M212 148 h56 M206 168 h36" fill="none" stroke={NEON_D} strokeWidth="7" strokeLinecap="round" />
  </>
);

// ---------------- أمثال وألغاز: صندوق كنز مفتوح ----------------
const PIECE = "m0 0 h16 q0 -10 8 -10 q8 0 8 10 h16 v16 q-10 0 -10 8 q0 8 10 8 v16 h-16 q0 -10 -8 -10 q-8 0 -8 10 h-16z";
const Riddles = (
  <>
    {/* ضوء */}
    <path d="M110 120 L70 20 H230 L190 120Z" fill="#fffbd0" opacity="0.9" />
    {/* الغطاء */}
    <path d="M92 118 L104 52 H196 L208 118Z" fill={WOOD} {...line(6)} />
    <path d="M104 52 Q150 30 196 52" fill={WOOD_D} {...line(6)} />
    <path d="M98 86 H202" fill="none" stroke={GOLD} strokeWidth="8" />
    <path d="M98 86 H202" fill="none" {...line(3)} />
    {/* الجسم */}
    <path d="M78 130 H222 V216 H78Z" fill={WOOD} {...line(7)} />
    <path d="M78 130 H222 L210 118 H90Z" fill="#fff3a6" {...line(5)} />
    <path d="M78 164 H222" fill="none" stroke={GOLD} strokeWidth="10" />
    <path d="M78 159 H222 M78 169 H222" fill="none" {...line(3)} />
    <rect x="138" y="150" width="24" height="30" rx="4" fill={GOLD} {...line(5)} />
    <circle cx="150" cy="163" r="4" fill={O} />
    {/* قطع أحجية */}
    <path transform="translate(118 30) rotate(-14)" d={PIECE} fill={TIF} {...line(5)} />
    <path transform="translate(170 8) rotate(18) scale(0.8)" d={PIECE} fill={NEON} {...line(5)} />
    {/* لمعة */}
    <path d="M60 60 v14 M53 67 h14 M244 92 v12 M238 98 h12" fill="none" stroke={GOLD_D} strokeWidth="5" strokeLinecap="round" />
  </>
);

// ---------------- عملات: كومة عملات وورقة نقدية ----------------
const coinStack = (x: number, base: number, n: number, r: number) =>
  Array.from({ length: n }, (_, i) => {
    const y = base - i * 14;
    return (
      <g key={i}>
        <path d={`M${x - r} ${y} v12 a${r} ${r * 0.36} 0 0 0 ${2 * r} 0 v-12`} fill={GOLD_D} {...line(5)} />
        <ellipse cx={x} cy={y} rx={r} ry={r * 0.36} fill={GOLD} {...line(5)} />
      </g>
    );
  });
const Currencies = (
  <>
    {/* ورقة نقدية */}
    <g transform="rotate(-10 190 110)">
      <rect x="120" y="70" width="150" height="80" rx="10" fill="#7fd1a0" {...line(6)} />
      <rect x="132" y="82" width="126" height="56" rx="6" fill="none" stroke="#3f9a63" strokeWidth="4" />
      <circle cx="195" cy="110" r="20" fill="#b9ecc9" {...line(4)} />
      <path d="M195 98 l10 6 v12 l-10 6 l-10 -6 v-12z" fill="#3f9a63" {...line(3)} />
    </g>
    {coinStack(110, 206, 6, 46)}
    <ellipse cx="110" cy="136" rx="30" ry="9" fill="none" stroke={GOLD_D} strokeWidth="4" />
    {/* عملة طائرة */}
    <ellipse cx="236" cy="190" rx="30" ry="30" fill={GOLD} {...line(6)} />
    <circle cx="236" cy="190" r="19" fill="none" stroke={GOLD_D} strokeWidth="5" />
    <path d="M228 176 l6 -10 M252 178 l8 -6" fill="none" stroke={WHITE} strokeWidth="5" strokeLinecap="round" />
  </>
);

const SCENES: Record<string, ReactElement> = {
  kuwait: Kuwait,
  quran: Quran,
  prophets: Prophets,
  "world-football": Football,
  "proverbs-riddles": Riddles,
  currencies: Currencies,
};

export const ILLUSTRATIONS: Record<string, true> = Object.fromEntries(Object.keys(SCENES).map((k) => [k, true]));

export function CategoryIllustration({ slug }: { slug: string }) {
  const scene = SCENES[slug];
  if (!scene) return null;
  return (
    <svg className="cat-illus" viewBox="0 0 300 240" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      {Backdrop}
      {scene}
    </svg>
  );
}
