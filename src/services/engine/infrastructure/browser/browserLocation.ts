import { logEngineFailure } from "../logging/logEngineFailure.ts";
import { isSafeAuthorizationOrigin } from "./authorizationOrigin.ts";

const CALLBACK_PARAMETERS = ["code", "state", "error"] as const;

export type CallbackQuery = {
  code: string | null;
  state: string | null;
  error: string | null;
};

export type CallbackCapture =
  | { status: "none" }
  | { status: "captured"; query: CallbackQuery }
  | { status: "failed"; query: CallbackQuery };

export function readAppRoot(): string {
  return new URL(import.meta.env.BASE_URL, window.location.origin).toString();
}

export function canStartAuthorization(): boolean {
  return isSafeAuthorizationOrigin(
    new URL(window.location.href),
    window.isSecureContext,
    typeof globalThis.crypto?.subtle !== "undefined",
  );
}

export function captureCallbackReturn(): CallbackCapture {
  const currentUrl = new URL(window.location.href);
  const query = readCallbackQuery(currentUrl.searchParams);
  if (query.code === null && query.state === null && query.error === null) {
    return { status: "none" };
  }

  for (const parameter of CALLBACK_PARAMETERS) {
    currentUrl.searchParams.delete(parameter);
  }

  try {
    window.history.replaceState(
      window.history.state,
      "",
      `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`,
    );
  } catch (error) {
    logEngineFailure("OpenRouter authorization return could not be cleared from the URL", error);
    return { status: "failed", query };
  }

  return { status: "captured", query };
}

function readCallbackQuery(searchParams: URLSearchParams): CallbackQuery {
  return {
    code: searchParams.get("code"),
    state: searchParams.get("state"),
    error: searchParams.get("error"),
  };
}
