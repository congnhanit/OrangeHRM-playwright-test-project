import { expect, test as setup } from "@playwright/test";
import { LoginPage } from "../pages/loginPage";
import path from "node:path";
import { EnvironmentConfig } from "../environment.config";

const config = EnvironmentConfig.getInstance();
const credentials = config.getCredentials();
const authFile = `auth/${config.getEnvironment()}.json`;

// const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup.setTimeout(60000);

setup("Lưu session", async ({ page }) => {
//   let loginPage = new LoginPage(page);
  await page.goto(credentials.baseUrl);
//   await loginPage.login((credentials.username), (credentials.password))
  await page.fill('input[name="username"]', credentials.username);
  await page.fill('input[name="password"]', credentials.password);
  await page.click("div > button");
  await page.waitForURL(
    "https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index",
  );
  await page.waitForLoadState("networkidle");

  await page.context().storageState({ path: authFile });
});
