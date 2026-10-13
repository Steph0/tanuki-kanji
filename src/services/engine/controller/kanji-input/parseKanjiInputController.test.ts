import { describe, expect, test } from "vitest";
import { KanjiInput } from "../../domain/kanji-input/KanjiInput.ts";
import type { KanjiInputValidationStatus } from "./parseKanjiInputApi.ts";
import { KANJI_INPUT_VALIDATION_STATUS } from "./parseKanjiInputApi.ts";
import { parseKanjiInputControllerFactory } from "./parseKanjiInputController.ts";

function stubFailure(status: Exclude<KanjiInputValidationStatus, typeof KANJI_INPUT_VALIDATION_STATUS.VALID>) {
  return () => ({ status }) as const;
}

describe("parseKanjiInputController unit", () => {
  describe("response contract", () => {
    describe("nominal", () => {
      test("maps a valid domain answer to a plain string value", () => {
        const created = KanjiInput.create("森");
        if (created.status !== KANJI_INPUT_VALIDATION_STATUS.VALID) {
          throw new Error("valid fixture failed to create");
        }
        const parse = parseKanjiInputControllerFactory(() => created);
        expect(parse("anything")).toEqual({ status: KANJI_INPUT_VALIDATION_STATUS.VALID, value: "森" });
      });
    });

    describe("errors", () => {
      test.each([
        KANJI_INPUT_VALIDATION_STATUS.EMPTY,
        KANJI_INPUT_VALIDATION_STATUS.INVALID_CHARACTERS,
        KANJI_INPUT_VALIDATION_STATUS.MISSING_KANJI,
        KANJI_INPUT_VALIDATION_STATUS.TOO_LONG,
      ])("maps %s to a status-only response", (status) => {
        const parse = parseKanjiInputControllerFactory(stubFailure(status));
        const result = parse("anything");
        expect(result).toEqual({ status });
        expect("value" in result).toBe(false);
      });
    });
  });

  describe("interaction with creator", () => {
    test("calls the injected creator with the raw text untouched", () => {
      let seen: string | undefined;
      const stub = (raw: string) => {
        seen = raw;
        return { status: KANJI_INPUT_VALIDATION_STATUS.EMPTY } as const;
      };
      const parse = parseKanjiInputControllerFactory(stub);
      expect(parse("  森  ")).toEqual({ status: KANJI_INPUT_VALIDATION_STATUS.EMPTY });
      expect(seen).toBe("  森  ");
    });
  });
});
