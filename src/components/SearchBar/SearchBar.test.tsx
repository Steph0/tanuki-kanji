import { render, screen } from "@testing-library/preact";
import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import styles from "./SearchBar.module.css";
import { SearchBar } from "./SearchBar.tsx";

describe("SearchBar", () => {
  test("labels the kanji input with its placeholder hint", () => {
    render(<SearchBar />);
    const input = screen.getByRole("textbox", { name: "Enter your kanji" });
    expect(input).toBeVisible();
    expect(input).toHaveAttribute("placeholder", "e.g. 森 or 食べる");
  });

  test("shows the submit action and the character counter", () => {
    render(<SearchBar />);
    const submit = screen.getByRole("button", { name: "Submit search" });
    expect(submit).toBeVisible();
    expect(submit).toHaveAttribute("type", "button");
    expect(screen.getByText(/\/ 21 chars/)).toBeVisible();
  });

  test("draws a single focus ring on the field, never two", async () => {
    render(<SearchBar />);
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
});
