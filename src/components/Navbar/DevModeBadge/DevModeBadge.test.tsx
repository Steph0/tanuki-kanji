import { render, screen } from "@testing-library/preact";
import { afterEach, describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { DevModeBadge } from "./DevModeBadge.tsx";

const originalDev = import.meta.env.DEV;
const originalMode = import.meta.env.MODE;

function enableDevMode(): void {
  import.meta.env.DEV = true;
  import.meta.env.MODE = "development";
}

afterEach(() => {
  import.meta.env.DEV = originalDev;
  import.meta.env.MODE = originalMode;
});

describe("DevModeBadge", () => {
  test("stays hidden in the test environment without any stubbing", () => {
    render(<DevModeBadge rootName="main" />);
    expect(screen.queryByRole("button", { name: /Development folder/ })).toBeNull();
  });

  test("names the folder it runs from when dev mode is on", () => {
    enableDevMode();
    render(<DevModeBadge rootName="main" />);
    const badge = screen.getByRole("button", { name: "Development folder: main. Activate to hide." });
    expect(badge).toBeVisible();
    expect(badge).toHaveTextContent("main");
    expect(badge).toHaveAttribute("title", "main");
  });

  test("shortens long names in the middle, keeping head and tail", () => {
    enableDevMode();
    render(<DevModeBadge rootName="tanuki-kanji-bare" />);
    expect(screen.getByRole("button", { name: /Development folder/ })).toHaveTextContent("tanu...are");
  });

  test("keeps short names whole", () => {
    enableDevMode();
    render(<DevModeBadge rootName="abcdefghij" />);
    expect(screen.getByRole("button", { name: /Development folder/ })).toHaveTextContent("abcdefghij");
  });

  test("hides after the badge is clicked", async () => {
    enableDevMode();
    render(<DevModeBadge rootName="main" />);
    await page.getByRole("button", { name: /Development folder/ }).click();
    expect(screen.queryByRole("button", { name: /Development folder/ })).toBeNull();
  });

  test("is a native button, so keyboard dismissal comes from the browser", () => {
    enableDevMode();
    render(<DevModeBadge rootName="main" />);
    expect(screen.getByRole("button", { name: /Development folder/ })).toHaveAttribute("type", "button");
  });
});
