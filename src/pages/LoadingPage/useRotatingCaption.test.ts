import { act, renderHook } from "@testing-library/preact";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useRotatingCaption } from "./useRotatingCaption.ts";

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

describe("useRotatingCaption", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test("starts with a non-empty caption", () => {
    const { result } = renderHook(() => useRotatingCaption());
    expect(result.current.length).toBeGreaterThan(0);
  });

  test("advances within the fastest cadence", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const { result } = renderHook(() => useRotatingCaption());
    const start = result.current;
    act(() => {
      vi.advanceTimersByTime(1199);
    });
    expect(result.current).toBe(start);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).not.toBe(start);
    expect(result.current.length).toBeGreaterThan(0);
  });

  test("waits out nearly the slowest cadence", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    const { result } = renderHook(() => useRotatingCaption());
    const start = result.current;
    act(() => {
      vi.advanceTimersByTime(3971);
    });
    expect(result.current).toBe(start);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).not.toBe(start);
  });

  test("uses non-constant delays across ticks", () => {
    vi.spyOn(Math, "random").mockReturnValueOnce(0).mockReturnValue(0.9999);
    const { result } = renderHook(() => useRotatingCaption());
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    const second = result.current;
    expect(second).not.toBe("");
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current).toBe(second);
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current).not.toBe(second);
  });

  test("never repeats the caption on consecutive ticks", () => {
    const draws = [0, 0.99, 0, 0.5];
    vi.spyOn(Math, "random").mockImplementation(() => draws.shift() ?? 0.5);
    const { result } = renderHook(() => useRotatingCaption());
    let previous = result.current;
    for (let tick = 0; tick < 2; tick++) {
      act(() => {
        vi.advanceTimersByTime(1200);
      });
      expect(result.current).not.toBe(previous);
      previous = result.current;
    }
  });

  test("cycles back to the first caption after the last one", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const { result } = renderHook(() => useRotatingCaption());
    const start = result.current;
    const seen = new Set<string>([start]);
    let backToStart = false;
    for (let step = 0; step < 30 && !backToStart; step++) {
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      seen.add(result.current);
      backToStart = result.current === start;
    }
    expect(seen.size).toBeGreaterThan(1);
    expect(backToStart).toBe(true);
  });

  test("stays on the first caption with no timer when reduced motion is requested", () => {
    const restore = mockReducedMotion(true);
    try {
      const { result } = renderHook(() => useRotatingCaption());
      const start = result.current;
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(result.current).toBe(start);
    } finally {
      restore();
    }
  });

  test("stops ticking after unmount", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const { result, unmount } = renderHook(() => useRotatingCaption());
    const start = result.current;
    unmount();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current).toBe(start);
  });
});
