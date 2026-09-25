import forwardIcon from "@material-symbols/svg-400/outlined/arrow_forward.svg";
import markerIcon from "@material-symbols/svg-400/outlined/ink_highlighter.svg";
import styles from "./SearchBar.module.css";

const LABEL_INTRINSIC_PX = 16;
const SUBMIT_INTRINSIC_PX = 20;

export function SearchBar() {
  return (
    <section className={styles.search}>
      <div className={styles.card}>
        <div className={styles.fieldHead}>
          <label className={styles.label} htmlFor="kanji-input">
            <img className={styles.labelIcon} src={markerIcon} alt="" aria-hidden="true" width={LABEL_INTRINSIC_PX} height={LABEL_INTRINSIC_PX} />
            Enter your kanji
          </label>
          <span className={styles.counter}>0 / 21 chars</span>
        </div>
        <div className={styles.fieldRow}>
          <input id="kanji-input" className={styles.input} type="text" placeholder="e.g. 森 or 食べる" readOnly />
          {/* Static skeleton button: real button element for a11y, no handler yet */}
          <button type="button" className={styles.submitButton} aria-label="Submit search">
            <img className={styles.submitIcon} src={forwardIcon} alt="" aria-hidden="true" width={SUBMIT_INTRINSIC_PX} height={SUBMIT_INTRINSIC_PX} />
          </button>
        </div>
      </div>
    </section>
  );
}
