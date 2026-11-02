import { screen } from "@testing-library/preact";
import { useEffect, useState } from "preact/hooks";
import { describe, expect, test, vi } from "vitest";
import { useBrowserNavigate, useOpenRouterSession, useTanukiKanjiLesson } from "./hooks/useTanukiKanjiServices.tsx";
import { fakeOpenRouterSessionAPI, pendingLesson, renderWithLesson, renderWithServices } from "./test-utils.tsx";

describe("test lesson helpers", () => {
  test("provides the lesson to the rendered tree", async () => {
    renderWithLesson(<ContextLesson />, async () => "the tanuki story");
    expect(await screen.findByText("the tanuki story")).toBeVisible();
  });

  test("keeps a pending lesson unsettled", async () => {
    const settled = Symbol("settled");
    const raced = await Promise.race([pendingLesson()("狸"), Promise.resolve(settled)]);
    expect(raced).toBe(settled);
  });
});

describe("test services helpers", () => {
  test("provides the session API and the browser transition to the rendered tree", async () => {
    const openRouterSession = fakeOpenRouterSessionAPI({ hasSession: () => true });
    const navigate = vi.fn();
    renderWithServices(<ContextServices />, { openRouterSession, navigate });

    const action = screen.getByRole("button", { name: "connected" });
    action.click();

    expect(navigate).toHaveBeenCalledWith("https://openrouter.ai/auth");
  });
});

function ContextLesson() {
  const tanukiKanjiLesson = useTanukiKanjiLesson();
  const [lesson, setLesson] = useState("pending");
  useEffect(() => {
    void tanukiKanjiLesson("狸").then(setLesson);
  }, [tanukiKanjiLesson]);
  return <p>{lesson}</p>;
}

function ContextServices() {
  const openRouterSession = useOpenRouterSession();
  const navigate = useBrowserNavigate();
  return (
    <button type="button" onClick={() => navigate("https://openrouter.ai/auth")}>
      {openRouterSession.hasSession() ? "connected" : "disconnected"}
    </button>
  );
}
