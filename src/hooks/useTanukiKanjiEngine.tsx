import type { ComponentChildren } from "preact";
import { createContext } from "preact";
import { useContext } from "preact/hooks";
import type { TanukiKanjiEngine } from "../services/types.ts";

const EngineContext = createContext<TanukiKanjiEngine | null>(null);

export function TanukiKanjiProvider({ engine, children }: { engine: TanukiKanjiEngine; children: ComponentChildren }) {
  return <EngineContext.Provider value={engine}>{children}</EngineContext.Provider>;
}

export function useTanukiKanjiEngine(): TanukiKanjiEngine {
  const engine = useContext(EngineContext);
  if (engine === null) {
    throw new Error("useTanukiKanjiEngine must be used inside <TanukiKanjiProvider>");
  }
  return engine;
}
