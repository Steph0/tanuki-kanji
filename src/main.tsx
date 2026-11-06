import { render } from "preact";
import "./globals.css";
import { App } from "./App.tsx";
import { openRouterSessionAPI } from "./services/engine/controller/openrouter-session/openRouterSessionApi.ts";

const app = document.getElementById("app");

openRouterSessionAPI.captureAuthorizationReturn();
if (import.meta.env.DEV) {
  openRouterSessionAPI.connectDevelopmentSession();
}

if (app) {
  render(<App />, app);
}
