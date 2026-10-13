import type { TanukiKanjiEngine } from "./types.ts";
import { InvalidKanjiInput, KanjiInputStatus, safeParseKanjiInput } from "./validate.ts";

const FAKE_DELAY_MS = 5000;

export const runTanukiKanjiLesson: TanukiKanjiEngine = (kanjiUserInput) => {
  const parsedKanjiInput = safeParseKanjiInput(kanjiUserInput);
  if (parsedKanjiInput.status !== KanjiInputStatus.VALID) {
    throw new InvalidKanjiInput(parsedKanjiInput.status);
  }

  return new Promise((resolve) => {
    globalThis.setTimeout(() => resolve(`kanji lesson: ${parsedKanjiInput.value}`), FAKE_DELAY_MS);
  });
};
