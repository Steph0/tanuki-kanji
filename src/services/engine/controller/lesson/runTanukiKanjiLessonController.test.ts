import { describe, expect, test } from "vitest";
import { KanjiInput } from "../../domain/kanji-input/KanjiInput.ts";
import { KanjiInputValidationStatus } from "../../domain/kanji-input/validation/KanjiInputValidationStatus.ts";
import { InvalidKanjiInput, runTanukiKanjiLessonControllerFactory } from "./runTanukiKanjiLessonController.ts";

const immediateSleeper = () => Promise.resolve();

function stubFailure(status: Exclude<KanjiInputValidationStatus, typeof KanjiInputValidationStatus.VALID>) {
  return () => ({ status }) as const;
}

describe("runTanukiKanjiLessonController unit", () => {
  describe("lesson contract", () => {
    describe("nominal", () => {
      test("maps a valid domain answer to the lesson text", async () => {
        const created = KanjiInput.create("森");
        if (created.status !== KanjiInputValidationStatus.VALID) {
          throw new Error("valid fixture failed to create");
        }
        const run = runTanukiKanjiLessonControllerFactory(() => created, immediateSleeper);
        await expect(run("anything")).resolves.toBe("kanji lesson: 森");
      });
    });

    describe("errors", () => {
      test.each([
        KanjiInputValidationStatus.EMPTY,
        KanjiInputValidationStatus.INVALID_CHARACTERS,
        KanjiInputValidationStatus.MISSING_KANJI,
        KanjiInputValidationStatus.TOO_LONG,
      ])("rejects %s with the boundary error", (status) => {
        const run = runTanukiKanjiLessonControllerFactory(stubFailure(status), immediateSleeper);
        try {
          run("anything");
          expect.unreachable();
        } catch (error) {
          expect(error).toBeInstanceOf(InvalidKanjiInput);
          expect((error as InvalidKanjiInput).status).toBe(status);
          expect((error as InvalidKanjiInput).name).toBe("InvalidKanjiInput");
        }
      });
    });
  });

  describe("interaction with creator", () => {
    test("calls the injected creator with the raw text untouched", async () => {
      let seen: string | undefined;
      const created = KanjiInput.create("森");
      if (created.status !== KanjiInputValidationStatus.VALID) {
        throw new Error("valid fixture failed to create");
      }
      const stub = (raw: string) => {
        seen = raw;
        return created;
      };
      const run = runTanukiKanjiLessonControllerFactory(stub, immediateSleeper);
      await expect(run("  森  ")).resolves.toBe("kanji lesson: 森");
      expect(seen).toBe("  森  ");
    });
  });
});
