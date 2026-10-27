import { beforeEach, describe, expect, test } from "vitest";
import { OpenRouterSession } from "../../domain/openrouter-session/OpenRouterSession.ts";
import { deleteSession, readSession, saveSession } from "../../infrastructure/openrouter/sessionStore.ts";
import { openRouterSessionAPI } from "./openRouterSessionApi.ts";

const API_KEY = "sk-or-v1-api-integration";

describe("openRouterSessionApi integration", () => {
  beforeEach(() => {
    deleteSession();
  });

  test("answers whether the real store holds a session", () => {
    expect(openRouterSessionAPI.hasSession()).toBe(false);

    saveSession(OpenRouterSession.create(API_KEY));

    expect(openRouterSessionAPI.hasSession()).toBe(true);
  });

  test("disconnect clears the real store and cannot fail", () => {
    saveSession(OpenRouterSession.create(API_KEY));

    expect(openRouterSessionAPI.disconnect()).toBeUndefined();
    expect(readSession()).toBeNull();
    expect(openRouterSessionAPI.hasSession()).toBe(false);
    expect(() => openRouterSessionAPI.disconnect()).not.toThrow();
  });

  test("exposes only the session status and the disconnect action", () => {
    saveSession(OpenRouterSession.create(API_KEY));

    expect(Object.keys(openRouterSessionAPI).sort()).toEqual(["disconnect", "hasSession"]);
    expect(JSON.stringify(openRouterSessionAPI)).not.toContain(API_KEY);
  });
});
