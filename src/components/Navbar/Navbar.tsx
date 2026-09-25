import syncIcon from "@material-symbols/svg-400/outlined/sync.svg";
import logo from "../../assets/navbar/app_logo.png";
import { ICON_MD_PX, ICON_XL_PX } from "../../constants/globals";
import styles from "./Navbar.module.css";

export function Navbar() {
  return (
    <header className={styles.bar}>
      <nav className={styles.navigationContent} aria-label="Primary">
        <div className={styles.brand}>
          <img className={styles.logo} src={logo} alt="Tanuki Kanji logo" width={ICON_XL_PX} height={ICON_XL_PX} />
          <span className={styles.title}>Tanuki Kanji</span>
        </div>
        <span className={styles.homeMark} aria-hidden="true">
          <img className={styles.homeIcon} src={syncIcon} alt="" width={ICON_MD_PX} height={ICON_MD_PX} />
        </span>
      </nav>
    </header>
  );
}
