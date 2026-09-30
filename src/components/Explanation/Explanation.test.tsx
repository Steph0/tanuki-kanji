import { render, screen } from "@testing-library/preact";
import { describe, expect, test } from "vitest";
import { Explanation } from "./Explanation.tsx";

describe("Explanation", () => {
  test("contains a block headline", () => {
    render(<Explanation />);
    expect(screen.getByRole("heading", { level: 2, name: "Why Etymology Works" })).toBeVisible();
  });

  test("a11y: labels the block using block headline", () => {
    render(<Explanation />);
    expect(screen.getByRole("region", { name: "Why Etymology Works" })).toBeVisible();
  });

  test("teaches exactly two memory principles in reading order", () => {
    render(<Explanation />);
    expect(screen.getByRole("list")).toBeVisible();
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);

    expect(screen.getByRole("heading", { level: 3, name: "Logical Radical Blocks" })).toBeVisible();
    expect(screen.getByText(/meaningful story component/i)).toBeVisible();

    expect(screen.getByRole("heading", { level: 3, name: "Deep Cultural Folklore" })).toBeVisible();
    expect(screen.getByText(/historical tales/i)).toBeVisible();
  });

  test("a11y: badges icons are purely decorative", () => {
    render(<Explanation />);
    expect(screen.getByText("Natural Memory")).toBeVisible();
    expect(screen.queryAllByRole("img")).toHaveLength(0);
  });
});
