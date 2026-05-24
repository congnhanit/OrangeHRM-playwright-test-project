import dotenv from "dotenv";
dotenv.config(); // Phải chạy dòng này đầu tiên!
import { defineConfig, devices } from "@playwright/test";
import { EnvironmentConfig } from "./environment.config";

const config = EnvironmentConfig.getInstance();

const authFile = `auth/${config.getEnvironment()}.json`;

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  timeout: 60_000,
  /* Run tests in files in parallel */
  // testMatch: '**/*.spec.ts',

  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 4 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [["html", { outputFolder: "playwright-report", open: "always" }]],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    launchOptions: {
      slowMo: 500, // Trì hoãn mỗi thao tác 50ms để nó "mượt" và dễ quan sát hơn
    },
    // Tự động quay video VÀO LÚC test case bị lỗi
    video: "retain-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },

    {
      name: "authen",
      use: { ...devices["Desktop Chrome"], storageState: authFile },
      dependencies: ["setup"],
      testDir: "./tests/auth",
      fullyParallel: true,
    },
    {
      name: "no-authen",
      use: { ...devices["Desktop Chrome"] },
      testDir: "./tests/no-auth",
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'],
    //             storageState: 'playwright/.auth/user.json',

    //    },
    //   dependencies: ['setup']

    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
