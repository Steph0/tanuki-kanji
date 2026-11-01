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

async function getChromeSession(
  provider: { getCDPSession?: (sessionId: string) => Promise<unknown> },
  sessionId: string,
): Promise<ChromeDevToolsProtocolSession> {
  if (!provider.getCDPSession) {
    throw new Error("Browser provider has no Chrome DevTools Protocol session");
  }
  return (await provider.getCDPSession(sessionId)) as unknown as ChromeDevToolsProtocolSession;
}

async function pressKey(session: ChromeDevToolsProtocolSession, key: KeyDefinition): Promise<void> {
  await session.send("Input.dispatchKeyEvent", { type: "rawKeyDown", ...key });
  await session.send("Input.dispatchKeyEvent", { type: "keyUp", ...key });
}

type KeyDefinition = { windowsVirtualKeyCode: number; code: string; key: string };

const TAB_KEY: KeyDefinition = { windowsVirtualKeyCode: 9, code: "Tab", key: "Tab" };
const ESCAPE_KEY: KeyDefinition = { windowsVirtualKeyCode: 27, code: "Escape", key: "Escape" };

/**
 * Node-side browser command: flips the real `prefers-reduced-motion` media
 * query in headless Chromium via the Chrome DevTools Protocol. Unlike the
 * `window.matchMedia` mock (which only fools JavaScript readers), this drives
 * genuine style `@media` evaluation, so `getComputedStyle` observes the
 * production fallback. Reusable by any future motion test via
 * `commands.emulateReducedMotion(reduce)`.
 */
export const emulateReducedMotion: BrowserCommand<[boolean]> = async ({ provider, sessionId }, reduce) => {
  const session = await getChromeSession(provider, sessionId);
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
  await pressKey(await getChromeSession(provider, sessionId), TAB_KEY);
};

/**
 * Node-side browser command: presses Escape with trusted keyboard input via
 * the Chrome DevTools Protocol, so native `<dialog>` cancellation runs through
 * the browser instead of a synthetic event.
 */
export const pressEscape: BrowserCommand<[]> = async ({ provider, sessionId }) => {
  await pressKey(await getChromeSession(provider, sessionId), ESCAPE_KEY);
};
