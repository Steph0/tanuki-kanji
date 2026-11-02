import type { ComponentChildren } from "preact";
import { createContext } from "preact";
import { useContext, useMemo } from "preact/hooks";
import type { TanukiKanjiLessonAPI } from "../services/engine/controller/lesson/runTanukiKanjiLessonApi.ts";
import { tanukiKanjiLessonAPI } from "../services/engine/controller/lesson/runTanukiKanjiLessonApi.ts";
import type { OpenRouterSessionAPI } from "../services/engine/controller/openrouter-session/openRouterSessionApi.ts";
import { openRouterSessionAPI } from "../services/engine/controller/openrouter-session/openRouterSessionApi.ts";

export type TanukiKanjiServices = {
  tanukiKanjiLesson: TanukiKanjiLessonAPI;
  openRouterSession: OpenRouterSessionAPI;
  navigate: (url: string) => void;
};

const realServices: TanukiKanjiServices = {
  tanukiKanjiLesson: tanukiKanjiLessonAPI,
  openRouterSession: openRouterSessionAPI,
  navigate: replaceLocation,
};

type TanukiKanjiProviderProps = {
  services?: Partial<TanukiKanjiServices>;
  children: ComponentChildren;
};

export function TanukiKanjiProvider({ services, children }: TanukiKanjiProviderProps) {
  const resolvedServices = useMemo(() => ({ ...realServices, ...services }), [services]);

  return <ServicesContext.Provider value={resolvedServices}>{children}</ServicesContext.Provider>;
}

export function useTanukiKanjiLesson(): TanukiKanjiLessonAPI {
  return useTanukiKanjiServices().tanukiKanjiLesson;
}

export function useOpenRouterSession(): OpenRouterSessionAPI {
  return useTanukiKanjiServices().openRouterSession;
}

export function useBrowserNavigate(): (url: string) => void {
  return useTanukiKanjiServices().navigate;
}

function replaceLocation(url: string) {
  window.location.replace(url);
}

const ServicesContext = createContext<TanukiKanjiServices | null>(null);

function useTanukiKanjiServices(): TanukiKanjiServices {
  const services = useContext(ServicesContext);
  if (services === null) {
    throw new Error("Tanuki Kanji hooks must be used inside <TanukiKanjiProvider>");
  }
  return services;
}
