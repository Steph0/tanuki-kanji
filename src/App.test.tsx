import { render, screen } from "@testing-library/preact";
import axe from "axe-core";
import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import styles from "./App.module.css";
import { App } from "./App.tsx";

describe("App", () => {
  test("shows a single site header, main content, and headline", () => {
    render(<App />);
    expect(screen.getByRole("banner")).toBeVisible();
    expect(screen.getByRole("main")).toBeVisible();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  test("keeps discovery order: navigation, illustration, search, explanation", () => {
    render(<App />);
    const navigation = screen.getByRole("navigation", { name: "Primary" });
    const illustration = screen.getByRole("img", { name: /tanuki calligraphing/i });
    const search = screen.getByRole("textbox", { name: "Enter your kanji" });
    const explanation = screen.getByRole("region", { name: "Why Etymology Works" });
    // Document order contract, not pixel positions.
    expect(navigation.compareDocumentPosition(illustration) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(illustration.compareDocumentPosition(search) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(search.compareDocumentPosition(explanation) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  test("constrains and centers the page shell on desktop", async () => {
    await page.viewport(1280, 800);
    render(<App />);
    // Last-resort lookup, documented: the page shell is a plain div with no
    // accessible role, so reach it via its CSS module class.
    const shell = document.querySelector(`.${styles.pageContent}`);
    expect(shell).not.toBeNull();
    const shellStyle = getComputedStyle(shell as Element);
    expect(shellStyle.maxWidth).toBe("1120px");
    expect(shellStyle.marginLeft).toBe(shellStyle.marginRight);
    // Width-gated banner cap: small centered strip, never a fullscreen cover.
    const illustration = screen.getByRole("img", { name: /tanuki calligraphing/i });
    const imageStyle = getComputedStyle(illustration);
    expect(imageStyle.objectFit).toBe("contain");
    expect(imageStyle.maxHeight).toBe("220px");
  });

  test("restores the cover crop on short viewports", async () => {
    await page.viewport(844, 390);
    render(<App />);
    // The max-height short-viewport block is declared after the desktop block
    // so it always wins: cover is restored over desktop contain.
    const illustration = screen.getByRole("img", { name: /tanuki calligraphing/i });
    expect(getComputedStyle(illustration).objectFit).toBe("cover");
  });

  test("has no accessibility violations on mobile", async () => {
    await page.viewport(390, 844);
    render(<App />);
    const results = await axe.run(document.body);
    expect(results.violations).toEqual([]);
  });

  test("has no accessibility violations when rotated", async () => {
    await page.viewport(844, 390);
    render(<App />);
    const results = await axe.run(document.body);
    expect(results.violations).toEqual([]);
  });

  test("has no accessibility violations on desktop", async () => {
    await page.viewport(1280, 800);
    render(<App />);
    const results = await axe.run(document.body);
    expect(results.violations).toEqual([]);
  });
});
