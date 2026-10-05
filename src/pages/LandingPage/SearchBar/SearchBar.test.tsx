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
    await page.getByRole("textbox", { name: "Enter your kanji" }).fill("は");
    const input = screen.getByRole("textbox", { name: "Enter your kanji" });
    input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    input.closest("form")?.requestSubmit();
    expect(onSubmit).not.toHaveBeenCalled();
    input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
    input.closest("form")?.requestSubmit();
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith("は");
  });

  test("allows submitting the field untouched", async () => {
    const onSubmit = vi.fn();
    render(<SearchBar onSubmit={onSubmit} />);
    await page.getByRole("button", { name: "Submit search" }).click();
    expect(onSubmit).toHaveBeenCalledWith("");
  });
});
