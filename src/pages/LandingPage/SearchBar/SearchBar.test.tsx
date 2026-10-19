import { render, screen } from "@testing-library/preact";
import { describe, expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { noop } from "../../../test-utils.tsx";
import styles from "./SearchBar.module.css";
import { SearchBar } from "./SearchBar.tsx";

describe("SearchBar", () => {
  describe("structure", () => {
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
  });

  describe("character counter", () => {
    test("starts at zero against the engine limit", () => {
      render(<SearchBar onSubmit={noop} />);
      expect(screen.getByText("0 / 21 chars")).toBeVisible();
    });

    test("counts each typed character", async () => {
      render(<SearchBar onSubmit={noop} />);
      await page.getByRole("textbox", { name: "Enter your kanji" }).fill("狸");
      expect(screen.getByText("1 / 21 chars")).toBeVisible();
    });

    test("keeps counting past the limit without blocking typing", async () => {
      render(<SearchBar onSubmit={noop} />);
      await page.getByRole("textbox", { name: "Enter your kanji" }).fill("狸".repeat(22));
      expect(screen.getByText("22 / 21 chars")).toBeVisible();
    });

    test("falls back down when characters are deleted", async () => {
      render(<SearchBar onSubmit={noop} />);
      const input = page.getByRole("textbox", { name: "Enter your kanji" });
      await input.fill("狸".repeat(22));
      await input.fill("狸");
      expect(screen.getByText("1 / 21 chars")).toBeVisible();
    });
  });

  describe("over-limit warning", () => {
    test("stays clean at the limit with no warning", async () => {
      render(<SearchBar onSubmit={noop} />);
      await page.getByRole("textbox", { name: "Enter your kanji" }).fill("狸".repeat(21));
      expect(screen.queryByText("Whoa, long one! Tanuki keeps first 21 chars.")).toBeNull();
      expect(screen.getByRole("button", { name: "Submit search" })).toBeEnabled();
    });

    test("warns on a long valid word with submit on", async () => {
      render(<SearchBar onSubmit={noop} />);
      await page.getByRole("textbox", { name: "Enter your kanji" }).fill("狸".repeat(22));
      expect(screen.getByText("Whoa, long one! Tanuki keeps first 21 chars.")).toBeVisible();
      expect(screen.getByRole("button", { name: "Submit search" })).toBeEnabled();
    });

    test("errors live when the cut keeps foreign characters", async () => {
      render(<SearchBar onSubmit={noop} />);
      await page.getByRole("textbox", { name: "Enter your kanji" }).fill("ab".repeat(11));
      expect(screen.getByText("Only Kanji, hiragana and katakana characters are allowed")).toBeVisible();
      expect(screen.queryByText("Whoa, long one! Tanuki keeps first 21 chars.")).toBeNull();
      expect(screen.getByRole("button", { name: "Submit search" })).toBeDisabled();
    });

    test("warns when only the tail past the limit is bad", async () => {
      render(<SearchBar onSubmit={noop} />);
      await page.getByRole("textbox", { name: "Enter your kanji" }).fill(`${"狸".repeat(21)}!`);
      expect(screen.getByText("Whoa, long one! Tanuki keeps first 21 chars.")).toBeVisible();
      expect(screen.queryByText("Only Kanji, hiragana and katakana characters are allowed")).toBeNull();
      expect(screen.getByRole("button", { name: "Submit search" })).toBeEnabled();
    });

    test("clears the warning back under the limit", async () => {
      render(<SearchBar onSubmit={noop} />);
      const input = page.getByRole("textbox", { name: "Enter your kanji" });
      await input.fill("狸".repeat(22));
      expect(screen.getByText("Whoa, long one! Tanuki keeps first 21 chars.")).toBeVisible();
      await input.fill("狸");
      expect(screen.queryByText("Whoa, long one! Tanuki keeps first 21 chars.")).toBeNull();
    });

    test("warns for a long blank of spaces with submit on but no lesson", async () => {
      const onSubmit = vi.fn();
      render(<SearchBar onSubmit={onSubmit} />);
      await page.getByRole("textbox", { name: "Enter your kanji" }).fill(" ".repeat(22));
      expect(screen.getByText("Whoa, long one! Tanuki keeps first 21 chars.")).toBeVisible();
      expect(screen.getByRole("button", { name: "Submit search" })).toBeEnabled();
      await page.getByRole("button", { name: "Submit search" }).click();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    test("holds the warning steady through composition", async () => {
      render(<SearchBar onSubmit={noop} />);
      await page.getByRole("textbox", { name: "Enter your kanji" }).fill("狸");
      const input = screen.getByRole("textbox", { name: "Enter your kanji" });
      input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
      await page.getByRole("textbox", { name: "Enter your kanji" }).fill("狸".repeat(22));
      expect(screen.queryByText("Whoa, long one! Tanuki keeps first 21 chars.")).toBeNull();
      input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
      expect(await screen.findByText("Whoa, long one! Tanuki keeps first 21 chars.")).toBeVisible();
    });

    test("submits the first 21 characters on a warned submit", async () => {
      const onSubmit = vi.fn();
      render(<SearchBar onSubmit={onSubmit} />);
      await page.getByRole("textbox", { name: "Enter your kanji" }).fill("狸".repeat(22));
      await page.getByRole("button", { name: "Submit search" }).click();
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith("狸".repeat(21));
    });

    test("describes the warning without the invalid mark", async () => {
      render(<SearchBar onSubmit={noop} />);
      await page.getByRole("textbox", { name: "Enter your kanji" }).fill("狸".repeat(22));
      const input = screen.getByRole("textbox", { name: "Enter your kanji" });
      expect(input).not.toHaveAttribute("aria-invalid");
      const describedBy = input.getAttribute("aria-describedby");
      expect(describedBy).not.toBeNull();
      const message = document.getElementById(describedBy as string);
      expect(message).toHaveTextContent("Whoa, long one! Tanuki keeps first 21 chars.");
      expect(message).toHaveAttribute("aria-live", "polite");
      expect(message).not.toHaveAttribute("role");
    });
  });

  describe("submit path", () => {
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
  });

  describe("validation display", () => {
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
      await page.getByRole("textbox", { name: "Enter your kanji" }).fill("狸");
      expect(screen.getByRole("button", { name: "Submit search" })).toBeEnabled();
      expect(screen.queryByText("Only Kanji, hiragana and katakana characters are allowed")).toBeNull();
      expect(screen.queryByText("Enter at least one kanji.")).toBeNull();
    });

    test("freezes validation on half-composed text and settles on compositionend", async () => {
      const onSubmit = vi.fn();
      render(<SearchBar onSubmit={onSubmit} />);
      await page.getByRole("textbox", { name: "Enter your kanji" }).fill("狸");
      expect(screen.getByRole("button", { name: "Submit search" })).toBeEnabled();
      const input = screen.getByRole("textbox", { name: "Enter your kanji" });
      input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
      await page.getByRole("textbox", { name: "Enter your kanji" }).fill("狸a");
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
  });

  describe("submit gate", () => {
    test("fires the normalized value for padded input on submit", async () => {
      const onSubmit = vi.fn();
      render(<SearchBar onSubmit={onSubmit} />);
      await page.getByRole("textbox", { name: "Enter your kanji" }).fill(" 狸 ");
      await page.getByRole("button", { name: "Submit search" }).click();
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith("狸");
    });

    test("submits the clean cut when only the tail past the limit is bad", async () => {
      const onSubmit = vi.fn();
      render(<SearchBar onSubmit={onSubmit} />);
      await page.getByRole("textbox", { name: "Enter your kanji" }).fill(`${"狸".repeat(21)}!`);
      await page.getByRole("button", { name: "Submit search" }).click();
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith("狸".repeat(21));
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

    test("blocks a click on a dirty cut past the limit with its error and no submit", async () => {
      const onSubmit = vi.fn();
      render(<SearchBar onSubmit={onSubmit} />);
      await page.getByRole("textbox", { name: "Enter your kanji" }).fill("ab".repeat(11));
      // Error tone disables the button — a real lightning-fast click can
      // still land before the disabled redraw, and the sync gate holds it
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
  });

  describe("invalid styling", () => {
    test("paints the field border and message in the same red on invalid input", async () => {
      render(<SearchBar onSubmit={noop} />);
      await page.getByRole("textbox", { name: "Enter your kanji" }).fill("hello");
      // fill focuses the input — blur to assert the at-rest red border
      screen.getByRole("textbox", { name: "Enter your kanji" }).blur();
      const field = screen.getByRole("textbox", { name: "Enter your kanji" }).closest(`.${styles.fieldRow}`);
      // "error" is the shared .field state hook from globals, not a module class
      expect(field?.className.split(" ")).toContain("error");
      const red = "rgb(200, 62, 43)";
      expect(getComputedStyle(field as Element).borderColor).toBe(red);
      expect(getComputedStyle(screen.getByText("Only Kanji, hiragana and katakana characters are allowed")).color).toBe(
        red,
      );
    });

    test("paints a single red stroke on focused invalid input", async () => {
      render(<SearchBar onSubmit={noop} />);
      // fill focuses the input, so :focus-within applies — the border goes
      // transparent and one 2px outline takes the green outline's own +2px seat
      await page.getByRole("textbox", { name: "Enter your kanji" }).fill("hello");
      const field = screen.getByRole("textbox", { name: "Enter your kanji" }).closest(`.${styles.fieldRow}`);
      const stained = getComputedStyle(field as Element);
      expect(stained.borderColor).toBe("rgba(0, 0, 0, 0)");
      expect(stained.boxShadow).toContain("200, 62, 43");
      expect(stained.outlineStyle).toBe("solid");
      expect(stained.outlineColor).toBe("rgb(200, 62, 43)");
      expect(stained.outlineWidth).toBe("2px");
      expect(stained.outlineOffset).toBe("2px");
    });

    test("leaves the field unmarked for valid input", async () => {
      render(<SearchBar onSubmit={noop} />);
      await page.getByRole("textbox", { name: "Enter your kanji" }).fill("狸");
      const field = screen.getByRole("textbox", { name: "Enter your kanji" }).closest(`.${styles.fieldRow}`);
      expect(field?.className.split(" ")).not.toContain("error");
    });

    test("reserves the message slot so the card never jumps", async () => {
      render(<SearchBar onSubmit={noop} />);
      const card = screen.getByRole("textbox", { name: "Enter your kanji" }).closest(`.${styles.card}`);
      const calm = (card as HTMLElement).offsetHeight;
      await page.getByRole("textbox", { name: "Enter your kanji" }).fill("hello");
      expect(screen.getByText("Only Kanji, hiragana and katakana characters are allowed")).toBeVisible();
      expect((card as HTMLElement).offsetHeight).toBe(calm);
    });

    test("grays the disabled submit with a dark arrow while keeping its target size", async () => {
      render(<SearchBar onSubmit={noop} />);
      const submit = screen.getByRole("button", { name: "Submit search" });
      expect(submit).toBeDisabled();
      expect(getComputedStyle(submit).backgroundColor).toBe("rgb(230, 224, 214)");
      const arrow = submit.querySelector("img");
      expect(getComputedStyle(arrow as Element).filter).toBe("none");
      expect(submit.offsetWidth).toBe(44);
      expect(submit.offsetHeight).toBe(44);
    });

    test("washes selected text in the palette tint instead of native blue", async () => {
      render(<SearchBar onSubmit={noop} />);
      await page.getByRole("textbox", { name: "Enter your kanji" }).fill("狸");
      const input = screen.getByRole("textbox", { name: "Enter your kanji" });
      expect(getComputedStyle(input, "::selection").backgroundColor).toBe("rgba(140, 91, 62, 0.1)");
    });
  });

  describe("warning styling", () => {
    test("paints the counter and message in warning gold past the limit", async () => {
      render(<SearchBar onSubmit={noop} />);
      await page.getByRole("textbox", { name: "Enter your kanji" }).fill("狸".repeat(22));
      // fill focuses the input — blur to assert the at-rest gold border
      screen.getByRole("textbox", { name: "Enter your kanji" }).blur();
      const field = screen.getByRole("textbox", { name: "Enter your kanji" }).closest(`.${styles.fieldRow}`);
      // "warning" is the shared .field state hook from globals, not a module class
      expect(field?.className.split(" ")).toContain("warning");
      const gold = "rgb(138, 94, 0)";
      expect(getComputedStyle(field as Element).borderColor).toBe(gold);
      const counter = screen.getByText("22 / 21 chars");
      expect(counter).toHaveClass(styles.warning);
      expect(getComputedStyle(counter).color).toBe(gold);
      const message = screen.getByText("Whoa, long one! Tanuki keeps first 21 chars.");
      expect(message).toHaveClass(styles.warning);
      expect(getComputedStyle(message).color).toBe(gold);
      expect(getComputedStyle(message).color).not.toBe("rgb(200, 62, 43)");
    });

    test("paints a single gold stroke on focused over-limit input", async () => {
      render(<SearchBar onSubmit={noop} />);
      // fill focuses the input, so :focus-within applies — the border goes
      // transparent and one 2px outline takes the green outline's own +2px seat
      await page.getByRole("textbox", { name: "Enter your kanji" }).fill("狸".repeat(22));
      const field = screen.getByRole("textbox", { name: "Enter your kanji" }).closest(`.${styles.fieldRow}`);
      const gilded = getComputedStyle(field as Element);
      expect(gilded.borderColor).toBe("rgba(0, 0, 0, 0)");
      expect(gilded.boxShadow).toContain("138, 94, 0");
      expect(gilded.outlineStyle).toBe("solid");
      expect(gilded.outlineColor).toBe("rgb(138, 94, 0)");
      expect(gilded.outlineWidth).toBe("2px");
      expect(gilded.outlineOffset).toBe("2px");
    });

    test("leaves error red untouched on a dirty cut past the limit", async () => {
      render(<SearchBar onSubmit={noop} />);
      await page.getByRole("textbox", { name: "Enter your kanji" }).fill("ab".repeat(11));
      const error = screen.getByText("Only Kanji, hiragana and katakana characters are allowed");
      expect(error).not.toHaveClass(styles.warning);
      expect(getComputedStyle(error).color).toBe("rgb(200, 62, 43)");
      const counter = screen.getByText("22 / 21 chars");
      expect(counter).not.toHaveClass(styles.warning);
      const field = screen.getByRole("textbox", { name: "Enter your kanji" }).closest(`.${styles.fieldRow}`);
      expect(field?.className.split(" ")).toContain("error");
    });

    test("keeps the calm look at the limit", async () => {
      render(<SearchBar onSubmit={noop} />);
      await page.getByRole("textbox", { name: "Enter your kanji" }).fill("狸".repeat(21));
      expect(screen.getByText("21 / 21 chars")).not.toHaveClass(styles.warning);
      const field = screen.getByRole("textbox", { name: "Enter your kanji" }).closest(`.${styles.fieldRow}`);
      expect(field?.className.split(" ")).not.toContain("warning");
    });

    test("drops the warning look back under the limit", async () => {
      render(<SearchBar onSubmit={noop} />);
      const input = page.getByRole("textbox", { name: "Enter your kanji" });
      await input.fill("狸".repeat(22));
      expect(screen.getByText("22 / 21 chars")).toHaveClass(styles.warning);
      await input.fill("狸");
      expect(screen.getByText("1 / 21 chars")).not.toHaveClass(styles.warning);
      expect(screen.queryByText("Whoa, long one! Tanuki keeps first 21 chars.")).toBeNull();
    });

    test("keeps the card height identical across silence, warning, error", async () => {
      render(<SearchBar onSubmit={noop} />);
      const card = screen.getByRole("textbox", { name: "Enter your kanji" }).closest(`.${styles.card}`);
      const calm = (card as HTMLElement).offsetHeight;
      await page.getByRole("textbox", { name: "Enter your kanji" }).fill("狸".repeat(22));
      expect(screen.getByText("Whoa, long one! Tanuki keeps first 21 chars.")).toBeVisible();
      expect((card as HTMLElement).offsetHeight).toBe(calm);
      await page.getByRole("textbox", { name: "Enter your kanji" }).fill("hello");
      expect(screen.getByText("Only Kanji, hiragana and katakana characters are allowed")).toBeVisible();
      expect((card as HTMLElement).offsetHeight).toBe(calm);
    });
  });

  describe("accessibility", () => {
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
      await page.getByRole("textbox", { name: "Enter your kanji" }).fill("狸");
      const input = screen.getByRole("textbox", { name: "Enter your kanji" });
      expect(input).toHaveAttribute("lang", "ja");
      expect(input).not.toHaveAttribute("aria-invalid");
      expect(input).not.toHaveAttribute("aria-describedby");
    });
  });
});
