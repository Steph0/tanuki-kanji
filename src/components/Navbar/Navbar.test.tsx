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
    expect(logo.getAttribute("src")).toContain("app_logo-72.png");
    expect(logo).toHaveAttribute(
      "srcset",
      "/src/assets/navbar/app_logo-72.png 72w, /src/assets/navbar/app_logo-144.png 144w",
    );

    const source = logo.closest("picture")?.querySelector("source");
    expect(source?.getAttribute("type")).toBe("image/webp");
    expect(source).toHaveAttribute(
      "srcset",
      "/src/assets/navbar/app_logo-72.webp 72w, /src/assets/navbar/app_logo-144.webp 144w",
    );
    expect(screen.getByText("Tanuki Kanji")).toBeVisible();
  });
});
