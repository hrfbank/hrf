export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="feed" aria-busy="true" aria-label="جارٍ التحميل">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton" />
      ))}
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="state">
      <span className="state-glyph" aria-hidden="true">؟</span>
      <p>{text}</p>
    </div>
  );
}

export function ErrorState({ error }: { error: Error }) {
  return (
    <div className="state error" role="alert">
      <span className="state-glyph" aria-hidden="true">!</span>
      <p>تعذّر تحميل البيانات. حاول مرة ثانية بعد قليل.</p>
      <code>{error.message}</code>
    </div>
  );
}
