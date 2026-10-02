import { render, screen } from "@testing-library/preact";
import { describe, expect, test } from "vitest";
import { noop } from "../../test-utils.ts";
import { LandingPage } from "./LandingPage.tsx";

describe("LandingPage", () => {
  test("shows the search bar section and the explanation", () => {
    render(<LandingPage onSubmit={noop} />);
    expect(screen.getByRole("textbox", { name: "Enter your kanji" })).toBeVisible();
    expect(screen.getByRole("region", { name: "Why Etymology Works" })).toBeVisible();
  });
});
