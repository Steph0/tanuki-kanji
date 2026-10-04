import { render, screen } from "@testing-library/preact";
import { describe, expect, test } from "vitest";
import { TanukiKanjiProvider } from "../../hooks/useTanukiKanjiEngine.tsx";
import { dummyEngine, noop } from "../../test-utils.ts";
import { LoadingPage } from "./LoadingPage.tsx";

describe("LoadingPage", () => {
  test("shows the loading indicator as a polite live region", async () => {
    render(
      <TanukiKanjiProvider engine={dummyEngine}>
        <LoadingPage kanjiUserInput="狸" onDone={noop} />
      </TanukiKanjiProvider>,
    );

    const indicator = await screen.findByText("Loading...");
    expect(indicator).toBeVisible();
    expect(indicator).toHaveAttribute("aria-live", "polite");
    expect(indicator).toHaveAttribute("aria-busy", "true");
  });
});
