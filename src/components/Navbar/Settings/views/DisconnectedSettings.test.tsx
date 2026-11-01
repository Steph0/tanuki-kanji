import { render, screen } from "@testing-library/preact";
import { describe, expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { DisconnectedSettings } from "./DisconnectedSettings.tsx";

const CONNECT_BODY = "This app uses OpenRouter free models to generate the lessons.";
const CONNECT_FOOTNOTE =
  "Your key is never saved and only works in this tab. Closing the app auto-disconnect by default.";

function renderDisconnected(status: "disconnected" | "starting" | "navigating") {
  const onConnect = vi.fn();
  render(<DisconnectedSettings bodyId="settings-body" status={status} onConnect={onConnect} />);
  return onConnect;
}

describe("DisconnectedSettings", () => {
  test("offers the sign-in with its exact copy", () => {
    renderDisconnected("disconnected");

    expect(screen.getByText(CONNECT_BODY)).toBeVisible();
    expect(screen.getByRole("button", { name: "Connect to OpenRouter" })).toBeVisible();
    expect(screen.getByText(CONNECT_FOOTNOTE)).toBeVisible();
  });

  test("starts the sign-in when the learner connects", async () => {
    const onConnect = renderDisconnected("disconnected");

    await page.getByRole("button", { name: "Connect to OpenRouter" }).click();

    expect(onConnect).toHaveBeenCalledTimes(1);
  });

  test("keeps the action disabled while the engine prepares the sign-in", () => {
    renderDisconnected("starting");

    expect(screen.getByRole("button", { name: "Connect to OpenRouter" })).toBeDisabled();
  });

  test("keeps the action disabled once navigation has started", () => {
    renderDisconnected("navigating");

    expect(screen.getByRole("button", { name: "Connect to OpenRouter" })).toBeDisabled();
  });
});
