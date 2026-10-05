import type { NormalizedKanjiInput } from "./normalize.ts";

const JAPANESE_WORD_PATTERN = /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\u3005]+$/u;

const EXCLUDED_ITERATION_MARKS_PATTERN = /[\u309D\u309E\u30FD\u30FE]/u;

const KANJI_PATTERN = /[\u4E00-\u9FFF]/u;

export const KanjiInputStatus = {
  EMPTY: "empty",
  VALID: "valid",
  INVALID_CHARACTERS: "invalid-characters",
  MISSING_KANJI: "missing-kanji",
} as const;

export type KanjiInputStatus = (typeof KanjiInputStatus)[keyof typeof KanjiInputStatus];

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

export function safeParseKanjiInput(normalizedKanjiInput: NormalizedKanjiInput): KanjiInputParseResult {
  const status = validateKanjiInput(normalizedKanjiInput);
  if (status === KanjiInputStatus.VALID) {
    return { status, value: normalizedKanjiInput as ValidKanjiInput };
  }
  return { status };
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

function validateKanjiInput(normalizedKanjiInput: NormalizedKanjiInput): KanjiInputStatus {
  if (isEmpty(normalizedKanjiInput)) {
    return KanjiInputStatus.EMPTY;
  }

  if (!hasOnlyJapaneseCharacters(normalizedKanjiInput)) {
    return KanjiInputStatus.INVALID_CHARACTERS;
  }

  if (hasExcludedIterationMarks(normalizedKanjiInput)) {
    return KanjiInputStatus.INVALID_CHARACTERS;
  }

  if (!containsKanji(normalizedKanjiInput)) {
    return KanjiInputStatus.MISSING_KANJI;
  }

  return KanjiInputStatus.VALID;
}
