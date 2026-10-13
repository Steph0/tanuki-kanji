import { describe, expect, test } from "vitest";
import { KanjiInput } from "./KanjiInput.ts";
import { KANJI_INPUT_MAX_LENGTH } from "./validation/KanjiInputValidationPolicy.ts";
import { KanjiInputValidationStatus } from "./validation/KanjiInputValidationStatus.ts";

describe("KanjiInput", () => {
  test("hands back an instance with its proven text when valid", () => {
    const result = KanjiInput.create("森");
    expect(result.status).toBe(KanjiInputValidationStatus.VALID);
    if (result.status === KanjiInputValidationStatus.VALID) {
      expect(result.value).toBeInstanceOf(KanjiInput);
      expect(result.value.value).toBe("森");
    }
  });

  test("padded input behaves like trimmed input", () => {
    const padded = KanjiInput.create("  森  ");
    expect(padded.status).toBe(KanjiInputValidationStatus.VALID);
    if (padded.status === KanjiInputValidationStatus.VALID) {
      expect(padded.value.value).toBe("森");
    }
  });

  test("flags spaces-only as empty with no value", () => {
    expect(KanjiInput.create("   ")).toEqual({ status: KanjiInputValidationStatus.EMPTY });
  });

  test("flags foreign characters with no value", () => {
    expect(KanjiInput.create("hello")).toEqual({ status: KanjiInputValidationStatus.INVALID_CHARACTERS });
  });

  test("flags kana-only with no value", () => {
    expect(KanjiInput.create("ひらがな")).toEqual({ status: KanjiInputValidationStatus.MISSING_KANJI });
  });

  test("flags an overlong word with no value", () => {
    expect(KanjiInput.create("森".repeat(KANJI_INPUT_MAX_LENGTH + 1))).toEqual({
      status: KanjiInputValidationStatus.TOO_LONG,
    });
  });
});
