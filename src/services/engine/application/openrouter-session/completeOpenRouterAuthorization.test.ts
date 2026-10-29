import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { OpenRouterAuthorizationCompletionStatus } from "../../domain/openrouter-session/OpenRouterAuthorizationStatus.ts";
import { OpenRouterSession } from "../../domain/openrouter-session/OpenRouterSession.ts";
import type { PendingAuthorization } from "../../infrastructure/browser/pendingStore.ts";
import {
  completeOpenRouterAuthorization,
  type OpenRouterAuthorizationReturn,
} from "./completeOpenRouterAuthorization.ts";

const mocks = vi.hoisted(() => ({
  canStartAuthorization: vi.fn(),
  readPendingAuthorization: vi.fn(),
  clearPendingAuthorization: vi.fn(),
  exchangeCode: vi.fn(),
  saveSession: vi.fn(),
}));

vi.mock("../../infrastructure/browser/browserLocation.ts", () => ({
  canStartAuthorization: mocks.canStartAuthorization,
}));

vi.mock("../../infrastructure/browser/pendingStore.ts", () => ({
  readPendingAuthorization: mocks.readPendingAuthorization,
  clearPendingAuthorization: mocks.clearPendingAuthorization,
}));

vi.mock("../../infrastructure/openrouter/exchangeCode.ts", () => ({
  exchangeCode: mocks.exchangeCode,
}));

vi.mock("../../infrastructure/openrouter/sessionStore.ts", () => ({
  saveSession: mocks.saveSession,
}));

const PENDING: PendingAuthorization = {
  verifier: "the-verifier",
  state: "the-state",
  createdAt: 0,
};
const CAPTURED: OpenRouterAuthorizationReturn = {
  code: "the-code",
  state: "the-state",
  error: null,
  captureFailed: false,
};

describe("completeOpenRouterAuthorization unit", () => {
  beforeEach(() => {
    mocks.canStartAuthorization.mockReturnValue(true);
    mocks.readPendingAuthorization.mockReturnValue(PENDING);
    mocks.exchangeCode.mockResolvedValue("sk-or-v1-from-exchange");
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test("answers none when no return was captured", async () => {
    await expect(completeOpenRouterAuthorization(null)).resolves.toEqual({
      status: OpenRouterAuthorizationCompletionStatus.NONE,
    });
    expect(mocks.readPendingAuthorization).not.toHaveBeenCalled();
    expect(mocks.exchangeCode).not.toHaveBeenCalled();
  });

  test("connects and saves the session after a state-matched exchange", async () => {
    const result = await completeOpenRouterAuthorization(CAPTURED);

    expect(result).toEqual({ status: OpenRouterAuthorizationCompletionStatus.CONNECTED });
    expect(mocks.exchangeCode).toHaveBeenCalledWith(CAPTURED.code, PENDING.verifier);
    expect(mocks.saveSession).toHaveBeenCalledWith(expect.any(OpenRouterSession));
    expect(mocks.clearPendingAuthorization).toHaveBeenCalledOnce();
    expect(mocks.clearPendingAuthorization.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.exchangeCode.mock.invocationCallOrder[0],
    );
  });

  test("fails a failed return before reading the pending record", async () => {
    await expect(completeOpenRouterAuthorization({ ...CAPTURED, captureFailed: true })).resolves.toEqual({
      status: OpenRouterAuthorizationCompletionStatus.FAILED,
    });
    expect(mocks.readPendingAuthorization).not.toHaveBeenCalled();
    expect(mocks.exchangeCode).not.toHaveBeenCalled();
  });

  test("fails a provider denial before the state check, without echoing state", async () => {
    await expect(
      completeOpenRouterAuthorization({
        code: null,
        state: null,
        error: "access_denied",
        captureFailed: false,
      }),
    ).resolves.toEqual({ status: OpenRouterAuthorizationCompletionStatus.FAILED });
    expect(mocks.readPendingAuthorization).not.toHaveBeenCalled();
    expect(mocks.clearPendingAuthorization).toHaveBeenCalledOnce();
    expect(mocks.exchangeCode).not.toHaveBeenCalled();
  });

  test("fails a missing code", async () => {
    await expect(completeOpenRouterAuthorization({ ...CAPTURED, code: null })).resolves.toEqual({
      status: OpenRouterAuthorizationCompletionStatus.FAILED,
    });
    expect(mocks.exchangeCode).not.toHaveBeenCalled();
  });

  test("fails a whitespace-only code", async () => {
    await expect(completeOpenRouterAuthorization({ ...CAPTURED, code: "   " })).resolves.toEqual({
      status: OpenRouterAuthorizationCompletionStatus.FAILED,
    });
    expect(mocks.exchangeCode).not.toHaveBeenCalled();
  });

  test("fails a missing pending record", async () => {
    mocks.readPendingAuthorization.mockReturnValue(null);

    await expect(completeOpenRouterAuthorization(CAPTURED)).resolves.toEqual({
      status: OpenRouterAuthorizationCompletionStatus.FAILED,
    });
    expect(mocks.exchangeCode).not.toHaveBeenCalled();
  });

  test("fails an expired pending record", async () => {
    mocks.readPendingAuthorization.mockReturnValue(null);

    await expect(completeOpenRouterAuthorization(CAPTURED)).resolves.toEqual({
      status: OpenRouterAuthorizationCompletionStatus.FAILED,
    });
    expect(mocks.clearPendingAuthorization).not.toHaveBeenCalled();
    expect(mocks.exchangeCode).not.toHaveBeenCalled();
  });

  test("fails a state mismatch", async () => {
    await expect(completeOpenRouterAuthorization({ ...CAPTURED, state: "another-state" })).resolves.toEqual({
      status: OpenRouterAuthorizationCompletionStatus.FAILED,
    });
    expect(mocks.clearPendingAuthorization).toHaveBeenCalledOnce();
    expect(mocks.exchangeCode).not.toHaveBeenCalled();
  });

  test("fails a storage read refusal", async () => {
    mocks.readPendingAuthorization.mockImplementation(() => {
      throw new Error("storage is blocked");
    });

    await expect(completeOpenRouterAuthorization(CAPTURED)).resolves.toEqual({
      status: OpenRouterAuthorizationCompletionStatus.FAILED,
    });
    expect(mocks.exchangeCode).not.toHaveBeenCalled();
  });

  test("fails an unsafe origin", async () => {
    mocks.canStartAuthorization.mockReturnValue(false);

    await expect(completeOpenRouterAuthorization(CAPTURED)).resolves.toEqual({
      status: OpenRouterAuthorizationCompletionStatus.FAILED,
    });
    expect(mocks.exchangeCode).not.toHaveBeenCalled();
  });

  test("fails an exchange failure without saving a session", async () => {
    mocks.exchangeCode.mockRejectedValue(new Error("exchange failed"));

    await expect(completeOpenRouterAuthorization(CAPTURED)).resolves.toEqual({
      status: OpenRouterAuthorizationCompletionStatus.FAILED,
    });
    expect(mocks.saveSession).not.toHaveBeenCalled();
  });

  test("fails a session save failure", async () => {
    mocks.saveSession.mockImplementation(() => {
      throw new Error("save failed");
    });

    await expect(completeOpenRouterAuthorization(CAPTURED)).resolves.toEqual({
      status: OpenRouterAuthorizationCompletionStatus.FAILED,
    });
  });

  test("fails a clear refusal before starting the exchange", async () => {
    mocks.clearPendingAuthorization.mockImplementation(() => {
      throw new Error("storage is blocked");
    });

    await expect(completeOpenRouterAuthorization(CAPTURED)).resolves.toEqual({
      status: OpenRouterAuthorizationCompletionStatus.FAILED,
    });
    expect(mocks.exchangeCode).not.toHaveBeenCalled();
    expect(mocks.saveSession).not.toHaveBeenCalled();
  });
});
