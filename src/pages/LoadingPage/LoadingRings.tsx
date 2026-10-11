import styles from "./LoadingRings.module.css";

export function OuterLoadingRing() {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 200" className={styles.outer}>
      <path
        d="M100 8 C148 7, 192 48, 191 100 C190 148, 149 191, 100 192 C52 193, 9 152, 8 100 C7 62, 34 26, 70 12"
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="12 18 120 28"
        opacity="0.28"
        className={styles.strokePrimary}
      />
      <circle cx="100" cy="8" r="1.8" opacity="0.4" className={styles.fillPrimary} />
      <circle cx="191" cy="100" r="1.5" opacity="0.35" className={styles.fillSecondary} />
    </svg>
  );
}

export function InnerLoadingRing() {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 200" className={styles.inner}>
      <path
        d="M100 12 C146 14, 186 52, 187 98 C188 144, 148 186, 102 188 C58 189, 14 150, 12 104 C11 70, 32 34, 68 18"
        fill="none"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeDasharray="24 36 80 40"
        opacity="0.24"
        className={styles.strokeSecondary}
      />
      <circle cx="42" cy="164" r="1.2" opacity="0.3" className={styles.fillSecondary} />
    </svg>
  );
}
