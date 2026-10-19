import { parseKanjiInput } from "../../application/kanji-input/parseKanjiInput.ts";
import type { KanjiInputResult } from "../../domain/kanji-input/KanjiInput.ts";
import type { KanjiInputValidationStatus as KanjiInputValidationStatusType } from "../../domain/kanji-input/validation/KanjiInputValidationStatus.ts";
import { KanjiInputValidationStatus } from "../../domain/kanji-input/validation/KanjiInputValidationStatus.ts";

export type ParseKanjiInputResponse =
  | { status: typeof KanjiInputValidationStatus.VALID; value: string }
  | {
      status: Exclude<KanjiInputValidationStatusType, typeof KanjiInputValidationStatus.VALID>;
    };

export function parseKanjiInputControllerFactory(
  parse: (raw: string) => KanjiInputResult = (raw) => parseKanjiInput(raw),
): (raw: string) => ParseKanjiInputResponse {
  return (raw: string) => {
    const result = parse(raw);
    return mapToResponse(result);
  };
}

function mapToResponse(result: KanjiInputResult): ParseKanjiInputResponse {
  switch (result.status) {
    case KanjiInputValidationStatus.VALID:
      return { status: result.status, value: result.value.value };
    case KanjiInputValidationStatus.EMPTY:
    case KanjiInputValidationStatus.INVALID_CHARACTERS:
    case KanjiInputValidationStatus.MISSING_KANJI:
    case KanjiInputValidationStatus.TOO_LONG:
      return { status: result.status };
    default: {
      const exhaustive: never = result;
      return exhaustive;
    }
  }
}
