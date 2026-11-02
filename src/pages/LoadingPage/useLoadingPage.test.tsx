import { renderHook } from "@testing-library/preact";
import type { ComponentChildren } from "preact";
import { afterEach, describe, expect, test, vi } from "vitest";
import { TanukiKanjiProvider } from "../../hooks/useTanukiKanjiServices.tsx";
import type { TanukiKanjiLessonAPI } from "../../services/engine/controller/lesson/runTanukiKanjiLessonApi.ts";
import { fakeOpenRouterSessionAPI } from "../../test-utils.tsx";
import { useLoadingPage } from "./useLoadingPage.ts";

function renderLoadingPageHook({
  kanjiUserInput = "狸",
  lesson,
  onDone,
}: {
  kanjiUserInput?: string;
  lesson: TanukiKanjiLessonAPI;
  onDone: (tanukiKanjiLessonOutput: string) => void;
}) {
  const navigate = vi.fn();
  function LessonProvider({ children }: { children?: ComponentChildren }) {
    return (
      <TanukiKanjiProvider
        services={{
          tanukiKanjiLesson: lesson,
          openRouterSession: fakeOpenRouterSessionAPI(),
          navigate,
        }}
      >
        {children}
      </TanukiKanjiProvider>
    );
  }
  return renderHook(
    () => {
      useLoadingPage(kanjiUserInput, onDone);
    },
    { wrapper: LessonProvider },
  );
}

describe("useLoadingPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("runs the lesson once with the kanji user input and forwards the lesson text", async () => {
    const lesson = vi.fn(async () => "kanji lesson");
    const onDone = vi.fn();
    renderLoadingPageHook({ lesson, onDone });

    await vi.waitFor(() => {
      expect(onDone).toHaveBeenCalledWith("kanji lesson");
    });
    expect(lesson).toHaveBeenCalledTimes(1);
    expect(lesson).toHaveBeenCalledWith("狸");
  });

  test("forwards a static error text when the lesson rejects", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const failure = new Error("lesson failed");
    const onDone = vi.fn();
    renderLoadingPageHook({
      lesson: () => Promise.reject(failure),
      onDone,
    });

    await vi.waitFor(() => {
      expect(onDone).toHaveBeenCalledWith("error");
    });
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith(failure);
  });

  test("does not run the lesson again on rerender", async () => {
    const lesson = vi.fn(async () => "kanji lesson");
    const onDone = vi.fn();
    const { rerender } = renderLoadingPageHook({ lesson, onDone });

    rerender();
    rerender();
    await vi.waitFor(() => {
      expect(onDone).toHaveBeenCalledWith("kanji lesson");
    });
    expect(lesson).toHaveBeenCalledTimes(1);
  });

  test("ignores a late resolve after unmount", async () => {
    const gate: { resolve?: (value: string) => void } = {};
    const onDone = vi.fn();
    const { unmount } = renderLoadingPageHook({
      lesson: () =>
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
