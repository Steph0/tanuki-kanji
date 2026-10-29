import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  OpenRouterAuthorizationCompletionStatus,
  OpenRouterAuthorizationStartStatus,
} from "../../domain/openrouter-session/OpenRouterAuthorizationStatus.ts";
import { OpenRouterSession } from "../../domain/openrouter-session/OpenRouterSession.ts";
import * as pendingStore from "../../infrastructure/browser/pendingStore.ts";
import { exchangeCode } from "../../infrastructure/openrouter/exchangeCode.ts";
import * as sessionStore from "../../infrastructure/openrouter/sessionStore.ts";
import { openRouterSessionAPI as api } from "./openRouterSessionApi.ts";

vi.mock("../../infrastructure/openrouter/exchangeCode.ts", () => ({ exchangeCode: vi.fn() }));

const API_KEY = "sk-or-v1-api-integration";

describe("openRouterSessionApi integration", () => {
  beforeEach(async () => {
    sessionStorage.clear();
    sessionStore.deleteSession();
    window.history.replaceState({}, "", "/");
    await api.completeAuthorization();
    vi.mocked(exchangeCode).mockReset();
    vi.mocked(exchangeCode).mockResolvedValue(API_KEY);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("answers whether the real store holds a session", () => {
    expect(api.hasSession()).toBe(false);

    sessionStore.saveSession(OpenRouterSession.create(API_KEY));

    expect(api.hasSession()).toBe(true);
  });

  test("disconnect clears the real store and cannot fail", () => {
    sessionStore.saveSession(OpenRouterSession.create(API_KEY));

    expect(api.disconnect()).toBeUndefined();
    expect(api.hasSession()).toBe(false);
    expect(() => api.disconnect()).not.toThrow();
  });

  test("exposes only the session surface and no key or session read", () => {
    sessionStore.saveSession(OpenRouterSession.create(API_KEY));

    expect(Object.keys(api).sort()).toEqual([
      "beginAuthorization",
      "captureAuthorizationReturn",
      "completeAuthorization",
      "disconnect",
      "hasSession",
    ]);
    expect(JSON.stringify(api)).not.toContain(API_KEY);
  });

  test("captures the pushed callback, strips the query, and connects once", async () => {
    pendingStore.savePendingAuthorization({
      verifier: "the-verifier",
      state: "the-state",
      createdAt: Date.now(),
    });
    window.history.pushState({}, "", "/settings?keep=1&code=the-code&state=the-state#section");

    expect(api.captureAuthorizationReturn()).toBe(true);
    expect(window.location.search).toBe("?keep=1");
    vi.mocked(exchangeCode).mockImplementation(async () => {
      expect(window.location.search).not.toContain("code=");
      expect(pendingStore.readPendingAuthorization()).toBeNull();
      return API_KEY;
    });

    await expect(api.completeAuthorization()).resolves.toEqual({
      status: OpenRouterAuthorizationCompletionStatus.CONNECTED,
    });
    expect(api.hasSession()).toBe(true);
    expect(api.captureAuthorizationReturn()).toBe(false);
    await expect(api.completeAuthorization()).resolves.toEqual({
      status: OpenRouterAuthorizationCompletionStatus.NONE,
    });
    expect(window.location.search).toBe("?keep=1");
  });

  test("begins the real PKCE handshake and seeds the pending record", async () => {
    const result = await api.beginAuthorization();

    expect(result.status).toBe(OpenRouterAuthorizationStartStatus.READY);
    if (result.status !== OpenRouterAuthorizationStartStatus.READY) {
      throw new Error("expected a ready start");
    }

    const authorizationUrl = new URL(result.authorizationUrl);
    expect(authorizationUrl.origin).toBe("https://openrouter.ai");
    expect(authorizationUrl.pathname).toBe("/auth");
    expect(authorizationUrl.searchParams.get("callback_url")).toBe(`${window.location.origin}/`);
    expect(authorizationUrl.searchParams.get("code_challenge_method")).toBe("S256");
    expect(authorizationUrl.searchParams.get("key_label")).toBe("Tanuki Kanji");

    const pending = pendingStore.readPendingAuthorization();
    expect(pending?.state).toBe(authorizationUrl.searchParams.get("state"));
    expect(pending?.verifier).toHaveLength(43);
    expect(authorizationUrl.searchParams.get("code_challenge")).toHaveLength(43);
    expect(api.hasSession()).toBe(false);
  });
});
