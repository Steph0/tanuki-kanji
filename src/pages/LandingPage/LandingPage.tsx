import { Banner } from "./Banner/Banner.tsx";
import { Explanation } from "./Explanation/Explanation.tsx";
import styles from "./LandingPage.module.css";
import { SearchBar } from "./SearchBar/SearchBar.tsx";

export function LandingPage() {
  return (
    <>
      <section className={styles.callToAction} aria-label="kanji meaning search bar">
        <Banner />
        <SearchBar />
      </section>
      <Explanation />
    </>
  );
}
