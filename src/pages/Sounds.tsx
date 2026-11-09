import { useEffect, useRef, useState } from "react";
import { isMusicPlaying, setMuted, setVolume, sfx, startCountdown, startMusic, stopMusic } from "../game/sound";
import { formatNumber } from "../lib/format";

const EFFECTS: { label: string; play: () => void; note: string }[] = [
  { label: "جرس الأحمر", play: () => sfx.buzz("red"), note: "نغمة أخفض" },
  { label: "جرس الأخضر", play: () => sfx.buzz("green"), note: "نغمة أعلى" },
  { label: "تلميح جديد", play: sfx.clue, note: "عند كشف كل تلميح" },
  { label: "كشف الجواب", play: sfx.reveal, note: "بعد ضغط «اكشف الجواب»" },
  { label: "إجابة صحيحة", play: sfx.correct, note: "الخلية تتلوّن" },
  { label: "إجابة خاطئة", play: sfx.wrong, note: "السؤال ينتقل للخصم" },
  { label: "اختيار حرف", play: sfx.select, note: "عند اختيار خلية" },
  { label: "الفوز بالجولة", play: sfx.roundWin, note: "اكتمال المسار" },
  { label: "انتهى الوقت", play: sfx.timeUp, note: "بعد آخر ثانية" },
];

export function Sounds() {
  const [music, setMusic] = useState(isMusicPlaying());
  const [muted, setMute] = useState(false);
  const [seconds, setSeconds] = useState(10);
  const [left, setLeft] = useState<number | null>(null);
  const stopRef = useRef<() => void>();

  useEffect(() => () => stopRef.current?.(), []);

  function toggleMusic() {
    if (music) stopMusic();
    else startMusic();
    setMusic(!music);
  }

  function runTimer() {
    stopRef.current?.();
    stopRef.current = startCountdown(seconds, setLeft, () => setTimeout(() => setLeft(null), 1200));
  }

  return (
    <>
      <header className="page-head">
        <p className="eyebrow">الأصوات</p>
        <h1>موسيقى ومؤثرات حروف</h1>
        <p className="lead">كل الأصوات مولّدة داخل المتصفح ومؤلفة للعبة، بدون ملفات من مصادر أخرى. اضغط أي زر لتسمعه.</p>
      </header>

      <section className="sound-panel">
        <div className="sound-row">
          <button type="button" className={`btn ${music ? "ghost" : "primary"}`} onClick={toggleMusic}>
            {music ? "إيقاف الموسيقى" : "تشغيل الموسيقى"}
          </button>
          <button
            type="button"
            className="btn ghost"
            aria-pressed={muted}
            onClick={() => {
              setMuted(!muted);
              setMute(!muted);
            }}
          >
            {muted ? "تشغيل الصوت" : "كتم الصوت"}
          </button>
        </div>
        <p className="sound-note">لحن أصلي بمقام الحجاز على إيقاع المقسوم (دُم، تَك).</p>
        <div className="sound-sliders">
          <label htmlFor="vol-music">
            الموسيقى
            <input id="vol-music" type="range" min="0" max="1" step="0.05" defaultValue="0.35" onChange={(e) => setVolume("music", +e.target.value)} />
          </label>
          <label htmlFor="vol-sfx">
            المؤثرات
            <input id="vol-sfx" type="range" min="0" max="1" step="0.05" defaultValue="0.8" onChange={(e) => setVolume("sfx", +e.target.value)} />
          </label>
        </div>
      </section>

      <section className="section">
        <div className="section-head"><h2>مهلة الإجابة</h2></div>
        <div className="timer-demo">
          <div className="seg" role="radiogroup" aria-label="مدة المهلة">
            {[10, 20, 30].map((s) => (
              <button key={s} type="button" role="radio" aria-checked={seconds === s} className={seconds === s ? "on" : ""} onClick={() => setSeconds(s)}>
                {formatNumber(s)} ث
              </button>
            ))}
          </div>
          <button type="button" className="btn primary" onClick={runTimer}>ابدأ العدّ</button>
          <div className={`clock${left !== null && left <= 4 ? " urgent" : ""}`} aria-live="polite">
            {left === null ? "—" : formatNumber(Math.max(left, 0))}
          </div>
        </div>
        <p className="sound-note">التكتكة تبدأ في آخر ٤ ثواني وتصير أحدّ في آخر ثانيتين، ثم صوت انتهاء الوقت.</p>
      </section>

      <section className="section">
        <div className="section-head"><h2>المؤثرات</h2></div>
        <div className="sfx-grid">
          {EFFECTS.map((e) => (
            <button key={e.label} type="button" className="sfx" onClick={e.play}>
              <strong>{e.label}</strong>
              <span>{e.note}</span>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
