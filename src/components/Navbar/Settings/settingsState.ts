export type SettingsState =
  | { status: "disconnected" }
  | { status: "starting" }
  | { status: "navigating" }
  | { status: "connecting" }
  | { status: "connected" }
  | { status: "failed"; message: string };

export type SettingsStatus = SettingsState["status"];

export type SettingsEvent =
  | { type: "startRequested" }
  | { type: "navigationStarted" }
  | { type: "returnCaptured" }
  | { type: "completed"; connected: boolean }
  | { type: "failed"; message: string }
  | { type: "disconnected" }
  | { type: "errorDismissed"; connected: boolean };

export function initialSettingsState(hasSession: boolean): SettingsState {
  return hasSession ? { status: "connected" } : { status: "disconnected" };
}

export function settingsReducer(state: SettingsState, event: SettingsEvent): SettingsState {
  switch (event.type) {
    case "startRequested":
      return { status: "starting" };
    case "navigationStarted":
      return { status: "navigating" };
    case "returnCaptured":
      return { status: "connecting" };
    case "completed":
      return event.connected ? { status: "connected" } : { status: "disconnected" };
    case "failed":
      return { status: "failed", message: event.message };
    case "disconnected":
      return { status: "disconnected" };
    case "errorDismissed":
      if (state.status !== "failed") {
        return state;
      }
      return event.connected ? { status: "connected" } : { status: "disconnected" };
  }
}
