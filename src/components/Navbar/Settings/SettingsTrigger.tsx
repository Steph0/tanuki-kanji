import settingsAccountIcon from "@material-symbols/svg-400/outlined/settings_account_box.svg";
import settingsAlertIcon from "@material-symbols/svg-400/outlined/settings_alert.svg";
import type { RefObject } from "preact";
import { ICON_MD_PX } from "../../../constants/globals.ts";
import { Tooltip } from "../../Tooltip/Tooltip.tsx";
import styles from "./Settings.module.css";

const CONNECTED_TRIGGER_NAME = "Settings, OpenRouter connected";
const CONNECTED_TOOLTIP = "OpenRouter account";
const DISCONNECTED_TRIGGER_NAME = "Settings, OpenRouter not connected";
const DISCONNECTED_TOOLTIP = "OpenRouter sign-in";

type SettingsTriggerProps = {
  isConnected: boolean;
  triggerRef: RefObject<HTMLButtonElement>;
  onOpen: () => void;
};

export function SettingsTrigger({ isConnected, triggerRef, onOpen }: SettingsTriggerProps) {
  const triggerName = isConnected ? CONNECTED_TRIGGER_NAME : DISCONNECTED_TRIGGER_NAME;
  const tooltip = isConnected ? CONNECTED_TOOLTIP : DISCONNECTED_TOOLTIP;
  const icon = isConnected ? settingsAccountIcon : settingsAlertIcon;

  return (
    <Tooltip label={tooltip} align="end">
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-label={triggerName}
        aria-haspopup="dialog"
        onClick={onOpen}
      >
        <img
          className={styles.triggerIcon}
          src={icon}
          alt=""
          aria-hidden="true"
          width={ICON_MD_PX}
          height={ICON_MD_PX}
        />
      </button>
    </Tooltip>
  );
}
