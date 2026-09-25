import { render } from "preact";
import "./globals.css";
import { App } from "./App.tsx";

const app = document.getElementById("app");

if (app) {
  render(<App />, app);
}
