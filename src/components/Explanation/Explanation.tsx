import bulbIcon from "@material-symbols/svg-400/outlined/lightbulb.svg";
import mindIcon from "@material-symbols/svg-400/outlined/psychology_alt.svg";
import leafIcon from "@material-symbols/svg-400/outlined/temp_preferences_eco.svg";
import { ICON_MD_PX, ICON_SM_PX } from "../../constants/globals";
import styles from "./Explanation.module.css";

export function Explanation() {
  return (
    <section className={styles.explanation} aria-labelledby="etymology-heading">
      <div className={styles.card}>
        <div className={styles.head}>
          <div className={styles.headLeft}>
            <span className={styles.headBadge}>
              <img className={styles.icon} src={mindIcon} alt="" aria-hidden="true" width={ICON_MD_PX} height={ICON_MD_PX} />
            </span>
            <h2 id="etymology-heading" className={styles.heading}>
              Why Etymology Works
            </h2>
          </div>
          <span className={styles.tag}>Natural Memory</span>
        </div>
        <ul className={styles.items}>
          <li className={styles.item}>
            <span className={styles.itemBadge}>
              <img className={styles.icon} src={bulbIcon} alt="" aria-hidden="true" width={ICON_SM_PX} height={ICON_SM_PX} />
            </span>
            <div className={styles.itemCopy}>
              <h3 className={styles.itemTitle}>Logical Radical Blocks</h3>
              <p className={styles.itemText}>Stop treating complex characters like abstract lines. Each stroke is a meaningful story component.</p>
            </div>
          </li>
          <li className={styles.item}>
            <span className={styles.itemBadge}>
              <img className={styles.icon} src={leafIcon} alt="" aria-hidden="true" width={ICON_SM_PX} height={ICON_SM_PX} />
            </span>
            <div className={styles.itemCopy}>
              <h3 className={styles.itemTitle}>Deep Cultural Folklore</h3>
              <p className={styles.itemText}>Tanuki Sensei weaves historical tales, seasonal poems, and native idiom trivia into your daily review.</p>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}
