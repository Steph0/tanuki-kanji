import type { BrowserCommand } from "vitest/node";

type ChromeDevToolsProtocolSession = {
  send(
    method: "Emulation.setEmulatedMedia",
    params: { features: [{ name: "prefers-reduced-motion"; value: "reduce" | "no-preference" }] },
  ): Promise<void>;
  send(
    method: "Input.dispatchKeyEvent",
    params: { type: "rawKeyDown" | "keyUp"; windowsVirtualKeyCode: number; code: string; key: string },
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

/**
 * Node-side browser command: presses Tab with trusted keyboard input via the
 * Chrome DevTools Protocol. Unlike `element.focus()` (which moves focus
 * without keyboard modality, so `:focus-visible` may not match), this drives
 * genuine keyboard focus movement, so `:focus-visible` styles and tooltips
 * appear exactly as they do for keyboard users. Reusable by any future focus
 * test via `commands.pressTab()`.
 */
export const pressTab: BrowserCommand<[]> = async ({ provider, sessionId }) => {
  const getSession = provider.getCDPSession;
  if (!getSession) {
    throw new Error("Browser provider has no Chrome DevTools Protocol session");
  }
  const session = (await getSession.call(provider, sessionId)) as unknown as ChromeDevToolsProtocolSession;
  const tabKey = { windowsVirtualKeyCode: 9, code: "Tab", key: "Tab" };
  await session.send("Input.dispatchKeyEvent", { type: "rawKeyDown", ...tabKey });
  await session.send("Input.dispatchKeyEvent", { type: "keyUp", ...tabKey });
};
