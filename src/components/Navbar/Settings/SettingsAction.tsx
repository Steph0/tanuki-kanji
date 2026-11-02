import type { ComponentChild, Ref } from "preact";
import styles from "./Settings.module.css";

type SettingsActionVariant = "primary" | "secondary";

type SettingsActionProps = {
  variant: SettingsActionVariant;
  disabled?: boolean;
  actionRef?: Ref<HTMLButtonElement>;
  onClick: () => void;
  children: ComponentChild;
};

export function SettingsAction({ variant, disabled = false, actionRef, onClick, children }: SettingsActionProps) {
  return (
    <button
      ref={actionRef}
      type="button"
      className={`${styles.action} ${styles[variant]}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
