import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/loginPage";

test.describe("Kiểm tra đăng nhập", () => {

  test.describe("Kiểm thử chức năng add employee", () => {
    test("add employee", async ({ page }) => {
      await page.goto(
        "https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index",
      );
      const employeeSection = page.getByRole("link", { name: "PIM" });
      await employeeSection.click();
      await expect(page).toHaveURL(/viewEmployeeList/);
      await page.getByRole("link", { name: "PIM" }).click();
      await page
        .getByRole("listitem")
        .filter({ hasText: "Add Employee" })
        .click();
      await page.getByRole("textbox", { name: "First Name" }).click();
      // await page.getByRole('textbox', { name: 'First Name' }).fill('Mike');
      // await page.getByRole('textbox', { name: 'Last Name' }).click();
      // await page.getByRole('textbox', { name: 'Last Name' }).fill('Tom');
      // await page.locator('.oxd-switch-input').click();
      // await page.getByRole('textbox').nth(5).click();
      // await page.getByRole('textbox').nth(5).fill('miketom');
      // await page.locator('input[type="password"]').first().click();
      // await page.locator('input[type="password"]').first().fill('Miketom123');
      // await page.locator('input[type="password"]').first().press('ControlOrMeta+a');
      // await page.locator('input[type="password"]').first().press('ControlOrMeta+c');
      // await page.locator('input[type="password"]').nth(1).click();
      // await page.locator('input[type="password"]').nth(1).fill('Miketom123');
      // await page.getByRole('button', { name: 'Save' }).click();
      // await page.getByRole('textbox').nth(4).click();
      // await page.getByRole('textbox').nth(4).fill('0432');
      // await page.getByRole('button', { name: 'Save' }).click();

      // await expect("").toBeVisible()
    });
    // test('watch', async ({page}) => {
    //   await page.goto('viewEmployeeList')
    // })
  });
});
