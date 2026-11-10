import { GAME_CONFIG } from "../game/config";
import { useSettings } from "../game/settings";
import { sfx } from "../game/sound";
import { formatNumber } from "../lib/format";
import { ThemeToggle } from "../components/ThemeToggle";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { clearSeen, seenCount, setSeenAccount } from "../game/pickQuestion";
import { useAuth } from "../lib/auth";
import { bank } from "../lib/api";

export function SettingsPage() {
  const [s, set] = useSettings();
  const { player, enabled: authOn, previewAsPlayer, setPreviewAsPlayer } = useAuth();
  const [seen, setSeen] = useState(0);
  useEffect(() => {
    void setSeenAccount(player?.id ?? null).then(() => setSeen(seenCount()));
  }, [player?.id]);
  const total = bank.questions.length;
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
          <div>
            <h3>سجل الأسئلة</h3>
            <p>طلع لكم {formatNumber(seen)} سؤال من {formatNumber(total)}. السؤال اللي يطلع ما يتكرر عليكم. المسح يرجّع كل الأسئلة جديدة.</p>
          </div>
          <button
            type="button"
            className="btn danger"
            disabled={!seen}
            onClick={async () => {
              if (!confirm("أكيد؟ بترجع كل الأسئلة اللي طلعت لكم تطلع من جديد.")) return;
              await clearSeen();
              setSeen(0);
            }}
          >
            امسح السجل
          </button>
        </div>
        {!authOn && (
          <div className="setting">
            <div>
              <h3>معاينة كلاعب</h3>
              <p>يخفي بنك الأسئلة والأجوبة والتصفح، عشان تشوف اللعبة مثل اللي يشتريها.</p>
            </div>
            <button type="button" className={`switch${previewAsPlayer ? " on" : ""}`} role="switch" aria-checked={previewAsPlayer} aria-label="معاينة كلاعب" onClick={() => setPreviewAsPlayer(!previewAsPlayer)}>
              <span />
            </button>
          </div>
        )}
        <div className="setting">
          <div><h3>جرّب الأصوات</h3><p>اسمع الجرس والموسيقى وباقي المؤثرات.</p></div>
          <Link to="/sounds" className="btn ghost">تجربة الأصوات</Link>
        </div>
      </div>
    </section>
  );
}
