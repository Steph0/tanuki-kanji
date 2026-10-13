import type { NormalizedKanjiInput } from "../normalizeKanjiInput.ts";
import { KANJI_INPUT_MAX_LENGTH } from "./KanjiInputValidationPolicy.ts";
import { KanjiInputValidationStatus } from "./KanjiInputValidationStatus.ts";

const JAPANESE_WORD_PATTERN = /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\u3005]+$/u;

const EXCLUDED_ITERATION_MARKS_PATTERN = /[\u309D\u309E\u30FD\u30FE]/u;

const KANJI_PATTERN = /[\u4E00-\u9FFF]/u;

export function validateKanjiInput(normalizedKanjiInput: NormalizedKanjiInput): KanjiInputValidationStatus {
  if (isEmpty(normalizedKanjiInput)) {
    return KanjiInputValidationStatus.EMPTY;
  }

  if (isOverKanjiInputLimit(normalizedKanjiInput)) {
    return KanjiInputValidationStatus.TOO_LONG;
  }

  if (!hasOnlyJapaneseCharacters(normalizedKanjiInput)) {
    return KanjiInputValidationStatus.INVALID_CHARACTERS;
  }

  if (hasExcludedIterationMarks(normalizedKanjiInput)) {
    return KanjiInputValidationStatus.INVALID_CHARACTERS;
  }

  if (!containsKanji(normalizedKanjiInput)) {
    return KanjiInputValidationStatus.MISSING_KANJI;
  }

  return KanjiInputValidationStatus.VALID;
}

function isEmpty(normalizedKanjiInput: NormalizedKanjiInput): boolean {
  return normalizedKanjiInput === "";
}

function hasOnlyJapaneseCharacters(normalizedKanjiInput: NormalizedKanjiInput): boolean {
  return JAPANESE_WORD_PATTERN.test(normalizedKanjiInput);
}

function hasExcludedIterationMarks(normalizedKanjiInput: NormalizedKanjiInput): boolean {
  return EXCLUDED_ITERATION_MARKS_PATTERN.test(normalizedKanjiInput);
}

function containsKanji(normalizedKanjiInput: NormalizedKanjiInput): boolean {
  return KANJI_PATTERN.test(normalizedKanjiInput);
}

function isOverKanjiInputLimit(normalizedKanjiInput: NormalizedKanjiInput): boolean {
  return normalizedKanjiInput.length > KANJI_INPUT_MAX_LENGTH;
}
