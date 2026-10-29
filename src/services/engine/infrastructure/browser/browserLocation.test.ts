import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { captureCallbackReturn, readAppRoot } from "./browserLocation.ts";

const ORIGINAL_BASE_URL = import.meta.env.BASE_URL;
const ROOT_URL = "/";

describe("browserLocation unit", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", ROOT_URL);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.history.replaceState({}, "", ROOT_URL);
    import.meta.env.BASE_URL = ORIGINAL_BASE_URL;
  });

  test("reads the app root from the base path", () => {
    import.meta.env.BASE_URL = "/tanuki-kanji/";

    expect(readAppRoot()).toBe(`${window.location.origin}/tanuki-kanji/`);
  });

  test("answers no callback when the query carries no return parameters", () => {
    window.history.pushState({}, "", "/?keep=1#section");
    const replaceState = vi.spyOn(window.history, "replaceState");

    expect(captureCallbackReturn()).toEqual({ status: "none" });
    expect(replaceState).not.toHaveBeenCalled();
  });

  test("captures the callback and strips only its parameters", () => {
    window.history.pushState({}, "", "/settings?keep=1&code=the-code&state=the-state#section");

    expect(captureCallbackReturn()).toEqual({
      status: "captured",
      query: { code: "the-code", state: "the-state", error: null },
    });
    expect(window.location.pathname).toBe("/settings");
    expect(window.location.search).toBe("?keep=1");
    expect(window.location.hash).toBe("#section");
  });

  test("captures a provider error return", () => {
    window.history.pushState({}, "", "/settings?error=access_denied&keep=1");

    expect(captureCallbackReturn()).toEqual({
      status: "captured",
      query: { code: null, state: null, error: "access_denied" },
    });
    expect(window.location.search).toBe("?keep=1");
  });

  test("answers a failed return when the query cleanup throws", () => {
    window.history.pushState({}, "", "/settings?code=the-code&state=the-state&keep=1");
    vi.spyOn(window.history, "replaceState").mockImplementation(() => {
      throw new Error("history is blocked");
    });

    expect(captureCallbackReturn()).toEqual({
      status: "failed",
      query: { code: "the-code", state: "the-state", error: null },
    });
    expect(window.location.search).toBe("?code=the-code&state=the-state&keep=1");
  });
});
