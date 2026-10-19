import { describe, expect, test } from "vitest";
import { KanjiInputValidationStatus } from "../../domain/kanji-input/validation/KanjiInputValidationStatus.ts";
import { InvalidKanjiInput, runTanukiKanjiLesson } from "./runTanukiKanjiLesson.ts";

const immediateSleeper = () => Promise.resolve();

describe("runTanukiKanjiLesson use case unit", () => {
  describe("lesson contract", () => {
    describe("nominal", () => {
      test("maps a valid word to the lesson text", async () => {
        await expect(runTanukiKanjiLesson("森", immediateSleeper)).resolves.toBe("kanji lesson: 森");
      });
    });

    describe("errors", () => {
      test.each([
        ["", KanjiInputValidationStatus.EMPTY],
        ["hello", KanjiInputValidationStatus.INVALID_CHARACTERS],
        ["かな", KanjiInputValidationStatus.MISSING_KANJI],
        ["森".repeat(22), KanjiInputValidationStatus.TOO_LONG],
      ])("rejects %s with the %s boundary error", (raw, status) => {
        try {
          runTanukiKanjiLesson(raw, immediateSleeper);
          expect.unreachable();
        } catch (error) {
          expect(error).toBeInstanceOf(InvalidKanjiInput);
          expect((error as InvalidKanjiInput).status).toBe(status);
          expect((error as InvalidKanjiInput).name).toBe("InvalidKanjiInput");
        }
      });
    });
  });

  describe("interaction with the domain", () => {
    test("cleans the raw text through the domain before answering", async () => {
      await expect(runTanukiKanjiLesson("  森  ", immediateSleeper)).resolves.toBe("kanji lesson: 森");
    });
  });
});
