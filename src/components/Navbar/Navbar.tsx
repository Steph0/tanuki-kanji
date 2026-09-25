import syncIcon from "@material-symbols/svg-400/outlined/sync.svg";
import logo from "../../assets/navbar/app_logo.png";
import styles from "./Navbar.module.css";

const LOGO_INTRINSIC_PX = 36;
const HOME_ICON_INTRINSIC_PX = 20;

export function Navbar() {
  return (
    <header className={styles.bar}>
      <nav className={styles.navigationContent} aria-label="Primary">
        <div className={styles.brand}>
          <img className={styles.logo} src={logo} alt="Tanuki Sensei logo" width={LOGO_INTRINSIC_PX} height={LOGO_INTRINSIC_PX} />
          <span className={styles.title}>Tanuki Sensei</span>
        </div>
        <span className={styles.homeMark} aria-hidden="true">
          <img className={styles.homeIcon} src={syncIcon} alt="" width={HOME_ICON_INTRINSIC_PX} height={HOME_ICON_INTRINSIC_PX} />
        </span>
      </nav>
    </header>
  );
}
