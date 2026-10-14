import { runTanukiKanjiLessonControllerFactory, type TanukiKanjiEngine } from "./runTanukiKanjiLessonController.ts";

export type { TanukiKanjiEngine };

export const runTanukiKanjiLessonAPI: TanukiKanjiEngine = runTanukiKanjiLessonControllerFactory();
