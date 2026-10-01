import { render, screen } from "@testing-library/preact";
import { describe, expect, test } from "vitest";
import { LandingPage } from "./LandingPage.tsx";

describe("LandingPage", () => {
  test("shows the search bar section and the explanation", () => {
    render(<LandingPage />);
    expect(screen.getByRole("textbox", { name: "Enter your kanji" })).toBeVisible();
    expect(screen.getByRole("region", { name: "Why Etymology Works" })).toBeVisible();
  });
});
