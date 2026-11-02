import { fireEvent, screen } from "@testing-library/preact";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { commands, page } from "vitest/browser";
import type {
  BeginOpenRouterAuthorizationResult,
  CompleteOpenRouterAuthorizationResult,
} from "../../../services/engine/controller/openrouter-session/openRouterSessionApi.ts";
import { fakeOpenRouterSessionAPI, renderWithServices } from "../../../test-utils.tsx";
import { Settings } from "./Settings.tsx";

const DISCONNECTED_TITLE = "Connect to OpenRouter";
const DISCONNECTED_BODY = "This app uses OpenRouter free models to generate the lessons.";
const DISCONNECTED_FOOTNOTE =
  "Your key is never saved and only works in this tab. Closing the app auto-disconnect by default.";
const CONNECTED_TITLE = "OpenRouter connected";
const CONNECTED_BODY =
  "Your OpenRouter account is connected. Your key is never saved and only works in this tab. Closing the app auto-disconnect by default.";
const CONNECTED_NOTE =
  "Disconnecting forgets the key in this tab. The key stays in your OpenRouter account until you revoke it.";
const CONNECTING_TITLE = "Connecting to OpenRouter";
const CONNECTING_BODY = "Finishing sign-in. This takes a moment.";
const CONNECTION_ERROR = "Could not connect to OpenRouter. Please try again.";
const AUTHORIZATION_URL = "https://openrouter.ai/auth?state=state-value&code_challenge=challenge-value";
const REVOKE_LABEL = "Revoke in OpenRouter (opens in a new tab)";
const SHORT_VIEWPORT = window.matchMedia("(max-height: 37.5rem)").matches;
const WIDE_VIEWPORT = window.matchMedia("(min-width: 48rem)").matches;
const COMPACT_VISUAL_REM = SHORT_VIEWPORT ? 8 : WIDE_VIEWPORT ? 12 : 10;

const navigate = vi.fn();

function remToPx(rem: number): string {
  const rootSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  return `${rem * rootSize}px`;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((fulfill) => {
    resolve = fulfill;
  });
  return { promise, resolve };
}

function renderSettings(api = fakeOpenRouterSessionAPI()) {
  renderWithServices(<Settings />, { openRouterSession: api, navigate });
  return api;
}

async function openSettings(triggerName = "Settings, OpenRouter not connected") {
  const trigger = screen.getByRole("button", { name: triggerName });
  await page.getByRole("button", { name: triggerName }).click();
  return trigger;
}

function spyOnConsole() {
  return (["debug", "error", "info", "log", "trace", "warn"] as const).map((method) =>
    vi.spyOn(console, method).mockImplementation(() => {}),
  );
}

function expectNoAuthorizationLeak() {
  expect(document.body.textContent).not.toContain(AUTHORIZATION_URL);
  expect(window.location.href).not.toContain("openrouter.ai/auth");
  expect(window.location.href).not.toContain("state-value");
  expect(localStorage.length).toBe(0);
  expect(sessionStorage.length).toBe(0);
  expect(document.cookie).toBe("");
}

beforeEach(() => {
  navigate.mockReset();
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Settings", () => {
  test("opens the offer from the trigger", async () => {
    renderSettings();

    await openSettings();

    const dialog = screen.getByRole("dialog", { name: DISCONNECTED_TITLE });
    expect(dialog).toBeVisible();
    expect(dialog).toHaveAccessibleDescription(DISCONNECTED_BODY);
  });

  test("moves focus to the close button when the offer opens", async () => {
    renderSettings();

    await openSettings();

    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Close settings" }));
  });

  test("closes from the close button and returns focus to the trigger", async () => {
    renderSettings();
    const trigger = await openSettings();

    await page.getByRole("button", { name: "Close settings" }).click();

    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.activeElement).toBe(trigger);
  });

  test("closes on Escape and returns focus to the trigger", async () => {
    renderSettings();
    const trigger = await openSettings();

    await commands.pressEscape();

    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.activeElement).toBe(trigger);
  });

  test("closes when the backdrop itself is clicked", async () => {
    renderSettings();
    await openSettings();
    const dialog = document.querySelector("dialog") as HTMLDialogElement;

    fireEvent.click(dialog);

    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  test("disables the action while the engine prepares the sign-in and re-enables it on refusal", async () => {
    const request = deferred<BeginOpenRouterAuthorizationResult>();
    const beginAuthorization = vi.fn(() => request.promise);
    renderSettings(fakeOpenRouterSessionAPI({ beginAuthorization }));
    await openSettings();
    const action = screen.getByRole("button", { name: "Connect to OpenRouter" });

    await page.getByRole("button", { name: "Connect to OpenRouter" }).click();

    expect(beginAuthorization).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => expect(action).toBeDisabled());

    request.resolve({ status: "refused" });

    expect(await screen.findByRole("alert")).toHaveTextContent(CONNECTION_ERROR);
    expect(screen.getByRole("button", { name: "Connect to OpenRouter" })).toBeEnabled();
    expect(screen.queryByText(DISCONNECTED_FOOTNOTE)).toBeNull();
  });

  test("clears the error as soon as a retry starts and keeps it gone when the retry succeeds", async () => {
    const retry = deferred<BeginOpenRouterAuthorizationResult>();
    const beginAuthorization = vi
      .fn<() => Promise<BeginOpenRouterAuthorizationResult>>()
      .mockResolvedValueOnce({ status: "refused" })
      .mockImplementationOnce(() => retry.promise);
    renderSettings(fakeOpenRouterSessionAPI({ beginAuthorization }));
    await openSettings();

    await page.getByRole("button", { name: "Connect to OpenRouter" }).click();
    expect(await screen.findByRole("alert")).toHaveTextContent(CONNECTION_ERROR);

    await page.getByRole("button", { name: "Connect to OpenRouter" }).click();

    expect(beginAuthorization).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByRole("button", { name: "Connect to OpenRouter" })).toBeDisabled();

    retry.resolve({ status: "ready", authorizationUrl: AUTHORIZATION_URL });

    await vi.waitFor(() => expect(navigate).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("alert")).toBeNull();
  });

  test("hands the prepared authorization URL to navigation exactly once", async () => {
    const consoleSpies = spyOnConsole();
    renderSettings(
      fakeOpenRouterSessionAPI({
        beginAuthorization: vi.fn(async () => ({ status: "ready" as const, authorizationUrl: AUTHORIZATION_URL })),
      }),
    );
    await openSettings();
    const action = screen.getByRole("button", { name: "Connect to OpenRouter" });

    await page.getByRole("button", { name: "Connect to OpenRouter" }).click();

    await vi.waitFor(() => expect(navigate).toHaveBeenCalledTimes(1));
    expect(navigate).toHaveBeenCalledWith(AUTHORIZATION_URL);
    expect(action).toBeDisabled();
    expectNoAuthorizationLeak();

    const logged = consoleSpies
      .flatMap((spy) => spy.mock.calls)
      .flat()
      .join(" ");
    expect(logged).not.toContain(AUTHORIZATION_URL);
    expect(logged).not.toContain("state-value");
  });

  test("treats a navigation throw as a start failure without storing a session or logging the URL", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    navigate.mockImplementation(() => {
      throw new Error("navigation blocked");
    });
    const api = renderSettings(
      fakeOpenRouterSessionAPI({
        beginAuthorization: vi.fn(async () => ({ status: "ready" as const, authorizationUrl: AUTHORIZATION_URL })),
      }),
    );
    await openSettings();

    await page.getByRole("button", { name: "Connect to OpenRouter" }).click();

    expect(await screen.findByRole("alert")).toHaveTextContent(CONNECTION_ERROR);
    expect(screen.getByRole("button", { name: "Connect to OpenRouter" })).toBeEnabled();
    expect(api.hasSession()).toBe(false);
    expect(consoleError.mock.calls.flat().join(" ")).not.toContain(AUTHORIZATION_URL);
    expectNoAuthorizationLeak();
  });

  test("disconnects in place and moves focus to the connect offer", async () => {
    let session = true;
    const api = renderSettings(
      fakeOpenRouterSessionAPI({
        hasSession: vi.fn(() => session),
        disconnect: vi.fn(() => {
          session = false;
        }),
      }),
    );
    await openSettings("Settings, OpenRouter connected");

    await page.getByRole("button", { name: "Disconnect" }).click();

    expect(api.disconnect).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("dialog", { name: DISCONNECTED_TITLE })).toBeVisible();
    expect(screen.getByText(DISCONNECTED_BODY)).toBeVisible();
    expect(screen.getByText(DISCONNECTED_FOOTNOTE)).toBeVisible();
    const connectAction = screen.getByRole("button", { name: "Connect to OpenRouter" });
    expect(connectAction).toBeEnabled();
    expect(screen.queryByRole("alert")).toBeNull();
    await vi.waitFor(() => expect(document.activeElement).toBe(connectAction));

    await page.getByRole("button", { name: "Close settings" }).click();

    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(screen.getByRole("button", { name: "Settings, OpenRouter not connected" })).toBeVisible();
  });

  test("opens the connecting view once per captured return", async () => {
    const completion = deferred<CompleteOpenRouterAuthorizationResult>();
    const api = renderSettings(
      fakeOpenRouterSessionAPI({
        captureAuthorizationReturn: vi.fn(() => true),
        completeAuthorization: vi.fn(() => completion.promise),
      }),
    );

    const dialog = await screen.findByRole("dialog", { name: CONNECTING_TITLE });
    expect(api.completeAuthorization).toHaveBeenCalledTimes(1);
    expect(dialog).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent(CONNECTING_BODY);
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByRole("button", { name: "Connect to OpenRouter" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Disconnect" })).toBeNull();

    const visual = dialog.querySelector("svg")?.parentElement as HTMLElement;
    const lock = visual.querySelector("img");
    expect(lock).toHaveAttribute("alt", "");
    expect(lock).toHaveAttribute("aria-hidden", "true");
    expect(lock).toHaveAttribute("width", "32");
    expect(getComputedStyle(visual).width).toBe(remToPx(COMPACT_VISUAL_REM));
  });

  test("does not finish a sign-in when no return was captured", async () => {
    const api = renderSettings();

    await vi.waitFor(() => expect(api.captureAuthorizationReturn).toHaveBeenCalledTimes(1));
    expect(api.completeAuthorization).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("closes connected after the exchange and reopens on the connected content", async () => {
    let session = false;
    const completion = deferred<CompleteOpenRouterAuthorizationResult>();
    const api = renderSettings(
      fakeOpenRouterSessionAPI({
        hasSession: vi.fn(() => session),
        captureAuthorizationReturn: vi.fn(() => true),
        completeAuthorization: vi.fn(() => completion.promise),
      }),
    );
    await screen.findByRole("dialog", { name: CONNECTING_TITLE });

    session = true;
    completion.resolve({ status: "connected" });

    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(api.hasSession).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Settings, OpenRouter connected" })).toBeVisible();
    expectNoAuthorizationLeak();

    await openSettings("Settings, OpenRouter connected");

    expect(screen.getByRole("dialog", { name: CONNECTED_TITLE })).toBeVisible();
    expect(screen.getByText(CONNECTED_BODY)).toBeVisible();
    expect(screen.getByText(CONNECTED_NOTE)).toBeVisible();
    expect(screen.getByRole("link", { name: REVOKE_LABEL })).toBeVisible();
    expect(screen.getByRole("button", { name: "Disconnect" })).toBeVisible();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  test("closes with no error when the exchange finds no return to finish", async () => {
    const completion = deferred<CompleteOpenRouterAuthorizationResult>();
    renderSettings(
      fakeOpenRouterSessionAPI({
        captureAuthorizationReturn: vi.fn(() => true),
        completeAuthorization: vi.fn(() => completion.promise),
      }),
    );
    await screen.findByRole("dialog", { name: CONNECTING_TITLE });

    completion.resolve({ status: "none" });

    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(screen.getByRole("button", { name: "Settings, OpenRouter not connected" })).toBeVisible();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  test("reports a failure when the exchange claims a connection without a session", async () => {
    const completion = deferred<CompleteOpenRouterAuthorizationResult>();
    renderSettings(
      fakeOpenRouterSessionAPI({
        hasSession: vi.fn(() => false),
        captureAuthorizationReturn: vi.fn(() => true),
        completeAuthorization: vi.fn(() => completion.promise),
      }),
    );
    await screen.findByRole("dialog", { name: CONNECTING_TITLE });

    completion.resolve({ status: "connected" });

    expect(await screen.findByRole("alert")).toHaveTextContent(CONNECTION_ERROR);
    expect(screen.getByRole("dialog", { name: DISCONNECTED_TITLE })).toBeVisible();
  });

  test("shows the offer with the failure under the action when no session was saved", async () => {
    const completion = deferred<CompleteOpenRouterAuthorizationResult>();
    renderSettings(
      fakeOpenRouterSessionAPI({
        captureAuthorizationReturn: vi.fn(() => true),
        completeAuthorization: vi.fn(() => completion.promise),
      }),
    );
    await screen.findByRole("dialog", { name: CONNECTING_TITLE });

    completion.resolve({ status: "failed" });

    const alert = await screen.findByRole("alert");
    const action = screen.getByRole("button", { name: "Connect to OpenRouter" });
    expect(screen.getByRole("dialog", { name: DISCONNECTED_TITLE })).toBeVisible();
    expect(screen.getByText(DISCONNECTED_BODY)).toBeVisible();
    expect(alert).toHaveTextContent(CONNECTION_ERROR);
    expect(action.compareDocumentPosition(alert)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  test("keeps a failure that arrives after the connecting modal was closed", async () => {
    const completion = deferred<CompleteOpenRouterAuthorizationResult>();
    renderSettings(
      fakeOpenRouterSessionAPI({
        captureAuthorizationReturn: vi.fn(() => true),
        completeAuthorization: vi.fn(() => completion.promise),
      }),
    );
    await screen.findByRole("dialog", { name: CONNECTING_TITLE });

    await page.getByRole("button", { name: "Close settings" }).click();
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    completion.resolve({ status: "failed" });

    await openSettings();

    expect(await screen.findByRole("alert")).toHaveTextContent(CONNECTION_ERROR);
    expect(screen.getByRole("dialog", { name: DISCONNECTED_TITLE })).toBeVisible();
  });

  test("still flips the trigger when the connecting modal was closed before success", async () => {
    let session = false;
    const completion = deferred<CompleteOpenRouterAuthorizationResult>();
    renderSettings(
      fakeOpenRouterSessionAPI({
        hasSession: vi.fn(() => session),
        captureAuthorizationReturn: vi.fn(() => true),
        completeAuthorization: vi.fn(() => completion.promise),
      }),
    );
    await screen.findByRole("dialog", { name: CONNECTING_TITLE });

    await page.getByRole("button", { name: "Close settings" }).click();
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    session = true;
    completion.resolve({ status: "connected" });

    await vi.waitFor(() =>
      expect(screen.getByRole("button", { name: "Settings, OpenRouter connected" })).toBeVisible(),
    );

    await openSettings("Settings, OpenRouter connected");

    expect(screen.getByRole("dialog", { name: CONNECTED_TITLE })).toBeVisible();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  test("clears the failure on close and leaves it absent when reopened", async () => {
    renderSettings(
      fakeOpenRouterSessionAPI({
        beginAuthorization: vi.fn(async () => ({ status: "refused" as const })),
      }),
    );
    await openSettings();

    await page.getByRole("button", { name: "Connect to OpenRouter" }).click();
    expect(await screen.findByRole("alert")).toHaveTextContent(CONNECTION_ERROR);

    await page.getByRole("button", { name: "Close settings" }).click();
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    await openSettings();

    expect(screen.getByRole("dialog", { name: DISCONNECTED_TITLE })).toBeVisible();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByText(DISCONNECTED_FOOTNOTE)).toBeVisible();
  });

  test("keeps natural tab order through the close button, action, and revocation link", async () => {
    renderSettings(fakeOpenRouterSessionAPI({ hasSession: () => true }));
    await openSettings("Settings, OpenRouter connected");

    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Close settings" }));

    await commands.pressTab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Disconnect" }));

    await commands.pressTab();
    expect(document.activeElement).toBe(screen.getByRole("link", { name: REVOKE_LABEL }));
  });
});
