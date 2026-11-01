import { render, screen } from "@testing-library/preact";
import { describe, expect, test } from "vitest";
import { ConnectingSettings } from "./ConnectingSettings.tsx";

const CONNECTING_BODY = "Finishing sign-in. This takes a moment.";
const SHORT_VIEWPORT = window.matchMedia("(max-height: 37.5rem)").matches;
const WIDE_VIEWPORT = window.matchMedia("(min-width: 48rem)").matches;
const COMPACT_VISUAL_REM = SHORT_VIEWPORT ? 8 : WIDE_VIEWPORT ? 12 : 10;

function remToPx(rem: number): string {
  const rootSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  return `${rem * rootSize}px`;
}

function renderConnecting() {
  render(<ConnectingSettings bodyId="settings-body" />);
}

describe("ConnectingSettings", () => {
  test("announces the finishing sign-in as busy", () => {
    renderConnecting();

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(CONNECTING_BODY);
    expect(status).toHaveAttribute("aria-busy", "true");
  });

  test("centers its progress message under the artwork", () => {
    renderConnecting();

    expect(getComputedStyle(screen.getByRole("status")).textAlign).toBe("center");
  });

  test("frames the wait with the compact artwork and a decorative lock", () => {
    renderConnecting();

    const visual = document.querySelector("svg")?.parentElement as HTMLElement;
    const lock = visual.querySelector("img");
    expect(lock).not.toBeNull();
    expect(lock).toHaveAttribute("alt", "");
    expect(lock).toHaveAttribute("aria-hidden", "true");
    expect(lock).toHaveAttribute("width", "32");

    expect(getComputedStyle(visual).width).toBe(remToPx(COMPACT_VISUAL_REM));
  });

  test("offers no action while the exchange runs", () => {
    renderConnecting();

    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
  });
});
