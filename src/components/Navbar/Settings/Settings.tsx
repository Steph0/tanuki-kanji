import { useId } from "preact/hooks";
import type { OpenRouterSessionAPI } from "../../../services/engine/controller/openrouter-session/openRouterSessionApi.ts";
import { SettingsDialog } from "./SettingsDialog.tsx";
import { SettingsTrigger } from "./SettingsTrigger.tsx";
import type { SettingsStatus } from "./settingsState.ts";
import { useSettings } from "./useSettings.ts";
import { SettingsContent } from "./views/SettingsContent.tsx";

const CONNECT_TITLE = "Connect to OpenRouter";
const CONNECTED_TITLE = "OpenRouter connected";
const CONNECTING_TITLE = "Connecting to OpenRouter";

const SETTINGS_TITLES = {
  disconnected: CONNECT_TITLE,
  starting: CONNECT_TITLE,
  navigating: CONNECT_TITLE,
  connecting: CONNECTING_TITLE,
  connected: CONNECTED_TITLE,
  failed: CONNECT_TITLE,
} as const satisfies Record<SettingsStatus, string>;

type SettingsProps = {
  openRouterSession: OpenRouterSessionAPI;
  navigate: (url: string) => void;
};

export function Settings({ openRouterSession, navigate }: SettingsProps) {
  const settings = useSettings(openRouterSession, navigate);
  const titleId = useId();
  const bodyId = useId();

  return (
    <>
      <SettingsTrigger
        isConnected={settings.state.status === "connected"}
        triggerRef={settings.triggerRef}
        onOpen={settings.open}
      />
      <SettingsDialog
        dialogRef={settings.dialogRef}
        closeButtonRef={settings.closeButtonRef}
        titleId={titleId}
        bodyId={bodyId}
        title={SETTINGS_TITLES[settings.state.status]}
        onCancel={settings.cancel}
        onClose={settings.close}
        onBackdrop={settings.close}
      >
        <SettingsContent
          state={settings.state}
          bodyId={bodyId}
          onConnect={settings.connect}
          onDisconnect={settings.disconnect}
        />
      </SettingsDialog>
    </>
  );
}
