import { render, screen } from "@testing-library/preact";
import { describe, expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { ConnectedSettings } from "./ConnectedSettings.tsx";

const CONNECTED_BODY =
  "Your OpenRouter account is connected. Your key is never saved and only works in this tab. Closing the app auto-disconnect by default.";
const CONNECTED_NOTE =
  "Disconnecting forgets the key in this tab. The key stays in your OpenRouter account until you revoke it.";
const REVOKE_URL = "https://openrouter.ai/keys";
const REVOKE_LABEL = "Revoke in OpenRouter (opens in a new tab)";

function renderConnected() {
  const onDisconnect = vi.fn();
  render(<ConnectedSettings bodyId="settings-body" onDisconnect={onDisconnect} />);
  return onDisconnect;
}

describe("ConnectedSettings", () => {
  test("reports the connected account with its informational note", () => {
    renderConnected();

    expect(screen.getByText(CONNECTED_BODY)).toBeVisible();
    expect(screen.getByText(CONNECTED_NOTE)).toBeVisible();
    expect(screen.getByRole("button", { name: "Disconnect" })).toBeVisible();
  });

  test("links to OpenRouter for revocation in a new tab", () => {
    renderConnected();

    const link = screen.getByRole("link", { name: REVOKE_LABEL });
    expect(link).toHaveTextContent("Revoke in OpenRouter");
    expect(link).toHaveAttribute("href", REVOKE_URL);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("reports the disconnect request", async () => {
    const onDisconnect = renderConnected();

    await page.getByRole("button", { name: "Disconnect" }).click();

    expect(onDisconnect).toHaveBeenCalledTimes(1);
  });
});
