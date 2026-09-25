import storiesIcon from "@material-symbols/svg-400/outlined/auto_stories.svg";
import banner from "../../assets/banner/landing_page_banner.png";
import { ICON_SM_PX } from "../../constants/globals";
import styles from "./Banner.module.css";

const ILLUSTRATION_INTRINSIC_W = 1376;
const ILLUSTRATION_INTRINSIC_H = 768;

export function Banner() {
  return (
    <section className={styles.banner} aria-labelledby="banner-heading">
      <div className={styles.visual}>
        <img className={styles.image} src={banner} alt="Japanese mnemonic illustration of a Tanuki calligraphing the fire kanji" width={ILLUSTRATION_INTRINSIC_W} height={ILLUSTRATION_INTRINSIC_H} />
        <div className={styles.overlay}>
          <span className={styles.badge}>
            <img className={styles.badgeIcon} src={storiesIcon} alt="" aria-hidden="true" width={ICON_SM_PX} height={ICON_SM_PX} />
          </span>
          <p className={styles.caption}>Unlock the secrets behind every stroke</p>
        </div>
      </div>
      <div className={styles.introText}>
        <h1 id="banner-heading" className={styles.pitch}>
          Tanuki Kanji guides you to understand Kanji real meaning. No funny memorization tricks, real history. Ready to learn?
        </h1>
      </div>
    </section>
  );
}
