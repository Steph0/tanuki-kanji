import { describe, expect, test } from "vitest";
import { normalizeKanjiInput } from "./normalize.ts";

describe("normalizeKanjiInput", () => {
  test.each([
    ["spaces", " 森 ", "森"],
    ["tabs", "\t森\t", "森"],
    ["newlines", "\n森\n", "森"],
    ["non-breaking spaces", "\u00a0森\u00a0", "森"],
    ["ideographic spaces", "\u3000森\u3000", "森"],
    ["mixed edge spaces", " \t\u00a0\u3000森\u3000\u00a0\t ", "森"],
  ] as Array<[string, string, string]>)("trims %s", (_label, raw, expected) => {
    expect(normalizeKanjiInput(raw)).toBe(expected);
  });

  test("spaces-only counts as empty", () => {
    expect(normalizeKanjiInput("   ")).toBe("");
  });

  test("keeps spaces inside the word for the validator to reject", () => {
    expect(normalizeKanjiInput("森 森")).toBe("森 森");
  });

  test("is stable when applied twice", () => {
    expect(normalizeKanjiInput(normalizeKanjiInput(" 森 "))).toBe("森");
  });
});
