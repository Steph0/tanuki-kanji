import { fireEvent, render, screen } from "@testing-library/preact";
import { describe, expect, test, vi } from "vitest";
import { SettingsAction } from "./SettingsAction.tsx";

describe("SettingsAction", () => {
  test("stays a plain button so it never submits a surrounding form", () => {
    render(
      <SettingsAction variant="primary" onClick={vi.fn()}>
        Connect to OpenRouter
      </SettingsAction>,
    );

    const action = screen.getByRole("button", { name: "Connect to OpenRouter" });
    expect(action).toHaveAttribute("type", "button");
    expect(action).toBeEnabled();
  });

  test("reports activation once", () => {
    const onClick = vi.fn();
    render(
      <SettingsAction variant="primary" onClick={onClick}>
        Connect to OpenRouter
      </SettingsAction>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Connect to OpenRouter" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("stays inert while disabled", () => {
    const onClick = vi.fn();
    render(
      <SettingsAction variant="primary" disabled onClick={onClick}>
        Connect to OpenRouter
      </SettingsAction>,
    );

    const action = screen.getByRole("button", { name: "Connect to OpenRouter" });
    expect(action).toBeDisabled();

    action.click();

    expect(onClick).not.toHaveBeenCalled();
  });
});
