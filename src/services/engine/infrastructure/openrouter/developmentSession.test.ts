import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { connectDevelopmentSessionFromEnvironment } from "./developmentSession.ts";
import { deleteSession, readSession } from "./sessionStore.ts";

const DEVELOPMENT_KEY = "sk-or-v1-development-key";

beforeEach(() => {
  vi.stubEnv("DEV", true);
});

afterEach(() => {
  deleteSession();
  vi.unstubAllEnvs();
});

describe("connectDevelopmentSessionFromEnvironment", () => {
  test("connects the development key as the session", () => {
    vi.stubEnv("VITE_OPENROUTER_API_KEY", `  ${DEVELOPMENT_KEY}\n`);

    connectDevelopmentSessionFromEnvironment();

    expect(readSession()?.apiKey).toBe(DEVELOPMENT_KEY);
  });

  test("leaves the app disconnected when the development key is absent", () => {
    vi.stubEnv("VITE_OPENROUTER_API_KEY", undefined);

    connectDevelopmentSessionFromEnvironment();

    expect(readSession()).toBeNull();
  });

  test("treats a blank development key as absent", () => {
    vi.stubEnv("VITE_OPENROUTER_API_KEY", "");

    connectDevelopmentSessionFromEnvironment();

    expect(readSession()).toBeNull();
  });

  test("treats a whitespace-only development key as absent", () => {
    vi.stubEnv("VITE_OPENROUTER_API_KEY", "  \n\t");

    connectDevelopmentSessionFromEnvironment();

    expect(readSession()).toBeNull();
  });

  test("ignores the development key outside development", () => {
    vi.stubEnv("DEV", false);
    vi.stubEnv("VITE_OPENROUTER_API_KEY", DEVELOPMENT_KEY);

    connectDevelopmentSessionFromEnvironment();

    expect(readSession()).toBeNull();
  });
});
