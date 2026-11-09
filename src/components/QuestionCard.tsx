import { useState } from "react";
import { Link } from "react-router-dom";
import type { Category, Question } from "../lib/types";
import { formatNumber } from "../lib/format";

const DIFFICULTY = { 1: "سهل", 2: "متوسط", 3: "صعب" } as const;

type Props = { question: Question; number: number; category?: Category };

export function QuestionCard({ question, number, category }: Props) {
  const [open, setOpen] = useState(false);
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
        <p className="q-text">{question.question}</p>
        <button
          type="button"
          className="reveal"
          aria-expanded={open}
          aria-controls={answerId}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "إخفاء الجواب" : "اكشف الجواب"}
        </button>
        <div id={answerId} className="q-answer" hidden={!open}>
          <span>الجواب</span>
          <strong>{question.answer}</strong>
        </div>
      </div>
    </article>
  );
}
