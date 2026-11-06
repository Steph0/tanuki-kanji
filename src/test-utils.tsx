import { type RenderResult, render } from "@testing-library/preact";
import type { VNode } from "preact";
import { vi } from "vitest";
import { TanukiKanjiProvider, type TanukiKanjiServices } from "./hooks/useTanukiKanjiServices.tsx";
import type { TanukiKanjiLessonAPI } from "./services/engine/controller/lesson/runTanukiKanjiLessonApi.ts";
import type { OpenRouterSessionAPI } from "./services/engine/controller/openrouter-session/openRouterSessionApi.ts";

export function noop(): void {}

export function pendingLesson(): TanukiKanjiLessonAPI {
  return () => new Promise<string>(noop);
}

/**
 * Builds an offline OpenRouter session API for UI suites. The default is the
 * disconnected learner with no captured callback return; a suite overrides
 * only the calls it drives.
 */
export function fakeOpenRouterSessionAPI(overrides: Partial<OpenRouterSessionAPI> = {}): OpenRouterSessionAPI {
  return {
    beginAuthorization: vi.fn(async () => ({ status: "refused" as const })),
    captureAuthorizationReturn: vi.fn(() => false),
    completeAuthorization: vi.fn(async () => ({ status: "none" as const })),
    connectDevelopmentSession: vi.fn(),
    hasSession: vi.fn(() => false),
    disconnect: vi.fn(),
    ...overrides,
  };
}

/**
 * Renders UI inside the app provider, with an offline service for every
 * capability the component tree may read. Suites override only what they
 * exercise.
 */
export function renderWithServices(ui: VNode, services: Partial<TanukiKanjiServices> = {}): RenderResult {
  return render(
    <TanukiKanjiProvider
      services={{
        tanukiKanjiLesson: services.tanukiKanjiLesson ?? pendingLesson(),
        openRouterSession: services.openRouterSession ?? fakeOpenRouterSessionAPI(),
        navigate: services.navigate ?? vi.fn(),
      }}
    >
      {ui}
    </TanukiKanjiProvider>,
  );
}

/**
 * Renders UI that needs the lesson API, with the rest of the app services
 * defaulted the same way as `renderWithServices`.
 */
export function renderWithLesson(
  ui: VNode,
  lesson: TanukiKanjiLessonAPI,
  services: Partial<Omit<TanukiKanjiServices, "tanukiKanjiLesson">> = {},
): RenderResult {
  return renderWithServices(ui, { ...services, tanukiKanjiLesson: lesson });
}
