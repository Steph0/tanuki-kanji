import { KanjiInput } from "./engine/domain/kanji-input/KanjiInput.ts";
import { KanjiInputValidationStatus } from "./engine/domain/kanji-input/validation/KanjiInputValidationStatus.ts";
import type { TanukiKanjiEngine } from "./types.ts";

const FAKE_DELAY_MS = 5000;

export class InvalidKanjiInput extends Error {
  readonly status: Exclude<KanjiInputValidationStatus, typeof KanjiInputValidationStatus.VALID>;

  constructor(status: Exclude<KanjiInputValidationStatus, typeof KanjiInputValidationStatus.VALID>) {
    super("input validation failed");
    this.name = "InvalidKanjiInput";
    this.status = status;
  }
}

export const runTanukiKanjiLesson: TanukiKanjiEngine = (kanjiUserInput) => {
  const createdKanjiInput = KanjiInput.create(kanjiUserInput);
  if (createdKanjiInput.status !== KanjiInputValidationStatus.VALID) {
    throw new InvalidKanjiInput(createdKanjiInput.status);
  }

  return new Promise((resolve) => {
    globalThis.setTimeout(() => resolve(`kanji lesson: ${createdKanjiInput.value.value}`), FAKE_DELAY_MS);
  });
};
