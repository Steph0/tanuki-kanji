import settingsAccountIcon from "@material-symbols/svg-400/outlined/settings_account_box.svg";
import settingsAlertIcon from "@material-symbols/svg-400/outlined/settings_alert.svg";
import { render, screen } from "@testing-library/preact";
import { createRef } from "preact";
import { describe, expect, test, vi } from "vitest";
import { commands, page } from "vitest/browser";
import { ICON_MD_PX } from "../../../constants/globals.ts";
import { SettingsTrigger } from "./SettingsTrigger.tsx";

function renderTrigger(isConnected: boolean) {
  const triggerRef = createRef<HTMLButtonElement>();
  const onOpen = vi.fn();
  render(<SettingsTrigger isConnected={isConnected} triggerRef={triggerRef} onOpen={onOpen} />);
  return { triggerRef, onOpen };
}

describe("SettingsTrigger", () => {
  test("names the disconnected trigger for the sign-in and advertises a dialog", () => {
    renderTrigger(false);

    const trigger = screen.getByRole("button", { name: "Settings, OpenRouter not connected" });
    expect(trigger).toHaveAttribute("type", "button");
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");

    const box = getComputedStyle(trigger);
    expect(box.width).toBe("44px");
    expect(box.height).toBe("44px");

    const icon = trigger.querySelector("img");
    expect(icon).toHaveAttribute("alt", "");
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon).toHaveAttribute("width", String(ICON_MD_PX));
    expect(icon).toHaveAttribute("height", String(ICON_MD_PX));
    expect(icon).toHaveAttribute("src", settingsAlertIcon);
  });

  test("switches its name, icon and tooltip when the account is connected", () => {
    renderTrigger(true);

    const trigger = screen.getByRole("button", { name: "Settings, OpenRouter connected" });
    expect(trigger.querySelector("img")).toHaveAttribute("src", settingsAccountIcon);

    const tooltip = screen.getByText("OpenRouter account");
    expect(tooltip).toHaveAttribute("aria-hidden", "true");
    expect(tooltip).not.toBeVisible();
  });

  test("labels the disconnected tooltip with the sign-in wording", () => {
    renderTrigger(false);

    const tooltip = screen.getByText("OpenRouter sign-in");
    expect(tooltip).toHaveAttribute("aria-hidden", "true");
    expect(tooltip).not.toBeVisible();
  });

  test("reports the open request once when activated", async () => {
    const { onOpen } = renderTrigger(false);

    await page.getByRole("button", { name: "Settings, OpenRouter not connected" }).click();

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  test("exposes the trigger element to its owner through the ref", () => {
    const { triggerRef } = renderTrigger(false);

    expect(triggerRef.current).toBe(screen.getByRole("button", { name: /Settings, OpenRouter/ }));
  });

  test("draws its focus ring on the glyph while keeping the 44px target", async () => {
    renderTrigger(false);
    const trigger = screen.getByRole("button", { name: "Settings, OpenRouter not connected" });
    const icon = trigger.querySelector("img") as Element;

    await commands.pressTab();

    expect(document.activeElement).toBe(trigger);
    expect(getComputedStyle(trigger).outlineStyle).toBe("none");
    const ring = getComputedStyle(icon);
    expect(ring.outlineStyle).toBe("solid");
    expect(ring.outlineWidth).toBe("2px");
    expect(ring.outlineColor).toBe("rgb(45, 90, 67)");
    expect(ring.outlineOffset).toBe("2px");
  });
});
