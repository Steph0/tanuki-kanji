import { screen } from "@testing-library/preact";
import { LocationProvider } from "preact-iso";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { AppRouter } from "./AppRouter.tsx";
import type { TanukiKanjiEngine } from "./services/engine/controller/lesson/runTanukiKanjiLessonApi.ts";
import { pendingEngine, renderWithEngine } from "./test-utils.tsx";

function renderAppRouter({
  initialKanjiUserInput = null,
  initialTanukiKanjiLessonOutput = null,
  engine,
}: {
  initialKanjiUserInput?: string | null;
  initialTanukiKanjiLessonOutput?: string | null;
  engine: TanukiKanjiEngine;
}) {
  return renderWithEngine(
    <LocationProvider>
      <AppRouter
        initialKanjiUserInput={initialKanjiUserInput}
        initialTanukiKanjiLessonOutput={initialTanukiKanjiLessonOutput}
      />
    </LocationProvider>,
    engine,
  );
}

describe("AppRouter", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
  });

  test("shows the loading view when kanji user input is stored", async () => {
    window.history.pushState({}, "", "/loading");
    renderAppRouter({ initialKanjiUserInput: "some kanji user input", engine: pendingEngine() });
    expect(await screen.findByRole("status")).toBeVisible();
    expect(window.location.pathname).toBe("/loading");
  });

  test("stores the resolved lesson output and lands on /result", async () => {
    window.history.pushState({}, "", "/loading");
    renderAppRouter({ initialKanjiUserInput: "狸", engine: vi.fn(async () => "kanji lesson") });
    expect(await screen.findByText("kanji lesson")).toBeVisible();
    expect(window.location.pathname).toBe("/result");
  });

  test("shows a static error on /result when the engine rejects", async () => {
    window.history.pushState({}, "", "/loading");
    renderAppRouter({
      initialKanjiUserInput: "狸",
      engine: () => Promise.reject(new Error("engine exploded")),
    });
    expect(await screen.findByText("error")).toBeVisible();
    expect(window.location.pathname).toBe("/result");
  });

  test("shows the result placeholder when a lesson output is stored", async () => {
    window.history.pushState({}, "", "/result");
    renderAppRouter({
      initialTanukiKanjiLessonOutput: "kanji lesson",
      engine: vi.fn(async () => "kanji lesson"),
    });
    expect(await screen.findByText("kanji lesson")).toBeVisible();
    expect(window.location.pathname).toBe("/result");
  });
});
