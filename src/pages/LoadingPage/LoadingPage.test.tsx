import { act, render, screen } from "@testing-library/preact";
import { describe, expect, test, vi } from "vitest";
import { commands } from "vitest/browser";
import { TanukiKanjiProvider } from "../../hooks/useTanukiKanjiEngine.tsx";
import { dummyEngine, noop } from "../../test-utils.ts";
import { LoadingPage } from "./LoadingPage.tsx";

const ARTWORK_ALT = "Tanuki calligraphing by lamplight while your lesson loads";

function renderLoadingPage() {
  return render(
    <TanukiKanjiProvider engine={dummyEngine}>
      <LoadingPage kanjiUserInput="狸" onDone={noop} />
    </TanukiKanjiProvider>,
  );
}

function mockReducedMotion(matches: boolean) {
  const original = window.matchMedia;
  window.matchMedia = ((query: string) => ({
    matches: query === "(prefers-reduced-motion: reduce)" ? matches : false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
  return () => {
    window.matchMedia = original;
  };
}

describe("LoadingPage", () => {
  test("shows the loading illustration with its descriptive label", async () => {
    renderLoadingPage();

    const illustration = await screen.findByRole("img", { name: ARTWORK_ALT });
    expect(illustration).toBeVisible();
    expect(illustration.getAttribute("src")).toContain("loading_page-400.png");
    expect(illustration).toHaveAttribute(
      "srcset",
      "/src/assets/loading/loading_page-400.png 400w, /src/assets/loading/loading_page-800.png 800w",
    );
    expect(illustration).toHaveAttribute("sizes", "(max-width: 48rem) calc(100vw - 2rem), 400px");

    const source = illustration.closest("picture")?.querySelector("source");
    expect(source?.getAttribute("type")).toBe("image/webp");
    expect(source).toHaveAttribute(
      "srcset",
      "/src/assets/loading/loading_page-400.webp 400w, /src/assets/loading/loading_page-800.webp 800w",
    );
  });

  test("keeps the decorative illustration layers hidden from assistive tech", async () => {
    renderLoadingPage();
    await screen.findByRole("img", { name: ARTWORK_ALT });

    // Decorative SVGs expose no role to query by, so a tag query is the last resort.
    const rings = document.querySelectorAll("svg");
    expect(rings).toHaveLength(2);
    for (const ring of rings) {
      expect(ring).toHaveAttribute("aria-hidden", "true");
    }
  });

  test("freezes the illustration motion when reduced motion is requested", async () => {
    await commands.emulateReducedMotion(true);
    try {
      renderLoadingPage();
      await screen.findByRole("img", { name: ARTWORK_ALT });

      const ring = document.querySelectorAll("svg")[0];
      expect(getComputedStyle(ring).animationName).toBe("none");
    } finally {
      await commands.emulateReducedMotion(false);
    }
  }, 20000);

  test("announces the lore caption as a polite live region", async () => {
    renderLoadingPage();

    const caption = await screen.findByRole("status");
    expect(caption).toBeVisible();
    expect(caption).not.toBeEmptyDOMElement();
    expect(caption).toHaveAttribute("aria-live", "polite");
    expect(caption).toHaveAttribute("aria-busy", "true");
  });

  test("rotates to a different lore caption while the lesson loads", () => {
    vi.useFakeTimers();
    try {
      renderLoadingPage();

      const caption = screen.getByRole("status");
      const start = caption.textContent;
      expect(start).toBeTruthy();
      act(() => {
        vi.advanceTimersByTime(4500);
      });
      expect(screen.getByRole("status").textContent).not.toBe(start);
      expect(screen.getByRole("status")).toBeVisible();
    } finally {
      vi.useRealTimers();
    }
  });

  test("keeps the first caption static when reduced motion is requested", () => {
    const restore = mockReducedMotion(true);
    vi.useFakeTimers();
    try {
      renderLoadingPage();

      const caption = screen.getByRole("status");
      const start = caption.textContent;
      expect(start).toBeTruthy();
      act(() => {
        vi.advanceTimersByTime(4500);
      });
      expect(caption.textContent).toBe(start);
    } finally {
      vi.useRealTimers();
      restore();
    }
  });
});
