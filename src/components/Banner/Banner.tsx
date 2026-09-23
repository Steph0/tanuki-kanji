import storiesIcon from "@material-symbols/svg-400/outlined/auto_stories.svg";
import banner from "../../assets/banner/landing_page_banner.png";
import styles from "./Banner.module.css";

export function Banner() {
  return (
    <section className={styles.section} aria-labelledby="banner-heading">
      <div className={styles.frame}>
        <img className={styles.image} src={banner} alt="Japanese mnemonic illustration of Tanuki Sensei calligraphing a kanji" />
        <div className={styles.overlay}>
          <span className={styles.badge}>
            <img className={styles.badgeIcon} src={storiesIcon} alt="" aria-hidden="true" width={15} height={15} />
          </span>
          <p className={styles.caption}>Unlock the secrets behind every stroke</p>
        </div>
      </div>
      <div className={styles.copy}>
        <h1 id="banner-heading" className={styles.srOnly}>
          Tanuki Sensei — Kanji etymology search
        </h1>
        <p className={styles.lede}>Tanuki Kanji guides you to understand Kanji real meaning. No funny memorization tricks, real history. Ready to learn?</p>
      </div>
    </section>
  );
}
