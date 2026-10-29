import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { OpenRouterAuthorizationCompletionStatus } from "../../domain/openrouter-session/OpenRouterAuthorizationStatus.ts";
import { OpenRouterSession } from "../../domain/openrouter-session/OpenRouterSession.ts";
import * as pendingStore from "../../infrastructure/browser/pendingStore.ts";
import { exchangeCode } from "../../infrastructure/openrouter/exchangeCode.ts";
import * as sessionStore from "../../infrastructure/openrouter/sessionStore.ts";
import * as controller from "./openRouterSessionController.ts";

vi.mock("../../infrastructure/openrouter/exchangeCode.ts", () => ({ exchangeCode: vi.fn() }));

describe("openRouterSessionController unit", () => {
  beforeEach(async () => {
    sessionStorage.clear();
    sessionStore.deleteSession();
    window.history.replaceState({}, "", "/");
    await controller.completeAuthorization();
    vi.mocked(exchangeCode).mockReset();
    vi.mocked(exchangeCode).mockResolvedValue("sk-or-v1-controller");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("reports no session before the store holds one", () => {
    expect(controller.hasOpenRouterSession()).toBe(false);
  });

  test("reports a session once the store holds one", () => {
    sessionStore.saveSession(OpenRouterSession.create("sk-or-v1-controller"));

    expect(controller.hasOpenRouterSession()).toBe(true);
  });

  test("reports no session after a disconnect", () => {
    sessionStore.saveSession(OpenRouterSession.create("sk-or-v1-controller"));

    controller.disconnectOpenRouterSession();

    expect(controller.hasOpenRouterSession()).toBe(false);
  });

  test("disconnect clears the store and returns nothing", () => {
    sessionStore.saveSession(OpenRouterSession.create("sk-or-v1-controller"));

    const result = controller.disconnectOpenRouterSession();

    expect(result).toBeUndefined();
    expect(sessionStore.hasSession()).toBe(false);
  });

  test("a second disconnect stays safe", () => {
    sessionStore.saveSession(OpenRouterSession.create("sk-or-v1-controller"));
    controller.disconnectOpenRouterSession();

    expect(() => controller.disconnectOpenRouterSession()).not.toThrow();
    expect(controller.hasOpenRouterSession()).toBe(false);
  });

  test("captures no return when the URL carries no callback", async () => {
    expect(controller.captureAuthorizationReturn()).toBe(false);

    await expect(controller.completeAuthorization()).resolves.toEqual({
      status: OpenRouterAuthorizationCompletionStatus.NONE,
    });
    expect(exchangeCode).not.toHaveBeenCalled();
  });

  test("captures the return, strips the query, and completes the handshake once", async () => {
    pendingStore.savePendingAuthorization({
      verifier: "the-verifier",
      state: "the-state",
      createdAt: Date.now(),
    });
    window.history.pushState({}, "", "/settings?keep=1&code=the-code&state=the-state#section");

    expect(controller.captureAuthorizationReturn()).toBe(true);
    expect(window.location.pathname).toBe("/settings");
    expect(window.location.search).toBe("?keep=1");
    expect(window.location.hash).toBe("#section");

    vi.mocked(exchangeCode).mockImplementation(async () => {
      expect(window.location.search).not.toContain("code=");
      expect(pendingStore.readPendingAuthorization()).toBeNull();
      return "sk-or-v1-controller";
    });

    await expect(controller.completeAuthorization()).resolves.toEqual({
      status: OpenRouterAuthorizationCompletionStatus.CONNECTED,
    });
    expect(sessionStore.hasSession()).toBe(true);
    expect(controller.captureAuthorizationReturn()).toBe(false);
    await expect(controller.completeAuthorization()).resolves.toEqual({
      status: OpenRouterAuthorizationCompletionStatus.NONE,
    });
    expect(window.location.search).toBe("?keep=1");
  });

  test("keeps answering true until the captured return is spent", async () => {
    window.history.pushState({}, "", "/?code=the-code&state=the-state");

    expect(controller.captureAuthorizationReturn()).toBe(true);
    expect(controller.captureAuthorizationReturn()).toBe(true);

    await controller.completeAuthorization();

    expect(controller.captureAuthorizationReturn()).toBe(false);
  });

  test("marks a cleanup failure as a failed return and never exchanges", async () => {
    pendingStore.savePendingAuthorization({
      verifier: "the-verifier",
      state: "the-state",
      createdAt: Date.now(),
    });
    window.history.pushState({}, "", "/?code=the-code&state=the-state");
    vi.spyOn(window.history, "replaceState").mockImplementation(() => {
      throw new Error("history is blocked");
    });

    expect(controller.captureAuthorizationReturn()).toBe(true);
    await expect(controller.completeAuthorization()).resolves.toEqual({
      status: OpenRouterAuthorizationCompletionStatus.FAILED,
    });
    expect(exchangeCode).not.toHaveBeenCalled();
    expect(window.location.search).toContain("code=the-code");
  });

  test("answers none on a second complete while the first exchange is in flight", async () => {
    let resolveExchange!: (apiKey: string) => void;
    pendingStore.savePendingAuthorization({
      verifier: "the-verifier",
      state: "the-state",
      createdAt: Date.now(),
    });
    window.history.pushState({}, "", "/?code=the-code&state=the-state");
    expect(controller.captureAuthorizationReturn()).toBe(true);
    vi.mocked(exchangeCode).mockReturnValue(
      new Promise<string>((resolve) => {
        resolveExchange = resolve;
      }),
    );

    const firstCompletion = controller.completeAuthorization();
    await expect(controller.completeAuthorization()).resolves.toEqual({
      status: OpenRouterAuthorizationCompletionStatus.NONE,
    });

    resolveExchange("sk-or-v1-controller");

    await expect(firstCompletion).resolves.toEqual({
      status: OpenRouterAuthorizationCompletionStatus.CONNECTED,
    });
    expect(sessionStore.hasSession()).toBe(true);
  });
});
