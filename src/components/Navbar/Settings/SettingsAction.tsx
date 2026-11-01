import type { ComponentChild } from "preact";
import styles from "./Settings.module.css";

type SettingsActionVariant = "primary" | "secondary";

type SettingsActionProps = {
  variant: SettingsActionVariant;
  disabled?: boolean;
  onClick: () => void;
  children: ComponentChild;
};

export function SettingsAction({ variant, disabled = false, onClick, children }: SettingsActionProps) {
  return (
    <button type="button" className={`${styles.action} ${styles[variant]}`} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
