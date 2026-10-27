import { CODE_CHALLENGE_METHOD } from "../browser/pkce.ts";
import {
  createEmptyCodeError,
  createEmptyVerifierError,
  createHttpStatusError,
  createRequestFailedError,
  createTimeoutError,
  createUnexpectedAnswerError,
  OpenRouterCodeExchangeError,
} from "./OpenRouterCodeExchangeError.ts";

const EXCHANGE_URL = "https://openrouter.ai/api/v1/auth/keys";
const EXCHANGE_TIMEOUT_MS = 15_000;

/**
 * Finishes the PKCE handshake. PKCE ties the callback to the app that started
 * it: a public SHA-256 challenge travels in the authorization redirect, while
 * the verifier stays local, so an intercepted code alone is useless. This
 * function trades that code plus the verifier for the provider API key.
 *
 * @param code The one-time authorization code OpenRouter returned on the
 *   callback; it cannot be redeemed without the matching verifier.
 * @param codeVerifier The secret kept out of the redirect whose hash was sent
 *   as the challenge, proving this app started the flow.
 */
export async function exchangeCode(code: string, codeVerifier: string): Promise<string> {
  const controller = new AbortController();
  let timeoutId: number | undefined;

  try {
    if (code.trim().length === 0) {
      throw createEmptyCodeError();
    }
    if (codeVerifier.trim().length === 0) {
      throw createEmptyVerifierError();
    }

    timeoutId = window.setTimeout(() => controller.abort(), EXCHANGE_TIMEOUT_MS);

    const response = await fetch(EXCHANGE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        code,
        code_verifier: codeVerifier,
        code_challenge_method: CODE_CHALLENGE_METHOD,
      }),
      credentials: "omit",
      redirect: "error",
      mode: "cors",
      referrerPolicy: "no-referrer",
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw createHttpStatusError(response.status);
    }

    return parseKey(await response.text());
  } catch (failure) {
    const exchangeError = toExchangeError(failure, controller.signal.aborted);
    logExchangeFailure(exchangeError);
    throw exchangeError;
  } finally {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
    }
  }
}

function parseKey(rawAnswer: string): string {
  let answer: unknown;
  try {
    answer = JSON.parse(rawAnswer);
  } catch {
    throw createUnexpectedAnswerError();
  }

  if (typeof answer !== "object" || answer === null) {
    throw createUnexpectedAnswerError();
  }

  const key = (answer as { key?: unknown }).key;
  if (typeof key !== "string" || key.trim().length === 0) {
    throw createUnexpectedAnswerError();
  }

  return key;
}

function toExchangeError(failure: unknown, aborted: boolean): OpenRouterCodeExchangeError {
  if (failure instanceof OpenRouterCodeExchangeError) {
    return failure;
  }
  if (aborted) {
    return createTimeoutError();
  }
  return createRequestFailedError();
}

function logExchangeFailure(exchangeError: OpenRouterCodeExchangeError): void {
  if (import.meta.env.DEV) {
    console.error("OpenRouter code exchange failed:", exchangeError.exchangeCause);
  }
}
