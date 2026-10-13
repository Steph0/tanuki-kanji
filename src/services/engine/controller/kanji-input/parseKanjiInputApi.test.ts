import { describe, expect, test } from "vitest";
import { KANJI_INPUT_VALIDATION_STATUS, parseKanjiInputAPI } from "./parseKanjiInputApi.ts";

describe("parseKanjiInputApi integration", () => {
  test("wires the engine end to end", () => {
    expect(parseKanjiInputAPI("森")).toEqual({ status: KANJI_INPUT_VALIDATION_STATUS.VALID, value: "森" });
    expect(parseKanjiInputAPI("hello")).toEqual({ status: KANJI_INPUT_VALIDATION_STATUS.INVALID_CHARACTERS });
  });
});
