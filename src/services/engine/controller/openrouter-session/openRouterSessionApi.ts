import { disconnectOpenRouterSession, hasOpenRouterSession } from "./openRouterSessionController.ts";

export type OpenRouterSessionAPI = {
  hasSession: () => boolean;
  disconnect: () => void;
};

export const openRouterSessionAPI: OpenRouterSessionAPI = {
  hasSession: hasOpenRouterSession,
  disconnect: disconnectOpenRouterSession,
};
