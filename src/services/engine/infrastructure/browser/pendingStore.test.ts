import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  clearPendingAuthorization,
  type PendingAuthorization,
  readPendingAuthorization,
  savePendingAuthorization,
} from "./pendingStore.ts";

const PENDING_STORAGE_KEY = "tanuki-kanji.openrouter.pkce";
const PENDING: PendingAuthorization = {
  verifier: "the-verifier",
  state: "the-state",
  createdAt: Date.now(),
};

describe("pendingStore unit", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  test("saves and reads back the pending authorization", () => {
    savePendingAuthorization(PENDING);

    expect(readPendingAuthorization()).toEqual(PENDING);
    expect(sessionStorage.getItem(PENDING_STORAGE_KEY)).toBe(JSON.stringify(PENDING));
  });

  test("clears the pending authorization", () => {
    savePendingAuthorization(PENDING);

    clearPendingAuthorization();

    expect(readPendingAuthorization()).toBeNull();
    expect(sessionStorage.getItem(PENDING_STORAGE_KEY)).toBeNull();
  });

  test("reads a malformed record as absent and clears it", () => {
    sessionStorage.setItem(PENDING_STORAGE_KEY, "{not json");

    expect(readPendingAuthorization()).toBeNull();
    expect(sessionStorage.getItem(PENDING_STORAGE_KEY)).toBeNull();
  });

  test("reads a record with missing fields as absent and clears it", () => {
    sessionStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify({ verifier: "the-verifier" }));

    expect(readPendingAuthorization()).toBeNull();
    expect(sessionStorage.getItem(PENDING_STORAGE_KEY)).toBeNull();
  });

  test("reads an expired record as absent and clears it", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-27T00:00:00.000Z"));
    savePendingAuthorization({ ...PENDING, createdAt: Date.now() });

    const expectedPendingLifetime = 10 * 60 * 1000;
    vi.setSystemTime(Date.now() + expectedPendingLifetime + 1);

    expect(readPendingAuthorization()).toBeNull();
    expect(sessionStorage.getItem(PENDING_STORAGE_KEY)).toBeNull();
  });

  test("keeps a record inside the pending lifetime", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-27T00:00:00.000Z"));
    savePendingAuthorization({ ...PENDING, createdAt: Date.now() });

    const expectedPendingLifetime = 10 * 60 * 1000;
    vi.setSystemTime(Date.now() + expectedPendingLifetime - 1);

    expect(readPendingAuthorization()).toEqual({ ...PENDING, createdAt: expect.any(Number) });
  });

  test("lets a storage write refusal surface", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage is blocked");
    });

    expect(() => savePendingAuthorization(PENDING)).toThrow("storage is blocked");
  });

  test("lets a storage read refusal surface", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage is blocked");
    });

    expect(() => readPendingAuthorization()).toThrow("storage is blocked");
  });

  test("lets a storage clear refusal surface", () => {
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("storage is blocked");
    });

    expect(() => clearPendingAuthorization()).toThrow("storage is blocked");
  });

  test("lets a clear refusal surface while discarding a malformed record", () => {
    sessionStorage.setItem(PENDING_STORAGE_KEY, "{not json");
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("storage is blocked");
    });

    expect(() => readPendingAuthorization()).toThrow("storage is blocked");
  });
});
