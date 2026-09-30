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
    expect(screen.getByText(/unlock the secrets/i)).toBeVisible();
  });

  test("a11y: badge icon on overlay caption is purely decorative", () => {
    render(<Banner />);
    expect(screen.getAllByRole("img")).toHaveLength(1);
  });
});
