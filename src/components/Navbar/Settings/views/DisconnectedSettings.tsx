import styles from "../Settings.module.css";
import { SettingsAction } from "../SettingsAction.tsx";
import type { SettingsStatus } from "../settingsState.ts";

const CONNECT_BODY = "This app uses OpenRouter free models to generate the lessons.";
const CONNECT_ACTION_LABEL = "Connect to OpenRouter";
const CONNECT_FOOTNOTE =
  "Your key is never saved and only works in this tab. Closing the app auto-disconnect by default.";

type DisconnectedStatus = Extract<SettingsStatus, "disconnected" | "starting" | "navigating">;

type DisconnectedSettingsProps = {
  bodyId: string;
  status: DisconnectedStatus;
  onConnect: () => void;
};

export function DisconnectedSettings({ bodyId, status, onConnect }: DisconnectedSettingsProps) {
  return (
    <>
      <p id={bodyId} className={styles.body}>
        {CONNECT_BODY}
      </p>
      <SettingsAction variant="primary" disabled={status !== "disconnected"} onClick={onConnect}>
        {CONNECT_ACTION_LABEL}
      </SettingsAction>
      <p className={styles.note}>{CONNECT_FOOTNOTE}</p>
    </>
  );
}
