import type { OpenRouterSession } from "../../domain/openrouter-session/OpenRouterSession.ts";

let storedSession: OpenRouterSession | null = null;

export function saveSession(session: OpenRouterSession): void {
  storedSession = session;
}

export function readSession(): OpenRouterSession | null {
  return storedSession;
}

export function deleteSession(): void {
  storedSession = null;
}
