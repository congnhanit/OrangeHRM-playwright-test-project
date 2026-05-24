import { test, expect, Locator } from "@playwright/test";
import { LoginPage } from "../../pages/loginPage";

test.describe("Kiểm tra đăng nhập", () => {
  let loginPage: LoginPage;
  let loginErrorAlert1: Locator, loginErrorAlert2: Locator;

  // HOOK: Chạy trước mỗi test case
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await page.goto(
      "https://opensource-demo.orangehrmlive.com/web/index.php/auth/login",
    );
    // Đợi trang load xong trạng thái mạng (WAIT)
    await page.waitForLoadState("networkidle");
    loginErrorAlert1 = page.locator('input[name="username"].oxd-input--error');
    loginErrorAlert2 = page.locator('input[name="password"].oxd-input--error');
  });

  test("Người dùng login thành công", async ({ page }) => {
    // ACTION
    await loginPage.login("Admin", "admin123");

    // ASSERTION: Kiểm tra URL sau khi login thành công
    await expect(page).toHaveURL(/dashboard/);
  });
  test("Người dùng không nhập cả 2 field", async ({ page }) => {
    await loginPage.login("", "");
    await expect(loginErrorAlert1).toBeVisible();
    await expect(loginErrorAlert2).toBeVisible();
  });

  test("Người dùng không nhập mật khẩu", async ({ page }) => {
    await loginPage.login("admin", "");
    await expect(loginErrorAlert1).toBeHidden();
    await expect(loginErrorAlert2).toBeVisible();
  });
  test("Người dùng không nhập username", async ({ page }) => {
    await loginPage.login("", "admin123");
    await expect(loginErrorAlert1).toBeVisible();
    await expect(loginErrorAlert2).toBeHidden();
  });
  test("Người dùng nhập sai username, đúng mật khẩu", async ({ page }) => {
    await loginPage.login("Adminb", "admin123");
    await page.keyboard.press("Enter");
    const errorDial = page.locator(".oxd-alert--error");
    await expect(errorDial).toBeVisible();
  });
  test("Người dùng nhập sai username, sai mật khẩu", async ({ page }) => {
    await loginPage.login("Adminb", "admin1233");
    await page.keyboard.press("Enter");
    const errorDial = page.locator(".oxd-alert--error");
    await expect(errorDial).toBeVisible();
  });
  test("Người dùng nhập đúng username, sai mật khẩu", async ({ page }) => {
    await loginPage.login("Adminb", "admin1233");
    // await page.keyboard.press('Enter');
    const errorDial = page.locator(".oxd-alert--error");
    await expect(errorDial).toBeVisible();
  });
});
