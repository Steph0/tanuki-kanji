const MISSING_API_KEY_CAUSE = "missing VITE_OPENROUTER_API_KEY";
const UNEXPECTED_ANSWER_CAUSE = "unexpected provider answer";
const TRUNCATED_ANSWER_CAUSE = "truncated provider answer";

export class TanukiKanjiLessonProviderError extends Error {
  readonly providerCause: string;

  constructor(providerCause: string) {
    super(`tanuki kanji lesson provider request failed: ${providerCause}`);
    this.name = "TanukiKanjiLessonProviderError";
    this.providerCause = providerCause;
  }
}

export function createMissingApiKeyError(): TanukiKanjiLessonProviderError {
  return new TanukiKanjiLessonProviderError(MISSING_API_KEY_CAUSE);
}

export function createUnexpectedAnswerError(): TanukiKanjiLessonProviderError {
  return new TanukiKanjiLessonProviderError(UNEXPECTED_ANSWER_CAUSE);
}

export function createTruncatedAnswerError(): TanukiKanjiLessonProviderError {
  return new TanukiKanjiLessonProviderError(TRUNCATED_ANSWER_CAUSE);
}
