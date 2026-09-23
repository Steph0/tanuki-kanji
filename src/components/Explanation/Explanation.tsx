import bulbIcon from "@material-symbols/svg-400/outlined/lightbulb.svg";
import mindIcon from "@material-symbols/svg-400/outlined/psychology_alt.svg";
import leafIcon from "@material-symbols/svg-400/outlined/temp_preferences_eco.svg";
import styles from "./Explanation.module.css";

export function Explanation() {
  return (
    <section className={styles.section} aria-labelledby="etymology-heading">
      <div className={styles.card}>
        <div className={styles.head}>
          <div className={styles.headLeft}>
            <span className={styles.headBadge}>
              <img className={styles.icon} src={mindIcon} alt="" aria-hidden="true" width={16} height={16} />
            </span>
            <h2 id="etymology-heading" className={styles.heading}>
              Why Etymology Works
            </h2>
          </div>
          <span className={styles.tag}>Natural Memory</span>
        </div>
        <div className={styles.items}>
          <div className={styles.item}>
            <span className={styles.itemBadge}>
              <img className={styles.icon} src={bulbIcon} alt="" aria-hidden="true" width={18} height={18} />
            </span>
            <div className={styles.itemCopy}>
              <h3 className={styles.itemTitle}>Logical Radical Blocks</h3>
              <p className={styles.itemText}>Stop treating complex characters like abstract lines. Each stroke is a meaningful story component.</p>
            </div>
          </div>
          <div className={styles.item}>
            <span className={styles.itemBadge}>
              <img className={styles.icon} src={leafIcon} alt="" aria-hidden="true" width={18} height={18} />
            </span>
            <div className={styles.itemCopy}>
              <h3 className={styles.itemTitle}>Deep Cultural Folklore</h3>
              <p className={styles.itemText}>Tanuki Sensei weaves historical tales, seasonal poems, and native idiom trivia into your daily review.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
