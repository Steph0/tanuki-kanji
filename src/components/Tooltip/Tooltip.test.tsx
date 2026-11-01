import { render, screen } from "@testing-library/preact";
import { describe, expect, test, vi } from "vitest";
import { commands, page } from "vitest/browser";
import { Tooltip } from "./Tooltip.tsx";

const LONG_LABEL = "A label long enough that it would overflow a narrow trigger";

function renderTooltip(align?: "center" | "end") {
  render(
    <div style={{ position: "fixed", top: "4rem", right: "0" }}>
      <Tooltip label={LONG_LABEL} align={align}>
        <button type="button">Trigger</button>
      </Tooltip>
    </div>,
  );
}

describe("Tooltip", () => {
  test("keeps its label out of the accessibility tree and out of sight until asked", () => {
    renderTooltip();

    const label = screen.getByText(LONG_LABEL);
    expect(label).toHaveAttribute("aria-hidden", "true");
    expect(label).not.toBeVisible();
  });

  test("reveals its label on hover and on keyboard focus", async () => {
    renderTooltip();
    const label = screen.getByText(LONG_LABEL);

    await page.getByRole("button", { name: "Trigger" }).hover();
    await vi.waitFor(() => expect(label).toBeVisible());

    await page.elementLocator(document.body).hover();
    await vi.waitFor(() => expect(label).not.toBeVisible());

    await commands.pressTab();
    await vi.waitFor(() => expect(label).toBeVisible());
  });

  test("anchors an end-aligned label inside the viewport at the right edge, however long", async () => {
    renderTooltip("end");

    await page.getByRole("button", { name: "Trigger" }).hover();
    const label = screen.getByText(LONG_LABEL);
    await vi.waitFor(() => expect(label).toBeVisible());

    const rect = label.getBoundingClientRect();
    expect(rect.left).toBeGreaterThanOrEqual(0);
    expect(rect.right).toBeLessThanOrEqual(window.innerWidth);
  });
});
