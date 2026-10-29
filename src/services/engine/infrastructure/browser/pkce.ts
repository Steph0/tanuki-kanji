const AUTHORIZATION_URL = "https://openrouter.ai/auth";
const RANDOM_BYTE_LENGTH = 32;
const KEY_LABEL = "Tanuki Kanji";

export const DIGEST_ALGORITHM_BY_METHOD = {
  pkceId: "S256",
  algorithmName: "SHA-256",
} as const;

export type PkcePair = {
  verifier: string;
  state: string;
  challenge: string;
};

export async function createPkcePair(): Promise<PkcePair> {
  const verifier = createRandomValue();
  const state = createRandomValue();
  return { verifier, state, challenge: await createCodeChallenge(verifier) };
}

async function createCodeChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    DIGEST_ALGORITHM_BY_METHOD.algorithmName,
    new TextEncoder().encode(verifier),
  );
  return toBase64Url(new Uint8Array(digest));
}

export function buildAuthorizationUrl(callbackUrl: string, pkce: PkcePair): string {
  const search = new URLSearchParams({
    callback_url: callbackUrl,
    code_challenge: pkce.challenge,
    code_challenge_method: DIGEST_ALGORITHM_BY_METHOD.pkceId,
    state: pkce.state,
    key_label: KEY_LABEL,
  });
  return `${AUTHORIZATION_URL}?${search.toString()}`;
}

function createRandomValue(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(RANDOM_BYTE_LENGTH));
  return toBase64Url(bytes);
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}
