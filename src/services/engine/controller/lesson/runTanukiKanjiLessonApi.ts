import { runTanukiKanjiLesson, type TanukiKanjiEngine } from "./runTanukiKanjiLessonController.ts";

export type { TanukiKanjiEngine };

export const runTanukiKanjiLessonAPI: TanukiKanjiEngine = runTanukiKanjiLesson;
