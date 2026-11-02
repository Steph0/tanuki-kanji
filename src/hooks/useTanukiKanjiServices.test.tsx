import { renderHook } from "@testing-library/preact";
import { describe, expect, test, vi } from "vitest";
import { tanukiKanjiLessonAPI } from "../services/engine/controller/lesson/runTanukiKanjiLessonApi.ts";
import { openRouterSessionAPI } from "../services/engine/controller/openrouter-session/openRouterSessionApi.ts";
import { fakeOpenRouterSessionAPI } from "../test-utils.tsx";
import {
  TanukiKanjiProvider,
  useBrowserNavigate,
  useOpenRouterSession,
  useTanukiKanjiLesson,
} from "./useTanukiKanjiServices.tsx";

function useServices() {
  return {
    tanukiKanjiLesson: useTanukiKanjiLesson(),
    openRouterSession: useOpenRouterSession(),
    navigate: useBrowserNavigate(),
  };
}

describe("TanukiKanjiProvider", () => {
  test("defaults to the real lesson API, session API, and browser transition", () => {
    const { result } = renderHook(useServices, { wrapper: TanukiKanjiProvider });

    expect(result.current.tanukiKanjiLesson).toBe(tanukiKanjiLessonAPI);
    expect(result.current.openRouterSession).toBe(openRouterSessionAPI);
    expect(result.current.navigate).toBeTypeOf("function");
  });

  test("merges partial overrides over the real services", () => {
    const openRouterSession = fakeOpenRouterSessionAPI({ hasSession: () => true });
    const navigate = vi.fn();
    const { result } = renderHook(useServices, {
      wrapper: ({ children }) => (
        <TanukiKanjiProvider services={{ openRouterSession, navigate }}>{children}</TanukiKanjiProvider>
      ),
    });

    expect(result.current.openRouterSession).toBe(openRouterSession);
    expect(result.current.navigate).toBe(navigate);
    expect(result.current.tanukiKanjiLesson).toBe(tanukiKanjiLessonAPI);
  });

  test("refuses to read services outside the provider", () => {
    expect(() => renderHook(useServices)).toThrow("Tanuki Kanji hooks must be used inside <TanukiKanjiProvider>");
  });
});
