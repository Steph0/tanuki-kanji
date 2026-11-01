import { type RenderResult, render } from "@testing-library/preact";
import type { VNode } from "preact";
import { vi } from "vitest";
import { TanukiKanjiProvider } from "./hooks/useTanukiKanjiEngine.tsx";
import type { TanukiKanjiEngine } from "./services/engine/controller/lesson/runTanukiKanjiLessonApi.ts";
import type { OpenRouterSessionAPI } from "./services/engine/controller/openrouter-session/openRouterSessionApi.ts";

export function noop(): void {}

export function pendingEngine(): TanukiKanjiEngine {
  return () => new Promise<string>(noop);
}

/**
 * To render components that relies on the Tanuki Engine
 * Such components are expected to mock engine call and not call the real engine (offline testing)
 */
export function renderWithEngine(ui: VNode, engine: TanukiKanjiEngine): RenderResult {
  return render(<TanukiKanjiProvider engine={engine}>{ui}</TanukiKanjiProvider>);
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
    hasSession: vi.fn(() => false),
    disconnect: vi.fn(),
    ...overrides,
  };
}
