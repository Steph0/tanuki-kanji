import { LocationProvider } from "preact-iso";
import styles from "./App.module.css";
import { AppRouter } from "./AppRouter.tsx";
import { Navbar } from "./components/Navbar/Navbar.tsx";
import { TanukiKanjiProvider } from "./hooks/useTanukiKanjiEngine.tsx";
import type { TanukiKanjiEngine } from "./services/engine/controller/lesson/runTanukiKanjiLessonApi.ts";
import { runTanukiKanjiLessonAPI } from "./services/engine/controller/lesson/runTanukiKanjiLessonApi.ts";

type AppProps = {
  engine?: TanukiKanjiEngine;
};

export function App({ engine = runTanukiKanjiLessonAPI }: AppProps = {}) {
  return (
    <LocationProvider>
      <div className={styles.appContainer}>
        <Navbar />
        <main className={styles.pageContent} tabIndex={-1}>
          <TanukiKanjiProvider engine={engine}>
            <AppRouter />
          </TanukiKanjiProvider>
        </main>
      </div>
    </LocationProvider>
  );
}
