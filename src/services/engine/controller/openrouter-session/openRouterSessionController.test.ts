import { beforeEach, describe, expect, test } from "vitest";
import { OpenRouterSession } from "../../domain/openrouter-session/OpenRouterSession.ts";
import { deleteSession, readSession, saveSession } from "../../infrastructure/openrouter/sessionStore.ts";
import { disconnectOpenRouterSession, hasOpenRouterSession } from "./openRouterSessionController.ts";

describe("openRouterSessionController unit", () => {
  beforeEach(() => {
    deleteSession();
  });

  test("reports no session before the store holds one", () => {
    expect(hasOpenRouterSession()).toBe(false);
  });

  test("reports a session once the store holds one", () => {
    saveSession(OpenRouterSession.create("sk-or-v1-controller"));

    expect(hasOpenRouterSession()).toBe(true);
  });

  test("reports no session after a disconnect", () => {
    saveSession(OpenRouterSession.create("sk-or-v1-controller"));

    disconnectOpenRouterSession();

    expect(hasOpenRouterSession()).toBe(false);
  });

  test("disconnect clears the store and returns nothing", () => {
    saveSession(OpenRouterSession.create("sk-or-v1-controller"));

    const result = disconnectOpenRouterSession();

    expect(result).toBeUndefined();
    expect(readSession()).toBeNull();
  });

  test("a second disconnect stays safe", () => {
    saveSession(OpenRouterSession.create("sk-or-v1-controller"));
    disconnectOpenRouterSession();

    expect(() => disconnectOpenRouterSession()).not.toThrow();
    expect(hasOpenRouterSession()).toBe(false);
  });
});
