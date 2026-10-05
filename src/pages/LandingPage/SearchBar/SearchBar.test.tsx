import { render, screen } from "@testing-library/preact";
import { describe, expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { noop } from "../../../test-utils.ts";
import styles from "./SearchBar.module.css";
import { SearchBar } from "./SearchBar.tsx";

describe("SearchBar", () => {
  test("labels the kanji input with its placeholder hint", () => {
    render(<SearchBar onSubmit={noop} />);
    const input = screen.getByRole("textbox", { name: "Enter your kanji" });
    expect(input).toBeVisible();
    expect(input).toHaveAttribute("placeholder", "e.g. 森 or 食べる");
  });

  test("shows the submit action and the character counter", () => {
    render(<SearchBar onSubmit={noop} />);
    const submit = screen.getByRole("button", { name: "Submit search" });
    expect(submit).toBeVisible();
    expect(submit).toHaveAttribute("type", "submit");
    expect(screen.getByText(/\/ 21 chars/)).toBeVisible();
  });

  test("draws a single focus ring on the field, never two", async () => {
    render(<SearchBar onSubmit={noop} />);
    await page.getByRole("textbox", { name: "Enter your kanji" }).click();
    const input = screen.getByRole("textbox", { name: "Enter your kanji" });

    // The input's outline is replaced and done by the field wrapper tied to that input (for design reasons)
    const field = input.closest(`.${styles.fieldRow}`);
    expect(field).not.toBeNull();
    expect(getComputedStyle(input).outlineStyle).toBe("none");

    const ring = getComputedStyle(field as Element);
    expect(ring.outlineStyle).toBe("solid");
    expect(ring.outlineWidth).toBe("2px");
    expect(ring.outlineColor).toBe("rgb(45, 90, 67)");
    expect(ring.outlineOffset).toBe("2px");
  });

  test("sends the typed text when the submit action is clicked", async () => {
    const onSubmit = vi.fn();
    render(<SearchBar onSubmit={onSubmit} />);
    await page.getByRole("textbox", { name: "Enter your kanji" }).fill("狸");
    await page.getByRole("button", { name: "Submit search" }).click();
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith("狸");
  });

  test("sends the typed text when the form is submitted", async () => {
    // requestSubmit drives the same onSubmit path as the Enter / mobile "go" key (native implicit submission)
    const onSubmit = vi.fn();
    render(<SearchBar onSubmit={onSubmit} />);
    await page.getByRole("textbox", { name: "Enter your kanji" }).fill("狸");
    const input = screen.getByRole("textbox", { name: "Enter your kanji" });
    input.closest("form")?.requestSubmit();
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith("狸");
  });

  test("ignores submits while composing Japanese text", async () => {
    const onSubmit = vi.fn();
    render(<SearchBar onSubmit={onSubmit} />);
    await page.getByRole("textbox", { name: "Enter your kanji" }).fill("狸");
    const input = screen.getByRole("textbox", { name: "Enter your kanji" });
    input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    input.closest("form")?.requestSubmit();
    expect(onSubmit).not.toHaveBeenCalled();
    input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
    input.closest("form")?.requestSubmit();
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith("狸");
  });

  test("freezes validation on half-composed text and settles on compositionend", async () => {
    const onSubmit = vi.fn();
    render(<SearchBar onSubmit={onSubmit} />);
    await page.getByRole("textbox", { name: "Enter your kanji" }).fill("森");
    expect(screen.getByRole("button", { name: "Submit search" })).toBeEnabled();
    const input = screen.getByRole("textbox", { name: "Enter your kanji" });
    input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    await page.getByRole("textbox", { name: "Enter your kanji" }).fill("森a");
    expect(screen.queryByText("Only Kanji, hiragana and katakana characters are allowed")).toBeNull();
    expect(screen.getByRole("button", { name: "Submit search" })).toBeEnabled();
    input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
    expect(await screen.findByText("Only Kanji, hiragana and katakana characters are allowed")).toBeVisible();
    expect(screen.getByRole("button", { name: "Submit search" })).toBeDisabled();
  });

  test("shows no message for intermediate text composed from empty", async () => {
    const onSubmit = vi.fn();
    render(<SearchBar onSubmit={onSubmit} />);
    const input = screen.getByRole("textbox", { name: "Enter your kanji" });
    input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    await page.getByRole("textbox", { name: "Enter your kanji" }).fill("hello");
    expect(screen.queryByText("Only Kanji, hiragana and katakana characters are allowed")).toBeNull();
    expect(screen.queryByText("Enter at least one kanji.")).toBeNull();
    expect(screen.getByRole("button", { name: "Submit search" })).toBeDisabled();
    input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
    expect(await screen.findByText("Only Kanji, hiragana and katakana characters are allowed")).toBeVisible();
  });

  test("blocks the untouched field silently with a disabled submit", async () => {
    const onSubmit = vi.fn();
    render(<SearchBar onSubmit={onSubmit} />);
    const submit = screen.getByRole("button", { name: "Submit search" });
    expect(submit).toBeDisabled();
    expect(screen.queryByText("Only Kanji, hiragana and katakana characters are allowed")).toBeNull();
    expect(screen.queryByText("Enter at least one kanji.")).toBeNull();
    await submit.click();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("rejects foreign characters with a message and a disabled submit", async () => {
    const onSubmit = vi.fn();
    render(<SearchBar onSubmit={onSubmit} />);
    await page.getByRole("textbox", { name: "Enter your kanji" }).fill("hello");
    expect(screen.getByText("Only Kanji, hiragana and katakana characters are allowed")).toBeVisible();
    expect(screen.getByRole("button", { name: "Submit search" })).toBeDisabled();
  });

  test("rejects kana-only input with a kanji message and a disabled submit", async () => {
    const onSubmit = vi.fn();
    render(<SearchBar onSubmit={onSubmit} />);
    await page.getByRole("textbox", { name: "Enter your kanji" }).fill("ひらがな");
    expect(screen.getByText("Enter at least one kanji.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Submit search" })).toBeDisabled();
  });

  test("enables the submit silently for a valid kanji word", async () => {
    const onSubmit = vi.fn();
    render(<SearchBar onSubmit={onSubmit} />);
    await page.getByRole("textbox", { name: "Enter your kanji" }).fill("森");
    expect(screen.getByRole("button", { name: "Submit search" })).toBeEnabled();
    expect(screen.queryByText("Only Kanji, hiragana and katakana characters are allowed")).toBeNull();
    expect(screen.queryByText("Enter at least one kanji.")).toBeNull();
  });

  test("fires the normalized value for padded input on submit", async () => {
    const onSubmit = vi.fn();
    render(<SearchBar onSubmit={onSubmit} />);
    await page.getByRole("textbox", { name: "Enter your kanji" }).fill(" 森 ");
    await page.getByRole("button", { name: "Submit search" }).click();
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith("森");
  });

  test("blocks a click on invalid input with its message and no submit", async () => {
    const onSubmit = vi.fn();
    render(<SearchBar onSubmit={onSubmit} />);
    await page.getByRole("textbox", { name: "Enter your kanji" }).fill("hello");
    // Native click: Playwright's page.click refuses disabled buttons, but a
    // real lightning-fast click can still land before the disabled redraw.
    screen.getByRole("button", { name: "Submit search" }).click();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("Only Kanji, hiragana and katakana characters are allowed")).toBeVisible();
  });

  test("blocks Enter on invalid input with its message and no submit", async () => {
    const onSubmit = vi.fn();
    render(<SearchBar onSubmit={onSubmit} />);
    await page.getByRole("textbox", { name: "Enter your kanji" }).fill("hello");
    const input = screen.getByRole("textbox", { name: "Enter your kanji" });
    input.closest("form")?.requestSubmit();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("Only Kanji, hiragana and katakana characters are allowed")).toBeVisible();
  });

  test("blocks Enter on empty input silently with no submit", async () => {
    const onSubmit = vi.fn();
    render(<SearchBar onSubmit={onSubmit} />);
    const input = screen.getByRole("textbox", { name: "Enter your kanji" });
    input.closest("form")?.requestSubmit();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.queryByText("Only Kanji, hiragana and katakana characters are allowed")).toBeNull();
    expect(screen.queryByText("Enter at least one kanji.")).toBeNull();
  });

  test("labels Japanese text with no error attributes when empty", () => {
    render(<SearchBar onSubmit={noop} />);
    const input = screen.getByRole("textbox", { name: "Enter your kanji" });
    expect(input).toHaveAttribute("lang", "ja");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toHaveAttribute("aria-describedby");
  });

  test("marks foreign characters invalid and describes the polite message", async () => {
    render(<SearchBar onSubmit={noop} />);
    await page.getByRole("textbox", { name: "Enter your kanji" }).fill("hello");
    const input = screen.getByRole("textbox", { name: "Enter your kanji" });
    expect(input).toHaveAttribute("lang", "ja");
    expect(input).toHaveAttribute("aria-invalid", "true");
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).not.toBeNull();
    const message = document.getElementById(describedBy as string);
    expect(message).toHaveTextContent("Only Kanji, hiragana and katakana characters are allowed");
    expect(message).toHaveAttribute("aria-live", "polite");
    expect(message).not.toHaveAttribute("role");
  });

  test("marks kana-only input invalid and describes its message", async () => {
    render(<SearchBar onSubmit={noop} />);
    await page.getByRole("textbox", { name: "Enter your kanji" }).fill("ひらがな");
    const input = screen.getByRole("textbox", { name: "Enter your kanji" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).not.toBeNull();
    expect(document.getElementById(describedBy as string)).toHaveTextContent("Enter at least one kanji.");
  });

  test("clears error attributes for a valid kanji word", async () => {
    render(<SearchBar onSubmit={noop} />);
    await page.getByRole("textbox", { name: "Enter your kanji" }).fill("森");
    const input = screen.getByRole("textbox", { name: "Enter your kanji" });
    expect(input).toHaveAttribute("lang", "ja");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toHaveAttribute("aria-describedby");
  });
});
