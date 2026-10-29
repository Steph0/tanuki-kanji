import { OpenRouterAuthorizationStartStatus } from "../../domain/openrouter-session/OpenRouterAuthorizationStatus.ts";
import { canStartAuthorization, readAppRoot } from "../../infrastructure/browser/browserLocation.ts";
import { savePendingAuthorization } from "../../infrastructure/browser/pendingStore.ts";
import { buildAuthorizationUrl, createPkcePair } from "../../infrastructure/browser/pkce.ts";
import { logEngineFailure } from "../../infrastructure/logging/logEngineFailure.ts";

export type BeginOpenRouterAuthorizationResult =
  | {
      status: typeof OpenRouterAuthorizationStartStatus.READY;
      authorizationUrl: string;
    }
  | { status: typeof OpenRouterAuthorizationStartStatus.REFUSED };

export async function beginOpenRouterAuthorization(): Promise<BeginOpenRouterAuthorizationResult> {
  if (!canStartAuthorization()) {
    return { status: OpenRouterAuthorizationStartStatus.REFUSED };
  }

  try {
    const pkce = await createPkcePair();
    const authorizationUrl = buildAuthorizationUrl(readAppRoot(), pkce);
    savePendingAuthorization({
      verifier: pkce.verifier,
      state: pkce.state,
      createdAt: Date.now(),
    });
    return { status: OpenRouterAuthorizationStartStatus.READY, authorizationUrl };
  } catch (error) {
    logEngineFailure("OpenRouter authorization could not start", error);
    return { status: OpenRouterAuthorizationStartStatus.REFUSED };
  }
}
