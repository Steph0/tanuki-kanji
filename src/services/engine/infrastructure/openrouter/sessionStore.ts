import type { OpenRouterSession } from "../../domain/openrouter-session/OpenRouterSession.ts";

let storedSession: OpenRouterSession | null = null;

export function saveSession(session: OpenRouterSession): void {
  storedSession = session;
}

export function hasSession(): boolean {
  return storedSession !== null;
}

export function deleteSession(): void {
  storedSession = null;
}
