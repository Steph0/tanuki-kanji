import syncIcon from "@material-symbols/svg-400/outlined/sync.svg";
import logo from "../../assets/navbar/app_logo.png";
import styles from "./Navbar.module.css";

export function Navbar() {
  return (
    <header className={styles.bar}>
      <nav className={styles.inner} aria-label="Primary">
        <div className={styles.brand}>
          <img className={styles.logo} src={logo} alt="Tanuki Sensei logo" width={36} height={36} />
          <span className={styles.title}>Tanuki Sensei</span>
        </div>
        <span className={styles.homeMark} aria-hidden="true">
          <img className={styles.homeIcon} src={syncIcon} alt="" width={20} height={20} />
        </span>
      </nav>
    </header>
  );
}
