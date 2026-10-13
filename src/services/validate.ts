import { KANJI_INPUT_MAX_LENGTH } from "./engine/domain/kanji-input/validation/KanjiInputValidationPolicy.ts";
import { KanjiInputValidationStatus as KanjiInputStatus } from "./engine/domain/kanji-input/validation/KanjiInputValidationStatus.ts";
import { validateKanjiInput } from "./engine/domain/kanji-input/validation/validateKanjiInput.ts";
import type { NormalizedKanjiInput } from "./normalize.ts";
import { normalizeKanjiInput } from "./normalize.ts";

export { KANJI_INPUT_MAX_LENGTH, KanjiInputStatus };

export type ValidKanjiInput = NormalizedKanjiInput & { readonly validKanjiInput: unique symbol };

export class InvalidKanjiInput extends Error {
  readonly status: Exclude<KanjiInputStatus, typeof KanjiInputStatus.VALID>;

  constructor(status: Exclude<KanjiInputStatus, typeof KanjiInputStatus.VALID>) {
    super("input validation failed");
    this.name = "InvalidKanjiInput";
    this.status = status;
  }
}

export type KanjiInputParseResult =
  | { status: typeof KanjiInputStatus.VALID; value: ValidKanjiInput }
  | { status: Exclude<KanjiInputStatus, typeof KanjiInputStatus.VALID> };

export function safeParseKanjiInput(rawKanjiInput: string): KanjiInputParseResult {
  const normalizedKanjiInput = normalizeKanjiInput(rawKanjiInput);
  const status = validateKanjiInput(normalizedKanjiInput);
  if (status === KanjiInputStatus.VALID) {
    return { status, value: normalizedKanjiInput as ValidKanjiInput };
  }
  return { status };
}
