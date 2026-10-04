import storiesIcon from "@material-symbols/svg-400/outlined/auto_stories.svg";
import banner400 from "../../../assets/banner/landing_page_banner-400.png";
import banner400Webp from "../../../assets/banner/landing_page_banner-400.webp";
import banner800 from "../../../assets/banner/landing_page_banner-800.png";
import banner800Webp from "../../../assets/banner/landing_page_banner-800.webp";
import { ICON_SM_PX } from "../../../constants/globals";
import styles from "./Banner.module.css";

const ILLUSTRATION_W = 400;
const ILLUSTRATION_H = 223;
const ILLUSTRATION_SIZES = "(max-width: 48rem) calc(100vw - 2rem), 400px";

export function Banner() {
  return (
    <section className={styles.banner} aria-labelledby="banner-heading">
      <div className={styles.visual}>
        <picture>
          <source
            type="image/webp"
            srcSet={`${banner400Webp} 400w, ${banner800Webp} 800w`}
            sizes={ILLUSTRATION_SIZES}
          />
          <img
            className={styles.image}
            src={banner400}
            srcSet={`${banner400} 400w, ${banner800} 800w`}
            sizes={ILLUSTRATION_SIZES}
            alt="Japanese mnemonic illustration of a Tanuki calligraphing the fire kanji"
            width={ILLUSTRATION_W}
            height={ILLUSTRATION_H}
            fetchPriority="high"
            decoding="async"
          />
        </picture>
        <div className={styles.overlay}>
          <span className={styles.badge}>
            <img
              className={styles.badgeIcon}
              src={storiesIcon}
              alt=""
              aria-hidden="true"
              width={ICON_SM_PX}
              height={ICON_SM_PX}
            />
          </span>
          <p className={styles.caption}>Unlock the secrets behind every stroke</p>
        </div>
      </div>
      <div className={styles.introText}>
        <h1 id="banner-heading">Understand kanji through real history.</h1>
        <p className={styles.pitch}>
          Tanuki Kanji guides you to understand Kanji real meaning. No funny memorization tricks, real history. Ready to
          learn?
        </p>
      </div>
    </section>
  );
}
