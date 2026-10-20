import { describe, expect, test } from "vitest";
import { TanukiKanjiLesson } from "./TanukiKanjiLesson.ts";

describe("TanukiKanjiLesson", () => {
  test("holds the lesson text without its surrounding whitespace", () => {
    const lesson = TanukiKanjiLesson.create("  The monkeys formed a union.  ");

    expect(lesson).toBeInstanceOf(TanukiKanjiLesson);
    expect(lesson.text).toBe("The monkeys formed a union.");
  });

  test("keeps an empty lesson empty", () => {
    const lesson = TanukiKanjiLesson.create("");

    expect(lesson.text).toBe("");
  });
});
