import type { ComponentChildren } from "preact";
import { useEffect, useState } from "preact/hooks";
import { Route, Router, useLocation } from "preact-iso";
import { LandingPage } from "./pages/LandingPage/LandingPage.tsx";
import { LoadingPage } from "./pages/LoadingPage/LoadingPage.tsx";
import { ResultPage } from "./pages/ResultPage/ResultPage.tsx";

type AppRouterProps = {
  initialKanjiUserInput?: string | null;
  initialTanukiKanjiLessonOutput?: string | null;
};

export function AppRouter({ initialKanjiUserInput = null, initialTanukiKanjiLessonOutput = null }: AppRouterProps) {
  const { route } = useLocation();
  const [kanjiUserInput, setKanjiUserInput] = useState<string | null>(initialKanjiUserInput);
  const [tanukiKanjiLessonOutput, setTanukiKanjiLessonOutput] = useState<string | null>(initialTanukiKanjiLessonOutput);

  function handleSubmit(kanjiInputValue: string) {
    setKanjiUserInput(kanjiInputValue);
    route("/loading");
  }

  function handleDone(finishedLessonOutput: string) {
    setTanukiKanjiLessonOutput(finishedLessonOutput);
    route("/result", true);
  }

  return (
    <Router>
      <Route path="/" component={LandingPage} onSubmit={handleSubmit} />
      <Route path="/loading" component={LoadingRoute} kanjiUserInput={kanjiUserInput} onDone={handleDone} />
      <Route path="/result" component={ResultRoute} tanukiKanjiLessonOutput={tanukiKanjiLessonOutput} />
      <Route default component={PageNotFoundRoute} />
    </Router>
  );
}

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

function LoadingRoute({ kanjiUserInput, onDone }: { kanjiUserInput: string | null; onDone: (tanukiKanjiLessonOutput: string) => void }) {
  return <RouteGuard value={kanjiUserInput}>{kanjiUserInput !== null && <LoadingPage kanjiUserInput={kanjiUserInput} onDone={onDone} />}</RouteGuard>;
}

function ResultRoute({ tanukiKanjiLessonOutput }: { tanukiKanjiLessonOutput: string | null }) {
  return <RouteGuard value={tanukiKanjiLessonOutput}>{tanukiKanjiLessonOutput !== null && <ResultPage tanukiKanjiLessonOutput={tanukiKanjiLessonOutput} />}</RouteGuard>;
}
