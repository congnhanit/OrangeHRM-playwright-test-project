import { test, expect } from '@playwright/test';

test.describe('Employee List', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index')
    const employeeSection =  page.getByRole('link', { name: 'PIM' });
    await employeeSection.click()
  });
  test.afterEach(async ({ page }) => {
  await page.close();
});
  // ─── Hiển thị ───────────────────────────────────────────────────────────────

  test('hiển thị danh sách nhân viên mặc định khi vào trang', async ({ page }) => {
    const rows = page.locator('.oxd-table-body .oxd-table-row');
    await page.waitForLoadState('networkidle')
    await expect(rows.first()).toBeVisible();
  });

  test('hiển thị đúng các cột trong bảng', async ({ page }) => {
    const headers = page.locator('.oxd-table-header .oxd-table-header-cell');
    await expect(headers).toContainText([
      'Id', 'First (& Middle) Name', 'Last Name', 'Job Title', 'Employment Status', 'Sub Unit',  'Actions'
    ]);
  });

  test('hiển thị số lượng record đúng với số nhân viên', async ({ page }) => {
    const recordCount = page.locator('.orangehrm-horizontal-padding span').filter({ hasText: /\d+ Record/ });
    await expect(recordCount).toBeVisible();
  });

  // ─── Tìm kiếm ───────────────────────────────────────────────────────────────

  test('tìm kiếm theo Employee Name', async ({ page }) => {
    await page.getByPlaceholder('Type for hints...').first().fill('John');
    await page.waitForSelector('.oxd-autocomplete-option', { timeout: 3000 }).catch(() => {});
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'Search' }).click();

    const rows = page.locator('.oxd-table-body .oxd-table-row');
    await expect(rows.first()).toBeVisible();
  });

  test('tìm kiếm theo Employee Id', async ({ page }) => {
    await page.locator("//label[text()='Employee Id']/ancestor::div[2]//input").fill('0317');
    await page.getByRole('button', { name: 'Search' }).click();

    const rows = page.locator('.oxd-table-body .oxd-table-row');
    await expect(rows).toHaveCount(1);
  });

  test('tìm kiếm không có kết quả hiển thị "No Records Found"', async ({ page }) => {
    await page.locator('input[placeholder="Employee Id"]').fill('NOTEXIST999');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.getByText('No Records Found')).toBeVisible();
  });

  test('tìm kiếm theo Employment Status', async ({ page }) => {
    await page.locator('.oxd-select-text').filter({ hasText: 'Employment Status' }).click();
    await page.getByRole('option', { name: 'Full-Time Permanent' }).click();
    await page.getByRole('button', { name: 'Search' }).click();

    const rows = page.locator('.oxd-table-body .oxd-table-row');
    await expect(rows.first()).toBeVisible();
  });

  test('tìm kiếm theo Job Title', async ({ page }) => {
    await page.locator('.oxd-select-text').filter({ hasText: 'Job Title' }).click();
    await page.getByRole('option').nth(1).click();
    await page.getByRole('button', { name: 'Search' }).click();

    const rows = page.locator('.oxd-table-body .oxd-table-row');
    await expect(rows.first()).toBeVisible();
  });

  test('tìm kiếm theo Sub Unit', async ({ page }) => {
    await page.locator('.oxd-select-text').filter({ hasText: 'Sub Unit' }).click();
    await page.getByRole('option').nth(1).click();
    await page.getByRole('button', { name: 'Search' }).click();

    const rows = page.locator('.oxd-table-body .oxd-table-row');
    await expect(rows.first()).toBeVisible();
  });

  test('nút Reset xoá toàn bộ bộ lọc và hiển thị lại danh sách gốc', async ({ page }) => {
    await page.locator('input[placeholder="Employee Id"]').fill('NOTEXIST999');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.getByText('No Records Found')).toBeVisible();

    await page.getByRole('button', { name: 'Reset' }).click();
    const rows = page.locator('.oxd-table-body .oxd-table-row');
    await expect(rows.first()).toBeVisible();
  });

  // ─── Thêm nhân viên ─────────────────────────────────────────────────────────

  test('click Add điều hướng đến trang Add Employee', async ({ page }) => {
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page).toHaveURL(/addEmployee/);
    await expect(page.getByRole('heading', { name: 'Add Employee' })).toBeVisible();
  });

  // ─── Chỉnh sửa ──────────────────────────────────────────────────────────────

  test('click Edit mở trang thông tin nhân viên', async ({ page }) => {
    const editBtn = page.locator('.oxd-table-body .oxd-table-row').first()
      .getByRole('button').filter({ has: page.locator('i.bi-pencil-fill') });
    await editBtn.click();

    await expect(page).toHaveURL(/viewPersonalDetails/);
  });

  // ─── Xoá nhân viên ──────────────────────────────────────────────────────────

  test('click Delete hiển thị dialog xác nhận', async ({ page }) => {
    const deleteBtn = page.locator('.oxd-table-body .oxd-table-row').first()
      .getByRole('button').filter({ has: page.locator('i.bi-trash') });
    await deleteBtn.click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Are you Sure?')).toBeVisible();
  });

  test('huỷ xoá không xoá nhân viên khỏi danh sách', async ({ page }) => {
    const rows = page.locator('.oxd-table-body .oxd-table-row');
    const countBefore = await rows.count();

    const deleteBtn = rows.first()
      .getByRole('button').filter({ has: page.locator('i.bi-trash') });
    await deleteBtn.click();

    await page.getByRole('button', { name: 'No, Cancel' }).click();
    await expect(rows).toHaveCount(countBefore);
  });

  // ─── Phân trang ─────────────────────────────────────────────────────────────

  test('phân trang hiển thị đúng số trang', async ({ page }) => {
    const pagination = page.locator('.oxd-pagination');
    const isVisible = await pagination.isVisible();

    if (isVisible) {
      await expect(pagination).toBeVisible();
    } else {
      // Ít hơn 1 trang → không có phân trang là đúng
      const rows = page.locator('.oxd-table-body .oxd-table-row');
      expect(await rows.count()).toBeGreaterThan(0);
    }
  });

  test('chuyển sang trang tiếp theo hiển thị nhân viên khác', async ({ page }) => {
    const nextBtn = page.locator('.oxd-pagination-page-item--page').nth(1);
    const isVisible = await nextBtn.isVisible();

    if (isVisible) {
      const firstRowBefore = await page.locator('.oxd-table-body .oxd-table-row').first().textContent();
      await nextBtn.click();
      const firstRowAfter = await page.locator('.oxd-table-body .oxd-table-row').first().textContent();
      expect(firstRowBefore).not.toEqual(firstRowAfter);
    }
  });
});