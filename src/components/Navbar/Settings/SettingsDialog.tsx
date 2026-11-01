import closeIcon from "@material-symbols/svg-400/outlined/close.svg";
import type { ComponentChild, RefObject } from "preact";
import { ICON_MD_PX } from "../../../constants/globals.ts";
import styles from "./Settings.module.css";

type SettingsDialogProps = {
  dialogRef: RefObject<HTMLDialogElement>;
  closeButtonRef: RefObject<HTMLButtonElement>;
  titleId: string;
  bodyId: string;
  title: string;
  onCancel: (event: Event) => void;
  onClose: () => void;
  onBackdrop: () => void;
  children: ComponentChild;
};

export function SettingsDialog({
  dialogRef,
  closeButtonRef,
  titleId,
  bodyId,
  title,
  onCancel,
  onClose,
  onBackdrop,
  children,
}: SettingsDialogProps) {
  function closeOnBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onBackdrop();
    }
  }

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop dismissal is pointer-only; Escape is the native keyboard path.
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      onCancel={onCancel}
      onClick={closeOnBackdropClick}
    >
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.close}
            aria-label="Close settings"
            onClick={onClose}
          >
            <img
              className={styles.closeIcon}
              src={closeIcon}
              alt=""
              aria-hidden="true"
              width={ICON_MD_PX}
              height={ICON_MD_PX}
            />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
