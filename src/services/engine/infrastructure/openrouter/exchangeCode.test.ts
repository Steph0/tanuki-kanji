import { HttpResponse, http } from "msw";
import { setupWorker } from "msw/browser";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import { exchangeCode } from "./exchangeCode.ts";
import { OpenRouterCodeExchangeError } from "./OpenRouterCodeExchangeError.ts";

const EXCHANGE_URL = "https://openrouter.ai/api/v1/auth/keys";
const CODE = "one-time-code";
const CODE_VERIFIER = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
const PROVIDER_KEY = "sk-or-v1-provider-key";
const SECRET_PROVIDER_MESSAGE = "secret-provider-message";
const SECRET_CODE = "secret-one-time-code";
const SECRET_VERIFIER = "secret-code-verifier";

type CapturedRequest = {
  url: string;
  method: string;
  headers: Headers;
  body: unknown;
  credentials: RequestCredentials;
  redirect: RequestRedirect;
  mode: RequestMode;
  referrerPolicy: ReferrerPolicy;
  cache: RequestCache;
};

const worker = setupWorker();
let sentRequest: CapturedRequest | undefined;
let exchangeCallCount = 0;

beforeAll(async () => {
  await worker.start({ onUnhandledFrame: "error", serviceWorker: { url: "/mockServiceWorker.js" } });
});

afterAll(async () => {
  await worker.stop();
});

afterEach(() => {
  worker.resetHandlers();
  vi.restoreAllMocks();
  vi.useRealTimers();
  sentRequest = undefined;
  exchangeCallCount = 0;
});

describe("exchangeCode unit", () => {
  describe("key exchange request", () => {
    test("sends one POST carrying only the code, the verifier, and the S256 method", async () => {
      mockExchange(() => successfulAnswer(PROVIDER_KEY));

      await exchangeCode(CODE, CODE_VERIFIER);

      const request = capturedRequest();
      expect(request.method).toBe("POST");
      expect(request.url).toBe(EXCHANGE_URL);
      expect(request.body).toEqual({
        code: CODE,
        code_verifier: CODE_VERIFIER,
        code_challenge_method: "S256",
      });
      expect(exchangeCallCount).toBe(1);
    });

    test("announces a JSON answer and never authorizes the exchange request", async () => {
      mockExchange(() => successfulAnswer(PROVIDER_KEY));

      await exchangeCode(CODE, CODE_VERIFIER);

      const headers = capturedRequest().headers;
      expect(headers.get("content-type")).toBe("application/json");
      expect(headers.get("accept")).toBe("application/json");
      expect(headers.get("authorization")).toBeNull();
    });

    test("omits credentials, refuses redirects, and keeps the exchange out of caches and referrers", async () => {
      mockExchange(() => successfulAnswer(PROVIDER_KEY));

      await exchangeCode(CODE, CODE_VERIFIER);

      const request = capturedRequest();
      expect(request.credentials).toBe("omit");
      expect(request.redirect).toBe("error");
      expect(request.mode).toBe("cors");
      expect(request.referrerPolicy).toBe("no-referrer");
      expect(request.cache).toBe("no-store");
    });

    test("refuses an empty code before any request leaves the page", async () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      const exchangeError = await failureFrom(exchangeCode("   ", CODE_VERIFIER));

      expect(exchangeError.exchangeCause).toBe("Empty code");
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(consoleError).toHaveBeenCalledTimes(1);
    });

    test("refuses an empty verifier before any request leaves the page", async () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      const exchangeError = await failureFrom(exchangeCode(CODE, ""));

      expect(exchangeError.exchangeCause).toBe("Empty verifier");
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(consoleError).toHaveBeenCalledTimes(1);
    });
  });

  describe("provider answer", () => {
    test("hands back the provider key untouched so the session creator stays the only trimmer", async () => {
      mockExchange(() => successfulAnswer(`  ${PROVIDER_KEY}  `));

      const key = await exchangeCode(CODE, CODE_VERIFIER);

      expect(key).toBe(`  ${PROVIDER_KEY}  `);
    });

    test("rejects a body that is not JSON as an abnormal answer", async () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
      mockExchange(() => new HttpResponse("not json at all"));

      const exchangeError = await failureFrom(exchangeCode(CODE, CODE_VERIFIER));

      expect(exchangeError.exchangeCause).toBe("Unexpected answer");
      expect(consoleError).toHaveBeenCalledTimes(1);
    });

    test.each([
      ["a JSON null", "null"],
      ["a JSON array", "[]"],
      ["a JSON string", JSON.stringify(PROVIDER_KEY)],
      ["an object with no key", JSON.stringify({})],
      ["a key that is not a string", JSON.stringify({ key: 42 })],
      ["an empty key", JSON.stringify({ key: "" })],
      ["a whitespace-only key", JSON.stringify({ key: "   " })],
    ])("rejects %s as an abnormal answer", async (_shape, body) => {
      vi.spyOn(console, "error").mockImplementation(() => undefined);
      mockExchange(() => new HttpResponse(body));

      const exchangeError = await failureFrom(exchangeCode(CODE, CODE_VERIFIER));

      expect(exchangeError.exchangeCause).toBe("Unexpected answer");
      expect(exchangeCallCount).toBe(1);
    });
  });

  describe("exchange failures", () => {
    test.each([400, 401, 429, 500])("rejects an http %i answer with the safe status", async (status) => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
      mockExchange(() => HttpResponse.json({ error: { message: SECRET_PROVIDER_MESSAGE } }, { status }));

      const exchangeError = await failureFrom(exchangeCode(CODE, CODE_VERIFIER));

      expect(exchangeError.exchangeCause).toBe(`HTTP ${status}`);
      expect(exchangeError.message).not.toContain(SECRET_PROVIDER_MESSAGE);
      expect(exchangeCallCount).toBe(1);
      expect(consoleError).toHaveBeenCalledTimes(1);
    });

    test("checks the failure status before it reads an answer that would otherwise be a key", async () => {
      vi.spyOn(console, "error").mockImplementation(() => undefined);
      const providerAnswer = new Response(JSON.stringify({ key: PROVIDER_KEY }), { status: 401 });
      const bodyRead = vi.spyOn(providerAnswer, "text");
      vi.spyOn(globalThis, "fetch").mockResolvedValue(providerAnswer);

      const exchangeError = await failureFrom(exchangeCode(CODE, CODE_VERIFIER));

      expect(exchangeError.exchangeCause).toBe("HTTP 401");
      expect(bodyRead).not.toHaveBeenCalled();
    });

    test("rejects a thrown request without retrying it", async () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
      mockExchange(() => HttpResponse.error());

      const exchangeError = await failureFrom(exchangeCode(CODE, CODE_VERIFIER));

      expect(exchangeError.exchangeCause).toBe("Request failed");
      expect(exchangeCallCount).toBe(1);
      expect(consoleError).toHaveBeenCalledTimes(1);
    });

    test("aborts an exchange that outlives its fifteen second timeout and clears the timer", async () => {
      vi.useFakeTimers();
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(
        (_input, init) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () => {
              reject(new DOMException("the exchange timed out", "AbortError"));
            });
          }),
      );

      const pending = exchangeCode(CODE, CODE_VERIFIER).catch((failure: unknown) => failure);
      await vi.advanceTimersByTimeAsync(15_000);
      const failure = await pending;

      expect(failure).toBeInstanceOf(OpenRouterCodeExchangeError);
      expect((failure as OpenRouterCodeExchangeError).exchangeCause).toBe("Timeout");
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(vi.getTimerCount()).toBe(0);
    });

    test("keeps the code, the verifier, the provider message, and the key out of the error and the dev log", async () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
      mockExchange(() => HttpResponse.json({ error: { message: SECRET_PROVIDER_MESSAGE } }, { status: 401 }));

      const exchangeError = await failureFrom(exchangeCode(SECRET_CODE, SECRET_VERIFIER));

      const sanitizedText = `${exchangeError.message} ${exchangeError.exchangeCause}`;
      const loggedText = consoleError.mock.calls.flat().join(" ");
      for (const secret of [SECRET_CODE, SECRET_VERIFIER, SECRET_PROVIDER_MESSAGE, PROVIDER_KEY]) {
        expect(sanitizedText).not.toContain(secret);
        expect(loggedText).not.toContain(secret);
      }
      expect(loggedText).toContain("HTTP 401");
    });
  });
});

function mockExchange(respond: () => Response): void {
  worker.use(
    http.post(EXCHANGE_URL, async ({ request }) => {
      sentRequest = await captureRequest(request);
      exchangeCallCount += 1;
      return respond();
    }),
  );
}

async function captureRequest(request: Request): Promise<CapturedRequest> {
  return {
    url: request.url,
    method: request.method,
    headers: new Headers(request.headers),
    body: (await request.json()) as unknown,
    credentials: request.credentials,
    redirect: request.redirect,
    mode: request.mode,
    referrerPolicy: request.referrerPolicy,
    cache: request.cache,
  };
}

function successfulAnswer(key: string): Response {
  return HttpResponse.json({ key });
}

function capturedRequest(): CapturedRequest {
  if (sentRequest === undefined) {
    throw new Error("no key exchange request reached the mocked provider");
  }
  return sentRequest;
}

async function failureFrom(pending: Promise<string>): Promise<OpenRouterCodeExchangeError> {
  try {
    await pending;
  } catch (failure) {
    if (failure instanceof OpenRouterCodeExchangeError) {
      return failure;
    }
    throw failure;
  }
  throw new Error("the exchange answered instead of failing");
}
