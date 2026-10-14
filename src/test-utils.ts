import type { TanukiKanjiEngine } from "./services/engine/controller/lesson/runTanukiKanjiLessonApi.ts";

export function noop(): void {
  return;
}

/**
 * Use this engine when your test case is not supposed to call the TanukiKanjiEngine but still relies on it
 */
export function dummyEngine(): ReturnType<TanukiKanjiEngine> {
  return new Promise<string>(noop);
}
