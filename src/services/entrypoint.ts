import { normalizeKanjiInput } from "./normalize.ts";
import type { TanukiKanjiEngine } from "./types.ts";

const FAKE_DELAY_MS = 1000;

export const runTanukiKanjiLesson: TanukiKanjiEngine = (kanjiUserInput) => {
  void normalizeKanjiInput(kanjiUserInput);
  return new Promise((resolve) => {
    globalThis.setTimeout(() => resolve("kanji lesson"), FAKE_DELAY_MS);
  });
};
