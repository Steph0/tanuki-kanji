import type { TanukiKanjiEngine } from "./services/types.ts";

export function noop(): void {
  return;
}

/**
 * Use this engine when your test case is not supposed to call the TanukiKanjiEngine but still relies on it
 */
export function dummyEngine(): ReturnType<TanukiKanjiEngine> {
  return new Promise<string>(noop);
}
