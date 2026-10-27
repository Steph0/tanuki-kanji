export class OpenRouterCodeExchangeError extends Error {
  readonly exchangeCause: string;

  constructor(exchangeCause: string) {
    super(`OpenRouter code exchange failed: ${exchangeCause}`);
    this.name = "OpenRouterCodeExchangeError";
    this.exchangeCause = exchangeCause;
  }
}

export function createEmptyCodeError(): OpenRouterCodeExchangeError {
  return new OpenRouterCodeExchangeError("Empty code");
}

export function createEmptyVerifierError(): OpenRouterCodeExchangeError {
  return new OpenRouterCodeExchangeError("Empty verifier");
}

export function createHttpStatusError(status: number): OpenRouterCodeExchangeError {
  return new OpenRouterCodeExchangeError(`HTTP ${status}`);
}

export function createRequestFailedError(): OpenRouterCodeExchangeError {
  return new OpenRouterCodeExchangeError("Request failed");
}

export function createTimeoutError(): OpenRouterCodeExchangeError {
  return new OpenRouterCodeExchangeError("Timeout");
}

export function createUnexpectedAnswerError(): OpenRouterCodeExchangeError {
  return new OpenRouterCodeExchangeError("Unexpected answer");
}
