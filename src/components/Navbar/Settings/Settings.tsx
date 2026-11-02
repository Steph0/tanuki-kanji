import { useId } from "preact/hooks";
import { useBrowserNavigate, useOpenRouterSession } from "../../../hooks/useTanukiKanjiServices.tsx";
import { SettingsDialog } from "./SettingsDialog.tsx";
import { SettingsTrigger } from "./SettingsTrigger.tsx";
import { isSettingsConnected, type SettingsStatus } from "./settingsState.ts";
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

export function Settings() {
  const openRouterSession = useOpenRouterSession();
  const navigate = useBrowserNavigate();
  const settings = useSettings(openRouterSession, navigate);
  const titleId = useId();
  const bodyId = useId();

  return (
    <>
      <SettingsTrigger
        isConnected={isSettingsConnected(settings.state)}
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
          connectActionRef={settings.connectActionRef}
          onConnect={settings.connect}
          onDisconnect={settings.disconnect}
        />
      </SettingsDialog>
    </>
  );
}
