import { useEffect, useMemo, useRef, useState } from "react";
import { bank } from "../lib/api";
import { GAME_CONFIG } from "../game/config";
import { buildBoard, winningPath, type Board, type Team } from "../game/hex";
import { sfx, startCountdown, startMusic, stopMusic, isMusicPlaying } from "../game/sound";
import { formatNumber } from "../lib/format";
import type { Question } from "../lib/types";
import { useAuth } from "../lib/auth";

type Phase = "setup" | "categories" | "board" | "question" | "roundWon" | "matchWon";
type QState = {
  cellIndex: number;
  q: Question;
  outsidePicks: boolean;
  shown: number;
  buzzed: Team | null;
  passedTo: Team | null;
  revealed: boolean;
};

const OTHER: Record<Team, Team> = { red: "green", green: "red" };
const BUZZ_KEYS: Record<string, Team> = { a: "red", ش: "red", l: "green", م: "green" };

export function Play() {
  const cfg = GAME_CONFIG;
  const { enabled: authOn, player } = useAuth();
  const [phase, setPhase] = useState<Phase>("setup");
  const [names, setNames] = useState<Record<Team, string>>({ red: cfg.teams.red.name, green: cfg.teams.green.name });
  const [seconds, setSeconds] = useState<number>(cfg.answerSeconds.default);
  const [picks, setPicks] = useState<{ slug: string; team: Team }[]>([]);
  const [board, setBoard] = useState<Board | null>(null);
  const [history, setHistory] = useState<Board[]>([]);
  const [turn, setTurn] = useState<Team>("red");
  const [score, setScore] = useState<Record<Team, number>>({ red: 0, green: 0 });
  const [roundWinner, setRoundWinner] = useState<{ team: Team; path: Set<number> } | null>(null);
  const [qs, setQs] = useState<QState | null>(null);
  const [left, setLeft] = useState<number | null>(null);
  const [music, setMusic] = useState(isMusicPlaying());
  const used = useRef(new Set<number>());
  const stopTimer = useRef<() => void>();

  const playable = useMemo(() => bank.categories.filter((c) => c.question_count > 0), []);
  const pickedSlugs = picks.map((p) => p.slug);
  const pickedIds = useMemo(
    () => new Set(bank.categories.filter((c) => pickedSlugs.includes(c.slug)).map((c) => c.id)),
    [pickedSlugs.join("|")],
  );
  const pickTurn: Team = picks.length % 2 === 0 ? "red" : "green";

  useEffect(() => () => stopTimer.current?.(), []);

  // ---------- اللوحة ----------
  function letterCounts(onlyPicked: boolean) {
    const counts: Record<string, number> = {};
    for (const q of bank.questions) {
      if (used.current.has(q.id)) continue;
      if (onlyPicked && !pickedIds.has(q.category_id)) continue;
      counts[q.letter] = (counts[q.letter] ?? 0) + 1;
    }
    return counts;
  }

  function newRound() {
    const { rows, cols } = cfg.board;
    const inPicks = letterCounts(true);
    // لو حروف الفئات المختارة ما تكفي اللوحة، نكمّل من باقي البنك
    const counts = Object.keys(inPicks).length >= rows * cols ? inPicks : { ...letterCounts(false), ...inPicks };
    setBoard(buildBoard(rows, cols, counts));
    setHistory([]);
    setRoundWinner(null);
    setPhase("board");
  }

  function openCell(index: number) {
    if (!board || board.cells[index].owner) return;
    const letter = board.cells[index].letter;
    const pool = (onlyPicked: boolean) =>
      bank.questions.filter((q) => q.letter === letter && !used.current.has(q.id) && (!onlyPicked || pickedIds.has(q.category_id)));
    let candidates = pool(true);
    const outside = candidates.length === 0;
    if (outside) candidates = pool(false);
    if (!candidates.length) return;
    const q = candidates[Math.floor(Math.random() * candidates.length)];
    used.current.add(q.id);
    sfx.select();
    setQs({ cellIndex: index, q, outsidePicks: outside, shown: 1, buzzed: null, passedTo: null, revealed: false });
    setLeft(null);
    setPhase("question");
  }

  // ---------- السؤال ----------
  function nextClue() {
    if (!qs || qs.shown >= qs.q.clues.length) return;
    sfx.clue();
    setQs({ ...qs, shown: qs.shown + 1 });
  }

  function runTimer() {
    stopTimer.current?.();
    stopTimer.current = startCountdown(seconds, setLeft, () => undefined);
  }

  function buzz(team: Team) {
    if (!qs || qs.buzzed || qs.revealed) return;
    sfx.buzz(team);
    setQs({ ...qs, buzzed: team });
    runTimer();
  }

  function passToOther() {
    if (!qs?.buzzed) return;
    stopTimer.current?.();
    sfx.wrong();
    const to = OTHER[qs.buzzed];
    const extra = cfg.wrongAnswer.revealExtraClue && qs.shown < qs.q.clues.length ? 1 : 0;
    setQs({ ...qs, passedTo: to, shown: qs.shown + extra });
    runTimer();
  }

  function reveal() {
    if (!qs) return;
    stopTimer.current?.();
    setLeft(null);
    sfx.reveal();
    setQs({ ...qs, revealed: true });
  }

  function judge(team: Team | null) {
    if (!qs || !board) return;
    if (!team) {
      sfx.wrong();
      setQs(null);
      setPhase("board");
      return;
    }
    const next: Board = { ...board, cells: board.cells.map((c, i) => (i === qs.cellIndex ? { ...c, owner: team } : c)) };
    setHistory((h) => [...h, board]);
    setBoard(next);
    setTurn(team);
    setQs(null);
    const path = winningPath(next, team);
    if (path) {
      sfx.roundWin();
      const s = { ...score, [team]: score[team] + 1 };
      setScore(s);
      setRoundWinner({ team, path: new Set(path.map((c) => c.r * next.cols + c.c)) });
      setPhase(s[team] >= cfg.match.roundsToWin ? "matchWon" : "roundWon");
    } else {
      sfx.correct();
      setPhase("board");
    }
  }

  function undo() {
    const prev = history[history.length - 1];
    if (!prev) return;
    setBoard(prev);
    setHistory((h) => h.slice(0, -1));
  }

  // أزرار الكيبورد للجرس (للتجربة على جهاز واحد)
  useEffect(() => {
    if (phase !== "question") return;
    const onKey = (e: KeyboardEvent) => {
      const t = BUZZ_KEYS[e.key.toLowerCase()];
      if (t) buzz(t);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function toggleMusic() {
    if (music) stopMusic();
    else startMusic();
    setMusic(!music);
  }

  function resetMatch() {
    used.current.clear();
    setScore({ red: 0, green: 0 });
    setPicks([]);
    setBoard(null);
    setPhase("setup");
  }

  // ---------- العرض ----------
  const scoreBar = (
    <div className="g-score">
      {(["red", "green"] as Team[]).map((t) => (
        <div key={t} className={`g-team ${t}${turn === t && (phase === "board") ? " turn" : ""}`}>
          <strong>{names[t]}</strong>
          <span>{formatNumber(score[t])} / {formatNumber(cfg.match.roundsToWin)}</span>
        </div>
      ))}
      <button type="button" className="icon-btn" onClick={toggleMusic} aria-label={music ? "إيقاف الموسيقى" : "تشغيل الموسيقى"} title="الموسيقى">
        {music ? "■" : "♪"}
      </button>
    </div>
  );

  if (phase === "setup") {
    return (
      <section className="g-wrap">
        <header className="page-head">
          <p className="eyebrow">لعبة جديدة</p>
          <h1>{player ? `حيّاك ${player.name}، جهّزوا الفريقين` : "جهّزوا الفريقين"}</h1>
          {!authOn && <p className="g-note">نسخة تجربة: تسجيل الدخول بـ Apple و Google يشتغل في النسخة المنشورة على الإنترنت.</p>}
          <p className="lead">{cfg.teams.red.name} يوصل من اليمين إلى اليسار، و{cfg.teams.green.name} من الأعلى إلى الأسفل. أول فريق يفوز بـ{formatNumber(cfg.match.roundsToWin)} جولات يكسب المباراة.</p>
        </header>
        <div className="g-setup">
          {(["red", "green"] as Team[]).map((t) => (
            <label key={t} className={`g-name ${t}`} htmlFor={`team-${t}`}>
              <span>اسم الفريق {cfg.teams[t].name}</span>
              <input
                id={`team-${t}`}
                value={names[t]}
                maxLength={cfg.teams.customNames.maxLength}
                onChange={(e) => setNames({ ...names, [t]: e.target.value })}
              />
            </label>
          ))}
          <div className="g-field">
            <span>مهلة الإجابة بعد الجرس</span>
            <div className="seg" role="radiogroup" aria-label="مهلة الإجابة">
              {cfg.answerSeconds.options.map((s) => (
                <button key={s} type="button" role="radio" aria-checked={seconds === s} className={seconds === s ? "on" : ""} onClick={() => setSeconds(s)}>
                  {formatNumber(s)} ث
                </button>
              ))}
            </div>
          </div>
          <button type="button" className="btn primary" onClick={() => { sfx.select(); setPhase("categories"); }}>التالي: اختيار الفئات</button>
        </div>
      </section>
    );
  }

  if (phase === "categories") {
    const done = picks.length >= cfg.categories.total;
    return (
      <section className="g-wrap">
        <header className="page-head">
          <p className="eyebrow">اختيار الفئات</p>
          <h1>{done ? "الفئات جاهزة" : <>دور <span className={`g-tag ${pickTurn}`}>{names[pickTurn]}</span> يختار فئة</>}</h1>
          <p className="lead">كل فريق يختار {formatNumber(cfg.categories.perTeam)} فئات بالتناوب. أسئلة الجولة من هذه الفئات فقط.</p>
        </header>
        <div className="g-cats">
          {playable.map((c) => {
            const p = picks.find((x) => x.slug === c.slug);
            return (
              <button
                key={c.slug}
                type="button"
                className={`g-cat${p ? ` picked ${p.team}` : ""}`}
                disabled={!p && done}
                onClick={() => {
                  if (p) setPicks(picks.filter((x) => x.slug !== c.slug));
                  else if (!done) { sfx.select(); setPicks([...picks, { slug: c.slug, team: pickTurn }]); }
                }}
              >
                <strong>{c.name}</strong>
                <span>{formatNumber(c.question_count)} سؤال</span>
              </button>
            );
          })}
        </div>
        <div className="g-actions">
          <button type="button" className="btn ghost" onClick={() => setPhase("setup")}>رجوع</button>
          <button type="button" className="btn primary" disabled={!done} onClick={newRound}>ابدأ الجولة</button>
        </div>
      </section>
    );
  }

  if (!board) return null;

  const hexBoard = (interactive: boolean) => (
    <div className="g-stage" style={{ ["--cols" as string]: board.cols, ["--rows" as string]: board.rows }}>
    <div className="hex-frame" dir="ltr">
      <div className="hex-edge top" /><div className="hex-edge bottom" />
      <div className="hex-edge left" /><div className="hex-edge right" />
      <div className="hex-grid">
        {Array.from({ length: board.rows }, (_, r) => (
          <div key={r} className={`hex-row${r % 2 ? " odd" : ""}`}>
            {board.cells.slice(r * board.cols, (r + 1) * board.cols).map((cell, c) => {
              const idx = r * board.cols + c;
              const win = roundWinner?.path.has(idx);
              return (
                <button
                  key={idx}
                  type="button"
                  className={`hex${cell.owner ? ` ${cell.owner}` : ""}${win ? " win" : ""}`}
                  disabled={!interactive || !!cell.owner}
                  onClick={() => openCell(idx)}
                  aria-label={`حرف ${cell.letter}${cell.owner ? `، للفريق ${names[cell.owner]}` : ""}`}
                >
                  <span>{cell.letter}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
    </div>
  );

  if (phase === "board" || phase === "roundWon" || phase === "matchWon") {
    return (
      <section className="g-wrap">
        {scoreBar}
        {phase === "board" && (
          <p className="g-hint">دور <span className={`g-tag ${turn}`}>{names[turn]}</span> لاختيار حرف</p>
        )}
        {phase !== "board" && roundWinner && (
          <div className={`g-banner ${roundWinner.team}`} role="status">
            {phase === "matchWon" ? `${names[roundWinner.team]} فاز بالمباراة!` : `${names[roundWinner.team]} فاز بالجولة`}
          </div>
        )}
        {hexBoard(phase === "board")}
        <div className="g-actions">
          {phase === "board" && (
            <button type="button" className="btn ghost" disabled={!history.length} onClick={undo}>تراجع عن آخر خلية</button>
          )}
          {phase === "roundWon" && <button type="button" className="btn primary" onClick={newRound}>الجولة التالية</button>}
          {phase === "matchWon" && <button type="button" className="btn primary" onClick={resetMatch}>مباراة جديدة</button>}
        </div>
      </section>
    );
  }

  // ---------- شاشة السؤال ----------
  if (!qs) return null;
  const cat = bank.categories.find((c) => c.id === qs.q.category_id);
  const answering = qs.passedTo ?? qs.buzzed;
  return (
    <section className="g-wrap">
      {scoreBar}
      <article className="g-question">
        <div className="g-q-head">
          <div className="g-letter">{board.cells[qs.cellIndex].letter}</div>
          <div>
            <span className="chip">{cat?.name}</span>
            {qs.outsidePicks && <span className="g-note">من خارج فئاتكم (ما فيه سؤال بهذا الحرف في فئاتكم)</span>}
          </div>
          {left !== null && (
            <div className={`clock${left <= cfg.tickLastSeconds ? " urgent" : ""}`} aria-live="polite">{formatNumber(Math.max(left, 0))}</div>
          )}
        </div>

        <ol className="g-clues">
          {qs.q.clues.slice(0, qs.shown).map((c, i) => <li key={i}>{c}</li>)}
        </ol>

        {qs.revealed ? (
          <>
            <div className="g-answer">
              <span>الجواب</span>
              <strong>{qs.q.answer}</strong>
              {qs.q.accepted?.length ? <em>ويُقبل: {qs.q.accepted.join("، ")}</em> : null}
            </div>
            <p className="g-judge-title">أي فريق جاوب صح؟</p>
            <div className="g-judge">
              <button type="button" className="g-btn red" onClick={() => judge("red")}>{names.red}</button>
              <button type="button" className="g-btn green" onClick={() => judge("green")}>{names.green}</button>
              <button type="button" className="g-btn none" onClick={() => judge(null)}>ولا أحد</button>
            </div>
          </>
        ) : (
          <>
            {answering ? (
              <p className={`g-buzzed ${answering}`}>
                {qs.passedTo ? `الفرصة لـ${names[qs.passedTo]}` : `${names[answering]} ضغط الجرس!`}
              </p>
            ) : (
              <div className="g-buzzers">
                <button type="button" className="g-buzz red" onClick={() => buzz("red")}>جرس<br />{names.red}</button>
                <button type="button" className="g-buzz green" onClick={() => buzz("green")}>جرس<br />{names.green}</button>
              </div>
            )}
            <div className="g-actions">
              {qs.shown < qs.q.clues.length && !qs.buzzed && (
                <button type="button" className="btn ghost" onClick={nextClue}>التلميح التالي ({formatNumber(qs.shown + 1)}/{formatNumber(qs.q.clues.length)})</button>
              )}
              {qs.buzzed && !qs.passedTo && cfg.wrongAnswer.passToOtherTeam && (
                <button type="button" className="btn ghost" onClick={passToOther}>إجابة خاطئة ← {names[OTHER[qs.buzzed]]}</button>
              )}
              <button type="button" className="btn primary" onClick={reveal}>اكشف الجواب</button>
            </div>
            {!qs.buzzed && <p className="g-keys">على الكمبيوتر: حرف A لجرس {names.red}، وحرف L لجرس {names.green}.</p>}
          </>
        )}
      </article>
    </section>
  );
}
