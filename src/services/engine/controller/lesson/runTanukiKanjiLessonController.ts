import type { KanjiInputResult } from "../../domain/kanji-input/KanjiInput.ts";
import { KanjiInput } from "../../domain/kanji-input/KanjiInput.ts";
import type { KanjiInputValidationStatus as DomainKanjiInputValidationStatusType } from "../../domain/kanji-input/validation/KanjiInputValidationStatus.ts";
import { KanjiInputValidationStatus as DomainKanjiInputValidationStatus } from "../../domain/kanji-input/validation/KanjiInputValidationStatus.ts";

export type TanukiKanjiEngine = (kanjiUserInput: string) => Promise<string>;

export class InvalidKanjiInput extends Error {
  readonly status: Exclude<DomainKanjiInputValidationStatusType, typeof DomainKanjiInputValidationStatus.VALID>;

  constructor(status: Exclude<DomainKanjiInputValidationStatusType, typeof DomainKanjiInputValidationStatus.VALID>) {
    super("input validation failed");
    this.name = "InvalidKanjiInput";
    this.status = status;
  }
}

const FAKE_DELAY_MS = 5000;

export function runTanukiKanjiLessonControllerFactory(
  createKanjiInput: (raw: string) => KanjiInputResult = (raw) => KanjiInput.create(raw),
  sleeper: (ms: number) => Promise<void> = (ms) => new Promise<void>((resolve) => globalThis.setTimeout(resolve, ms)),
): TanukiKanjiEngine {
  return (kanjiUserInput: string) => {
    const createdKanjiInput = createKanjiInput(kanjiUserInput);
    if (createdKanjiInput.status !== DomainKanjiInputValidationStatus.VALID) {
      throw new InvalidKanjiInput(createdKanjiInput.status);
    }
    return sleeper(FAKE_DELAY_MS).then(() => `kanji lesson: ${createdKanjiInput.value.value}`);
  };
}
