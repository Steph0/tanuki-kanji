import { beforeEach, describe, expect, test } from "vitest";
import { OpenRouterSession } from "../../domain/openrouter-session/OpenRouterSession.ts";
import { deleteSession, readSession, saveSession } from "./sessionStore.ts";

describe("sessionStore unit", () => {
  beforeEach(() => {
    deleteSession();
  });

  test("starts with no session for the tab", () => {
    expect(readSession()).toBeNull();
  });

  test("reads back the session it saved", () => {
    const session = OpenRouterSession.create("sk-or-v1-memory-only");

    saveSession(session);

    expect(readSession()).toBe(session);
  });

  test("keeps only the latest saved session", () => {
    saveSession(OpenRouterSession.create("sk-or-v1-first"));
    const latestSession = OpenRouterSession.create("sk-or-v1-latest");

    saveSession(latestSession);

    expect(readSession()).toBe(latestSession);
  });

  test("forgets the saved session on delete", () => {
    saveSession(OpenRouterSession.create("sk-or-v1-memory-only"));

    deleteSession();

    expect(readSession()).toBeNull();
  });

  test("deleting with nothing saved stays safe", () => {
    deleteSession();

    deleteSession();

    expect(readSession()).toBeNull();
  });
});
