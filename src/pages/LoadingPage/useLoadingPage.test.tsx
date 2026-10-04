import { renderHook } from "@testing-library/preact";
import type { ComponentChildren } from "preact";
import { describe, expect, test, vi } from "vitest";
import { TanukiKanjiProvider } from "../../hooks/useTanukiKanjiEngine.tsx";
import type { TanukiKanjiEngine } from "../../services/types.ts";
import { useLoadingPage } from "./useLoadingPage.ts";

function renderLoadingPageHook({ kanjiUserInput = "狸", engine, onDone }: { kanjiUserInput?: string; engine: TanukiKanjiEngine; onDone: (tanukiKanjiLessonOutput: string) => void }) {
  function Wrapper({ children }: { children: ComponentChildren }) {
    return <TanukiKanjiProvider engine={engine}>{children}</TanukiKanjiProvider>;
  }
  return renderHook(
    () => {
      useLoadingPage(kanjiUserInput, onDone);
    },
    { wrapper: Wrapper },
  );
}

describe("useLoadingPage", () => {
  test("runs the engine once with the kanji user input and forwards the lesson text", async () => {
    const engine = vi.fn(async () => "kanji lesson");
    const onDone = vi.fn();
    renderLoadingPageHook({ engine, onDone });

    await vi.waitFor(() => {
      expect(onDone).toHaveBeenCalledWith("kanji lesson");
    });
    expect(engine).toHaveBeenCalledTimes(1);
    expect(engine).toHaveBeenCalledWith("狸");
  });

  test("forwards a static error text when the engine rejects", async () => {
    const onDone = vi.fn();
    renderLoadingPageHook({
      engine: () => Promise.reject(new Error("engine exploded")),
      onDone,
    });

    await vi.waitFor(() => {
      expect(onDone).toHaveBeenCalledWith("error");
    });
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  test("does not run the engine again on rerender", async () => {
    const engine = vi.fn(async () => "kanji lesson");
    const onDone = vi.fn();
    const { rerender } = renderLoadingPageHook({ engine, onDone });

    rerender();
    rerender();
    await vi.waitFor(() => {
      expect(onDone).toHaveBeenCalledWith("kanji lesson");
    });
    expect(engine).toHaveBeenCalledTimes(1);
  });

  test("ignores a late resolve after unmount", async () => {
    const gate: { resolve?: (value: string) => void } = {};
    const onDone = vi.fn();
    const { unmount } = renderLoadingPageHook({
      engine: () =>
        new Promise<string>((resolve) => {
          gate.resolve = resolve;
        }),
      onDone,
    });

    unmount();
    gate.resolve?.("kanji lesson");
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(onDone).not.toHaveBeenCalled();
  });
});
