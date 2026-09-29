import preact from "@preact/preset-vite";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [preact()],
    server: {
      host: false,
      allowedHosts: [
        env.VITE_ALLOWED_HOST_REMOTE_IP,
        env.VITE_ALLOWED_HOST_REMOTE_DNS
      ]
    }
  };
});
