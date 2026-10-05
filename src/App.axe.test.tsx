import { render, screen } from "@testing-library/preact";
import axe from "axe-core";
import { beforeEach, describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { App } from "./App.tsx";

const MOBILE = { viewportName: "mobile", width: 390, height: 844 };
const ROTATED = { viewportName: "rotated", width: 844, height: 390 };
const DESKTOP = { viewportName: "desktop", width: 1280, height: 800 };

const VIEWPORTS = [MOBILE, ROTATED, DESKTOP];

describe("App accessibility on /", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
  });

  test.each(VIEWPORTS)("has no violations at $viewportName viewport", async ({ width, height }) => {
    await page.viewport(width, height);
    render(<App />);
    await screen.findByRole("textbox", { name: "Enter your kanji" });
    const results = await axe.run(document.body);
    expect(results.violations).toEqual([]);
  });
});

describe("App accessibility on /loading", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
  });

  test.each(VIEWPORTS)("has no violations at $viewportName viewport", async ({ width, height }) => {
    await page.viewport(width, height);
    render(<App />);
    await page.getByRole("textbox", { name: "Enter your kanji" }).fill("狸");
    await page.getByRole("button", { name: "Submit search" }).click();
    await screen.findByText("Loading...");
    const results = await axe.run(document.body);
    expect(results.violations).toEqual([]);
  });
});

describe("App accessibility on /result", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
  });

  test.each(VIEWPORTS)("has no violations at $viewportName viewport", async ({ width, height }) => {
    await page.viewport(width, height);
    render(<App />);
    await page.getByRole("textbox", { name: "Enter your kanji" }).fill("狸");
    await page.getByRole("button", { name: "Submit search" }).click();
    await screen.findByText("kanji lesson: 狸", {}, { timeout: 5000 });
    const results = await axe.run(document.body);
    expect(results.violations).toEqual([]);
  });
});
