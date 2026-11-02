import { LocationProvider } from "preact-iso";
import styles from "./App.module.css";
import { AppRouter } from "./AppRouter.tsx";
import { Navbar } from "./components/Navbar/Navbar.tsx";
import { TanukiKanjiProvider, type TanukiKanjiServices } from "./hooks/useTanukiKanjiServices.tsx";

type AppProps = {
  services?: Partial<TanukiKanjiServices>;
};

export function App({ services }: AppProps) {
  return (
    <LocationProvider>
      <TanukiKanjiProvider services={services}>
        <div className={styles.appContainer}>
          <Navbar />
          <main className={styles.pageContent} tabIndex={-1}>
            <AppRouter />
          </main>
        </div>
      </TanukiKanjiProvider>
    </LocationProvider>
  );
}
