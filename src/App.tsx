import styles from "./App.module.css";
import { Banner } from "./components/Banner/Banner.tsx";
import { Explanation } from "./components/Explanation/Explanation.tsx";
import { Navbar } from "./components/Navbar/Navbar.tsx";
import { SearchBar } from "./components/SearchBar/SearchBar.tsx";

export function App() {
  return (
    <div className={styles.appContainer}>
      <Navbar />
      <main className={styles.pageContent}>
        <section className={styles.callToAction} aria-label="kanji meaning search bar">
          <Banner />
          <SearchBar />
        </section>
        <Explanation />
      </main>
    </div>
  );
}
