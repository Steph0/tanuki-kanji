import { screen } from "@testing-library/preact";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { commands, page } from "vitest/browser";
import { ICON_XL_PX } from "../../constants/globals.ts";
import { renderWithServices } from "../../test-utils.tsx";
import { Navbar } from "./Navbar.tsx";

const { mockRoute } = vi.hoisted(() => ({ mockRoute: vi.fn() }));

vi.mock("preact-iso", () => ({
  useLocation: () => ({ route: mockRoute }),
}));

const originalDev = import.meta.env.DEV;
const originalMode = import.meta.env.MODE;

function renderNavbar() {
  renderWithServices(<Navbar />);
}

beforeEach(() => {
  mockRoute.mockClear();
});

afterEach(() => {
  import.meta.env.DEV = originalDev;
  import.meta.env.MODE = originalMode;
});

describe("Navbar", () => {
  test("identifies as the webapp top-level header, not as content", () => {
    renderNavbar();
    expect(screen.getByRole("banner")).toBeVisible();
  });

  test("identifies as the webapp primary navigation system", () => {
    renderNavbar();
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeVisible();
  });

  test("shows the brand logo", () => {
    renderNavbar();
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
    renderNavbar();
    expect(screen.queryByRole("button", { name: /Development folder/ })).toBeNull();
  });

  test("groups the settings control ahead of the home action as the last navigation child", () => {
    renderNavbar();
    const navigation = screen.getByRole("navigation", { name: "Primary" });
    const settings = screen.getByRole("button", { name: "Settings, OpenRouter not connected" });
    const home = screen.getByRole("button", { name: "Back to homepage" });
    const actions = navigation.lastElementChild;

    expect(actions).not.toBeNull();
    expect(actions?.contains(settings)).toBe(true);
    expect(actions?.contains(home)).toBe(true);
    expect(settings.compareDocumentPosition(home) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  test("sits next to the brand, ahead of the actions group, when dev mode is on", () => {
    import.meta.env.DEV = true;
    import.meta.env.MODE = "development";
    renderNavbar();
    const navigation = screen.getByRole("navigation", { name: "Primary" });
    const badge = screen.getByRole("button", { name: /Development folder/ });
    const actions = navigation.lastElementChild;
    expect(badge).toBeVisible();
    expect(navigation.children[1]).toBe(badge);
    expect(badge.nextElementSibling).toBe(actions);
    expect(actions).toBe(navigation.lastElementChild);
  });

  test("tabs into settings first and the home action second", async () => {
    renderNavbar();

    await commands.pressTab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Settings, OpenRouter not connected" }));

    await commands.pressTab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Back to homepage" }));
  });

  describe("home button", () => {
    test("returns the user to the homepage when activated", async () => {
      renderNavbar();
      const home = screen.getByRole("button", { name: "Back to homepage" });
      expect(home).toBeVisible();
      expect(home).toHaveAttribute("type", "button");
      await page.getByRole("button", { name: "Back to homepage" }).click();
      expect(mockRoute).toHaveBeenCalledTimes(1);
      expect(mockRoute).toHaveBeenCalledWith("/");
    });

    test("reveals its tooltip on hover", async () => {
      renderNavbar();
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
      renderNavbar();
      const home = screen.getByRole("button", { name: "Back to homepage" });
      const tooltip = screen.getByText("Back to homepage");
      expect(tooltip).not.toBeVisible();
      await commands.pressTab();
      await commands.pressTab();
      // The parked mouse is on the logo, so only keyboard focus can reveal this.
      expect(home.matches(":hover")).toBe(false);
      await vi.waitFor(() => expect(tooltip).toBeVisible());

      expect(getComputedStyle(home).outlineStyle).toBe("none");
      const ring = getComputedStyle(home.querySelector("img") as Element);
      expect(ring.outlineStyle).toBe("solid");
      expect(ring.outlineWidth).toBe("2px");
      expect(ring.outlineColor).toBe("rgb(45, 90, 67)");
      expect(ring.outlineOffset).toBe("2px");
    });
  });
});
