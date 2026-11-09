import { useState } from "react";
import { Link } from "react-router-dom";
import type { Category, Question } from "../lib/types";
import { formatNumber } from "../lib/format";
import { QuestionImage } from "./QuestionImage";

const DIFFICULTY = { 1: "سهل", 2: "متوسط", 3: "صعب" } as const;

type Props = { question: Question; number: number; category?: Category };

export function QuestionCard({ question, number, category }: Props) {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(0);
  const clues = question.clues;
  const answerId = `answer-${question.id}`;

  return (
    <article className={`q-card${open ? " open" : ""}`}>
      <div className="q-letter" aria-label={`الحرف ${question.letter}`}>
        {question.letter}
      </div>
      <div className="q-main">
        <div className="q-meta">
          <span className="q-num">س{formatNumber(number)}</span>
          {category && (
            <Link to={`/c/${category.slug}`} className="chip">
              {category.name}
            </Link>
          )}
          <span className={`diff d${question.difficulty}`}>
            <i /><i /><i />
            {DIFFICULTY[question.difficulty]}
          </span>
        </div>
        {question.image && (
          <QuestionImage image={question.image} step={shown} steps={clues.length} revealed={open} />
        )}
        <p className="q-text">{question.question}</p>
        {shown > 0 && (
          <ol className="q-clues">
            {clues.slice(0, shown).map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ol>
        )}
        <div className="q-actions">
          {shown < clues.length && !open && (
            <button type="button" className="hint" onClick={() => setShown((n) => n + 1)}>
              {shown === 0 ? "تلميح" : "التلميح التالي"} ({shown + 1}/{clues.length})
            </button>
          )}
        <button
          type="button"
          className="reveal"
          aria-expanded={open}
          aria-controls={answerId}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "إخفاء الجواب" : "اكشف الجواب"}
        </button>
        </div>
        <div id={answerId} className="q-answer" hidden={!open}>
          <span>الجواب</span>
          <strong>{question.answer}</strong>
          {question.accepted?.length ? <em className="q-alt">ويُقبل: {question.accepted.join("، ")}</em> : null}
          {question.source && (
            <a className="q-source" href={question.source} target="_blank" rel="noopener noreferrer">
              المصدر ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
