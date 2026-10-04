import { render, screen } from "@testing-library/preact";
import { describe, expect, test } from "vitest";
import { ResultPage } from "./ResultPage.tsx";

describe("ResultPage", () => {
  test("shows the stored lesson output", async () => {
    render(<ResultPage tanukiKanjiLessonOutput="kanji lesson" />);
    expect(await screen.findByText("kanji lesson")).toBeVisible();
  });
});
