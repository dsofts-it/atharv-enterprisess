import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";
const edge = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 90000,
  use: {
    baseURL: "http://127.0.0.1:5174",
    headless: true,
    launchOptions: { executablePath: existsSync(edge) ? edge : undefined },
    screenshot: "only-on-failure",
  },
  webServer: [
    {
      command: "node --import tsx scripts/e2e-server.ts",
      url: "http://127.0.0.1:4101/api/v1/health",
      timeout: 120000,
      reuseExistingServer: false,
    },
    {
      command: "npm.cmd run dev:client",
      url: "http://127.0.0.1:5174",
      env: { VITE_PORT: "5174", API_PROXY_TARGET: "http://127.0.0.1:4101" },
      timeout: 60000,
      reuseExistingServer: false,
    },
  ],
});
