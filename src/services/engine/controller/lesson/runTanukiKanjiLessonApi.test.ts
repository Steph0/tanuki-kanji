import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { KanjiInputValidationStatus } from "../../domain/kanji-input/validation/KanjiInputValidationStatus.ts";
import { runTanukiKanjiLessonAPI } from "./runTanukiKanjiLessonApi.ts";

describe("runTanukiKanjiLessonApi integration", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("wires the engine end to end", async () => {
    const pending = runTanukiKanjiLessonAPI("森");
    const assertion = expect(pending).resolves.toBe("kanji lesson: 森");
    await vi.advanceTimersByTimeAsync(5000);
    await assertion;
  });

  test("rejects invalid input with the boundary error shape", () => {
    try {
      runTanukiKanjiLessonAPI("hello");
      expect.unreachable();
    } catch (error) {
      expect(error).toMatchObject({
        name: "InvalidKanjiInput",
        status: KanjiInputValidationStatus.INVALID_CHARACTERS,
      });
    }
  });
});
