import { screen } from "@testing-library/preact";
import { useEffect, useState } from "preact/hooks";
import { describe, expect, test } from "vitest";
import { useTanukiKanjiEngine } from "./hooks/useTanukiKanjiEngine.tsx";
import { pendingEngine, renderWithEngine } from "./test-utils.tsx";

describe("test engine helpers", () => {
  test("provides the engine to the rendered tree", async () => {
    renderWithEngine(<ContextLesson />, async () => "the tanuki story");
    expect(await screen.findByText("the tanuki story")).toBeVisible();
  });

  test("keeps a pending engine unsettled", async () => {
    const settled = Symbol("settled");
    const raced = await Promise.race([pendingEngine()("狸"), Promise.resolve(settled)]);
    expect(raced).toBe(settled);
  });
});

function ContextLesson() {
  const engine = useTanukiKanjiEngine();
  const [lesson, setLesson] = useState("pending");
  useEffect(() => {
    void engine("狸").then(setLesson);
  }, [engine]);
  return <p>{lesson}</p>;
}
