import { afterEach, describe, expect, test, vi } from "vitest";
import { logEngineFailure } from "./logEngineFailure.ts";

describe("logEngineFailure unit", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  test("logs the message and the failure in dev mode", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const failure = new Error("boom");

    logEngineFailure("engine step failed", failure);

    expect(consoleError).toHaveBeenCalledWith("engine step failed", failure);
  });

  test("stays quiet outside dev mode", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.stubEnv("DEV", false);

    logEngineFailure("engine step failed", new Error("boom"));

    expect(consoleError).not.toHaveBeenCalled();
  });
});
