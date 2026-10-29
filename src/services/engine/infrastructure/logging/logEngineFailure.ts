export function logEngineFailure(message: string, failure?: unknown): void {
  if (import.meta.env.DEV) {
    console.error(message, failure);
  }
}
