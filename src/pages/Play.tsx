import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { bank } from "../lib/api";
import { GAME_CONFIG } from "../game/config";
import { buildBoard, winningPath, type Board, type Team } from "../game/hex";
import { sfx, startCountdown, startMusic, stopMusic, isMusicPlaying } from "../game/sound";
import { loadSettings } from "../game/settings";
import { clearGame, loadGame, saveGame } from "../game/save";
import { formatNumber } from "../lib/format";
import type { Question } from "../lib/types";
import { useAuth } from "../lib/auth";
import { CategoryArt } from "../components/CategoryArt";

type Phase = "setup" | "categories" | "board" | "question" | "roundWon" | "matchWon";
type HelperId = (typeof GAME_CONFIG.features.helpers.kinds)[number]["id"];
type QState = {
  cellIndex: number;
  qid: number;
  outsidePicks: boolean;
  shown: number;
  buzzed: Team | null;
  passedTo: Team | null;
  revealed: boolean;
  twoAnswers: Team | null;
};
type Game = {
  phase: Phase;
  names: Record<Team, string>;
  seconds: number;
  helperPicks: Record<Team, HelperId[]>;
  helperUsed: Record<Team, HelperId[]>;
  picks: { slug: string; team: Team }[];
  board: Board | null;
  turn: Team;
  score: Record<Team, number>;
  correct: Record<Team, number>;
  used: number[];
  round: number;
  roundWinner: { team: Team; path: number[] } | null;
  qs: QState | null;
};

const TEAMS: Team[] = ["red", "green"];
const OTHER: Record<Team, Team> = { red: "green", green: "red" };
const BUZZ_KEYS: Record<string, Team> = { a: "red", ش: "red", l: "green", م: "green" };
const HELPERS = GAME_CONFIG.features.helpers.kinds;
const helperById = (id: HelperId) => HELPERS.find((h) => h.id === id)!;

function freshGame(): Game {
  const cfg = GAME_CONFIG;
  const defaults = HELPERS.slice(0, cfg.features.helpers.perTeam).map((h) => h.id);
  return {
    phase: "setup",
    names: { red: cfg.teams.red.name, green: cfg.teams.green.name },
    seconds: loadSettings().seconds,
    helperPicks: { red: [...defaults], green: [...defaults] },
    helperUsed: { red: [], green: [] },
    picks: [],
    board: null,
    turn: "red",
    score: { red: 0, green: 0 },
    correct: { red: 0, green: 0 },
    used: [],
    round: 1,
    roundWinner: null,
    qs: null,
  };
}

// ---------- أيقونات وسائل المساعدة ----------
function HelperIcon({ id }: { id: HelperId }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      {id === "extraClue" && <path {...p} d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z" />}
      {id === "changeQuestion" && <path {...p} d="M4 9a8 8 0 0 1 14-3l2 2M20 4v4h-4M20 15a8 8 0 0 1-14 3l-2-2M4 20v-4h4" />}
      {id === "callFriend" && <path {...p} d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />}
      {id === "twoAnswers" && <path {...p} d="M8 13V5a1.5 1.5 0 0 1 3 0v6M11 11V4a1.5 1.5 0 0 1 3 0v7M14 11l1.5-4.5a1.5 1.5 0 0 1 2.8 1L17 12v3a6 6 0 0 1-6 6h-1a5 5 0 0 1-4.5-3L4 14.5a1.5 1.5 0 0 1 2.5-1.6L8 15" />}
    </svg>
  );
}

export function Play() {
  const cfg = GAME_CONFIG;
  const navigate = useNavigate();
  const location = useLocation();
  const { enabled: authOn, player } = useAuth();
  const fresh = (location.state as { fresh?: boolean } | null)?.fresh;

  const [g, setG] = useState<Game>(() => {
    if (fresh) {
      clearGame();
      return freshGame();
    }
    const saved = loadGame<Game>();
    return saved && saved.phase !== "matchWon" ? { ...freshGame(), ...saved } : freshGame();
  });
  const [history, setHistory] = useState<Board[]>([]);
  const [left, setLeft] = useState<number | null>(null);
  const [friendLeft, setFriendLeft] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [music, setMusic] = useState(isMusicPlaying());
  const [catQuery, setCatQuery] = useState("");
  const stopTimer = useRef<() => void>();
  const stopFriend = useRef<() => void>();

  const patch = (p: Partial<Game>) => setG((s) => ({ ...s, ...p }));

  // حفظ تلقائي بعد كل تغيير
  useEffect(() => {
    if (g.phase === "setup") return;
    if (g.phase === "matchWon") clearGame();
    else saveGame(g);
  }, [g]);

  useEffect(() => () => {
    stopTimer.current?.();
    stopFriend.current?.();
  }, []);

  const playable = useMemo(() => bank.categories.filter((c) => c.question_count > 0), []);
  const pickedIds = useMemo(
    () => new Set(bank.categories.filter((c) => g.picks.some((p) => p.slug === c.slug)).map((c) => c.id)),
    [g.picks],
  );
  const qById = useMemo(() => new Map(bank.questions.map((q) => [q.id, q])), []);
  const usedSet = useMemo(() => new Set(g.used), [g.used]);
  const pickTurn: Team = g.picks.length % 2 === 0 ? "red" : "green";
  const q: Question | undefined = g.qs ? qById.get(g.qs.qid) : undefined;

  // ---------- اللوحة ----------
  function letterCounts(onlyPicked: boolean, used = usedSet) {
    const counts: Record<string, number> = {};
    for (const x of bank.questions) {
      if (used.has(x.id)) continue;
      if (onlyPicked && !pickedIds.has(x.category_id)) continue;
      counts[x.letter] = (counts[x.letter] ?? 0) + 1;
    }
    return counts;
  }

  function newRound(nextRound = g.round) {
    const { rows, cols } = cfg.board;
    const inPicks = letterCounts(true);
    const counts = Object.keys(inPicks).length >= rows * cols ? inPicks : { ...letterCounts(false), ...inPicks };
    setHistory([]);
    patch({ board: buildBoard(rows, cols, counts), roundWinner: null, qs: null, phase: "board", round: nextRound });
  }

  function pickQuestion(letter: string, exclude: Set<number>) {
    const pool = (onlyPicked: boolean) =>
      bank.questions.filter((x) => x.letter === letter && !exclude.has(x.id) && (!onlyPicked || pickedIds.has(x.category_id)));
    let candidates = pool(true);
    const outside = candidates.length === 0;
    if (outside) candidates = pool(false);
    if (!candidates.length) return null;
    return { q: candidates[Math.floor(Math.random() * candidates.length)], outside };
  }

  function openCell(index: number) {
    if (!g.board || g.board.cells[index].owner) return;
    const res = pickQuestion(g.board.cells[index].letter, usedSet);
    if (!res) return;
    sfx.select();
    setLeft(null);
    patch({
      used: [...g.used, res.q.id],
      qs: { cellIndex: index, qid: res.q.id, outsidePicks: res.outside, shown: 1, buzzed: null, passedTo: null, revealed: false, twoAnswers: null },
      phase: "question",
    });
  }

  // ---------- السؤال ----------
  function runTimer() {
    stopTimer.current?.();
    stopTimer.current = startCountdown(g.seconds, setLeft, () => undefined);
  }

  function setQs(p: Partial<QState>) {
    setG((s) => (s.qs ? { ...s, qs: { ...s.qs, ...p } } : s));
  }

  function nextClue() {
    if (!g.qs || !q || g.qs.shown >= q.clues.length) return;
    sfx.clue();
    setQs({ shown: g.qs.shown + 1 });
  }

  function buzz(team: Team) {
    if (!g.qs || g.qs.buzzed || g.qs.revealed || paused) return;
    sfx.buzz(team);
    setQs({ buzzed: team });
    runTimer();
  }

  function passToOther() {
    if (!g.qs?.buzzed || !q) return;
    stopTimer.current?.();
    sfx.wrong();
    const extra = cfg.wrongAnswer.revealExtraClue && g.qs.shown < q.clues.length ? 1 : 0;
    setQs({ passedTo: OTHER[g.qs.buzzed], shown: g.qs.shown + extra });
    runTimer();
  }

  function reveal() {
    stopTimer.current?.();
    stopFriend.current?.();
    setFriendLeft(null);
    setLeft(null);
    sfx.reveal();
    setQs({ revealed: true });
  }

  function useHelper(team: Team, id: HelperId) {
    if (!g.qs || !q || g.helperUsed[team].includes(id) || !g.helperPicks[team].includes(id)) return;
    const markUsed = { helperUsed: { ...g.helperUsed, [team]: [...g.helperUsed[team], id] } };
    sfx.select();
    if (id === "extraClue") {
      if (g.qs.shown >= q.clues.length) return;
      patch({ ...markUsed, qs: { ...g.qs, shown: g.qs.shown + 1 } });
    } else if (id === "changeQuestion") {
      const res = pickQuestion(q.letter, usedSet);
      if (!res) return;
      stopTimer.current?.();
      setLeft(null);
      patch({ ...markUsed, used: [...g.used, res.q.id], qs: { ...g.qs, qid: res.q.id, outsidePicks: res.outside, shown: 1, buzzed: null, passedTo: null } });
    } else if (id === "callFriend") {
      patch(markUsed);
      stopFriend.current?.();
      stopFriend.current = startCountdown(GAME_CONFIG.features.helpers.kinds[2].seconds, setFriendLeft, () => setTimeout(() => setFriendLeft(null), 1200));
    } else if (id === "twoAnswers") {
      patch({ ...markUsed, qs: { ...g.qs, twoAnswers: team } });
    }
  }

  function judge(team: Team | null) {
    if (!g.qs || !g.board) return;
    if (!team) {
      sfx.wrong();
      patch({ qs: null, phase: "board" });
      return;
    }
    const board: Board = { ...g.board, cells: g.board.cells.map((c, i) => (i === g.qs!.cellIndex ? { ...c, owner: team } : c)) };
    setHistory((h) => [...h, g.board!]);
    const correct = { ...g.correct, [team]: g.correct[team] + 1 };
    const path = winningPath(board, team);
    if (path) {
      sfx.roundWin();
      const score = { ...g.score, [team]: g.score[team] + 1 };
      patch({
        board, correct, score, turn: team, qs: null,
        roundWinner: { team, path: path.map((c) => c.r * board.cols + c.c) },
        phase: score[team] >= cfg.match.roundsToWin ? "matchWon" : "roundWon",
      });
    } else {
      sfx.correct();
      patch({ board, correct, turn: team, qs: null, phase: "board" });
    }
  }

  function undo() {
    const prev = history[history.length - 1];
    if (!prev) return;
    patch({ board: prev });
    setHistory((h) => h.slice(0, -1));
  }

  useEffect(() => {
    if (g.phase !== "question") return;
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

  function rematch() {
    const f = freshGame();
    setG({ ...f, names: g.names, seconds: g.seconds, helperPicks: g.helperPicks, phase: "categories" });
  }

  function exitToHome() {
    setPaused(false);
    stopTimer.current?.();
    navigate("/");
  }

  // ---------- أجزاء مشتركة ----------
  const hud = (
    <div className="hud">
      {TEAMS.map((t) => (
        <div key={t} className={`hud-team ${t}${g.turn === t && g.phase === "board" ? " turn" : ""}`}>
          <div className="hud-name">{g.names[t]}</div>
          <div className="hud-pips" aria-label={`${formatNumber(g.score[t])} من ${formatNumber(cfg.match.roundsToWin)} جولات`}>
            {Array.from({ length: cfg.match.roundsToWin }, (_, i) => <i key={i} className={i < g.score[t] ? "on" : ""} />)}
          </div>
          <div className="hud-helpers">
            {g.helperPicks[t].map((id) => (
              <span key={id} className={`hud-helper${g.helperUsed[t].includes(id) ? " used" : ""}`} title={helperById(id).name}>
                <HelperIcon id={id} />
              </span>
            ))}
          </div>
        </div>
      ))}
      <div className="hud-tools">
        <button type="button" className="icon-btn" onClick={toggleMusic} aria-label={music ? "إيقاف الموسيقى" : "تشغيل الموسيقى"}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm11-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />{!music && <path d="M3 3l18 18" />}</svg>
        </button>
        <button type="button" className="icon-btn" onClick={() => setPaused(true)} aria-label="إيقاف مؤقت">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5v14M15 5v14" /></svg>
        </button>
      </div>
    </div>
  );

  const pauseMenu = paused && (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="اللعبة متوقفة">
      <div className="sheet">
        <h2>اللعبة متوقفة</h2>
        <p className="lead">الجولة {formatNumber(g.round)} · {g.names.red} {formatNumber(g.score.red)} – {formatNumber(g.score.green)} {g.names.green}</p>
        <button type="button" className="btn primary" onClick={() => setPaused(false)}>كمّل اللعب</button>
        <button type="button" className="btn ghost" onClick={() => { setPaused(false); newRound(); }}>أعد الجولة بلوحة جديدة</button>
        <button type="button" className="btn ghost" onClick={exitToHome}>اطلع للرئيسية (تنحفظ اللعبة)</button>
        <button type="button" className="btn danger" onClick={() => { clearGame(); setPaused(false); setG(freshGame()); }}>أنهِ المباراة</button>
      </div>
    </div>
  );

  const stage = (children: ReactNode) => <section className="g-wrap">{children}{pauseMenu}</section>;

  // ---------- الإعداد ----------
  if (g.phase === "setup") {
    const perTeam = cfg.features.helpers.perTeam;
    return stage(
      <>
        <header className="page-head">
          <p className="eyebrow">لعبة جديدة</p>
          <h1>{player ? `حيّاك ${player.name}، جهّزوا الفريقين` : "جهّزوا الفريقين"}</h1>
          {!authOn && <p className="g-note">نسخة تجربة: تسجيل الدخول بـ Apple و Google يشتغل في النسخة المنشورة على الإنترنت.</p>}
        </header>
        <div className="setup-teams">
          {TEAMS.map((t) => (
            <div key={t} className={`setup-team ${t}`}>
              <p className="setup-dir">{t === "red" ? "يوصّل من اليمين إلى اليسار" : "يوصّل من الأعلى إلى الأسفل"}</p>
              <label htmlFor={`team-${t}`} className="setup-label">اسم الفريق</label>
              <input
                id={`team-${t}`}
                className="setup-input"
                value={g.names[t]}
                maxLength={cfg.teams.customNames.maxLength}
                onChange={(e) => patch({ names: { ...g.names, [t]: e.target.value } })}
              />
              <p className="setup-label">وسائل المساعدة ({formatNumber(g.helperPicks[t].length)}/{formatNumber(perTeam)})</p>
              <div className="setup-helpers">
                {HELPERS.map((h) => {
                  const on = g.helperPicks[t].includes(h.id);
                  return (
                    <button
                      key={h.id}
                      type="button"
                      className={`helper-chip${on ? " on" : ""}`}
                      aria-pressed={on}
                      title={h.hint}
                      onClick={() => {
                        const cur = g.helperPicks[t];
                        const next = on ? cur.filter((x) => x !== h.id) : cur.length < perTeam ? [...cur, h.id] : cur;
                        patch({ helperPicks: { ...g.helperPicks, [t]: next } });
                      }}
                    >
                      <HelperIcon id={h.id} />
                      <span>{h.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="setup-row">
          <span className="setup-label">مهلة الإجابة بعد الجرس</span>
          <div className="seg" role="radiogroup" aria-label="مهلة الإجابة">
            {cfg.answerSeconds.options.map((s) => (
              <button key={s} type="button" role="radio" aria-checked={g.seconds === s} className={g.seconds === s ? "on" : ""} onClick={() => patch({ seconds: s })}>
                {formatNumber(s)} ث
              </button>
            ))}
          </div>
        </div>
        <div className="g-actions">
          <button type="button" className="btn primary big" onClick={() => { sfx.select(); patch({ phase: "categories" }); }}>التالي: اختيار الفئات</button>
          <Link to="/how" className="btn ghost">كيف تلعب؟</Link>
        </div>
      </>,
    );
  }

  // ---------- اختيار الفئات ----------
  if (g.phase === "categories") {
    const done = g.picks.length >= cfg.categories.total;
    const term = catQuery.trim();
    const shown = playable.filter((c) => !term || c.name.includes(term));
    const countOf = (t: Team) => g.picks.filter((p) => p.team === t).length;
    const randomFill = () => {
      const free = playable.filter((c) => !g.picks.some((p) => p.slug === c.slug)).sort(() => Math.random() - 0.5);
      const picks = [...g.picks];
      for (const c of free) {
        if (picks.length >= cfg.categories.total) break;
        picks.push({ slug: c.slug, team: picks.length % 2 === 0 ? "red" : "green" });
      }
      sfx.select();
      patch({ picks });
    };
    return stage(
      <>
        <header className="page-head">
          <p className="eyebrow">اختيار الفئات</p>
          <h1>{done ? "الفئات جاهزة!" : <>دور <span className={`g-tag ${pickTurn}`}>{g.names[pickTurn]}</span> يختار</>}</h1>
          <p className="lead">كل فريق يختار {formatNumber(cfg.categories.perTeam)} فئات بالتناوب، وأسئلة المباراة من هذه الفئات.</p>
        </header>
        <div className="pick-bar">
          {TEAMS.map((t) => (
            <span key={t} className={`pick-count ${t}`}>{g.names[t]}: {formatNumber(countOf(t))}/{formatNumber(cfg.categories.perTeam)}</span>
          ))}
          <label className="search-field slim">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>
            <input id="cat-search" type="search" value={catQuery} onChange={(e) => setCatQuery(e.target.value)} placeholder="ابحث عن فئة" aria-label="ابحث عن فئة" />
          </label>
          <button type="button" className="btn secondary" disabled={done} onClick={randomFill}>اختيار عشوائي</button>
        </div>
        <div className="pick-grid">
          {shown.map((c) => {
            const p = g.picks.find((x) => x.slug === c.slug);
            return (
              <button
                key={c.slug}
                type="button"
                className={`pick-card${p ? ` picked ${p.team}` : ""}`}
                disabled={!p && done}
                aria-pressed={!!p}
                onClick={() => {
                  if (p) patch({ picks: g.picks.filter((x) => x.slug !== c.slug) });
                  else if (!done) { sfx.select(); patch({ picks: [...g.picks, { slug: c.slug, team: pickTurn }] }); }
                }}
              >
                <CategoryArt name={c.name} slug={c.slug} />
                <span className="pick-name">{c.name}</span>
                {p && <span className="pick-badge">{g.names[p.team]}</span>}
              </button>
            );
          })}
        </div>
        <div className="g-actions sticky-actions">
          <button type="button" className="btn ghost" onClick={() => patch({ phase: "setup" })}>رجوع</button>
          <button type="button" className="btn primary big" disabled={!done} onClick={() => newRound(1)}>ابدأ المباراة</button>
        </div>
      </>,
    );
  }

  if (!g.board) return null;
  const board = g.board;

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
                const win = g.roundWinner?.path.includes(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`hex${cell.owner ? ` ${cell.owner}` : ""}${win ? " win" : ""}`}
                    disabled={!interactive || !!cell.owner}
                    onClick={() => openCell(idx)}
                    aria-label={`حرف ${cell.letter}${cell.owner ? `، للفريق ${g.names[cell.owner]}` : ""}`}
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

  // ---------- نهاية المباراة ----------
  if (g.phase === "matchWon" && g.roundWinner) {
    const w = g.roundWinner.team;
    return stage(
      <>
        <div className={`win-screen ${w}`}>
          <div className="confetti" aria-hidden="true">{Array.from({ length: 24 }, (_, i) => <i key={i} style={{ ["--i" as string]: i }} />)}</div>
          <p className="eyebrow">انتهت المباراة</p>
          <h1>{g.names[w]} فاز!</h1>
          <div className="win-stats">
            {TEAMS.map((t) => (
              <div key={t} className={`win-team ${t}${t === w ? " champ" : ""}`}>
                <strong>{g.names[t]}</strong>
                <span>{formatNumber(g.score[t])} جولات</span>
                <span>{formatNumber(g.correct[t])} إجابة صحيحة</span>
              </div>
            ))}
          </div>
          <div className="g-actions center">
            <button type="button" className="btn primary big" onClick={rematch}>مباراة ثانية</button>
            <button type="button" className="btn ghost" onClick={() => { clearGame(); navigate("/"); }}>الرئيسية</button>
          </div>
        </div>
        {hexBoard(false)}
      </>,
    );
  }

  // ---------- اللوحة ----------
  if (g.phase === "board" || g.phase === "roundWon") {
    return stage(
      <>
        {hud}
        {g.phase === "board" ? (
          <p className="g-hint">الجولة {formatNumber(g.round)} · دور <span className={`g-tag ${g.turn}`}>{g.names[g.turn]}</span> لاختيار حرف</p>
        ) : (
          g.roundWinner && <div className={`g-banner ${g.roundWinner.team}`} role="status">{g.names[g.roundWinner.team]} فاز بالجولة {formatNumber(g.round)}!</div>
        )}
        {hexBoard(g.phase === "board")}
        <div className="g-actions center">
          {g.phase === "board" && <button type="button" className="btn ghost" disabled={!history.length} onClick={undo}>تراجع عن آخر خلية</button>}
          {g.phase === "roundWon" && <button type="button" className="btn primary big" onClick={() => newRound(g.round + 1)}>الجولة التالية</button>}
        </div>
      </>,
    );
  }

  // ---------- شاشة السؤال ----------
  if (!g.qs || !q) return null;
  const qs = g.qs;
  const cat = bank.categories.find((c) => c.id === q.category_id);
  const answering = qs.passedTo ?? qs.buzzed;
  const helperTeam: Team = answering ?? g.turn;
  return stage(
    <>
      {hud}
      <article className="g-question">
        <div className="g-q-head">
          <div className="g-letter">{board.cells[qs.cellIndex].letter}</div>
          <div>
            <span className="chip">{cat?.name}</span>
            {qs.outsidePicks && <span className="g-note">من خارج فئاتكم (ما فيه سؤال بهذا الحرف في فئاتكم)</span>}
            {qs.twoAnswers && <span className="g-note strong">{g.names[qs.twoAnswers]} يجاوب جوابين</span>}
          </div>
          {left !== null && (
            <div className={`clock${left <= cfg.tickLastSeconds ? " urgent" : ""}`} aria-live="polite">{formatNumber(Math.max(left, 0))}</div>
          )}
        </div>

        <ol className="g-clues">
          {q.clues.slice(0, qs.shown).map((c, i) => <li key={i}>{c}</li>)}
        </ol>

        {friendLeft !== null && (
          <div className="friend-call" role="status">اتصال بصديق: باقي {formatNumber(Math.max(friendLeft, 0))} ثانية</div>
        )}

        {qs.revealed ? (
          <>
            <div className="g-answer">
              <span>الجواب</span>
              <strong>{q.answer}</strong>
              {q.accepted?.length ? <em>ويُقبل: {q.accepted.join("، ")}</em> : null}
            </div>
            <p className="g-judge-title">أي فريق جاوب صح؟</p>
            <div className="g-judge">
              <button type="button" className="g-btn red" onClick={() => judge("red")}>{g.names.red}</button>
              <button type="button" className="g-btn green" onClick={() => judge("green")}>{g.names.green}</button>
              <button type="button" className="g-btn none" onClick={() => judge(null)}>ولا أحد</button>
            </div>
          </>
        ) : (
          <>
            {answering ? (
              <p className={`g-buzzed ${answering}`}>{qs.passedTo ? `الفرصة لـ${g.names[qs.passedTo]}` : `${g.names[answering]} ضغط الجرس!`}</p>
            ) : (
              <div className="g-buzzers">
                <button type="button" className="g-buzz red" onClick={() => buzz("red")}>جرس<br />{g.names.red}</button>
                <button type="button" className="g-buzz green" onClick={() => buzz("green")}>جرس<br />{g.names.green}</button>
              </div>
            )}
            <div className="q-helpers">
              <span>مساعدة {g.names[helperTeam]}:</span>
              {g.helperPicks[helperTeam].map((id) => {
                const used = g.helperUsed[helperTeam].includes(id);
                const blocked = (id === "extraClue" && qs.shown >= q.clues.length) || (id === "twoAnswers" && !!qs.twoAnswers);
                return (
                  <button key={id} type="button" className={`helper-chip small ${helperTeam}`} disabled={used || blocked} onClick={() => useHelper(helperTeam, id)} title={helperById(id).hint}>
                    <HelperIcon id={id} />
                    <span>{helperById(id).name}</span>
                  </button>
                );
              })}
            </div>
            <div className="g-actions">
              {qs.shown < q.clues.length && !qs.buzzed && (
                <button type="button" className="btn ghost" onClick={nextClue}>التلميح التالي ({formatNumber(qs.shown + 1)}/{formatNumber(q.clues.length)})</button>
              )}
              {qs.buzzed && !qs.passedTo && cfg.wrongAnswer.passToOtherTeam && (
                <button type="button" className="btn ghost" onClick={passToOther}>إجابة خاطئة ← {g.names[OTHER[qs.buzzed]]}</button>
              )}
              <button type="button" className="btn primary" onClick={reveal}>اكشف الجواب</button>
            </div>
            {!qs.buzzed && <p className="g-keys">على الكمبيوتر: حرف A لجرس {g.names.red}، وحرف L لجرس {g.names.green}.</p>}
          </>
        )}
      </article>
    </>,
  );
}
