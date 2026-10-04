export function ResultPage({ tanukiKanjiLessonOutput }: { tanukiKanjiLessonOutput: string }) {
  return <p aria-live="polite">{tanukiKanjiLessonOutput}</p>;
}
