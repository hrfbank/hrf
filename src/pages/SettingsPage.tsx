import { GAME_CONFIG } from "../game/config";
import { useSettings } from "../game/settings";
import { sfx } from "../game/sound";
import { formatNumber } from "../lib/format";
import { ThemeToggle } from "../components/ThemeToggle";
import { Link } from "react-router-dom";

export function SettingsPage() {
  const [s, set] = useSettings();
  return (
    <section className="settings">
      <header className="page-head">
        <p className="eyebrow">الإعدادات</p>
        <h1>إعدادات اللعبة</h1>
        <p className="lead">تنحفظ على هذا الجهاز.</p>
      </header>

      <div className="settings-list">
        <div className="setting">
          <div><h3>الصوت</h3><p>شغّل أو اكتم كل الأصوات.</p></div>
          <button type="button" className={`switch${s.muted ? "" : " on"}`} role="switch" aria-checked={!s.muted} onClick={() => set({ muted: !s.muted })}>
            <span />
          </button>
        </div>
        <div className="setting">
          <div><h3>مستوى الموسيقى</h3><p>{formatNumber(Math.round(s.music * 100))}٪</p></div>
          <input id="set-music" type="range" min="0" max="1" step="0.05" value={s.music} onChange={(e) => set({ music: +e.target.value })} aria-label="مستوى الموسيقى" />
        </div>
        <div className="setting">
          <div><h3>مستوى المؤثرات</h3><p>{formatNumber(Math.round(s.sfx * 100))}٪</p></div>
          <input id="set-sfx" type="range" min="0" max="1" step="0.05" value={s.sfx} onChange={(e) => set({ sfx: +e.target.value })} onMouseUp={() => sfx.correct()} onTouchEnd={() => sfx.correct()} aria-label="مستوى المؤثرات" />
        </div>
        <div className="setting">
          <div><h3>مهلة الإجابة الافتراضية</h3><p>تقدرون تغيّرونها قبل كل لعبة.</p></div>
          <div className="seg" role="radiogroup" aria-label="مهلة الإجابة الافتراضية">
            {GAME_CONFIG.answerSeconds.options.map((v) => (
              <button key={v} type="button" role="radio" aria-checked={s.seconds === v} className={s.seconds === v ? "on" : ""} onClick={() => set({ seconds: v })}>
                {formatNumber(v)} ث
              </button>
            ))}
          </div>
        </div>
        <div className="setting">
          <div><h3>الوضع الليلي</h3><p>بدّل بين الفاتح والغامق.</p></div>
          <ThemeToggle />
        </div>
        <div className="setting">
          <div><h3>جرّب الأصوات</h3><p>اسمع الجرس والموسيقى وباقي المؤثرات.</p></div>
          <Link to="/sounds" className="btn ghost">تجربة الأصوات</Link>
        </div>
      </div>
    </section>
  );
}
