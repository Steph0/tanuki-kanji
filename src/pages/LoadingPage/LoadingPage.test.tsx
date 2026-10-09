import { render, screen } from "@testing-library/preact";
import { describe, expect, test } from "vitest";
import { TanukiKanjiProvider } from "../../hooks/useTanukiKanjiEngine.tsx";
import { dummyEngine, noop } from "../../test-utils.ts";
import { LoadingPage } from "./LoadingPage.tsx";
import { LOADING_CAPTIONS } from "./loadingCaptions.ts";

const ARTWORK_ALT = "Tanuki calligraphing by lamplight while your lesson loads";

describe("LoadingPage", () => {
  test("shows the loading illustration with its descriptive label", async () => {
    render(
      <TanukiKanjiProvider engine={dummyEngine}>
        <LoadingPage kanjiUserInput="狸" onDone={noop} />
      </TanukiKanjiProvider>,
    );

    const illustration = await screen.findByRole("img", { name: ARTWORK_ALT });
    expect(illustration).toBeVisible();
  });

  test("announces the lore caption as a polite live region", async () => {
    render(
      <TanukiKanjiProvider engine={dummyEngine}>
        <LoadingPage kanjiUserInput="狸" onDone={noop} />
      </TanukiKanjiProvider>,
    );

    const caption = await screen.findByRole("status");
    expect(caption).toBeVisible();
    expect(caption).toHaveTextContent(LOADING_CAPTIONS[0]);
    expect(caption).toHaveAttribute("aria-live", "polite");
    expect(caption).toHaveAttribute("aria-busy", "true");
  });
});
