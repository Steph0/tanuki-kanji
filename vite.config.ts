import { basename } from "node:path";
import preact from "@preact/preset-vite";
import { playwright } from "@vitest/browser-playwright";
import { msw } from "msw/vite";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";
import { emulateReducedMotion, pressTab } from "./browser-commands.ts";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  // MSW serves its worker script from `node_modules`; registering the plugin
  // only under test keeps that test-only script out of `public/` and `dist/`.
  const plugins = process.env.VITEST ? [msw({ mode: "worker-only" })] : [];

  return {
    plugins: [preact(), ...plugins],
    define: {
      __APP_ROOT_DIR_NAME__: JSON.stringify(basename(process.cwd())),
    },
    server: {
      port: 5173,
      strictPort: false, // allows multiple dev servers
      host: false,
      allowedHosts: [env.VITE_ALLOWED_HOST_REMOTE_IP, env.VITE_ALLOWED_HOST_REMOTE_DNS],
    },
    test: {
      setupFiles: ["./src/test-setup.ts"],
      browser: {
        enabled: true,
        provider: playwright(),
        headless: true,
        instances: [{ browser: "chromium" }],
        commands: { emulateReducedMotion, pressTab },
      },
    },
  };
});
