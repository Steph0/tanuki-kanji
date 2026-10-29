import type { BeginOpenRouterAuthorizationResult } from "../../application/openrouter-session/beginOpenRouterAuthorization.ts";
import type { CompleteOpenRouterAuthorizationResult } from "../../application/openrouter-session/completeOpenRouterAuthorization.ts";
import {
  beginAuthorization,
  captureAuthorizationReturn,
  completeAuthorization,
  disconnectOpenRouterSession,
  hasOpenRouterSession,
} from "./openRouterSessionController.ts";

export type { BeginOpenRouterAuthorizationResult, CompleteOpenRouterAuthorizationResult };

export type OpenRouterSessionAPI = {
  beginAuthorization: () => Promise<BeginOpenRouterAuthorizationResult>;
  captureAuthorizationReturn: () => boolean;
  completeAuthorization: () => Promise<CompleteOpenRouterAuthorizationResult>;
  hasSession: () => boolean;
  disconnect: () => void;
};

export const openRouterSessionAPI: OpenRouterSessionAPI = {
  beginAuthorization,
  captureAuthorizationReturn,
  completeAuthorization,
  hasSession: hasOpenRouterSession,
  disconnect: disconnectOpenRouterSession,
};
