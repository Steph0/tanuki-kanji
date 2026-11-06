export type OpenRouterAuthorizationReturn = {
  code: string | null;
  state: string | null;
  error: string | null;
  captureFailed: boolean;
};

let capturedReturn: OpenRouterAuthorizationReturn | null = null;

export function hasCapturedReturn(): boolean {
  return capturedReturn !== null;
}

export function saveCapturedReturn(captured: OpenRouterAuthorizationReturn): void {
  capturedReturn = captured;
}

export function takeCapturedReturn(): OpenRouterAuthorizationReturn | null {
  const captured = capturedReturn;
  capturedReturn = null;
  return captured;
}
