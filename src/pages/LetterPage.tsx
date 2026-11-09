import { Link, useParams } from "react-router-dom";
import { isLetter, LETTERS } from "../lib/letters";
import { lettersFor, useCatalog } from "../hooks/useCatalog";
import { QuestionFeed } from "../components/QuestionFeed";
import { EmptyState } from "../components/States";
import { questionsLabel } from "../lib/format";

export function LetterPage() {
  const { letter } = useParams();
  const { letterCounts } = useCatalog();
  if (!isLetter(letter)) return <EmptyState text="هذا ليس حرفاً عربياً." />;

  const i = LETTERS.indexOf(letter);
  const prev = LETTERS[i - 1];
  const next = LETTERS[i + 1];
  const count = lettersFor(letterCounts)[letter] ?? 0;

  return (
    <>
      <header className="letter-hero">
        {prev ? <Link className="step" to={`/letter/${prev}`} aria-label={`الحرف السابق ${prev}`}>{prev}</Link> : <span />}
        <div className="letter-big-wrap">
          <span className="letter-big">{letter}</span>
          <p>أسئلة أجوبتها تبدأ بحرف «{letter}» · {questionsLabel(count)}</p>
        </div>
        {next ? <Link className="step" to={`/letter/${next}`} aria-label={`الحرف التالي ${next}`}>{next}</Link> : <span />}
      </header>
      <QuestionFeed letter={letter} showCategory emptyText={`ما فيه أسئلة مدققة لحرف «${letter}» بعد.`} />
    </>
  );
}
