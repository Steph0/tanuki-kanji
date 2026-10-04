import { useEffect } from "preact/hooks";
import { useTanukiKanjiEngine } from "../../hooks/useTanukiKanjiEngine.tsx";

export function useLoadingPage(kanjiUserInput: string, onDone: (tanukiKanjiLessonOutput: string) => void) {
  const engine = useTanukiKanjiEngine();

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const tanukiKanjiLessonOutput = await engine(kanjiUserInput);
        if (cancelled) {
          console.warn("Kanji research got cancelled. Result will not be displayed.");
          return;
        }
        onDone(tanukiKanjiLessonOutput);
      } catch {
        if (cancelled) {
          console.warn("Kanji research got cancelled. Silently failing.");
          return;
        }
        onDone("error");
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [engine, kanjiUserInput, onDone]);
}
