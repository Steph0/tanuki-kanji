import { logEngineFailure } from "../logging/logEngineFailure.ts";

const OPENROUTER_PENDING_LIFETIME_MS = 10 * 60 * 1000;
const PENDING_STORAGE_KEY = "tanuki-kanji.openrouter.pkce";

export type PendingAuthorization = {
  verifier: string;
  state: string;
  createdAt: number;
};

export function savePendingAuthorization(pending: PendingAuthorization): void {
  sessionStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(pending));
}

export function readPendingAuthorization(): PendingAuthorization | null {
  const raw = sessionStorage.getItem(PENDING_STORAGE_KEY);
  if (raw === null) {
    return null;
  }

  const pending = parsePendingAuthorization(raw);
  if (pending === null || isExpired(pending, Date.now())) {
    clearPendingAuthorization();
    return null;
  }
  return pending;
}

export function clearPendingAuthorization(): void {
  sessionStorage.removeItem(PENDING_STORAGE_KEY);
}

function parsePendingAuthorization(raw: string): PendingAuthorization | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    logEngineFailure("OpenRouter pending authorization is malformed", error);
    return null;
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return null;
  }

  const record = parsed as Record<string, unknown>;
  if (typeof record.verifier !== "string" || record.verifier.length === 0) {
    return null;
  }
  if (typeof record.state !== "string" || record.state.length === 0) {
    return null;
  }
  if (typeof record.createdAt !== "number" || !Number.isFinite(record.createdAt)) {
    return null;
  }
  return { verifier: record.verifier, state: record.state, createdAt: record.createdAt };
}

function isExpired(pending: PendingAuthorization, now: number): boolean {
  return now - pending.createdAt >= OPENROUTER_PENDING_LIFETIME_MS;
}
