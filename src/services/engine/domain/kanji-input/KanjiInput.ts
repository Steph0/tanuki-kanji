import { normalizeKanjiInput } from "./normalizeKanjiInput.ts";
import { KanjiInputValidationStatus } from "./validation/KanjiInputValidationStatus.ts";
import { validateKanjiInput } from "./validation/validateKanjiInput.ts";

export type KanjiInputResult =
  | { status: typeof KanjiInputValidationStatus.VALID; value: KanjiInput }
  | { status: Exclude<KanjiInputValidationStatus, typeof KanjiInputValidationStatus.VALID> };

export class KanjiInput {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(rawKanjiInput: string): KanjiInputResult {
    const normalizedKanjiInput = normalizeKanjiInput(rawKanjiInput);
    const status = validateKanjiInput(normalizedKanjiInput);
    if (status === KanjiInputValidationStatus.VALID) {
      return { status, value: new KanjiInput(normalizedKanjiInput) };
    }
    return { status };
  }
}
