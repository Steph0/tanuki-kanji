import syncIcon from "@material-symbols/svg-400/outlined/sync.svg";
import logo72 from "../../assets/navbar/app_logo-72.png";
import logo72Webp from "../../assets/navbar/app_logo-72.webp";
import logo144 from "../../assets/navbar/app_logo-144.png";
import logo144Webp from "../../assets/navbar/app_logo-144.webp";
import { ICON_MD_PX, ICON_XL_PX } from "../../constants/globals";
import { DevModeBadge } from "./DevModeBadge/DevModeBadge.tsx";
import styles from "./Navbar.module.css";
import { useNavbar } from "./useNavbar.ts";

const LOGO_SIZES = `${ICON_XL_PX}px`;

export function Navbar() {
  const { handleHomeClick } = useNavbar();

  return (
    <header className={styles.bar}>
      <nav className={styles.navigationContent} aria-label="Primary">
        <div className={styles.brand}>
          <picture className={styles.logoPicture}>
            <source type="image/webp" srcSet={`${logo72Webp} 72w, ${logo144Webp} 144w`} sizes={LOGO_SIZES} />
            <img
              className={styles.logo}
              src={logo72}
              srcSet={`${logo72} 72w, ${logo144} 144w`}
              sizes={LOGO_SIZES}
              alt="Tanuki Kanji logo"
              width={ICON_XL_PX}
              height={ICON_XL_PX}
              decoding="async"
            />
          </picture>
          <span className={styles.title}>Tanuki Kanji</span>
        </div>
        <DevModeBadge />
        <button type="button" className={styles.homeMark} aria-label="Back to homepage" onClick={handleHomeClick}>
          <img
            className={styles.homeIcon}
            src={syncIcon}
            alt=""
            aria-hidden="true"
            width={ICON_MD_PX}
            height={ICON_MD_PX}
          />
          <span className={styles.tooltip} aria-hidden="true">
            Back to homepage
          </span>
        </button>
      </nav>
    </header>
  );
}
