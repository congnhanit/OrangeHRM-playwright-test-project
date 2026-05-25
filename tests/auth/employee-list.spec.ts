import { test, expect, Locator } from "@playwright/test";

let employeeId: Locator;
let table: Locator;

function createCounter() {
  let count = 0;
  return function () {
    count++;
    return `TC-EMPL-${String(count).padStart(2, "0")}: `;
  };
}

// 2. Khởi tạo một bộ đếm cụ thể
const nextTC = createCounter();

test.describe("Orange HRM - Employee List", () => {
  let TCID = "TC-EMPL-";
  test.setTimeout(60000);
  test.beforeEach(async ({ page }) => {
    await page.goto(
      "https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index",
    );
    const employeeSection = page.getByRole("link", { name: "PIM" });
    await employeeSection.click();
    await page.waitForLoadState('networkidle')
    employeeId = page.locator(
      "//label[text()='Employee Id']/ancestor::div[2]//input",
    );
    table = page.locator(".oxd-table-body .oxd-table-row");
  });
  // ─── Hiển thị ───────────────────────────────────────────────────────────────

  test(
    nextTC() + "Hiển thị danh sách nhân viên mặc định khi vào trang",
    async ({ page }) => {
      const rows = page.locator(".oxd-table-body .oxd-table-row");
      await page.waitForLoadState("networkidle");
      await rows.first().scrollIntoViewIfNeeded();
      await expect(rows.first()).toBeVisible();
    },
  );

  test(nextTC() + "Hiển thị đúng các cột trong bảng", async ({ page }) => {
    const headers = page.locator(".oxd-table-header .oxd-table-header-cell");
    await 
    await expect(headers).toContainText([
      "Id",
      "First (& Middle) Name",
      "Last Name",
      "Job Title",
      "Employment Status",
      "Sub Unit",
      "Supervisor",
      "Actions",
    ]);
  });

  // ─── Tìm kiếm ───────────────────────────────────────────────────────────────

  test(nextTC() + "Tìm kiếm theo Employee Name", async ({ page }) => {
    await page.getByPlaceholder("Type for hints...").first().fill("John");
    await page
      .waitForSelector(".oxd-autocomplete-option", { timeout: 3000 })
      .catch(() => {});
    await page.keyboard.press("Enter");
    await page.getByRole("button", { name: "Search" }).click();

    const rows = page.locator(".oxd-table-body .oxd-table-row");
    await expect(rows.first()).toBeVisible();
  });

  test(nextTC() + "Tìm kiếm theo Employee ID", async ({ page }) => {
    await page
      .locator("//label[text()='Employee Id']/ancestor::div[2]//input")
      .fill("0317");
    await page.getByRole("button", { name: "Search" }).click();

    const rows = page.locator(".oxd-table-body .oxd-table-row");
    await expect(rows).toHaveCount(1);
  });

  test(nextTC() + "Tìm kiếm không có kết quả hiển thị", async ({ page }) => {
    const rows = page.locator(".oxd-table-body .oxd-table-row");
    await page.waitForLoadState("networkidle");
    await employeeId.fill("NOTEXIST999");
    await page.getByRole("button", { name: "Search" }).click();
    await expect(rows).toBeHidden();
  });

  test(nextTC() + "Tìm kiếm theo Employment Status", async ({ page }) => {
    await page
      .locator(
        "//label[text() = 'Employment Status']/parent::div/following-sibling::div",
      )
      .click();
    await page.getByRole("option", { name: "Full-Time Permanent" }).click();
    await page.getByRole("button", { name: "Search" }).click();

    const rows = page.locator(".oxd-table-body .oxd-table-row");
    await expect(rows.first()).toBeVisible();
  });

  test.skip(nextTC() + "Tìm kiếm theo Job Title", async ({ page }) => {
    await page
      .locator(
        '//label[text() = "Job Title"]/parent::div/following-sibling::div',
      )
      .click();
    await page.getByRole("option").nth(1).click();
    await page.getByRole("button", { name: "Search" }).click();

    const rows = page.locator(".oxd-table-body .oxd-table-row");
    await expect(rows.first()).toBeVisible();
  });

  test.skip(nextTC() + "Tìm kiếm theo Sub Unit", async ({ page }) => {
    await page
      .locator(".oxd-select-text")
      .filter({ hasText: "Sub Unit" })
      .click();
    await page.getByRole("option").nth(1).click();
    await page.getByRole("button", { name: "Search" }).click();

    const rows = page.locator(".oxd-table-body .oxd-table-row");
    await expect(rows.first()).toBeVisible();
  });

  test(
    nextTC() + "Nút Reset xoá toàn bộ bộ lọc và hiển thị lại danh sách gốc",
    async ({ page }) => {
      await employeeId.fill("NOTEXIST999");
      await page.getByRole("button", { name: "Search" }).click();
      await expect(table).toBeHidden();

      await page.getByRole("button", { name: "Reset" }).click();
      await expect(employeeId).toBeEmpty();
      const rows = page.locator(".oxd-table-body .oxd-table-row");
      await expect(rows.first()).toBeVisible();
    },
  );

  // ─── Phân trang ─────────────────────────────────────────────────────────────

  test(
    nextTC() + "Phân trang hiển thị khi nhiều hơn 1 trang",
    async ({ page }) => {
      const pagination = page.locator('ul[class="oxd-pagination__ul"]');
      await page.waitForLoadState("networkidle");
      await pagination.scrollIntoViewIfNeeded();
      await expect(pagination).toBeVisible();
    },
  );

  test(
    nextTC() + "Phân trang không hiển thị khi ít hơn 1 trang",
    async ({ page }) => {
      const pagination = page.locator('ul[class="oxd-pagination__ul"]');
      await page.getByPlaceholder("Type for hints...").first().fill("John");
      await page.getByRole("button", { name: "Search" }).click();
      await page.waitForLoadState("networkidle");
      await expect(pagination).toBeHidden();
    },
  );

  test(
    nextTC() + "Chuyển sang trang tiếp theo hiển thị nhân viên khác",
    async ({ page }) => {
      const nextBtn = page.locator(".oxd-pagination-page-item--page").nth(1);
      const isVisible = await nextBtn.isVisible();

      if (isVisible) {
        const firstRowBefore = await page
          .locator(".oxd-table-body .oxd-table-row")
          .first()
          .textContent();
        await nextBtn.click();
        const firstRowAfter = await page
          .locator(".oxd-table-body .oxd-table-row")
          .first()
          .textContent();
        expect(firstRowBefore).not.toEqual(firstRowAfter);
      }
    },
  );
});
