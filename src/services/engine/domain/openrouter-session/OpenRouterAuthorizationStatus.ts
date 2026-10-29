export const OpenRouterAuthorizationStartStatus = {
  READY: "ready",
  REFUSED: "refused",
} as const;

export type OpenRouterAuthorizationStartStatus =
  (typeof OpenRouterAuthorizationStartStatus)[keyof typeof OpenRouterAuthorizationStartStatus];

export const OpenRouterAuthorizationCompletionStatus = {
  NONE: "none",
  FAILED: "failed",
  CONNECTED: "connected",
} as const;

export type OpenRouterAuthorizationCompletionStatus =
  (typeof OpenRouterAuthorizationCompletionStatus)[keyof typeof OpenRouterAuthorizationCompletionStatus];
