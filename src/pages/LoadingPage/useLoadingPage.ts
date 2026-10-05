import { useEffect } from "preact/hooks";
import { useTanukiKanjiEngine } from "../../hooks/useTanukiKanjiEngine.tsx";
import { InvalidKanjiInput } from "../../services/validate.ts";

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
      } catch (error) {
        if (cancelled) {
          console.warn("Kanji research got cancelled. Silently failing.");
          return;
        }
        if (error instanceof InvalidKanjiInput) {
          console.warn("Invalid kanji input reached the lesson engine.");
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
