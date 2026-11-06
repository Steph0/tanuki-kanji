import { OpenRouterSession } from "../../domain/openrouter-session/OpenRouterSession.ts";
import { saveSession } from "./sessionStore.ts";

/**
 * Connects the local development key so the learner skips the OpenRouter
 * handshake. A production build never reads the key.
 */
export function connectDevelopmentSessionFromEnvironment(): void {
  if (!import.meta.env.DEV) {
    return;
  }
  const rawApiKey = import.meta.env.VITE_OPENROUTER_API_KEY?.trim();
  if (!rawApiKey) {
    return;
  }
  saveSession(OpenRouterSession.create(rawApiKey));
}
