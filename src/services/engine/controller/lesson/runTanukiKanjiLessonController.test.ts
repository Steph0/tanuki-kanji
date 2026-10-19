import { describe, expect, test } from "vitest";
import { KanjiInputValidationStatus } from "../../domain/kanji-input/validation/KanjiInputValidationStatus.ts";
import { InvalidKanjiInput, runTanukiKanjiLessonControllerFactory } from "./runTanukiKanjiLessonController.ts";

describe("runTanukiKanjiLessonController unit", () => {
  describe("delegation to the use case", () => {
    test("returns the use case answer untouched", async () => {
      const run = runTanukiKanjiLessonControllerFactory(() => Promise.resolve("kanji lesson: 森"));
      await expect(run("anything")).resolves.toBe("kanji lesson: 森");
    });

    test("propagates the use case rejection untouched", async () => {
      const failure = new InvalidKanjiInput(KanjiInputValidationStatus.EMPTY);
      const run = runTanukiKanjiLessonControllerFactory(() => Promise.reject(failure));
      await expect(run("anything")).rejects.toBe(failure);
    });

    test("calls the use case with the raw text untouched", async () => {
      let seen: string | undefined;
      const run = runTanukiKanjiLessonControllerFactory((raw) => {
        seen = raw;
        return Promise.resolve("kanji lesson: 森");
      });
      await run("  森  ");
      expect(seen).toBe("  森  ");
    });
  });
});
