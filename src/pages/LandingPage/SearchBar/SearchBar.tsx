import forwardIcon from "@material-symbols/svg-400/outlined/arrow_forward.svg";
import markerIcon from "@material-symbols/svg-400/outlined/ink_highlighter.svg";
import { useState } from "preact/hooks";
import { ICON_MD_PX, ICON_SM_PX } from "../../../constants/globals";
import styles from "./SearchBar.module.css";

export function SearchBar({ onSubmit }: { onSubmit: (kanjiInputValue: string) => void }) {
  const [kanjiInputValue, setKanjiInputValue] = useState("");

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
        <div className={`${styles.fieldRow} field`}>
          <input
            id="kanji-input"
            className={styles.input}
            type="text"
            placeholder="e.g. 森 or 食べる"
            value={kanjiInputValue}
            onInput={(event) => {
              setKanjiInputValue((event.target as HTMLInputElement).value);
            }}
          />
          <button
            type="button"
            className={styles.submitButton}
            aria-label="Submit search"
            onClick={() => {
              onSubmit(kanjiInputValue);
            }}
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
      </div>
    </section>
  );
}
