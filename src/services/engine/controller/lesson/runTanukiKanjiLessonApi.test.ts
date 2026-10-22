import { describe, expect, test, vi } from "vitest";
import { KanjiInputValidationStatus } from "../../domain/kanji-input/validation/KanjiInputValidationStatus.ts";
import { TanukiKanjiLesson } from "../../domain/tanuki-kanji-lesson/TanukiKanjiLesson.ts";
import { runTanukiKanjiLessonAPI } from "./runTanukiKanjiLessonApi.ts";

const LESSON_CONTENT = "The monkeys formed a union.";

vi.mock("../../infrastructure/openrouter/getTanukiKanjiLesson.ts", () => ({
  getTanukiKanjiLesson: () => {
    const lesson = TanukiKanjiLesson.create(LESSON_CONTENT);
    return Promise.resolve(lesson);
  },
}));

describe("runTanukiKanjiLessonApi integration", () => {
  test("resolves the lesson content end to end", async () => {
    await expect(runTanukiKanjiLessonAPI("森")).resolves.toBe(LESSON_CONTENT);
  });

  test("rejects invalid input with the boundary error shape", async () => {
    await expect(runTanukiKanjiLessonAPI("hello")).rejects.toMatchObject({
      name: "InvalidKanjiInput",
      status: KanjiInputValidationStatus.INVALID_CHARACTERS,
    });
  });
});
