import { useEffect } from "preact/hooks";
import { useTanukiKanjiLesson } from "../../hooks/useTanukiKanjiServices.tsx";

export function useLoadingPage(kanjiUserInput: string, onDone: (tanukiKanjiLessonOutput: string) => void) {
  const lesson = useTanukiKanjiLesson();

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const tanukiKanjiLessonOutput = await lesson(kanjiUserInput);
        if (cancelled) {
          console.warn("Kanji research got cancelled. Result will not be displayed.");
          return;
        }
        onDone(tanukiKanjiLessonOutput);
      } catch (error) {
        if (cancelled) {
          console.warn("Kanji research got cancelled. Silently failing.");
          return;
        }
        console.error(error);
        onDone("error");
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [lesson, kanjiUserInput, onDone]);
}
