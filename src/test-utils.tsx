import { type RenderResult, render } from "@testing-library/preact";
import type { VNode } from "preact";
import { TanukiKanjiProvider } from "./hooks/useTanukiKanjiEngine.tsx";
import type { TanukiKanjiEngine } from "./services/engine/controller/lesson/runTanukiKanjiLessonApi.ts";

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
