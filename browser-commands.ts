import type { BrowserCommand } from "vitest/node";

type ChromeDevToolsProtocolSession = {
  send(
    method: "Emulation.setEmulatedMedia",
    params: { features: [{ name: "prefers-reduced-motion"; value: "reduce" | "no-preference" }] },
  ): Promise<void>;
};

/**
 * Node-side browser command: flips the real `prefers-reduced-motion` media
 * query in headless Chromium via the Chrome DevTools Protocol. Unlike the
 * `window.matchMedia` mock (which only fools JavaScript readers), this drives
 * genuine style `@media` evaluation, so `getComputedStyle` observes the
 * production fallback. Reusable by any future motion test via
 * `commands.emulateReducedMotion(reduce)`.
 */
export const emulateReducedMotion: BrowserCommand<[boolean]> = async ({ provider, sessionId }, reduce) => {
  const getSession = provider.getCDPSession;
  if (!getSession) {
    throw new Error("Browser provider has no Chrome DevTools Protocol session");
  }
  const session = (await getSession.call(provider, sessionId)) as unknown as ChromeDevToolsProtocolSession;
  await session.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: reduce ? "reduce" : "no-preference" }],
  });
};
