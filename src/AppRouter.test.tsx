import { render, screen } from "@testing-library/preact";
import type { ComponentChildren } from "preact";
import { LocationProvider } from "preact-iso";
import { beforeEach, describe, expect, test } from "vitest";
import { AppRouter } from "./AppRouter.tsx";
import { TanukiKanjiProvider } from "./hooks/useTanukiKanjiEngine.tsx";
import type { TanukiKanjiEngine } from "./services/types.ts";
import { dummyEngine } from "./test-utils.ts";

function renderAppRouter({
  initialKanjiUserInput = null,
  initialTanukiKanjiLessonOutput = null,
  engine,
}: {
  initialKanjiUserInput?: string | null;
  initialTanukiKanjiLessonOutput?: string | null;
  engine: TanukiKanjiEngine;
}) {
  function Wrapper({ children }: { children: ComponentChildren }) {
    return (
      <LocationProvider>
        <TanukiKanjiProvider engine={engine}>{children}</TanukiKanjiProvider>
      </LocationProvider>
    );
  }
  render(
    <AppRouter
      initialKanjiUserInput={initialKanjiUserInput}
      initialTanukiKanjiLessonOutput={initialTanukiKanjiLessonOutput}
    />,
    { wrapper: Wrapper },
  );
}

describe("AppRouter", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
  });

  test("shows the loading placeholder when kanji user input is stored", async () => {
    window.history.pushState({}, "", "/loading");
    renderAppRouter({ initialKanjiUserInput: "some kanji user input", engine: dummyEngine });
    expect(await screen.findByText("Loading...")).toBeVisible();
    expect(window.location.pathname).toBe("/loading");
  });

  test("stores the resolved lesson output and lands on /result", async () => {
    window.history.pushState({}, "", "/loading");
    renderAppRouter({ initialKanjiUserInput: "狸", engine: () => Promise.resolve("kanji lesson") });
    expect(await screen.findByText("kanji lesson")).toBeVisible();
    expect(window.location.pathname).toBe("/result");
  });

  test("shows a static error on /result when the engine rejects", async () => {
    window.history.pushState({}, "", "/loading");
    renderAppRouter({ initialKanjiUserInput: "狸", engine: () => Promise.reject(new Error("engine exploded")) });
    expect(await screen.findByText("error")).toBeVisible();
    expect(window.location.pathname).toBe("/result");
  });

  test("shows the result placeholder when a lesson output is stored", async () => {
    window.history.pushState({}, "", "/result");
    renderAppRouter({ initialTanukiKanjiLessonOutput: "kanji lesson", engine: dummyEngine });
    expect(await screen.findByText("kanji lesson")).toBeVisible();
    expect(window.location.pathname).toBe("/result");
  });
});
