import styles from "../Settings.module.css";
import { SettingsAction } from "../SettingsAction.tsx";

const CONNECT_BODY = "This app uses OpenRouter free models to generate the lessons.";
const CONNECT_ACTION_LABEL = "Connect to OpenRouter";

type FailedSettingsProps = {
  bodyId: string;
  message: string;
  onConnect: () => void;
};

export function FailedSettings({ bodyId, message, onConnect }: FailedSettingsProps) {
  return (
    <>
      <p id={bodyId} className={styles.body}>
        {CONNECT_BODY}
      </p>
      <SettingsAction variant="primary" onClick={onConnect}>
        {CONNECT_ACTION_LABEL}
      </SettingsAction>
      <p role="alert" className={styles.error}>
        {message}
      </p>
    </>
  );
}
