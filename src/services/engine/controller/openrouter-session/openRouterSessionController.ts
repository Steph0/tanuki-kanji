import {
  type BeginOpenRouterAuthorizationResult,
  beginOpenRouterAuthorization,
} from "../../application/openrouter-session/beginOpenRouterAuthorization.ts";
import { captureOpenRouterAuthorizationReturn } from "../../application/openrouter-session/captureOpenRouterAuthorizationReturn.ts";
import {
  type CompleteOpenRouterAuthorizationResult,
  completeOpenRouterAuthorization,
} from "../../application/openrouter-session/completeOpenRouterAuthorization.ts";
import { connectDevelopmentSessionFromEnvironment } from "../../infrastructure/openrouter/developmentSession.ts";
import { deleteSession, hasSession } from "../../infrastructure/openrouter/sessionStore.ts";

export function connectDevelopmentSession(): void {
  connectDevelopmentSessionFromEnvironment();
}

export function hasOpenRouterSession(): boolean {
  return hasSession();
}

export function disconnectOpenRouterSession(): void {
  deleteSession();
}

export function beginAuthorization(): Promise<BeginOpenRouterAuthorizationResult> {
  return beginOpenRouterAuthorization();
}

export function captureAuthorizationReturn(): boolean {
  return captureOpenRouterAuthorizationReturn();
}

export function completeAuthorization(): Promise<CompleteOpenRouterAuthorizationResult> {
  return completeOpenRouterAuthorization();
}
