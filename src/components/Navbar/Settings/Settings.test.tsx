import { fireEvent, render, screen } from "@testing-library/preact";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { commands, page } from "vitest/browser";
import type { BeginOpenRouterAuthorizationResult } from "../../../services/engine/controller/openrouter-session/openRouterSessionApi.ts";
import { fakeOpenRouterSessionAPI } from "../../../test-utils.tsx";
import { Settings } from "./Settings.tsx";

const DISCONNECTED_TITLE = "Connect to OpenRouter";
const DISCONNECTED_BODY = "This app uses OpenRouter free models to generate the lessons.";
const CONNECTING_TITLE = "Connecting to OpenRouter";
const CONNECTING_BODY = "Finishing sign-in. This takes a moment.";
const CONNECTION_ERROR = "Could not connect to OpenRouter. Please try again.";
const AUTHORIZATION_URL = "https://openrouter.ai/auth?state=state-value&code_challenge=challenge-value";
const REVOKE_LABEL = "Revoke in OpenRouter (opens in a new tab)";

const navigate = vi.fn();

function renderSettings(api = fakeOpenRouterSessionAPI()) {
  render(<Settings openRouterSession={api} navigate={navigate} />);
  return api;
}

async function openSettings(triggerName = "Settings, OpenRouter not connected") {
  const trigger = screen.getByRole("button", { name: triggerName });
  await page.getByRole("button", { name: triggerName }).click();
  return trigger;
}

beforeEach(() => {
  navigate.mockReset();
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

  test("disables the action while the engine prepares the sign-in", async () => {
    let resolveBegin!: (result: BeginOpenRouterAuthorizationResult) => void;
    const beginAuthorization = vi.fn(
      () =>
        new Promise<BeginOpenRouterAuthorizationResult>((resolve) => {
          resolveBegin = resolve;
        }),
    );
    renderSettings(fakeOpenRouterSessionAPI({ beginAuthorization }));
    await openSettings();
    const action = screen.getByRole("button", { name: "Connect to OpenRouter" });

    await page.getByRole("button", { name: "Connect to OpenRouter" }).click();

    await vi.waitFor(() => expect(action).toBeDisabled());
    resolveBegin({ status: "refused" });
    expect(await screen.findByRole("alert")).toHaveTextContent(CONNECTION_ERROR);
    expect(screen.getByRole("button", { name: "Connect to OpenRouter" })).toBeEnabled();
  });

  test("hands the prepared authorization URL to navigation exactly once", async () => {
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
    expect(document.body.textContent).not.toContain(AUTHORIZATION_URL);
  });

  test("treats a navigation throw as a start failure without logging the URL", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    navigate.mockImplementation(() => {
      throw new Error("navigation blocked");
    });
    renderSettings(
      fakeOpenRouterSessionAPI({
        beginAuthorization: vi.fn(async () => ({ status: "ready" as const, authorizationUrl: AUTHORIZATION_URL })),
      }),
    );
    await openSettings();

    await page.getByRole("button", { name: "Connect to OpenRouter" }).click();

    expect(await screen.findByRole("alert")).toHaveTextContent(CONNECTION_ERROR);
    expect(screen.getByRole("button", { name: "Connect to OpenRouter" })).toBeEnabled();
    expect(consoleError.mock.calls.flat().join(" ")).not.toContain(AUTHORIZATION_URL);
  });

  test("disconnects and keeps the open dialog on the offer", async () => {
    const api = renderSettings(fakeOpenRouterSessionAPI({ hasSession: () => true }));
    await openSettings("Settings, OpenRouter connected");

    await page.getByRole("button", { name: "Disconnect" }).click();

    expect(api.disconnect).toHaveBeenCalledTimes(1);
    const dialog = screen.getByRole("dialog", { name: DISCONNECTED_TITLE });
    expect(dialog).toBeVisible();
    expect(screen.getByRole("button", { name: "Connect to OpenRouter" })).toBeVisible();
  });

  test("opens the connecting view when the authorization return is captured", async () => {
    renderSettings(
      fakeOpenRouterSessionAPI({
        captureAuthorizationReturn: vi.fn(() => true),
        completeAuthorization: vi.fn(() => new Promise<never>(() => {})),
      }),
    );

    const dialog = await screen.findByRole("dialog", { name: CONNECTING_TITLE });
    expect(dialog).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent(CONNECTING_BODY);
    expect(screen.queryByRole("button", { name: "Connect to OpenRouter" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Disconnect" })).toBeNull();
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
