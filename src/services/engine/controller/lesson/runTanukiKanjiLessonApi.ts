import { runTanukiKanjiLesson } from "./runTanukiKanjiLessonController.ts";

export type TanukiKanjiLessonAPI = (kanjiUserInput: string) => Promise<string>;

export const tanukiKanjiLessonAPI: TanukiKanjiLessonAPI = runTanukiKanjiLesson;
