import { beforeEach, describe, expect, test, vi } from "vitest";
import { KanjiInput } from "../../domain/kanji-input/KanjiInput.ts";
import { KanjiInputValidationStatus } from "../../domain/kanji-input/validation/KanjiInputValidationStatus.ts";
import { TanukiKanjiLesson } from "../../domain/tanuki-kanji-lesson/TanukiKanjiLesson.ts";
import { InvalidKanjiInput, runTanukiKanjiLesson } from "./runTanukiKanjiLessonController.ts";

const LESSON_CONTENT = "The monkeys formed a union.";

const { getLessonMock } = vi.hoisted(() => ({
  getLessonMock: vi.fn<(provenKanjiWord: KanjiInput) => Promise<TanukiKanjiLesson>>(),
}));

vi.mock("../../infrastructure/openrouter/getTanukiKanjiLesson.ts", () => ({
  getTanukiKanjiLesson: getLessonMock,
}));

describe("runTanukiKanjiLessonController unit", () => {
  beforeEach(() => {
    getLessonMock.mockReset();
    getLessonMock.mockResolvedValue(TanukiKanjiLesson.create(LESSON_CONTENT));
  });

  describe("lesson contract", () => {
    describe("nominal", () => {
      test("resolves the lesson content verbatim", async () => {
        await expect(runTanukiKanjiLesson("森")).resolves.toBe(LESSON_CONTENT);
      });

      test("resolves the lesson content without the legacy prefix", async () => {
        const lessonContent = await runTanukiKanjiLesson("森");

        expect(lessonContent).not.toContain("kanji lesson:");
      });
    });

    describe("errors", () => {
      test.each([
        ["", KanjiInputValidationStatus.EMPTY],
        ["hello", KanjiInputValidationStatus.INVALID_CHARACTERS],
        ["かな", KanjiInputValidationStatus.MISSING_KANJI],
        ["森".repeat(22), KanjiInputValidationStatus.TOO_LONG],
      ])("rejects %s with the %s boundary error", async (raw, status) => {
        const pending = runTanukiKanjiLesson(raw);

        await expect(pending).rejects.toBeInstanceOf(InvalidKanjiInput);
        await expect(pending).rejects.toMatchObject({ name: "InvalidKanjiInput", status });
      });

      test("never calls the provider for an invalid word", async () => {
        await expect(runTanukiKanjiLesson("hello")).rejects.toBeInstanceOf(InvalidKanjiInput);

        expect(getLessonMock).not.toHaveBeenCalled();
      });

      test("propagates the provider rejection untouched", async () => {
        const failure = new Error("provider unavailable");
        getLessonMock.mockRejectedValueOnce(failure);

        await expect(runTanukiKanjiLesson("森")).rejects.toBe(failure);
      });
    });
  });

  describe("interaction with the domain", () => {
    test("hands the raw text to the creator untouched", async () => {
      const createSpy = vi.spyOn(KanjiInput, "create");

      await runTanukiKanjiLesson("  森  ");

      expect(createSpy).toHaveBeenCalledWith("  森  ");
    });

    test("hands the proven word to the provider", async () => {
      await runTanukiKanjiLesson("  森  ");

      expect(getLessonMock).toHaveBeenCalledTimes(1);
      const provenWord = getLessonMock.mock.calls[0][0];
      expect(provenWord).toBeInstanceOf(KanjiInput);
      expect(provenWord.value).toBe("森");
    });
  });
});
