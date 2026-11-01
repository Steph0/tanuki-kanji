import { render, screen } from "@testing-library/preact";
import { describe, expect, test } from "vitest";
import { commands } from "vitest/browser";
import { AnimatedArtwork } from "./AnimatedArtwork.tsx";

const SHORT_VIEWPORT = window.matchMedia("(max-height: 37.5rem)").matches;
const WIDE_VIEWPORT = window.matchMedia("(min-width: 48rem)").matches;

const HERO_VISUAL_REM = SHORT_VIEWPORT ? 12 : WIDE_VIEWPORT ? 24 : 18;
const HERO_SLOT_REM = SHORT_VIEWPORT ? 8 : WIDE_VIEWPORT ? 16 : 12;
const COMPACT_VISUAL_REM = SHORT_VIEWPORT ? 8 : WIDE_VIEWPORT ? 12 : 10;
const COMPACT_SLOT_REM = SHORT_VIEWPORT ? 5.5 : WIDE_VIEWPORT ? 7.5 : 6.5;

function renderArtwork(compact = false) {
  render(
    <AnimatedArtwork compact={compact}>
      <span>mark</span>
    </AnimatedArtwork>,
  );
}

function visualFrame(): HTMLElement {
  return document.querySelector("svg")?.parentElement as HTMLElement;
}

function artworkSlot(): HTMLElement {
  return screen.getByText("mark").parentElement as HTMLElement;
}

function remToPx(rem: number): string {
  return `${rem * rootFontSize()}px`;
}

function rootFontSize(): number {
  return Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
}

describe("AnimatedArtwork", () => {
  test("frames its content with two decorative rings", () => {
    renderArtwork();

    const rings = document.querySelectorAll("svg");
    expect(rings).toHaveLength(2);
    for (const ring of rings) {
      expect(ring).toHaveAttribute("aria-hidden", "true");
    }
    expect(screen.getByText("mark")).toBeVisible();
  });

  test("keeps the hero frame at the loading page size", () => {
    renderArtwork();

    expect(getComputedStyle(visualFrame()).width).toBe(remToPx(HERO_VISUAL_REM));
    const heroSlotPx = Math.min(HERO_SLOT_REM * rootFontSize(), HERO_VISUAL_REM * rootFontSize() * 0.66);
    expect(Number.parseFloat(getComputedStyle(artworkSlot()).width)).toBeCloseTo(heroSlotPx, 2);
  });

  test("steps down to the compact frame for the settings modal", () => {
    renderArtwork(true);

    expect(getComputedStyle(visualFrame()).width).toBe(remToPx(COMPACT_VISUAL_REM));
    expect(getComputedStyle(artworkSlot()).width).toBe(remToPx(COMPACT_SLOT_REM));
  });

  test("freezes the rings when reduced motion is requested", async () => {
    await commands.emulateReducedMotion(true);
    try {
      renderArtwork();

      for (const ring of document.querySelectorAll("svg")) {
        expect(getComputedStyle(ring).animationName).toBe("none");
      }
    } finally {
      await commands.emulateReducedMotion(false);
    }
  }, 20000);
});
