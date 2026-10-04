import { useState } from "preact/hooks";
import styles from "./DevModeBadge.module.css";

const MAX_FULL_LENGTH = 10;
const HEAD_CHARS = 4;
const TAIL_CHARS = 3;

export function truncateMiddle(name: string): string {
  if (name.length <= MAX_FULL_LENGTH) {
    return name;
  }
  return `${name.slice(0, HEAD_CHARS)}...${name.slice(-TAIL_CHARS)}`;
}

type DevModeBadgeProps = {
  rootName?: string;
};

export function DevModeBadge({ rootName = __APP_ROOT_DIR_NAME__ }: DevModeBadgeProps = {}) {
  const [dismissed, setDismissed] = useState(false);

  if (!import.meta.env.DEV || import.meta.env.MODE !== "development" || dismissed || rootName.length === 0) {
    return null;
  }

  return (
    <button
      type="button"
      className={styles.badge}
      title={rootName}
      aria-label={`Development folder: ${rootName}. Activate to hide.`}
      onClick={() => setDismissed(true)}
    >
      {truncateMiddle(rootName)}
    </button>
  );
}
