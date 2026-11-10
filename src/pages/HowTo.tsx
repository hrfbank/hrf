import { Link } from "react-router-dom";
import { GAME_CONFIG } from "../game/config";
import { formatNumber } from "../lib/format";

const cfg = GAME_CONFIG;

const STEPS = [
  { t: "جهّزوا الفريقين", d: `اكتبوا اسم كل فريق، واختاروا مهلة الإجابة (${cfg.answerSeconds.options.map(formatNumber).join(" أو ")} ثانية)، وكل فريق يختار ${formatNumber(cfg.features.helpers.perTeam)} وسائل مساعدة.` },
  { t: "اختاروا الفئات", d: `كل فريق يختار ${formatNumber(cfg.categories.perTeam)} فئات بالتناوب، أو اضغطوا «اختيار عشوائي».` },
  { t: "اختاروا حرف", d: "الفريق صاحب الدور يختار خلية من اللوحة، ويظهر سؤال جوابه يبدأ بحرفها." },
  { t: "اضغطوا الجرس", d: "التلميحات تنكشف وحدة وحدة. أول فريق يضغط الجرس يجاوب، ويبدأ العدّاد." },
  { t: "اكشفوا الجواب", d: "بعد الكشف، اختاروا «أي فريق جاوب صح؟» والخلية تتلوّن بلونه." },
  { t: "وصّلوا مساركم", d: `${cfg.teams.red.name} يوصّل من اليمين إلى اليسار، و${cfg.teams.green.name} من الأعلى إلى الأسفل. أول فريق يفوز بـ${formatNumber(cfg.match.roundsToWin)} جولات يكسب المباراة.` },
];

const FAQ = [
  { q: "لو الفريق جاوب غلط؟", a: "اضغطوا «إجابة خاطئة»، فينتقل السؤال للفريق الثاني مع تلميح إضافي، ويجاوب بدون جرس." },
  { q: "لو انضغط شي بالغلط؟", a: "زر «تراجع عن آخر خلية» يرجّع آخر خلية انكسبت." },
  { q: "نقدر نوقف اللعبة ونكمّلها بعدين؟", a: "إيه. اضغطوا زر الإيقاف، ثم «اطلع للرئيسية». اللعبة تنحفظ على نفس الجهاز، وتطلع لكم «كمّل لعبتك» في الرئيسية." },
  { q: "وش «ال» التعريف؟", a: "ما تنحسب. «البحرين» تحت حرف الباء، و«الكويت» تحت حرف الكاف." },
  { q: "الأسئلة من وين تجي؟", a: "من الفئات اللي اخترتوها بس. واللوحة ما تحط إلا حروف لها أسئلة جديدة عليكم في فئاتكم. ولو الأسئلة الجديدة ما تكفي لعبة، ما تبدأ المباراة وتختارون فئات ثانية." },
  { q: "بيتكرر علينا سؤال؟", a: "لا، نهائياً. كل حساب له سجل بالأسئلة اللي طلعت له، وما ترجع له لا في جولة ولا في لعبة ثانية. وأي حساب ثاني ممكن يطلع له نفس السؤال. ولو تبون تعيدون الأسئلة، امسحوا السجل من الإعدادات." },
  { q: "الأسئلة صحيحة؟", a: "كل سؤال يمرّ بتدقيق، وله مصدر، قبل ما يدخل اللعبة. ولو لقيتوا خطأ، بلّغونا." },
];

const HELP = cfg.features.helpers.kinds;

export function HowTo() {
  return (
    <section className="howto">
      <header className="page-head">
        <p className="eyebrow">كيف تلعب</p>
        <h1>حروف في ست خطوات</h1>
      </header>
      <ol className="steps">
        {STEPS.map((s, i) => (
          <li key={s.t}>
            <span className="step-num">{formatNumber(i + 1)}</span>
            <div><h3>{s.t}</h3><p>{s.d}</p></div>
          </li>
        ))}
      </ol>

      <section className="section">
        <div className="section-head"><h2>وسائل المساعدة</h2></div>
        <div className="help-grid">
          {HELP.map((h) => (
            <div key={h.id} className="help-card"><h3>{h.name}</h3><p>{h.hint}</p></div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head"><h2>أسئلة شائعة</h2></div>
        <div className="faq">
          {FAQ.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="g-actions center">
        <Link to="/play" state={{ fresh: true }} className="btn primary big">ابدأ لعبة</Link>
      </div>
    </section>
  );
}
