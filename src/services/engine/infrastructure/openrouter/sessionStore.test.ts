import { beforeEach, describe, expect, test } from "vitest";
import { OpenRouterSession } from "../../domain/openrouter-session/OpenRouterSession.ts";
import { deleteSession, hasSession, saveSession } from "./sessionStore.ts";

describe("sessionStore unit", () => {
  beforeEach(() => {
    deleteSession();
  });

  test("starts with no session for the tab", () => {
    expect(hasSession()).toBe(false);
  });

  test("reports a session once one is saved", () => {
    saveSession(OpenRouterSession.create("sk-or-v1-memory-only"));

    expect(hasSession()).toBe(true);
  });

  test("reports no session after a delete", () => {
    saveSession(OpenRouterSession.create("sk-or-v1-memory-only"));

    deleteSession();

    expect(hasSession()).toBe(false);
  });

  test("keeps a session when a newer one replaces it", () => {
    saveSession(OpenRouterSession.create("sk-or-v1-first"));

    saveSession(OpenRouterSession.create("sk-or-v1-latest"));

    expect(hasSession()).toBe(true);
  });

  test("deleting with nothing saved stays safe", () => {
    deleteSession();

    deleteSession();

    expect(hasSession()).toBe(false);
  });
});
