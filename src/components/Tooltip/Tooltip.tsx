import type { ComponentChild } from "preact";
import styles from "./Tooltip.module.css";

type TooltipAlign = "center" | "end";

type TooltipProps = {
  label: string;
  /** `end` hugs the right edge, so a trigger near the viewport edge stays readable */
  align?: TooltipAlign;
  children: ComponentChild;
};

export function Tooltip({ label, align = "center", children }: TooltipProps) {
  return (
    <span className={styles.root}>
      {children}
      <span aria-hidden="true" className={`${styles.tooltip} ${align === "end" ? styles.end : styles.center}`}>
        {label}
      </span>
    </span>
  );
}
