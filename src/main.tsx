import { render } from "preact";
import "./globals.css";
import { App } from "./App.tsx";
import { runTanukiKanjiLessonAPI } from "./services/engine/controller/lesson/runTanukiKanjiLessonApi.ts";

const app = document.getElementById("app");

if (app) {
  render(<App engine={runTanukiKanjiLessonAPI} />, app);
}
