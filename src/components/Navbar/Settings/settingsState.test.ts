import { describe, expect, test } from "vitest";
import { initialSettingsState, type SettingsState, settingsReducer } from "./settingsState.ts";

const MESSAGE = "Could not connect to OpenRouter. Please try again.";

describe("settingsState", () => {
  test("starts connected when the engine already holds a session", () => {
    expect(initialSettingsState(true)).toEqual({ status: "connected" });
  });

  test("starts disconnected when the tab has no session", () => {
    expect(initialSettingsState(false)).toEqual({ status: "disconnected" });
  });

  test("disables the offer as soon as the sign-in begins", () => {
    expect(settingsReducer({ status: "disconnected" }, { type: "startRequested" })).toEqual({ status: "starting" });
  });

  test("keeps the offer disabled once navigation starts", () => {
    expect(settingsReducer({ status: "starting" }, { type: "navigationStarted" })).toEqual({ status: "navigating" });
  });

  test("carries the failure message into the failed state", () => {
    expect(settingsReducer({ status: "navigating" }, { type: "failed", message: MESSAGE })).toEqual({
      status: "failed",
      message: MESSAGE,
    });
  });

  test("moves to the connecting state when the return is captured", () => {
    expect(settingsReducer({ status: "disconnected" }, { type: "returnCaptured" })).toEqual({ status: "connecting" });
  });

  test("connects when the exchange leaves a session behind", () => {
    expect(settingsReducer({ status: "connecting" }, { type: "completed", connected: true })).toEqual({
      status: "connected",
    });
  });

  test("returns to the offer when the exchange leaves no session", () => {
    expect(settingsReducer({ status: "connecting" }, { type: "completed", connected: false })).toEqual({
      status: "disconnected",
    });
  });

  test("disconnecting forgets the session while the dialog stays open", () => {
    expect(settingsReducer({ status: "connected" }, { type: "disconnected" })).toEqual({ status: "disconnected" });
  });

  test("dismissing a failure falls back to the session the engine still holds", () => {
    const failed: SettingsState = { status: "failed", message: MESSAGE };

    expect(settingsReducer(failed, { type: "errorDismissed", connected: true })).toEqual({ status: "connected" });
    expect(settingsReducer(failed, { type: "errorDismissed", connected: false })).toEqual({ status: "disconnected" });
  });

  test("dismissing an error leaves every other state untouched", () => {
    const states: SettingsState[] = [
      { status: "disconnected" },
      { status: "starting" },
      { status: "navigating" },
      { status: "connecting" },
      { status: "connected" },
    ];

    for (const state of states) {
      expect(settingsReducer(state, { type: "errorDismissed", connected: false })).toBe(state);
    }
  });
});
