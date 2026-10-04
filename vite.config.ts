import { basename } from "node:path";
import preact from "@preact/preset-vite";
import { playwright } from "@vitest/browser-playwright";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [preact()],
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
      },
    },
  };
});
