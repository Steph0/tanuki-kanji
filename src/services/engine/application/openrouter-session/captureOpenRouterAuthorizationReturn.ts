import { captureCallbackReturn } from "../../infrastructure/browser/browserLocation.ts";
import { hasCapturedReturn, saveCapturedReturn } from "./capturedReturnStore.ts";

/**
 * Captures the provider's callback return once. The UI calls it after
 * `beginAuthorization` sent the learner away and before
 * `completeAuthorization` redeems the answer.
 */
export function captureOpenRouterAuthorizationReturn(): boolean {
  if (hasCapturedReturn()) {
    return true;
  }

  const capture = captureCallbackReturn();
  if (capture.status === "none") {
    return false;
  }

  saveCapturedReturn({
    code: capture.query.code,
    state: capture.query.state,
    error: capture.query.error,
    captureFailed: capture.status === "failed",
  });
  return true;
}
