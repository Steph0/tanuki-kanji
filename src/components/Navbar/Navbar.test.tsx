import { render, screen } from "@testing-library/preact";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { commands, page } from "vitest/browser";
import { ICON_XL_PX } from "../../constants/globals.ts";
import { Navbar } from "./Navbar.tsx";

const { mockRoute } = vi.hoisted(() => ({ mockRoute: vi.fn() }));

vi.mock("preact-iso", () => ({
  useLocation: () => ({ route: mockRoute }),
}));

const originalDev = import.meta.env.DEV;
const originalMode = import.meta.env.MODE;

beforeEach(() => {
  mockRoute.mockClear();
});

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

  describe("home button", () => {
    test("returns the user to the homepage when activated", async () => {
      render(<Navbar />);
      const home = screen.getByRole("button", { name: "Back to homepage" });
      expect(home).toBeVisible();
      expect(home).toHaveAttribute("type", "button");
      await page.getByRole("button", { name: "Back to homepage" }).click();
      expect(mockRoute).toHaveBeenCalledTimes(1);
      expect(mockRoute).toHaveBeenCalledWith("/");
    });

    test("reveals its tooltip on hover", async () => {
      render(<Navbar />);
      const tooltip = screen.getByText("Back to homepage");
      // Park the real mouse away first: earlier tests may have left it over the button.
      await page.getByRole("img", { name: "Tanuki Kanji logo" }).hover();
      await vi.waitFor(() => expect(tooltip).not.toBeVisible());
      await page.getByRole("button", { name: "Back to homepage" }).hover();
      await vi.waitFor(() => expect(tooltip).toBeVisible());
      // Park the mouse away again so the keyboard test below starts hover-free.
      await page.getByRole("img", { name: "Tanuki Kanji logo" }).hover();
      await vi.waitFor(() => expect(tooltip).not.toBeVisible());
    });

    test("reveals its tooltip and the focus ring on keyboard focus, never hover-only", async () => {
      render(<Navbar />);
      const home = screen.getByRole("button", { name: "Back to homepage" });
      const tooltip = screen.getByText("Back to homepage");
      expect(tooltip).not.toBeVisible();
      await commands.pressTab();
      // The parked mouse is on the logo, so only keyboard focus can reveal this.
      expect(home.matches(":hover")).toBe(false);
      await vi.waitFor(() => expect(tooltip).toBeVisible());

      // The DESIGN.md focus ring arrives via the global :focus-visible rule
      const ring = getComputedStyle(home);
      expect(ring.outlineStyle).toBe("solid");
      expect(ring.outlineWidth).toBe("2px");
      expect(ring.outlineColor).toBe("rgb(45, 90, 67)");
      expect(ring.outlineOffset).toBe("2px");
    });
  });
});
