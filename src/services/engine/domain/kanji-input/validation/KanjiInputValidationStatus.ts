export const KanjiInputValidationStatus = {
  EMPTY: "empty",
  VALID: "valid",
  INVALID_CHARACTERS: "invalid-characters",
  MISSING_KANJI: "missing-kanji",
  TOO_LONG: "too-long",
} as const;

export type KanjiInputValidationStatus = (typeof KanjiInputValidationStatus)[keyof typeof KanjiInputValidationStatus];
