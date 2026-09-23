import forwardIcon from "@material-symbols/svg-400/outlined/arrow_forward.svg";
import markerIcon from "@material-symbols/svg-400/outlined/ink_highlighter.svg";
import styles from "./SearchBar.module.css";

export function SearchBar() {
  return (
    <section className={styles.section} aria-labelledby="search-heading">
      <div className={styles.card}>
        <h2 id="search-heading" className={styles.srOnly}>
          Kanji search
        </h2>
        <div className={styles.fieldHead}>
          <label className={styles.label} htmlFor="kanji-input">
            <img className={styles.labelIcon} src={markerIcon} alt="" aria-hidden="true" width={16} height={16} />
            Enter your kanji
          </label>
          <span className={styles.counter}>0 / 21 chars</span>
        </div>
        <div className={styles.fieldRow}>
          <input id="kanji-input" className={styles.input} type="text" placeholder="e.g. 森 or 食べる" aria-label="Search for a kanji or word" readOnly />
          {/* Static skeleton button: real button element for a11y, no handler yet */}
          <button type="button" className={styles.submitButton} aria-label="Submit search">
            <img className={styles.submitIcon} src={forwardIcon} alt="" aria-hidden="true" width={20} height={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
