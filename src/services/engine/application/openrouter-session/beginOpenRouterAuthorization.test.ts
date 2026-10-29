import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { OpenRouterAuthorizationStartStatus } from "../../domain/openrouter-session/OpenRouterAuthorizationStatus.ts";
import type { PkcePair } from "../../infrastructure/browser/pkce.ts";

const mocks = vi.hoisted(() => ({
  canStartAuthorization: vi.fn(),
  readAppRoot: vi.fn(),
  createPkcePair: vi.fn(),
  buildAuthorizationUrl: vi.fn(),
  savePendingAuthorization: vi.fn(),
}));

vi.mock("../../infrastructure/browser/browserLocation.ts", () => ({
  canStartAuthorization: mocks.canStartAuthorization,
  readAppRoot: mocks.readAppRoot,
}));

vi.mock("../../infrastructure/browser/pkce.ts", () => ({
  createPkcePair: mocks.createPkcePair,
  buildAuthorizationUrl: mocks.buildAuthorizationUrl,
}));

vi.mock("../../infrastructure/browser/pendingStore.ts", () => ({
  savePendingAuthorization: mocks.savePendingAuthorization,
}));

import { beginOpenRouterAuthorization } from "./beginOpenRouterAuthorization.ts";

const APP_ROOT = "https://tanuki.example/tanuki-kanji/";
const AUTHORIZATION_URL = "https://openrouter.ai/auth?code_challenge=the-challenge";
const PKCE: PkcePair = {
  verifier: "the-verifier",
  state: "the-state",
  challenge: "the-challenge",
};

describe("beginOpenRouterAuthorization unit", () => {
  beforeEach(() => {
    mocks.canStartAuthorization.mockReturnValue(true);
    mocks.readAppRoot.mockReturnValue(APP_ROOT);
    mocks.createPkcePair.mockResolvedValue(PKCE);
    mocks.buildAuthorizationUrl.mockReturnValue(AUTHORIZATION_URL);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test("answers ready with the authorization URL after saving the pending record", async () => {
    const result = await beginOpenRouterAuthorization();

    expect(result).toEqual({
      status: OpenRouterAuthorizationStartStatus.READY,
      authorizationUrl: AUTHORIZATION_URL,
    });
    expect(mocks.canStartAuthorization).toHaveBeenCalledOnce();
    expect(mocks.savePendingAuthorization).toHaveBeenCalledWith({
      verifier: PKCE.verifier,
      state: PKCE.state,
      createdAt: expect.any(Number),
    });
    expect(mocks.buildAuthorizationUrl).toHaveBeenCalledWith(APP_ROOT, PKCE);
  });

  test("builds the authorization URL before saving the pending record", async () => {
    await beginOpenRouterAuthorization();

    expect(mocks.buildAuthorizationUrl.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.savePendingAuthorization.mock.invocationCallOrder[0],
    );
  });

  test("refuses an unsafe origin before generating the pair", async () => {
    mocks.canStartAuthorization.mockReturnValue(false);

    await expect(beginOpenRouterAuthorization()).resolves.toEqual({
      status: OpenRouterAuthorizationStartStatus.REFUSED,
    });
    expect(mocks.createPkcePair).not.toHaveBeenCalled();
    expect(mocks.savePendingAuthorization).not.toHaveBeenCalled();
  });

  test("refuses when the pair generation throws, saving no pending record", async () => {
    mocks.createPkcePair.mockRejectedValue(new Error("crypto is unavailable"));

    await expect(beginOpenRouterAuthorization()).resolves.toEqual({
      status: OpenRouterAuthorizationStartStatus.REFUSED,
    });
    expect(mocks.savePendingAuthorization).not.toHaveBeenCalled();
  });

  test("refuses when the storage write throws", async () => {
    mocks.savePendingAuthorization.mockImplementation(() => {
      throw new Error("storage is blocked");
    });

    await expect(beginOpenRouterAuthorization()).resolves.toEqual({
      status: OpenRouterAuthorizationStartStatus.REFUSED,
    });
  });

  test("refuses when building the link throws, saving no pending record", async () => {
    mocks.buildAuthorizationUrl.mockImplementation(() => {
      throw new Error("link building failed");
    });

    await expect(beginOpenRouterAuthorization()).resolves.toEqual({
      status: OpenRouterAuthorizationStartStatus.REFUSED,
    });
    expect(mocks.savePendingAuthorization).not.toHaveBeenCalled();
  });
});
