export class OpenRouterSession {
  #apiKey: string;

  private constructor(apiKey: string) {
    this.#apiKey = apiKey;
  }

  static create(rawApiKey: string): OpenRouterSession {
    const apiKey = rawApiKey.trim();
    if (apiKey.length === 0) {
      throw new Error("OpenRouter API key is empty");
    }
    return new OpenRouterSession(apiKey);
  }

  get apiKey(): string {
    return this.#apiKey;
  }
}
