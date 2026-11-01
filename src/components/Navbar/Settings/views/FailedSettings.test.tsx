import { render, screen } from "@testing-library/preact";
import { describe, expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { FailedSettings } from "./FailedSettings.tsx";

const CONNECT_BODY = "This app uses OpenRouter free models to generate the lessons.";
const CONNECTION_ERROR = "Could not connect to OpenRouter. Please try again.";

function renderFailed() {
  const onConnect = vi.fn();
  render(<FailedSettings bodyId="settings-body" message={CONNECTION_ERROR} onConnect={onConnect} />);
  return onConnect;
}

describe("FailedSettings", () => {
  test("keeps the offer and announces the failure under the action", () => {
    renderFailed();

    const action = screen.getByRole("button", { name: "Connect to OpenRouter" });
    const alert = screen.getByRole("alert");

    expect(screen.getByText(CONNECT_BODY)).toBeVisible();
    expect(alert).toHaveTextContent(CONNECTION_ERROR);
    expect(action.compareDocumentPosition(alert)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  test("lets the learner retry from the failure", async () => {
    const onConnect = renderFailed();

    await page.getByRole("button", { name: "Connect to OpenRouter" }).click();

    expect(onConnect).toHaveBeenCalledTimes(1);
  });
});
