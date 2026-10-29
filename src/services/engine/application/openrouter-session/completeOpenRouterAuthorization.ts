import { OpenRouterAuthorizationCompletionStatus } from "../../domain/openrouter-session/OpenRouterAuthorizationStatus.ts";
import { OpenRouterSession } from "../../domain/openrouter-session/OpenRouterSession.ts";
import { canStartAuthorization } from "../../infrastructure/browser/browserLocation.ts";
import {
  clearPendingAuthorization,
  type PendingAuthorization,
  readPendingAuthorization,
} from "../../infrastructure/browser/pendingStore.ts";
import { logEngineFailure } from "../../infrastructure/logging/logEngineFailure.ts";
import { exchangeCode } from "../../infrastructure/openrouter/exchangeCode.ts";
import { saveSession } from "../../infrastructure/openrouter/sessionStore.ts";

export type OpenRouterAuthorizationReturn = {
  code: string | null;
  state: string | null;
  error: string | null;
  captureFailed: boolean;
};

export type CompleteOpenRouterAuthorizationResult =
  | { status: typeof OpenRouterAuthorizationCompletionStatus.NONE }
  | { status: typeof OpenRouterAuthorizationCompletionStatus.FAILED }
  | { status: typeof OpenRouterAuthorizationCompletionStatus.CONNECTED };

export async function completeOpenRouterAuthorization(
  captured: OpenRouterAuthorizationReturn | null,
): Promise<CompleteOpenRouterAuthorizationResult> {
  if (captured === null) {
    return { status: OpenRouterAuthorizationCompletionStatus.NONE };
  }

  try {
    if (authorizationProcessFailed(captured)) {
      // Current saved pending authorization is void
      clearPendingAuthorization();
      return { status: OpenRouterAuthorizationCompletionStatus.FAILED };
    }

    const pending = readPendingAuthorization();
    if (noAuthorizationWasInProgress(pending)) {
      logEngineFailure("Unexpected authorization requested.");
      return { status: OpenRouterAuthorizationCompletionStatus.FAILED };
    }

    // Current pending is valided, thus not needed in memory anymore
    clearPendingAuthorization();

    if (!canStartAuthorization()) {
      logEngineFailure("Missing required security context.");
      return { status: OpenRouterAuthorizationCompletionStatus.FAILED };
    }

    if (CSRFTokenMismatch(pending, captured)) {
      logEngineFailure("CSRF security gate failed.");
      return { status: OpenRouterAuthorizationCompletionStatus.FAILED };
    }

    const code = captured.code;
    if (hasNoAuthorizationCode(code)) {
      logEngineFailure("Authorization code security gate failed.");
      return { status: OpenRouterAuthorizationCompletionStatus.FAILED };
    }

    const apiKey = await exchangeCode(code, pending.verifier);
    saveSession(OpenRouterSession.create(apiKey));
    return { status: OpenRouterAuthorizationCompletionStatus.CONNECTED };
  } catch (error) {
    logEngineFailure("OpenRouter authorization could not complete", error);
    return { status: OpenRouterAuthorizationCompletionStatus.FAILED };
  }
}

function noAuthorizationWasInProgress(pending: PendingAuthorization | null) {
  return pending === null;
}

function authorizationProcessFailed(captured: OpenRouterAuthorizationReturn) {
  return captured.captureFailed || captured.error !== null;
}

/**
 * @see https://openrouter.ai/docs/guides/overview/auth/oauth#optional-parameters
 */
function CSRFTokenMismatch(pending: PendingAuthorization, captured: OpenRouterAuthorizationReturn) {
  return pending.state !== captured.state;
}

function hasNoAuthorizationCode(code: string | null): code is null {
  return code === null || code.trim().length === 0;
}
