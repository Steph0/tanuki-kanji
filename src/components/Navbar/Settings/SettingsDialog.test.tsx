import { fireEvent, render, screen } from "@testing-library/preact";
import { createRef } from "preact";
import { describe, expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { SettingsDialog } from "./SettingsDialog.tsx";

const TITLE = "Connect to OpenRouter";
const BODY = "This app uses OpenRouter free models to generate the lessons.";

function renderDialog() {
  const dialogRef = createRef<HTMLDialogElement>();
  const closeButtonRef = createRef<HTMLButtonElement>();
  const onCancel = vi.fn();
  const onClose = vi.fn();
  const onBackdrop = vi.fn();

  render(
    <SettingsDialog
      dialogRef={dialogRef}
      closeButtonRef={closeButtonRef}
      titleId="settings-title"
      bodyId="settings-body"
      title={TITLE}
      onCancel={onCancel}
      onClose={onClose}
      onBackdrop={onBackdrop}
    >
      <p id="settings-body">{BODY}</p>
      <button type="button">Disconnect</button>
    </SettingsDialog>,
  );

  return { dialogRef, closeButtonRef, onCancel, onClose, onBackdrop };
}

function openDialog(dialogRef: { current: HTMLDialogElement | null }) {
  dialogRef.current?.showModal();
}

describe("SettingsDialog", () => {
  test("keeps the closed dialog in the DOM but out of the accessibility tree", () => {
    const { dialogRef } = renderDialog();

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(dialogRef.current).not.toBeNull();
    expect(dialogRef.current).not.toBeVisible();
  });

  test("names and describes itself with the heading and body it is given", () => {
    const { dialogRef } = renderDialog();

    openDialog(dialogRef);

    expect(screen.getByRole("heading", { level: 2, name: TITLE })).toBeVisible();
    const dialog = screen.getByRole("dialog", { name: TITLE });
    expect(dialog).toHaveAccessibleDescription(BODY);
  });

  test("renders the state content inside its panel", () => {
    const { dialogRef } = renderDialog();

    openDialog(dialogRef);

    expect(screen.getByText(BODY)).toBeVisible();
    expect(screen.getByRole("button", { name: "Disconnect" })).toBeVisible();
  });

  test("offers a named close button and reports its dismissal", async () => {
    const { dialogRef, closeButtonRef, onClose } = renderDialog();
    openDialog(dialogRef);

    const close = screen.getByRole("button", { name: "Close settings" });
    expect(close).toHaveAttribute("type", "button");
    expect(closeButtonRef.current).toBe(close);

    await page.getByRole("button", { name: "Close settings" }).click();

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("forwards the native cancel event to its owner", () => {
    const { dialogRef, onCancel } = renderDialog();
    openDialog(dialogRef);

    fireEvent(screen.getByRole("dialog", { name: TITLE }), new Event("cancel", { cancelable: true }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test("reports a click on the backdrop but not a click inside the panel", () => {
    const { dialogRef, onBackdrop } = renderDialog();
    openDialog(dialogRef);
    const dialog = screen.getByRole("dialog", { name: TITLE });

    fireEvent.click(screen.getByText(BODY));
    expect(onBackdrop).not.toHaveBeenCalled();

    fireEvent.click(dialog);
    expect(onBackdrop).toHaveBeenCalledTimes(1);
  });
});
