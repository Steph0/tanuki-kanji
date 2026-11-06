import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { hasCapturedReturn, takeCapturedReturn } from "./capturedReturnStore.ts";
import { captureOpenRouterAuthorizationReturn } from "./captureOpenRouterAuthorizationReturn.ts";

const mocks = vi.hoisted(() => ({
  captureCallbackReturn: vi.fn(),
}));

vi.mock("../../infrastructure/browser/browserLocation.ts", () => ({
  captureCallbackReturn: mocks.captureCallbackReturn,
}));

const QUERY = {
  code: "the-code",
  state: "the-state",
  error: null,
};

describe("captureOpenRouterAuthorizationReturn unit", () => {
  beforeEach(() => {
    takeCapturedReturn();
    mocks.captureCallbackReturn.mockReturnValue({ status: "captured", query: QUERY });
  });

  afterEach(() => {
    takeCapturedReturn();
    vi.resetAllMocks();
  });

  test("answers false and stores nothing when the URL carries no callback", () => {
    mocks.captureCallbackReturn.mockReturnValue({ status: "none" });

    expect(captureOpenRouterAuthorizationReturn()).toBe(false);
    expect(hasCapturedReturn()).toBe(false);
  });

  test("stores the code, state, and error from the callback", () => {
    expect(captureOpenRouterAuthorizationReturn()).toBe(true);
    expect(takeCapturedReturn()).toEqual({ ...QUERY, captureFailed: false });
  });

  test("marks a callback whose URL cleanup failed", () => {
    mocks.captureCallbackReturn.mockReturnValue({ status: "failed", query: QUERY });

    expect(captureOpenRouterAuthorizationReturn()).toBe(true);
    expect(takeCapturedReturn()).toEqual({ ...QUERY, captureFailed: true });
  });

  test("keeps the first return and does not read the browser again", () => {
    captureOpenRouterAuthorizationReturn();

    expect(captureOpenRouterAuthorizationReturn()).toBe(true);
    expect(mocks.captureCallbackReturn).toHaveBeenCalledOnce();
    expect(takeCapturedReturn()).toEqual({ ...QUERY, captureFailed: false });
  });
});
