// رسومات الفئات بأسلوب رسم يدوي: حبر مهتز + تلوين مائي + ملمس ورق.
// كل رسمة 400×300. الفلاتر تعطي الخط اهتزاز القلم، والتعبئة بقع الألوان المائية.
// أضف فئة جديدة بدالة مشهد بنفس الأسلوب، واربطها بالـ slug في SCENES.
import type { ReactElement } from "react";
import { MORE_SCENES } from "./CategoryScenes";

const INK = "#1b2430";
const TIF = "#0abab5";
const NEON = "#e4ff1a";

type Ids = { ink: string; wash: string; paper: string; glow: string };

/** خط حبر: لون غامق وسماكة تتغير قليلاً */
const ink = (w = 3.2) => ({ stroke: INK, strokeWidth: w, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" });

function Defs({ id }: { id: Ids }) {
  return (
    <defs>
      {/* اهتزاز خط القلم */}
      <filter id={id.ink} x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" />
      </filter>
      {/* بقع الألوان المائية: حواف متموجة وتفاوت في الكثافة */}
      <filter id={id.wash} x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="3" seed="7" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="9" result="d" />
        <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="11" result="g" />
        <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.1 1.25" result="mask" />
        <feComposite in="d" in2="mask" operator="in" />
      </filter>
      {/* ملمس الورق */}
      <filter id={id.paper}>
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed="2" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0 0.3  0 0 0 0.16 0" />
      </filter>
      <filter id={id.glow} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="10" />
      </filter>
    </defs>
  );
}

/** طبقات: ألوان مائية تحت، حبر فوق، وملمس ورق فوق الكل */
function Layers({ id, wash, lines, extra }: { id: Ids; wash: ReactElement; lines: ReactElement; extra?: ReactElement }) {
  return (
    <>
      <g filter={`url(#${id.wash})`}>{wash}</g>
      {extra}
      <g filter={`url(#${id.ink})`}>{lines}</g>
      <rect width="400" height="300" filter={`url(#${id.paper})`} />
    </>
  );
}

// ---------------- الكويت: غروب، أبراج الكويت، سفينة بوم ----------------
function Kuwait(id: Ids) {
  return (
    <>
      <linearGradient id={`${id.ink}-sky`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ff9f5a" />
        <stop offset="0.55" stopColor="#ffd59a" />
        <stop offset="1" stopColor="#a8e6e2" />
      </linearGradient>
      <Layers
        id={id}
        wash={
          <>
            <rect width="400" height="300" fill={`url(#${id.ink}-sky)`} />
            <circle cx="300" cy="120" r="46" fill="#ffe27a" />
            <path d="M0 205 Q100 198 200 205 T400 205 V300 H0Z" fill={TIF} />
            <path d="M0 240 Q100 232 200 240 T400 240 V300 H0Z" fill="#078f8b" />
            {/* انعكاس الشمس */}
            <path d="M270 210 h60 M282 222 h36 M292 234 h16" stroke="#ffe27a" strokeWidth="6" strokeLinecap="round" />
            {/* الأبراج */}
            <circle cx="180" cy="88" r="27" fill="#2e7fc2" />
            <circle cx="180" cy="128" r="14" fill="#2e7fc2" />
            <circle cx="232" cy="122" r="19" fill="#2e7fc2" />
            {/* البوم */}
            <path d="M40 232 Q90 252 150 232 L140 250 Q90 262 50 250Z" fill="#a8693a" />
            <path d="M92 228 L96 150 L140 222Z" fill="#fff6e3" />
            <path d="M82 226 L86 176 L58 224Z" fill="#fff6e3" />
          </>
        }
        lines={
          <>
            {/* البرج الرئيسي */}
            <path d="M180 22 V205" {...ink(3.6)} />
            <circle cx="180" cy="88" r="27" {...ink()} />
            <path d="M156 80 Q180 72 204 80 M155 94 Q180 102 205 94" {...ink(2)} />
            <circle cx="180" cy="128" r="14" {...ink()} />
            {/* البرج الثاني */}
            <path d="M232 70 V205" {...ink(3.4)} />
            <circle cx="232" cy="122" r="19" {...ink()} />
            <path d="M216 118 Q232 112 248 118" {...ink(2)} />
            {/* البرج الثالث */}
            <path d="M268 112 V205 M262 140 L268 112 L274 140" {...ink(3)} />
            <path d="M150 205 H300" {...ink(3)} />
            {/* موج */}
            <path d="M20 268 q12 -6 24 0 t24 0 M300 258 q12 -6 24 0 t24 0 M180 282 q10 -5 20 0 t20 0" {...ink(2.2)} />
            {/* البوم */}
            <path d="M40 232 Q90 252 150 232 L140 250 Q90 262 50 250Z" {...ink()} />
            <path d="M96 150 V236 M92 228 L96 150 L140 222Z M82 226 L86 176 L58 224Z" {...ink(2.6)} />
            <path d="M60 244 h70" {...ink(1.6)} />
            {/* طيور */}
            <path d="M60 70 q8 -8 16 0 q8 -8 16 0 M110 50 q6 -6 12 0 q6 -6 12 0" {...ink(2.2)} />
          </>
        }
      />
    </>
  );
}

// ---------------- القرآن: مصحف على رحل داخل قوس مسجد ----------------
function Quran(id: Ids) {
  return (
    <>
      <radialGradient id={`${id.ink}-glow`} cx="0.5" cy="0.55" r="0.6">
        <stop offset="0" stopColor="#fff3b0" />
        <stop offset="1" stopColor="#0f5a4a" />
      </radialGradient>
      <Layers
        id={id}
        wash={
          <>
            <rect width="400" height="300" fill="#0f5a4a" />
            <path d="M60 300 V140 Q60 40 200 22 Q340 40 340 140 V300Z" fill={`url(#${id.ink}-glow)`} />
            <rect x="0" y="270" width="400" height="30" fill="#5a3418" />
            {/* الرحل */}
            <path d="M140 270 L210 200 M260 270 L190 200" stroke="#8a4f22" strokeWidth="16" strokeLinecap="round" />
            {/* الصفحات */}
            <path d="M200 132 Q160 112 112 122 V206 Q160 196 200 214Z" fill="#fffaf0" />
            <path d="M200 132 Q240 112 288 122 V206 Q240 196 200 214Z" fill="#fffaf0" />
            <path d="M112 122 Q160 112 200 132 Q240 112 288 122 L292 128 Q240 118 200 138 Q160 118 108 128Z" fill="#c9a227" />
            {/* فانوس */}
            <path d="M318 40 L332 62 L318 92 L304 62Z" fill={NEON} />
          </>
        }
        extra={<circle cx="200" cy="160" r="60" fill="#fff6c4" opacity="0.55" filter={`url(#${id.glow})`} />}
        lines={
          <>
            <path d="M60 300 V140 Q60 40 200 22 Q340 40 340 140 V300" {...ink(3.4)} />
            <path d="M80 300 V146 Q80 62 200 44 Q320 62 320 146 V300" {...ink(2)} />
            {/* نقش نجمي على القوس */}
            <path d="M200 30 l6 12 13 2 -10 9 3 13 -12 -7 -12 7 3 -13 -10 -9 13 -2z" {...ink(2)} />
            {/* المصحف */}
            <path d="M200 132 Q160 112 112 122 V206 Q160 196 200 214 Q240 196 288 206 V122 Q240 112 200 132Z M200 132 V214" {...ink()} />
            <path d="M124 140 Q158 132 188 146 M124 156 Q158 148 188 162 M124 172 Q158 164 188 178 M212 146 Q242 132 276 140 M212 162 Q242 148 276 156 M212 178 Q242 164 276 172" {...ink(1.6)} stroke={TIF} />
            {/* الرحل */}
            <path d="M140 270 L210 200 M260 270 L190 200" {...ink(3)} />
            {/* أشعة */}
            <path d="M200 100 V78 M160 108 L148 90 M240 108 L252 90 M130 128 L110 118 M270 128 L290 118" {...ink(2)} stroke="#c9a227" />
            {/* الفانوس */}
            <path d="M318 0 V40 M318 40 L332 62 L318 92 L304 62Z M304 62 H332" {...ink(2.4)} />
          </>
        }
      />
    </>
  );
}

// ---------------- قصص الأنبياء: سفينة على الجبل بعد الطوفان ----------------
function Prophets(id: Ids) {
  return (
    <>
      <linearGradient id={`${id.ink}-sky`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#7cc4f0" />
        <stop offset="1" stopColor="#e8f7f0" />
      </linearGradient>
      <Layers
        id={id}
        wash={
          <>
            <rect width="400" height="300" fill={`url(#${id.ink}-sky)`} />
            {/* قوس قزح */}
            {["#ff8a7a", "#ffc46b", NEON, "#7fd88a", TIF, "#8aa8ff"].map((c, i) => (
              <path key={c} d={`M${40 + i * 9} 200 A${170 - i * 9} ${150 - i * 9} 0 0 1 ${360 - i * 9} 200`} stroke={c} strokeWidth="9" fill="none" opacity="0.75" />
            ))}
            {/* الجبال */}
            <path d="M0 300 L0 230 L90 150 L170 220 L250 130 L400 240 V300Z" fill="#6aa86b" />
            <path d="M0 300 L0 260 L120 210 L260 250 L400 230 V300Z" fill="#3f7f53" />
            {/* السفينة */}
            <path d="M190 128 Q250 150 320 126 L304 158 Q250 172 204 158Z" fill="#9c5b2e" />
            <path d="M220 128 V104 H290 V128" fill="#c98a52" />
            <path d="M212 104 L255 86 L298 104Z" fill="#7a3f1d" />
            {/* غيوم */}
            <ellipse cx="80" cy="60" rx="46" ry="20" fill="#fff" />
            <ellipse cx="330" cy="46" rx="40" ry="16" fill="#fff" />
            {/* الحمامة */}
            <path d="M92 118 q24 -22 48 -4 q-10 4 -14 14 q-18 8 -30 -2 l-18 6 l10 -12z" fill="#fff" />
          </>
        }
        lines={
          <>
            <path d="M0 230 L90 150 L170 220 L250 130 L400 240" {...ink(3)} />
            <path d="M0 260 L120 210 L260 250 L400 230" {...ink(2.4)} />
            <path d="M190 128 Q250 150 320 126 L304 158 Q250 172 204 158Z" {...ink()} />
            <path d="M200 140 Q250 156 312 138" {...ink(1.6)} />
            <path d="M220 128 V104 H290 V128 M212 104 L255 86 L298 104Z" {...ink(2.6)} />
            <rect x="245" y="110" width="18" height="16" {...ink(2.2)} />
            <path d="M34 60 q10 -22 34 -18 q14 -16 34 -2 q22 0 22 18 q-4 12 -18 12 H44 q-14 0 -10 -10z" {...ink(2.2)} />
            <path d="M92 118 q24 -22 48 -4 q-10 4 -14 14 q-18 8 -30 -2 l-18 6 l10 -12z" {...ink(2.6)} />
            <circle cx="132" cy="112" r="1.6" fill={INK} />
            {/* غصن الزيتون */}
            <path d="M140 114 q14 2 22 12" {...ink(2.4)} stroke="#2f7a3f" />
            <path d="M150 116 q4 -8 10 -6 q-2 7 -10 6z M158 122 q6 -6 11 -2 q-4 6 -11 2z" fill="#4c9a52" stroke="#2f7a3f" strokeWidth="1.6" />
          </>
        }
      />
    </>
  );
}

// ---------------- كرة قدم عالمية: كرة تدخل المرمى في ملعب ليلي ----------------
function Football(id: Ids) {
  const confetti = [[60, 40, TIF], [110, 70, NEON], [300, 50, "#ff8a7a"], [350, 90, TIF], [250, 30, NEON], [150, 30, "#ff8a7a"], [40, 110, NEON], [370, 140, "#ff8a7a"]] as const;
  return (
    <>
      <linearGradient id={`${id.ink}-night`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#0b2240" />
        <stop offset="1" stopColor="#1d4d6e" />
      </linearGradient>
      <Layers
        id={id}
        wash={
          <>
            <rect width="400" height="300" fill={`url(#${id.ink}-night)`} />
            {/* المدرجات */}
            <path d="M0 150 Q200 110 400 150 V190 H0Z" fill="#2f5b7a" />
            {Array.from({ length: 26 }, (_, i) => (
              <circle key={i} cx={10 + i * 15} cy={150 - Math.sin((i / 25) * Math.PI) * 24 + (i % 3) * 6} r="4" fill={i % 4 ? "#7fb6d8" : NEON} opacity="0.8" />
            ))}
            {/* الملعب */}
            <path d="M-20 300 L60 190 H340 L420 300Z" fill="#3fa05a" />
            <path d="M20 245 H380 L400 272 H0Z" fill="#4bb366" />
            {/* الكرة */}
            <circle cx="236" cy="208" r="26" fill="#fff" />
          </>
        }
        extra={
          <>
            <circle cx="40" cy="40" r="34" fill="#fff8c0" opacity="0.7" filter={`url(#${id.glow})`} />
            <circle cx="360" cy="40" r="34" fill="#fff8c0" opacity="0.7" filter={`url(#${id.glow})`} />
          </>
        }
        lines={
          <>
            {/* أبراج الإضاءة */}
            <path d="M40 40 V150 M360 40 V150" {...ink(3)} stroke="#cfe" />
            <rect x="24" y="28" width="32" height="18" rx="3" {...ink(2.4)} stroke="#cfe" />
            <rect x="344" y="28" width="32" height="18" rx="3" {...ink(2.4)} stroke="#cfe" />
            {/* المرمى والشبكة */}
            <path d="M120 230 V160 H300 V230" {...ink(4)} stroke="#fff" />
            <path d="M140 160 V230 M160 160 V230 M180 160 V230 M200 160 V230 M220 160 V230 M240 160 V230 M260 160 V230 M280 160 V230 M120 176 H300 M120 192 H300 M120 208 H300" {...ink(1.2)} stroke="#cfe" />
            <path d="M-20 300 L60 190 H340 L420 300" {...ink(2.4)} stroke="#e9fff0" />
            {/* الكرة */}
            <circle cx="236" cy="208" r="26" {...ink(3)} />
            <path d="M236 196 l10 7 -4 12 h-12 l-4 -12z" fill={INK} />
            <path d="M236 196 V182 M246 203 l12 -4 M242 215 l8 10 M230 215 l-8 10 M226 203 l-12 -4" {...ink(2)} />
            {/* خطوط الحركة */}
            <path d="M300 236 h50 M296 222 h70 M304 208 h40" {...ink(3)} stroke={NEON} />
          </>
        }
      />
      {confetti.map(([x, y, c], i) => (
        <rect key={i} x={x} y={y} width="8" height="4" rx="1" fill={c} transform={`rotate(${i * 37} ${x} ${y})`} />
      ))}
    </>
  );
}

// ---------------- أمثال وألغاز: صندوق كنز يفتح وتطير منه قطع أحجية ----------------
function Riddles(id: Ids) {
  const piece = "m0 0 h14 q0 -8 6 -8 q6 0 6 8 h14 v14 q-8 0 -8 6 q0 6 8 6 v14 h-14 q0 -8 -6 -8 q-6 0 -6 8 h-14z";
  return (
    <>
      <Layers
        id={id}
        wash={
          <>
            <rect width="400" height="300" fill="#3b2366" />
            <circle cx="200" cy="150" r="140" fill="#5a3796" />
            {/* السجادة */}
            <path d="M30 300 L80 230 H320 L370 300Z" fill="#b2322d" />
            <path d="M70 290 L104 244 H296 L330 290Z" fill="#e0a43a" />
            {/* الصندوق */}
            <path d="M130 250 V200 H270 V250Z" fill="#8a5426" />
            <path d="M130 200 L150 150 H290 L270 200Z" fill="#fff1a8" />
            <path d="M150 150 H290 L300 86 H160Z" fill="#a8693a" />
            {/* القطع */}
            <path transform="translate(150 70) rotate(-18)" d={piece} fill={TIF} />
            <path transform="translate(236 50) rotate(14)" d={piece} fill={NEON} />
            <path transform="translate(300 110) rotate(-8) scale(0.8)" d={piece} fill="#ff8a7a" />
            {/* فانوس */}
            <ellipse cx="72" cy="200" rx="22" ry="30" fill="#ffd36b" />
          </>
        }
        extra={<ellipse cx="212" cy="150" rx="80" ry="50" fill="#fff4b0" opacity="0.75" filter={`url(#${id.glow})`} />}
        lines={
          <>
            <path d="M30 300 L80 230 H320 L370 300 M70 290 L104 244 H296 L330 290" {...ink(2.6)} />
            <path d="M120 266 h6 M150 266 h6 M180 266 h6 M210 266 h6 M240 266 h6 M270 266 h6" {...ink(3)} stroke="#fff3d6" />
            <path d="M130 250 V200 H270 V250Z M130 200 L150 150 H290 L270 200 M270 250 L290 230 V150" {...ink()} />
            <path d="M150 150 L160 86 H300 L290 150 M166 110 H296" {...ink(2.8)} />
            <path d="M170 176 l10 -14 M200 180 v-18 M232 176 l-8 -14 M258 172 l-10 -12" {...ink(2.2)} stroke="#e0a43a" />
            <path d="M200 200 V250 M186 214 h28 v16 h-28z" {...ink(2.4)} />
            <path transform="translate(150 70) rotate(-18)" d={piece} {...ink(2.6)} />
            <path transform="translate(236 50) rotate(14)" d={piece} {...ink(2.6)} />
            <path transform="translate(300 110) rotate(-8) scale(0.8)" d={piece} {...ink(2.6)} />
            {/* المفتاح */}
            <circle cx="110" cy="110" r="12" {...ink(3)} stroke="#e0a43a" />
            <path d="M120 118 L150 140 M140 132 l-6 8 M146 136 l-6 8" {...ink(3)} stroke="#e0a43a" />
            {/* الفانوس */}
            <path d="M72 140 V170 M56 176 h32 M50 200 q0 -26 22 -26 q22 0 22 26 q0 24 -22 30 q-22 -6 -22 -30z M62 232 h20" {...ink(2.6)} />
            {/* شرر */}
            <path d="M200 120 v-14 M193 113 h14 M330 70 v-10 M325 65 h10 M110 60 v-10 M105 55 h10" {...ink(2.4)} stroke={NEON} />
          </>
        }
      />
    </>
  );
}

// ---------------- عملات: عملات تتساقط على خريطة قديمة ----------------
function Currencies(id: Ids) {
  /** كومة عملات من الجنب: جسم + وجه علوي */
  const stack = (x: number, base: number, n: number, r: number, face: string, side: string) =>
    Array.from({ length: n }, (_, i) => {
      const y = base - i * 11;
      return (
        <g key={i}>
          <path d={`M${x - r} ${y} v10 a${r} ${r * 0.35} 0 0 0 ${2 * r} 0 v-10`} fill={side} />
          <ellipse cx={x} cy={y} rx={r} ry={r * 0.35} fill={face} />
        </g>
      );
    });
  const stackLines = (x: number, base: number, n: number, r: number) =>
    Array.from({ length: n }, (_, i) => {
      const y = base - i * 11;
      return <path key={i} d={`M${x - r} ${y} v10 a${r} ${r * 0.35} 0 0 0 ${2 * r} 0 v-10 M${x - r} ${y} a${r} ${r * 0.35} 0 0 1 ${2 * r} 0`} {...ink(2.2)} />;
    });
  const falling = [[210, 70, 24], [320, 44, 18], [92, 62, 16]] as const;
  return (
    <>
      <Layers
        id={id}
        wash={
          <>
            <rect width="400" height="300" fill="#13283d" />
            <path d="M40 120 L360 96 L376 280 L28 290Z" fill="#ecd8a8" />
            <path d="M80 160 q30 -20 60 0 q10 30 -20 40 q-30 0 -40 -40z M190 140 q40 -10 50 20 q-10 30 -40 26 q-20 -20 -10 -46z M270 170 q40 0 50 30 q-20 30 -50 10z" fill="#9fc48a" />
            {stack(140, 256, 6, 38, "#f6d257", "#c9971f")}
            {stack(250, 262, 4, 32, "#e6ebef", "#a9b3bb")}
            {falling.map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.92} fill={i === 1 ? "#e6ebef" : "#f6d257"} />)}
            <circle cx="330" cy="160" r="30" fill="#c58b3c" />
          </>
        }
        extra={<circle cx="210" cy="70" r="34" fill="#fff4a8" opacity="0.5" filter={`url(#${id.glow})`} />}
        lines={
          <>
            <path d="M40 120 L360 96 L376 280 L28 290Z" {...ink(2.6)} />
            <path d="M80 160 q30 -20 60 0 q10 30 -20 40 q-30 0 -40 -40z M190 140 q40 -10 50 20 q-10 30 -40 26 q-20 -20 -10 -46z M270 170 q40 0 50 30 q-20 30 -50 10z" {...ink(1.8)} />
            <path d="M120 150 q60 -40 120 -6" {...ink(1.6)} strokeDasharray="6 7" stroke="#b03a2e" />
            {stackLines(140, 256, 6, 38)}
            {stackLines(250, 262, 4, 32)}
            <ellipse cx="140" cy="201" rx="24" ry="8" {...ink(1.4)} />
            {falling.map(([x, y, r], i) => (
              <g key={i}>
                <ellipse cx={x} cy={y} rx={r} ry={r * 0.92} {...ink(2.6)} />
                <ellipse cx={x} cy={y} rx={r * 0.66} ry={r * 0.6} {...ink(1.4)} />
              </g>
            ))}
            <path d="M200 60 l6 -10 M214 86 l8 4" {...ink(2.4)} stroke="#fff" />
            <circle cx="330" cy="160" r="30" {...ink(2.8)} />
            <circle cx="330" cy="160" r="22" {...ink(1.6)} />
            <path d="M330 142 L336 160 L330 178 L324 160Z" fill={TIF} stroke={INK} strokeWidth="2" />
            <path d="M330 142 L336 160 H324Z" fill="#d6453b" />
            <path d="M210 30 v-14 M320 14 v-8 M92 30 v-12" {...ink(2.2)} stroke={NEON} />
          </>
        }
      />
    </>
  );
}

const BASE_SCENES: Record<string, (id: Ids) => ReactElement> = {
  kuwait: Kuwait,
  quran: Quran,
  prophets: Prophets,
  "world-football": Football,
  "proverbs-riddles": Riddles,
  currencies: Currencies,
};

const SCENES: Record<string, (id: Ids) => ReactElement> = {
  ...BASE_SCENES,
  ...Object.fromEntries(
    Object.entries(MORE_SCENES).map(([slug, sc]) => [
      slug,
      (id: Ids) => <Layers id={id} wash={sc.wash} lines={sc.lines} extra={sc.extra?.(id.glow)} />,
    ]),
  ),
};

/** للتوافق مع CategoryArt: أي فئة لها مشهد */
export const ILLUSTRATIONS: Record<string, true> = Object.fromEntries(Object.keys(SCENES).map((k) => [k, true]));

export function CategoryIllustration({ slug }: { slug: string }) {
  const scene = SCENES[slug];
  if (!scene) return null;
  const id: Ids = { ink: `ink-${slug}`, wash: `wash-${slug}`, paper: `paper-${slug}`, glow: `glow-${slug}` };
  return (
    <svg className="cat-illus" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <Defs id={id} />
      {scene(id)}
    </svg>
  );
}
