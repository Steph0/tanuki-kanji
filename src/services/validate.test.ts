import { describe, expect, test } from "vitest";
import { normalizeKanjiInput } from "./normalize.ts";
import { InvalidKanjiInput, KANJI_INPUT_MAX_LENGTH, KanjiInputStatus, safeParseKanjiInput } from "./validate.ts";

function parseStatus(raw: string) {
  return safeParseKanjiInput(normalizeKanjiInput(raw)).status;
}

describe("safeParseKanjiInput", () => {
  test.each(["森", "狸", "漢字", "ひらがな森", "カタカナ森", "漢字々"])("accepts %s", (raw) => {
    expect(parseStatus(raw)).toBe(KanjiInputStatus.VALID);
  });

  test("hands back the proven value when valid", () => {
    const parsed = safeParseKanjiInput(normalizeKanjiInput(" 森 "));
    expect(parsed.status).toBe(KanjiInputStatus.VALID);
    if (parsed.status === KanjiInputStatus.VALID) {
      expect(parsed.value).toBe("森");
    }
  });

  test.each(["ソ", "ゾ"])("accepts katakana %s as kana-only", (raw) => {
    expect(parseStatus(raw)).toBe(KanjiInputStatus.MISSING_KANJI);
  });

  test("ソ and ゾ stay allowed next to kanji", () => {
    expect(parseStatus("ソゾ森")).toBe(KanjiInputStatus.VALID);
  });

  test("empty stays silent", () => {
    expect(parseStatus("")).toBe(KanjiInputStatus.EMPTY);
    expect(parseStatus("   ")).toBe(KanjiInputStatus.EMPTY);
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
    expect(parseStatus(raw)).toBe(KanjiInputStatus.INVALID_CHARACTERS);
  });

  test("bad characters win over missing kanji", () => {
    expect(parseStatus("hello")).toBe(KanjiInputStatus.INVALID_CHARACTERS);
  });

  test.each(["ひらがな", "カタカナ", "ラーメン", "々", "ひらがな々"])("rejects kana-only %s", (raw) => {
    expect(parseStatus(raw)).toBe(KanjiInputStatus.MISSING_KANJI);
  });

  test("accepts a full length word at the limit", () => {
    expect(parseStatus("森".repeat(KANJI_INPUT_MAX_LENGTH))).toBe(KanjiInputStatus.VALID);
  });

  test("flags a word past the limit as too long", () => {
    expect(parseStatus("森".repeat(KANJI_INPUT_MAX_LENGTH + 1))).toBe(KanjiInputStatus.TOO_LONG);
  });

  test("length wins over bad characters past the limit", () => {
    expect(parseStatus(`hello${"森".repeat(KANJI_INPUT_MAX_LENGTH)}`)).toBe(KanjiInputStatus.TOO_LONG);
  });

  test("hands back only the status when too long", () => {
    const parsed = safeParseKanjiInput(normalizeKanjiInput("森".repeat(KANJI_INPUT_MAX_LENGTH + 1)));
    expect(parsed).toEqual({ status: KanjiInputStatus.TOO_LONG });
  });

  test("hands back only the status when invalid", () => {
    const parsed = safeParseKanjiInput(normalizeKanjiInput("hello"));
    expect(parsed).toEqual({ status: KanjiInputStatus.INVALID_CHARACTERS });
  });

  test("ignores the repetition mark when looking for kanji", () => {
    expect(parseStatus("々")).toBe(KanjiInputStatus.MISSING_KANJI);
  });
});

describe("InvalidKanjiInput", () => {
  test("carries only the failing status", () => {
    const error = new InvalidKanjiInput(KanjiInputStatus.MISSING_KANJI);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("InvalidKanjiInput");
    expect(error.status).toBe(KanjiInputStatus.MISSING_KANJI);
    expect(error.message).toBe("input validation failed");
  });
});
