import { runTanukiKanjiLesson } from "../../application/lesson/runTanukiKanjiLesson.ts";

export type TanukiKanjiEngine = (kanjiUserInput: string) => Promise<string>;

export { InvalidKanjiInput } from "../../application/lesson/runTanukiKanjiLesson.ts";

export function runTanukiKanjiLessonControllerFactory(
  run: TanukiKanjiEngine = (kanjiUserInput) => runTanukiKanjiLesson(kanjiUserInput),
): TanukiKanjiEngine {
  return (kanjiUserInput: string) => run(kanjiUserInput);
}
