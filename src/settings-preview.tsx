import { render } from "preact";
import "./globals.css";
import { Settings } from "./components/Navbar/Settings/Settings.tsx";
import type { OpenRouterSessionAPI } from "./services/engine/controller/openrouter-session/openRouterSessionApi.ts";

type PreviewMode = "disconnected" | "connected" | "connecting" | "failed";

const params = new URLSearchParams(window.location.search);
const mode = (params.get("mode") ?? "disconnected") as PreviewMode;
const shouldOpen = params.get("open") === "1";

const previewApi: OpenRouterSessionAPI = {
  beginAuthorization: async () => ({ status: "refused" }),
  captureAuthorizationReturn: () => mode === "connecting" || mode === "failed",
  completeAuthorization: async () => {
    if (mode === "connecting") {
      return new Promise<never>(() => {});
    }
    return { status: "failed" };
  },
  hasSession: () => mode === "connected",
  disconnect: () => {},
};

const MODES: PreviewMode[] = ["disconnected", "connected", "connecting", "failed"];

render(
  <div>
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: "var(--navbar-h)",
        paddingInline: "var(--page-margin)",
        borderBottom: "1px solid var(--color-border)",
        backgroundColor: "var(--color-canvas)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-head)",
          fontWeight: "var(--text-headline-lg-weight)",
          fontSize: "var(--text-headline-lg-size)",
          color: "var(--color-primary)",
        }}
      >
        Tanuki Kanji
      </span>
      <Settings openRouterSession={previewApi} navigate={(url) => console.info("navigate", url)} />
    </header>
    <main style={{ padding: "var(--page-margin)", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
      {MODES.map((name) => (
        <a key={name} href={`?mode=${name}`} style={{ color: "var(--color-primary)" }}>
          {name}
        </a>
      ))}
    </main>
  </div>,
  document.getElementById("app") as HTMLElement,
);

if (shouldOpen) {
  document.querySelector<HTMLButtonElement>("button[aria-haspopup='dialog']")?.click();
}
