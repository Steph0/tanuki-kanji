import styles from "../Settings.module.css";
import { SettingsAction } from "../SettingsAction.tsx";

const CONNECTED_BODY =
  "Your OpenRouter account is connected. Your key is never saved and only works in this tab. Closing the app auto-disconnect by default.";
const CONNECTED_NOTE =
  "Disconnecting forgets the key in this tab. The key stays in your OpenRouter account until you revoke it.";
const DISCONNECT_ACTION_LABEL = "Disconnect";
const REVOKE_URL = "https://openrouter.ai/keys";
const REVOKE_LABEL = "Revoke in OpenRouter (opens in a new tab)";
const REVOKE_TEXT = "Revoke in OpenRouter";

type ConnectedSettingsProps = {
  bodyId: string;
  onDisconnect: () => void;
};

export function ConnectedSettings({ bodyId, onDisconnect }: ConnectedSettingsProps) {
  return (
    <>
      <p id={bodyId} className={styles.body}>
        {CONNECTED_BODY}
      </p>
      <SettingsAction variant="secondary" onClick={onDisconnect}>
        {DISCONNECT_ACTION_LABEL}
      </SettingsAction>
      <p className={styles.note}>
        <span>{CONNECTED_NOTE}</span>{" "}
        <a
          className={styles.noteLink}
          href={REVOKE_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={REVOKE_LABEL}
        >
          {REVOKE_TEXT}
        </a>
      </p>
    </>
  );
}
