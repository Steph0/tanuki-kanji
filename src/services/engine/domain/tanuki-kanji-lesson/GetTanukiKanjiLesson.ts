import type { TanukiKanjiLesson } from "./TanukiKanjiLesson.ts";

export type GetTanukiKanjiLesson = (provenKanjiWord: string) => Promise<TanukiKanjiLesson>;
