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
    const pending = runTanukiKanjiLesson("some input");
    const assertion = expect(pending).resolves.toBe("kanji lesson");
    await vi.advanceTimersByTimeAsync(1000);
    await assertion;
  });
});
