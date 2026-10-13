import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  KANJI_INPUT_MAX_LENGTH,
  KANJI_INPUT_VALIDATION_STATUS,
} from "./engine/controller/kanji-input/parseKanjiInputApi.ts";
import { InvalidKanjiInput, runTanukiKanjiLesson } from "./entrypoint.ts";

describe("runTanukiKanjiLesson", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("names the output after the input", async () => {
    const pending = runTanukiKanjiLesson("狸");
    const assertion = expect(pending).resolves.toBe("kanji lesson: 狸");
    await vi.advanceTimersByTimeAsync(5000);
    await assertion;
  });

  test("treats padded input like trimmed input", async () => {
    const padded = runTanukiKanjiLesson(" 森 ");
    const trimmed = runTanukiKanjiLesson("森");
    const paddedAssertion = expect(padded).resolves.toBe("kanji lesson: 森");
    const trimmedAssertion = expect(trimmed).resolves.toBe("kanji lesson: 森");
    await vi.advanceTimersByTimeAsync(5000);
    await paddedAssertion;
    await trimmedAssertion;
  });

  test.each([
    { expected: KANJI_INPUT_VALIDATION_STATUS.INVALID_CHARACTERS, raw: "hello" },
    { expected: KANJI_INPUT_VALIDATION_STATUS.MISSING_KANJI, raw: "ひらがな" },
    { expected: KANJI_INPUT_VALIDATION_STATUS.EMPTY, raw: "" },
    { expected: KANJI_INPUT_VALIDATION_STATUS.EMPTY, raw: "   " },
    { expected: KANJI_INPUT_VALIDATION_STATUS.TOO_LONG, raw: "森".repeat(KANJI_INPUT_MAX_LENGTH + 1) },
  ])("rejects $raw with status $expected before any lesson", ({ expected, raw }) => {
    try {
      runTanukiKanjiLesson(raw);
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidKanjiInput);
      expect((error as InvalidKanjiInput).status).toBe(expected);
      expect((error as InvalidKanjiInput).name).toBe("InvalidKanjiInput");
    }
  });
});
