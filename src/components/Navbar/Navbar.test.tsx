import { render, screen } from "@testing-library/preact";
import { afterEach, describe, expect, test } from "vitest";
import { ICON_XL_PX } from "../../constants/globals.ts";
import { Navbar } from "./Navbar.tsx";

const originalDev = import.meta.env.DEV;
const originalMode = import.meta.env.MODE;

afterEach(() => {
  import.meta.env.DEV = originalDev;
  import.meta.env.MODE = originalMode;
});

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

  test("shows no dev badge in the test environment", () => {
    render(<Navbar />);
    expect(screen.queryByRole("button", { name: /Development folder/ })).toBeNull();
  });

  test("sits next to the brand, ahead of the home mark, when dev mode is on", () => {
    import.meta.env.DEV = true;
    import.meta.env.MODE = "development";
    render(<Navbar />);
    const navigation = screen.getByRole("navigation", { name: "Primary" });
    const badge = screen.getByRole("button", { name: /Development folder/ });
    expect(badge).toBeVisible();
    expect(navigation.children[1]).toBe(badge);
    expect(badge.nextElementSibling).toBe(navigation.lastElementChild);
  });
});
