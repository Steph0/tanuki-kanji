import { afterEach, describe, expect, test, vi } from "vitest";
import { buildAuthorizationUrl, createPkcePair, type PkcePair } from "./pkce.ts";

const RFC_VERIFIER = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
const RFC_CHALLENGE = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM";
const BASE64URL_43 = /^[A-Za-z0-9_-]{43}$/;
const CALLBACK_URL = "https://tanuki.example/tanuki-kanji/";
const STATE = "state value/with+chars";
const RFC_VERIFIER_BYTES = Uint8Array.from(
  atob(`${RFC_VERIFIER.replaceAll("-", "+").replaceAll("_", "/")}=`),
  (character) => character.charCodeAt(0),
);

describe("pkce unit", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("derives the RFC 7636 S256 challenge from its verifier", async () => {
    stubRandomBytes([RFC_VERIFIER_BYTES, new Uint8Array(32)]);

    const pkce = await createPkcePair();

    expect(pkce.verifier).toBe(RFC_VERIFIER);
    expect(pkce.challenge).toBe(RFC_CHALLENGE);
  });

  test("generates unpadded base64url verifier, state, and challenge", async () => {
    const pkce = await createPkcePair();

    expect(pkce.verifier).toMatch(BASE64URL_43);
    expect(pkce.state).toMatch(BASE64URL_43);
    expect(pkce.challenge).toMatch(BASE64URL_43);
    expect(pkce.verifier).not.toBe(pkce.state);
  });

  test("builds the authorization URL through encoded query parameters", () => {
    const pkce: PkcePair = { verifier: RFC_VERIFIER, state: STATE, challenge: RFC_CHALLENGE };

    const url = new URL(buildAuthorizationUrl(CALLBACK_URL, pkce));

    expect(url.origin).toBe("https://openrouter.ai");
    expect(url.pathname).toBe("/auth");
    expect(url.searchParams.get("callback_url")).toBe(CALLBACK_URL);
    expect(url.searchParams.get("code_challenge")).toBe(RFC_CHALLENGE);
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("state")).toBe(STATE);
    expect(url.searchParams.get("key_label")).toBe("Tanuki Kanji");
    expect(url.search).toContain("callback_url=https%3A%2F%2Ftanuki.example%2Ftanuki-kanji%2F");
    expect(url.search).toContain("state=state+value%2Fwith%2Bchars");
    expect(url.search).toContain("key_label=Tanuki+Kanji");
  });
});

function stubRandomBytes(sequence: Uint8Array[]): void {
  let call = 0;
  vi.spyOn(crypto, "getRandomValues").mockImplementation(<T extends ArrayBufferView | null>(array: T): T => {
    if (array instanceof Uint8Array) {
      array.set(sequence[call] ?? sequence[sequence.length - 1]);
      call += 1;
    }
    return array;
  });
}
