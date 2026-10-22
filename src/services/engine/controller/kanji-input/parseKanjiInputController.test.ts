import { afterEach, describe, expect, test, vi } from "vitest";
import { KanjiInput } from "../../domain/kanji-input/KanjiInput.ts";
import { KanjiInputValidationStatus as KANJI_INPUT_VALIDATION_STATUS } from "../../domain/kanji-input/validation/KanjiInputValidationStatus.ts";
import { parseKanjiInput } from "./parseKanjiInputController.ts";

describe("parseKanjiInputController unit", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("response contract", () => {
    describe("nominal", () => {
      test("maps a valid kanji word to a plain string value", () => {
        expect(parseKanjiInput("森")).toEqual({ status: KANJI_INPUT_VALIDATION_STATUS.VALID, value: "森" });
      });
    });

    describe("errors", () => {
      test.each([
        ["", KANJI_INPUT_VALIDATION_STATUS.EMPTY],
        ["hello", KANJI_INPUT_VALIDATION_STATUS.INVALID_CHARACTERS],
        ["かな", KANJI_INPUT_VALIDATION_STATUS.MISSING_KANJI],
        ["森".repeat(22), KANJI_INPUT_VALIDATION_STATUS.TOO_LONG],
      ])("maps %s to the %s status", (raw, status) => {
        const result = parseKanjiInput(raw);

        expect(result).toEqual({ status });
        expect("value" in result).toBe(false);
      });
    });
  });

  describe("interaction with the domain", () => {
    test("hands the raw text to the creator untouched", () => {
      const createSpy = vi.spyOn(KanjiInput, "create");

      parseKanjiInput("  森  ");

      expect(createSpy).toHaveBeenCalledWith("  森  ");
    });
  });
});
