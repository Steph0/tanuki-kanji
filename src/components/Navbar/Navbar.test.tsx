import { render, screen } from "@testing-library/preact";
import { describe, expect, test } from "vitest";
import { ICON_XL_PX } from "../../constants/globals.ts";
import { Navbar } from "./Navbar.tsx";

describe("Navbar", () => {
  test("identifies as the webapp top-level header, not as content", () => {
    render(<Navbar />);
    expect(screen.getByRole("banner")).toBeVisible();
  });

  test("identifies as the webapp primary navigation system", () => {
    render(<Navbar />);
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeVisible();
  });

  test("shows the brand logo", () => {
    render(<Navbar />);
    const logo = screen.getByRole("img", { name: "Tanuki Kanji logo" });
    expect(logo).toBeVisible();
    expect(logo).toHaveAttribute("width", String(ICON_XL_PX));
    expect(logo).toHaveAttribute("height", String(ICON_XL_PX));
    expect(screen.getByText("Tanuki Kanji")).toBeVisible();
  });
});
