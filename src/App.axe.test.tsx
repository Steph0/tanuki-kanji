import { render, screen } from "@testing-library/preact";
import axe from "axe-core";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { App } from "./App.tsx";
import type { TanukiKanjiLessonAPI } from "./services/engine/controller/lesson/runTanukiKanjiLessonApi.ts";
import type { OpenRouterSessionAPI } from "./services/engine/controller/openrouter-session/openRouterSessionApi.ts";
import { fakeOpenRouterSessionAPI, noop, pendingLesson } from "./test-utils.tsx";

const MOBILE = { viewportName: "mobile", width: 390, height: 844 };
const ROTATED = { viewportName: "rotated", width: 844, height: 390 };
const DESKTOP = { viewportName: "desktop", width: 1280, height: 800 };

const VIEWPORTS = [MOBILE, ROTATED, DESKTOP];

function renderApp(
  lesson: TanukiKanjiLessonAPI = vi.fn(async () => "kanji lesson"),
  session: OpenRouterSessionAPI = fakeOpenRouterSessionAPI(),
) {
  render(
    <App
      services={{
        tanukiKanjiLesson: lesson,
        openRouterSession: session,
        navigate: vi.fn(),
      }}
    />,
  );
}

async function axeHasNoViolations() {
  const results = await axe.run(document.body);
  expect(results.violations).toEqual([]);
}

describe("App accessibility on /", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
  });

  test.each(VIEWPORTS)("has no violations at $viewportName viewport", async ({ width, height }) => {
    await page.viewport(width, height);
    renderApp();
    await screen.findByRole("textbox", { name: "Enter your kanji" });
    await axeHasNoViolations();
  });
});

describe("App accessibility on /loading", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
  });

  test.each(VIEWPORTS)("has no violations at $viewportName viewport", async ({ width, height }) => {
    await page.viewport(width, height);
    renderApp(pendingLesson());
    await page.getByRole("textbox", { name: "Enter your kanji" }).fill("狸");
    await page.getByRole("button", { name: "Submit search" }).click();
    await screen.findByRole("status");
    await axeHasNoViolations();
  });
});

describe("App accessibility on /result", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
  });

  test.each(VIEWPORTS)("has no violations at $viewportName viewport", async ({ width, height }) => {
    await page.viewport(width, height);
    renderApp(vi.fn(async () => "kanji lesson: 狸"));
    await page.getByRole("textbox", { name: "Enter your kanji" }).fill("狸");
    await page.getByRole("button", { name: "Submit search" }).click();
    expect(await screen.findByText("kanji lesson: 狸")).toBeVisible();
    await axeHasNoViolations();
  });
});

describe("App accessibility with the disconnected settings offer", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
  });

  test.each(VIEWPORTS)("has no violations at $viewportName viewport", async ({ width, height }) => {
    await page.viewport(width, height);
    renderApp();
    await page.getByRole("button", { name: "Settings, OpenRouter not connected" }).click();
    await screen.findByRole("dialog", { name: "Connect to OpenRouter" });
    await axeHasNoViolations();
  });
});

describe("App accessibility with the connected settings view", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
  });

  test.each(VIEWPORTS)("has no violations at $viewportName viewport", async ({ width, height }) => {
    await page.viewport(width, height);
    renderApp(undefined, fakeOpenRouterSessionAPI({ hasSession: () => true }));
    await page.getByRole("button", { name: "Settings, OpenRouter connected" }).click();
    await screen.findByRole("dialog", { name: "OpenRouter connected" });
    await axeHasNoViolations();
  });
});

describe("App accessibility while finishing the sign-in", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
  });

  test.each(VIEWPORTS)("has no violations at $viewportName viewport", async ({ width, height }) => {
    await page.viewport(width, height);
    renderApp(
      undefined,
      fakeOpenRouterSessionAPI({
        captureAuthorizationReturn: () => true,
        completeAuthorization: () => new Promise(noop),
      }),
    );
    await screen.findByRole("dialog", { name: "Connecting to OpenRouter" });
    await axeHasNoViolations();
  });
});

describe("App accessibility after a failed return", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
  });

  test.each(VIEWPORTS)("has no violations at $viewportName viewport", async ({ width, height }) => {
    await page.viewport(width, height);
    renderApp(
      undefined,
      fakeOpenRouterSessionAPI({
        captureAuthorizationReturn: () => true,
        completeAuthorization: async () => ({ status: "failed" }),
      }),
    );
    await screen.findByRole("alert");
    await axeHasNoViolations();
  });
});
