import { describe, expect, test } from "vitest";
import { KanjiInputValidationStatus } from "../../domain/kanji-input/validation/KanjiInputValidationStatus.ts";
import { parseKanjiInput } from "./parseKanjiInput.ts";

describe("parseKanjiInput use case unit", () => {
  describe("domain handoff", () => {
    test("answers the proven word for a valid input", () => {
      const result = parseKanjiInput("森");
      if (result.status !== KanjiInputValidationStatus.VALID) {
        throw new Error("valid fixture failed to create");
      }
      expect(result.value.value).toBe("森");
    });

    test.each([
      ["", KanjiInputValidationStatus.EMPTY],
      ["hello", KanjiInputValidationStatus.INVALID_CHARACTERS],
      ["かな", KanjiInputValidationStatus.MISSING_KANJI],
      ["森".repeat(22), KanjiInputValidationStatus.TOO_LONG],
    ])("maps the %s input to the %s status", (raw, status) => {
      const result = parseKanjiInput(raw);
      expect(result).toEqual({ status });
      expect("value" in result).toBe(false);
    });

    test("cleans the raw text through the domain before answering", () => {
      const result = parseKanjiInput("  森  ");
      if (result.status !== KanjiInputValidationStatus.VALID) {
        throw new Error("valid fixture failed to create");
      }
      expect(result.value.value).toBe("森");
    });
  });
});
