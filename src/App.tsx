import type { ComponentChildren } from "preact";
import { useEffect, useState } from "preact/hooks";
import { LocationProvider, Route, Router, useLocation } from "preact-iso";
import styles from "./App.module.css";
import { Navbar } from "./components/Navbar/Navbar.tsx";
import { LandingPage } from "./pages/LandingPage/LandingPage.tsx";

type AppProps = {
  initialKanjiUserInput?: string | null;
  initialTanukiKanjiLessonOutput?: string | null;
};

function PageNotFoundRoute() {
  const { route } = useLocation();

  useEffect(() => {
    route("/", true);
  }, [route]);

  return null;
}

function RouteGuard({ value, children }: { value: string | null; children: ComponentChildren }) {
  const { route } = useLocation();

  useEffect(() => {
    if (value === null) {
      route("/", true);
    }
  }, [value, route]);

  if (value === null) {
    return null;
  }

  return <>{children}</>;
}

function LoadingRoute({ kanjiUserInput }: { kanjiUserInput: string | null }) {
  return (
    <RouteGuard value={kanjiUserInput}>
      <p>Loading...</p>
    </RouteGuard>
  );
}

function ResultRoute({ tanukiKanjiLessonOutput }: { tanukiKanjiLessonOutput: string | null }) {
  return (
    <RouteGuard value={tanukiKanjiLessonOutput}>
      <p>{tanukiKanjiLessonOutput}</p>
    </RouteGuard>
  );
}

export function App({ initialKanjiUserInput = null, initialTanukiKanjiLessonOutput = null }: AppProps = {}) {
  const [kanjiUserInput] = useState<string | null>(initialKanjiUserInput);
  const [tanukiKanjiLessonOutput] = useState<string | null>(initialTanukiKanjiLessonOutput);

  return (
    <LocationProvider>
      <div className={styles.appContainer}>
        <Navbar />
        <main className={styles.pageContent} tabIndex={-1}>
          <Router>
            <Route path="/" component={LandingPage} />
            <Route path="/loading" component={LoadingRoute} kanjiUserInput={kanjiUserInput} />
            <Route path="/result" component={ResultRoute} tanukiKanjiLessonOutput={tanukiKanjiLessonOutput} />
            <Route default component={PageNotFoundRoute} />
          </Router>
        </main>
      </div>
    </LocationProvider>
  );
}
