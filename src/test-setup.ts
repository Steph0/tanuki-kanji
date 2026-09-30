import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/preact";
import { afterEach } from "vitest";
/* Renders with the real global stylesheet */
import "./globals.css";

afterEach(() => {
  cleanup();
});
