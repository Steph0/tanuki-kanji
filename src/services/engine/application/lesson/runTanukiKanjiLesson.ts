import { KanjiInput } from "../../domain/kanji-input/KanjiInput.ts";
import type { KanjiInputValidationStatus as KanjiInputValidationStatusType } from "../../domain/kanji-input/validation/KanjiInputValidationStatus.ts";
import { KanjiInputValidationStatus } from "../../domain/kanji-input/validation/KanjiInputValidationStatus.ts";

export class InvalidKanjiInput extends Error {
  readonly status: Exclude<KanjiInputValidationStatusType, typeof KanjiInputValidationStatus.VALID>;

  constructor(status: Exclude<KanjiInputValidationStatusType, typeof KanjiInputValidationStatus.VALID>) {
    super("input validation failed");
    this.name = "InvalidKanjiInput";
    this.status = status;
  }
}

const FAKE_DELAY_MS = 5000;

function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    globalThis.setTimeout(resolve, ms);
  });
}

export function runTanukiKanjiLesson(
  kanjiUserInput: string,
  sleeper: (ms: number) => Promise<void> = sleep,
): Promise<string> {
  const createdKanjiInput = KanjiInput.create(kanjiUserInput);
  if (createdKanjiInput.status !== KanjiInputValidationStatus.VALID) {
    throw new InvalidKanjiInput(createdKanjiInput.status);
  }
  const delayed = sleeper(FAKE_DELAY_MS);
  return delayed.then(() => `kanji lesson: ${createdKanjiInput.value.value}`);
}
