import { describe, expect, test } from "vitest";
import { isSafeAuthorizationOrigin } from "./authorizationOrigin.ts";

describe("authorizationOrigin unit", () => {
  test.each([
    ["https://tanuki.example", true, true, true],
    ["http://localhost:5173", true, true, true],
    ["http://127.0.0.1:5173", true, true, true],
    ["http://127.8.9.10", true, true, true],
    ["http://[::1]:5173", true, true, true],
    ["http://tanuki.example", true, true, false],
    ["file:///home/tanuki/index.html", true, true, false],
    ["ftp://localhost", true, true, false],
    ["https://tanuki.example", false, true, false],
    ["https://tanuki.example", true, false, false],
    ["http://localhost", false, true, false],
  ])("answers %s with secure context %s and subtle crypto %s as %s", (origin, isSecureContext, hasSubtle, safe) => {
    expect(isSafeAuthorizationOrigin(new URL(origin), isSecureContext, hasSubtle)).toBe(safe);
  });
});
