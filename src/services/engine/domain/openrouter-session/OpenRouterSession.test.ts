import { describe, expect, test } from "vitest";
import { OpenRouterSession } from "./OpenRouterSession.ts";

describe("OpenRouterSession", () => {
  test("reads the trimmed key through its accessor", () => {
    const session = OpenRouterSession.create("  sk-or-v1-memory-only  ");

    expect(session).toBeInstanceOf(OpenRouterSession);
    expect(session.apiKey).toBe("sk-or-v1-memory-only");
  });

  test("keeps the key off its own enumerable and serialized shape", () => {
    const session = OpenRouterSession.create("sk-or-v1-memory-only");

    expect(Object.keys(session)).toEqual([]);
    expect(Object.getOwnPropertyNames(session)).toEqual([]);
    expect(Object.values(session)).toEqual([]);
    expect(JSON.stringify(session)).toBe("{}");
  });

  test("keeps the accessor on the prototype and read-only", () => {
    const accessor = Object.getOwnPropertyDescriptor(OpenRouterSession.prototype, "apiKey");

    expect(accessor?.get).toBeTypeOf("function");
    expect(accessor?.set).toBeUndefined();
  });

  test("refuses an empty key with a plain error carrying no key text", () => {
    const error = captureError(() => OpenRouterSession.create("   "));

    expect(error).toBeInstanceOf(Error);
    expect(Object.getPrototypeOf(error)).toBe(Error.prototype);
    expect((error as Error).message).toBe("OpenRouter API key is empty");
  });
});

function captureError(run: () => unknown): unknown {
  try {
    run();
  } catch (error) {
    return error;
  }
  throw new Error("expected the creation to throw");
}
