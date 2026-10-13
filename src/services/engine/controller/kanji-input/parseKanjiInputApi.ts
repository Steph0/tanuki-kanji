import { KANJI_INPUT_MAX_LENGTH } from "../../domain/kanji-input/validation/KanjiInputValidationPolicy.ts";
import type { KanjiInputValidationStatus as DomainKanjiInputValidationStatusType } from "../../domain/kanji-input/validation/KanjiInputValidationStatus.ts";
import { KanjiInputValidationStatus as DomainKanjiInputValidationStatus } from "../../domain/kanji-input/validation/KanjiInputValidationStatus.ts";
import { parseKanjiInputControllerFactory } from "./parseKanjiInputController.ts";

export const KANJI_INPUT_VALIDATION_STATUS = DomainKanjiInputValidationStatus;

export type KanjiInputValidationStatus = DomainKanjiInputValidationStatusType;

export type { ParseKanjiInputResponse } from "./parseKanjiInputController.ts";
export { KANJI_INPUT_MAX_LENGTH };

export const parseKanjiInputAPI = parseKanjiInputControllerFactory();
