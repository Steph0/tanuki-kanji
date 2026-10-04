import { useLoadingPage } from "./useLoadingPage.ts";

type LoadingPageProps = {
  kanjiUserInput: string;
  onDone: (tanukiKanjiLessonOutput: string) => void;
};

export function LoadingPage({ kanjiUserInput, onDone }: LoadingPageProps) {
  useLoadingPage(kanjiUserInput, onDone);

  return (
    <p aria-live="polite" aria-busy="true">
      Loading...
    </p>
  );
}
