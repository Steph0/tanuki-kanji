import { deleteSession, hasSession } from "../../infrastructure/openrouter/sessionStore.ts";

export function hasOpenRouterSession(): boolean {
  return hasSession();
}

export function disconnectOpenRouterSession(): void {
  deleteSession();
}
