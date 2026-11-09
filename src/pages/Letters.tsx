import { lettersFor, useCatalog } from "../hooks/useCatalog";
import { LetterGrid } from "../components/LetterGrid";

export function Letters() {
  const { letterCounts } = useCatalog();
  return (
    <>
      <header className="page-head">
        <p className="eyebrow">الحروف</p>
        <h1>اختر حرفاً</h1>
        <p className="lead">كل سؤال جوابه يبدأ بالحرف اللي تختاره.</p>
      </header>
      <LetterGrid counts={lettersFor(letterCounts)} hrefFor={(l) => `/letter/${l}`} />
    </>
  );
}
