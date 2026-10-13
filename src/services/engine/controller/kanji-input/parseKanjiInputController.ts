import type { KanjiInputResult } from "../../domain/kanji-input/KanjiInput.ts";
import { KanjiInput } from "../../domain/kanji-input/KanjiInput.ts";
import type { KanjiInputValidationStatus as DomainKanjiInputValidationStatusType } from "../../domain/kanji-input/validation/KanjiInputValidationStatus.ts";
import { KanjiInputValidationStatus as DomainKanjiInputValidationStatus } from "../../domain/kanji-input/validation/KanjiInputValidationStatus.ts";

export type ParseKanjiInputResponse =
  | { status: typeof DomainKanjiInputValidationStatus.VALID; value: string }
  | {
      status: Exclude<DomainKanjiInputValidationStatusType, typeof DomainKanjiInputValidationStatus.VALID>;
    };

export function parseKanjiInputControllerFactory(
  createKanjiInput: (raw: string) => KanjiInputResult = (raw) => KanjiInput.create(raw),
): (raw: string) => ParseKanjiInputResponse {
  return (raw: string) => {
    const result = createKanjiInput(raw);
    return mapToResponse(result);
  };
}

function mapToResponse(result: KanjiInputResult): ParseKanjiInputResponse {
  switch (result.status) {
    case DomainKanjiInputValidationStatus.VALID:
      return { status: result.status, value: result.value.value };
    case DomainKanjiInputValidationStatus.EMPTY:
    case DomainKanjiInputValidationStatus.INVALID_CHARACTERS:
    case DomainKanjiInputValidationStatus.MISSING_KANJI:
    case DomainKanjiInputValidationStatus.TOO_LONG:
      return { status: result.status };
    default: {
      const exhaustive: never = result;
      return exhaustive;
    }
  }
}
