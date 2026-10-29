import {
  type BeginOpenRouterAuthorizationResult,
  beginOpenRouterAuthorization,
} from "../../application/openrouter-session/beginOpenRouterAuthorization.ts";
import {
  type CompleteOpenRouterAuthorizationResult,
  completeOpenRouterAuthorization,
  type OpenRouterAuthorizationReturn,
} from "../../application/openrouter-session/completeOpenRouterAuthorization.ts";
import { captureCallbackReturn } from "../../infrastructure/browser/browserLocation.ts";
import { deleteSession, hasSession } from "../../infrastructure/openrouter/sessionStore.ts";

let capturedReturn: OpenRouterAuthorizationReturn | null = null;

export function hasOpenRouterSession(): boolean {
  return hasSession();
}

export function disconnectOpenRouterSession(): void {
  deleteSession();
}

export function beginAuthorization(): Promise<BeginOpenRouterAuthorizationResult> {
  return beginOpenRouterAuthorization();
}

/**
 * Captures the provider's callback return. The UI calls it after
 * `beginAuthorization` sent the learner away and before
 * `completeAuthorization` redeems the answer.
 */
export function captureAuthorizationReturn(): boolean {
  if (capturedReturn !== null) {
    return true;
  }

  const capture = captureCallbackReturn();
  if (capture.status === "none") {
    return false;
  }

  capturedReturn = {
    code: capture.query.code,
    state: capture.query.state,
    error: capture.query.error,
    captureFailed: capture.status === "failed",
  };
  return true;
}

export function completeAuthorization(): Promise<CompleteOpenRouterAuthorizationResult> {
  const captured = capturedReturn;
  capturedReturn = null;
  return completeOpenRouterAuthorization(captured);
}
