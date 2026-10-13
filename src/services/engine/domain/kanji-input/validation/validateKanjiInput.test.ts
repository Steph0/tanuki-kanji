import { describe, expect, test } from "vitest";
import { normalizeKanjiInput } from "../normalizeKanjiInput.ts";
import { KANJI_INPUT_MAX_LENGTH } from "./KanjiInputValidationPolicy.ts";
import { KanjiInputValidationStatus } from "./KanjiInputValidationStatus.ts";
import { validateKanjiInput } from "./validateKanjiInput.ts";

function classifyStatus(raw: string) {
  return validateKanjiInput(normalizeKanjiInput(raw));
}

describe("validateKanjiInput", () => {
  test.each(["森", "狸", "漢字", "ひらがな森", "カタカナ森", "漢字々"])("accepts %s as valid", (raw) => {
    expect(classifyStatus(raw)).toBe(KanjiInputValidationStatus.VALID);
  });

  test("padded input behaves like trimmed input", () => {
    expect(classifyStatus("  森  ")).toBe(classifyStatus("森"));
  });

  test("ソ and ゾ stay allowed next to kanji", () => {
    expect(classifyStatus("ソゾ森")).toBe(KanjiInputValidationStatus.VALID);
  });

  test.each(["", "   "])("flags %s as empty", (raw) => {
    expect(classifyStatus(raw)).toBe(KanjiInputValidationStatus.EMPTY);
  });

  test.each([
    "hello",
    "森123",
    "森 森",
    "森、",
    "森。",
    "<script>",
    "alert('x')",
    "森ゝ",
    "森ゞ",
    "森ヽ",
    "森ヾ",
    "森ｱ",
  ])("rejects characters in %s", (raw) => {
    expect(classifyStatus(raw)).toBe(KanjiInputValidationStatus.INVALID_CHARACTERS);
  });

  test("bad characters win over missing kanji", () => {
    expect(classifyStatus("hello")).toBe(KanjiInputValidationStatus.INVALID_CHARACTERS);
  });

  test.each(["ひらがな", "カタカナ", "ラーメン", "々", "ひらがな々", "ソ", "ゾ"])("rejects kana-only %s", (raw) => {
    expect(classifyStatus(raw)).toBe(KanjiInputValidationStatus.MISSING_KANJI);
  });

  test("ignores the repetition mark when looking for kanji", () => {
    expect(classifyStatus("々")).toBe(KanjiInputValidationStatus.MISSING_KANJI);
  });

  test("accepts a full length word at the limit", () => {
    expect(classifyStatus("森".repeat(KANJI_INPUT_MAX_LENGTH))).toBe(KanjiInputValidationStatus.VALID);
  });

  test("flags a word past the limit as too long", () => {
    expect(classifyStatus("森".repeat(KANJI_INPUT_MAX_LENGTH + 1))).toBe(KanjiInputValidationStatus.TOO_LONG);
  });

  test("length wins over bad characters past the limit", () => {
    expect(classifyStatus(`hello${"森".repeat(KANJI_INPUT_MAX_LENGTH)}`)).toBe(KanjiInputValidationStatus.TOO_LONG);
  });
});
