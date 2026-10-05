import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { runTanukiKanjiLesson } from "./entrypoint.ts";
import { InvalidKanjiInput, KanjiInputStatus } from "./validate.ts";

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
    await vi.advanceTimersByTimeAsync(1000);
    await assertion;
  });

  test("treats padded input like trimmed input", async () => {
    const padded = runTanukiKanjiLesson(" 森 ");
    const trimmed = runTanukiKanjiLesson("森");
    const paddedAssertion = expect(padded).resolves.toBe("kanji lesson: 森");
    const trimmedAssertion = expect(trimmed).resolves.toBe("kanji lesson: 森");
    await vi.advanceTimersByTimeAsync(1000);
    await paddedAssertion;
    await trimmedAssertion;
  });

  test.each([
    { expected: KanjiInputStatus.INVALID_CHARACTERS, raw: "hello" },
    { expected: KanjiInputStatus.MISSING_KANJI, raw: "ひらがな" },
    { expected: KanjiInputStatus.EMPTY, raw: "" },
    { expected: KanjiInputStatus.EMPTY, raw: "   " },
  ])("rejects $raw with status $expected before any lesson", ({ expected, raw }) => {
    try {
      runTanukiKanjiLesson(raw);
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidKanjiInput);
      expect((error as InvalidKanjiInput).status).toBe(expected);
    }
  });
});
