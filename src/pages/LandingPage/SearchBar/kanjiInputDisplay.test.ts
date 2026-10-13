import { describe, expect, test } from "vitest";
import { KANJI_INPUT_MAX_LENGTH } from "../../../services/engine/controller/kanji-input/parseKanjiInputApi.ts";
import { isKanjiSubmitBlocked, resolveKanjiInputDisplay, truncateKanjiInput } from "./kanjiInputDisplay.ts";

describe("truncateKanjiInput", () => {
  test("keeps only the first characters past the limit", () => {
    expect(truncateKanjiInput("狸".repeat(KANJI_INPUT_MAX_LENGTH + 1))).toBe("狸".repeat(KANJI_INPUT_MAX_LENGTH));
  });

  test("leaves a word at the limit untouched", () => {
    expect(truncateKanjiInput("狸".repeat(KANJI_INPUT_MAX_LENGTH))).toBe("狸".repeat(KANJI_INPUT_MAX_LENGTH));
  });

  test("leaves a short word untouched", () => {
    expect(truncateKanjiInput("狸")).toBe("狸");
  });
});

describe("resolveKanjiInputDisplay", () => {
  test("stays clean for a valid kanji word", () => {
    expect(resolveKanjiInputDisplay("狸")).toEqual({ tone: "clean", message: null });
  });

  test("stays clean at the limit", () => {
    expect(resolveKanjiInputDisplay("狸".repeat(KANJI_INPUT_MAX_LENGTH))).toEqual({ tone: "clean", message: null });
  });

  test("stays silent when empty", () => {
    expect(resolveKanjiInputDisplay("")).toEqual({ tone: "empty", message: null });
  });

  test("stays silent for a short blank of spaces", () => {
    expect(resolveKanjiInputDisplay(" ".repeat(KANJI_INPUT_MAX_LENGTH))).toEqual({ tone: "empty", message: null });
  });

  test("warns for a long blank of spaces", () => {
    expect(resolveKanjiInputDisplay(" ".repeat(KANJI_INPUT_MAX_LENGTH + 1))).toEqual({
      tone: "warning",
      message: "Whoa, long one! Tanuki keeps first 21 chars.",
    });
  });

  test("warns past the limit when the cut stays valid", () => {
    expect(resolveKanjiInputDisplay("狸".repeat(KANJI_INPUT_MAX_LENGTH + 1))).toEqual({
      tone: "warning",
      message: "Whoa, long one! Tanuki keeps first 21 chars.",
    });
  });

  test("warns when only the tail past the limit is bad", () => {
    expect(resolveKanjiInputDisplay(`${"狸".repeat(KANJI_INPUT_MAX_LENGTH)}!`)).toEqual({
      tone: "warning",
      message: "Whoa, long one! Tanuki keeps first 21 chars.",
    });
  });

  test("errors on foreign characters under the limit", () => {
    expect(resolveKanjiInputDisplay("hello")).toEqual({
      tone: "error",
      message: "Only Kanji, hiragana and katakana characters are allowed",
    });
  });

  test("errors live when the cut keeps foreign characters", () => {
    expect(resolveKanjiInputDisplay("ab".repeat(KANJI_INPUT_MAX_LENGTH))).toEqual({
      tone: "error",
      message: "Only Kanji, hiragana and katakana characters are allowed",
    });
  });

  test("errors on kana-only input under the limit", () => {
    expect(resolveKanjiInputDisplay("ひらがな")).toEqual({ tone: "error", message: "Enter at least one kanji." });
  });

  test("errors live when the cut stays kana-only", () => {
    expect(resolveKanjiInputDisplay(`${"あ".repeat(KANJI_INPUT_MAX_LENGTH)}狸`)).toEqual({
      tone: "error",
      message: "Enter at least one kanji.",
    });
  });
});

describe("isKanjiSubmitBlocked", () => {
  test("lets clean input submit", () => {
    expect(isKanjiSubmitBlocked("clean")).toBe(false);
  });

  test("lets warned input submit", () => {
    expect(isKanjiSubmitBlocked("warning")).toBe(false);
  });

  test("blocks errored input", () => {
    expect(isKanjiSubmitBlocked("error")).toBe(true);
  });

  test("blocks silent input", () => {
    expect(isKanjiSubmitBlocked("empty")).toBe(true);
  });
});
