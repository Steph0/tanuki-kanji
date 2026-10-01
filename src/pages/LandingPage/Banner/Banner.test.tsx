import { render, screen } from "@testing-library/preact";
import { describe, expect, test } from "vitest";
import { Banner } from "./Banner.tsx";

describe("Banner", () => {
  test("contains a page headline", () => {
    render(<Banner />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Understand kanji through real history.");
  });

  test("a11y: labels the block using page headline", () => {
    render(<Banner />);
    const section = screen.getByRole("region", { name: /real history/i });
    expect(section).toBeVisible();
  });

  test("shows the tanuki illustration with its overlay caption", () => {
    render(<Banner />);
    const illustration = screen.getByRole("img", { name: /tanuki calligraphing/i });
    expect(illustration).toBeVisible();
    expect(illustration.getAttribute("src")).toContain("landing_page_banner-400.png");
    expect(illustration).toHaveAttribute("srcset", "/src/assets/banner/landing_page_banner-400.png 400w, /src/assets/banner/landing_page_banner-800.png 800w");

    const source = illustration.closest("picture")?.querySelector("source");
    expect(source?.getAttribute("type")).toBe("image/webp");
    expect(source).toHaveAttribute("srcset", "/src/assets/banner/landing_page_banner-400.webp 400w, /src/assets/banner/landing_page_banner-800.webp 800w");
    expect(screen.getByText(/unlock the secrets/i)).toBeVisible();
  });

  test("a11y: badge icon on overlay caption is purely decorative", () => {
    render(<Banner />);
    expect(screen.getAllByRole("img")).toHaveLength(1);
  });
});
