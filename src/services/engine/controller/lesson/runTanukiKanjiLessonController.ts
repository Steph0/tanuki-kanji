import { KanjiInput } from "../../domain/kanji-input/KanjiInput.ts";
import type { KanjiInputValidationStatus as KanjiInputValidationStatusType } from "../../domain/kanji-input/validation/KanjiInputValidationStatus.ts";
import { KanjiInputValidationStatus } from "../../domain/kanji-input/validation/KanjiInputValidationStatus.ts";
import { getTanukiKanjiLesson } from "../../infrastructure/openrouter/getTanukiKanjiLesson.ts";

export type TanukiKanjiEngine = (kanjiUserInput: string) => Promise<string>;

export class InvalidKanjiInput extends Error {
  readonly status: Exclude<KanjiInputValidationStatusType, typeof KanjiInputValidationStatus.VALID>;

  constructor(status: Exclude<KanjiInputValidationStatusType, typeof KanjiInputValidationStatus.VALID>) {
    super("input validation failed");
    this.name = "InvalidKanjiInput";
    this.status = status;
  }
}

export async function runTanukiKanjiLesson(kanjiUserInput: string): Promise<string> {
  const createdKanjiInput = KanjiInput.create(kanjiUserInput);
  if (createdKanjiInput.status !== KanjiInputValidationStatus.VALID) {
    throw new InvalidKanjiInput(createdKanjiInput.status);
  }
  const lesson = await getTanukiKanjiLesson(createdKanjiInput.value);
  return lesson.content;
}
