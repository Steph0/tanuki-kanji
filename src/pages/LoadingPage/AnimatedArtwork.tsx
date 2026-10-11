import type { ComponentChild } from "preact";
import styles from "./AnimatedArtwork.module.css";
import { InnerLoadingRing, OuterLoadingRing } from "./LoadingRings.tsx";

type AnimatedArtworkProps = {
  children: ComponentChild;
};

export function AnimatedArtwork({ children }: AnimatedArtworkProps) {
  return (
    <div className={styles.visual}>
      <div aria-hidden="true" className={styles.halo} />
      <div aria-hidden="true" className={styles.ripple} />
      <OuterLoadingRing />
      <InnerLoadingRing />
      <span aria-hidden="true" className={`${styles.dot} ${styles.dotTopRight}`} />
      <span aria-hidden="true" className={`${styles.dot} ${styles.dotBottomLeft}`} />
      <span aria-hidden="true" className={`${styles.dot} ${styles.dotMiddleLeft}`} />
      <span aria-hidden="true" className={`${styles.dot} ${styles.dotBottomRight}`} />
      <div className={styles.slot}>{children}</div>
    </div>
  );
}
