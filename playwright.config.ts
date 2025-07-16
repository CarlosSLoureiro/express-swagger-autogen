import { defineConfig, devices, PlaywrightTestConfig } from "@playwright/test";
import { readdirSync } from "fs";

const examples = readdirSync("./examples").map((file) => file.replace(/\.ts$/, ""));

const tests = readdirSync("./tests");

examples.forEach((example) => {
  if (!tests.includes(`${example}.spec.ts`)) {
    throw `No test file found for example "${example}.spec.ts".`;
  }
});

const projects: PlaywrightTestConfig["projects"] = examples.map((name, index) => {
  const port = 3000 + index;

  return {
    name,
    testMatch: `**/${name}.spec.ts`,
    use: {
      ...devices["Desktop Chrome"],
      baseURL: `http://localhost:${port}`,
    },
  };
});

const webServer: PlaywrightTestConfig["webServer"] = examples.map((name, index) => {
  const port = 3000 + index;

  return {
    command: `npm run example -- ./examples/${name}.ts --port=${port}`,
    url: `http://localhost:${port}/documentation`,
    reuseExistingServer: !process.env.CI,
    timeout: 30 * 1000,
    stdout: "pipe",
    stderr: "pipe",
  };
});

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "line",
  use: {
    trace: "on-first-retry",
  },
  projects,
  webServer,
});
