import type { SettingsState } from "../settingsState.ts";
import { ConnectedSettings } from "./ConnectedSettings.tsx";
import { ConnectingSettings } from "./ConnectingSettings.tsx";
import { DisconnectedSettings } from "./DisconnectedSettings.tsx";
import { FailedSettings } from "./FailedSettings.tsx";

type SettingsContentProps = {
  state: SettingsState;
  bodyId: string;
  onConnect: () => void;
  onDisconnect: () => void;
};

export function SettingsContent({ state, bodyId, onConnect, onDisconnect }: SettingsContentProps) {
  if (state.status === "connecting") {
    return <ConnectingSettings bodyId={bodyId} />;
  }
  if (state.status === "failed") {
    return <FailedSettings bodyId={bodyId} message={state.message} onConnect={onConnect} />;
  }
  if (state.status === "connected") {
    return <ConnectedSettings bodyId={bodyId} onDisconnect={onDisconnect} />;
  }
  return <DisconnectedSettings bodyId={bodyId} status={state.status} onConnect={onConnect} />;
}
