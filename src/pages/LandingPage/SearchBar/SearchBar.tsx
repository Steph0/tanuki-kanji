import forwardIcon from "@material-symbols/svg-400/outlined/arrow_forward.svg";
import markerIcon from "@material-symbols/svg-400/outlined/ink_highlighter.svg";
import { ICON_MD_PX, ICON_SM_PX } from "../../../constants/globals";
import styles from "./SearchBar.module.css";
import { useSearchBar } from "./useSearchBar.ts";

export function SearchBar({ onSubmit }: { onSubmit: (kanjiInputValue: string) => void }) {
  const {
    handleKanjiInput,
    handleSearchSubmit,
    isSearchSubmitDisabled,
    kanjiInputMessage,
    kanjiInputRef,
    kanjiInputValue,
  } = useSearchBar(onSubmit);

  return (
    <section className={styles.search}>
      <div className={styles.card}>
        <div className={styles.fieldHead}>
          <label className={styles.label} htmlFor="kanji-input">
            <img
              className={styles.labelIcon}
              src={markerIcon}
              alt=""
              aria-hidden="true"
              width={ICON_SM_PX}
              height={ICON_SM_PX}
            />
            Enter your kanji
          </label>
          <span className={styles.counter}>0 / 21 chars</span>
        </div>
        <form onSubmit={handleSearchSubmit}>
          <div className={`${styles.fieldRow} field${kanjiInputMessage ? " invalid" : ""}`}>
            <input
              id="kanji-input"
              ref={kanjiInputRef}
              className={styles.input}
              type="text"
              lang="ja"
              placeholder="e.g. 森 or 食べる"
              value={kanjiInputValue}
              onInput={handleKanjiInput}
              aria-invalid={kanjiInputMessage ? "true" : undefined}
              aria-describedby={kanjiInputMessage ? "kanji-input-message" : undefined}
            />
            <button
              type="submit"
              className={styles.submitButton}
              aria-label="Submit search"
              disabled={isSearchSubmitDisabled}
            >
              <img
                className={styles.submitIcon}
                src={forwardIcon}
                alt=""
                aria-hidden="true"
                width={ICON_MD_PX}
                height={ICON_MD_PX}
              />
            </button>
          </div>
        </form>
        <div className={styles.errorMessage}>
          {kanjiInputMessage ? (
            <p id="kanji-input-message" className={styles.message} aria-live="polite">
              {kanjiInputMessage}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
