import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { runTanukiKanjiLesson } from "./entrypoint.ts";

describe("runTanukiKanjiLesson", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("resolves the static lesson text after ~1s", async () => {
    const pending = runTanukiKanjiLesson("some kanji");
    const assertion = expect(pending).resolves.toBe("kanji lesson");
    await vi.advanceTimersByTimeAsync(1000);
    await assertion;
  });

  test("treats padded input like trimmed input", async () => {
    const padded = runTanukiKanjiLesson(" 森 ");
    const trimmed = runTanukiKanjiLesson("森");
    const paddedAssertion = expect(padded).resolves.toBe("kanji lesson");
    const trimmedAssertion = expect(trimmed).resolves.toBe("kanji lesson");
    await vi.advanceTimersByTimeAsync(1000);
    await paddedAssertion;
    await trimmedAssertion;
  });
});
