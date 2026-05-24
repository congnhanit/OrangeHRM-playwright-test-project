import { test, expect, Page } from "@playwright/test";

// ==================== CONFIG ====================
const BASE_URL = "https://opensource-demo.orangehrmlive.com";
const ADMIN_USER = { username: "Admin", password: "admin123" };

// ==================== HELPERS ====================
async function login(page: Page) {
  await page.goto(`${BASE_URL}/web/index.php/auth/login`);
  await page.getByPlaceholder("Username").fill(ADMIN_USER.username);
  await page.getByPlaceholder("Password").fill(ADMIN_USER.password);
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/dashboard/);
}

async function navigateToLeave(page: Page) {
  await page.getByRole("link", { name: "Leave" }).click();
  await expect(page).toHaveURL(/viewLeaveList/);
}

async function navigateToLeaveConfig(page: Page) {
  await page.getByRole("link", { name: "Leave" }).click();
  await page.getByRole("menuitem", { name: "Configure" }).click();
}

function uniqueName(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
}

// ==================== TEST SUITE ====================

test.describe("OrangeHRM - Leave Module", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  // ============================================
  // 1. LEAVE LIST (My Leave / All Leaves)
  // ============================================
  test.describe("1. Leave List", () => {
    test("TC-LVE-001: Hiển thị danh sách Leave List", async ({ page }) => {
      await navigateToLeave(page);
      await expect(
        page.getByRole("heading", { name: "Leave List" })
      ).toBeVisible();
      await expect(page.getByRole("table")).toBeVisible();
      await expect(page.getByText("Employee Name")).toBeVisible();
      await expect(page.getByText("Leave Type")).toBeVisible();
      await expect(page.getByText("From Date")).toBeVisible();
      await expect(page.getByText("To Date")).toBeVisible();
      await expect(page.getByText("Status")).toBeVisible();
    });

    test("TC-LVE-002: Tìm kiếm leave theo Leave Type", async ({ page }) => {
      await navigateToLeave(page);
      await page.locator(".oxd-select-text").first().click();
      await page.getByRole("option").nth(1).click();
      await page.getByRole("button", { name: "Search" }).click();
      await expect(page.getByRole("table")).toBeVisible();
    });

    test("TC-LVE-003: Tìm kiếm leave theo Leave Status", async ({ page }) => {
      await navigateToLeave(page);
      // Chọn status Pending Approval
      const statusDropdown = page.locator(".oxd-select-text").nth(1);
      await statusDropdown.click();
      await page.getByRole("option", { name: "Pending Approval" }).click();
      await page.getByRole("button", { name: "Search" }).click();
      await expect(page.getByRole("table")).toBeVisible();
    });

    test("TC-LVE-004: Tìm kiếm leave theo khoảng ngày", async ({ page }) => {
      await navigateToLeave(page);
      await page.locator("input.oxd-input").nth(0).fill("2025-01-01");
      await page.locator("input.oxd-input").nth(1).fill("2025-12-31");
      await page.getByRole("button", { name: "Search" }).click();
      await expect(page.getByRole("table")).toBeVisible();
    });

    test("TC-LVE-005: Tìm kiếm không có kết quả", async ({ page }) => {
      await navigateToLeave(page);
      await page.locator("input.oxd-input").nth(0).fill("2000-01-01");
      await page.locator("input.oxd-input").nth(1).fill("2000-01-02");
      await page.getByRole("button", { name: "Search" }).click();
      await expect(page.getByText("No Records Found")).toBeVisible();
    });

    test("TC-LVE-006: Reset form tìm kiếm Leave List", async ({ page }) => {
      await navigateToLeave(page);
      await page.locator("input.oxd-input").nth(0).fill("2025-01-01");
      await page.getByRole("button", { name: "Reset" }).click();
      const fromDateInput = page.locator("input.oxd-input").nth(0);
      await expect(fromDateInput).toHaveValue("");
    });

    test("TC-LVE-007: Phân trang trong danh sách Leave", async ({ page }) => {
      await navigateToLeave(page);
      await page.getByRole("button", { name: "Search" }).click();
      await expect(page.locator(".oxd-pagination")).toBeVisible();
    });

    test("TC-LVE-008: Tìm kiếm leave theo Employee Name", async ({ page }) => {
      await navigateToLeave(page);
      const empNameInput = page.locator("input.oxd-input[placeholder]").first();
      await empNameInput.fill("test");
      await page.getByRole("option").first().click();
      await page.getByRole("button", { name: "Search" }).click();
      await expect(page.getByRole("table")).toBeVisible();
    });
  });

  // ============================================
  // 2. APPLY LEAVE
  // ============================================
  test.describe("2. Apply Leave", () => {
    test("TC-LVE-009: Hiển thị form Apply Leave", async ({ page }) => {
      await page.getByRole("link", { name: "Leave" }).click();
      await page.getByRole("menuitem", { name: "Apply" }).click();
      await expect(
        page.getByRole("heading", { name: "Apply Leave" })
      ).toBeVisible();
      await expect(page.getByText("Leave Type")).toBeVisible();
      await expect(page.getByText("From Date")).toBeVisible();
      await expect(page.getByText("To Date")).toBeVisible();
    });

    test("TC-LVE-010: Apply Leave thất bại - bỏ trống trường bắt buộc", async ({
      page,
    }) => {
      await page.getByRole("link", { name: "Leave" }).click();
      await page.getByRole("menuitem", { name: "Apply" }).click();
      await page.getByRole("button", { name: "Apply" }).click();
      const requiredMessages = await page.getByText("Required").all();
      expect(requiredMessages.length).toBeGreaterThanOrEqual(1);
    });

    test("TC-LVE-011: Apply Leave thất bại - ngày kết thúc trước ngày bắt đầu", async ({
      page,
    }) => {
      await page.getByRole("link", { name: "Leave" }).click();
      await page.getByRole("menuitem", { name: "Apply" }).click();

      // Chọn leave type
      await page.locator(".oxd-select-text").first().click();
      await page.getByRole("option").nth(1).click();

      // Nhập ngày sai chiều
      await page.locator("input.oxd-input").nth(0).fill("2025-12-31");
      await page.locator("input.oxd-input").nth(1).fill("2025-01-01");
      await page.getByRole("button", { name: "Apply" }).click();

      await expect(
        page.getByText(/To date should be after from date|invalid/i)
      ).toBeVisible();
    });

    test("TC-LVE-012: Hiển thị số ngày leave khi chọn ngày", async ({
      page,
    }) => {
      await page.getByRole("link", { name: "Leave" }).click();
      await page.getByRole("menuitem", { name: "Apply" }).click();

      await page.locator(".oxd-select-text").first().click();
      await page.getByRole("option").nth(1).click();

      await page.locator("input.oxd-input").nth(0).fill("2025-08-01");
      await page.locator("input.oxd-input").nth(1).fill("2025-08-03");
      await page.keyboard.press("Tab");

      // Kiểm tra hiển thị số ngày
      await expect(page.getByText(/\d+\.?\d* Day/i)).toBeVisible();
    });

    test("TC-LVE-013: Nhập comment khi apply leave", async ({ page }) => {
      await page.getByRole("link", { name: "Leave" }).click();
      await page.getByRole("menuitem", { name: "Apply" }).click();

      const commentBox = page.locator("textarea.oxd-textarea");
      await expect(commentBox).toBeVisible();
      await commentBox.fill("Test comment for leave application");
      await expect(commentBox).toHaveValue(
        "Test comment for leave application"
      );
    });
  });

  // ============================================
  // 3. MY LEAVE
  // ============================================
  test.describe("3. My Leave", () => {
    test("TC-LVE-014: Hiển thị My Leave list", async ({ page }) => {
      await page.getByRole("link", { name: "Leave" }).click();
      await page.getByRole("menuitem", { name: "My Leave" }).click();
      await expect(
        page.getByRole("heading", { name: "My Leave List" })
      ).toBeVisible();
      await expect(page.getByRole("table")).toBeVisible();
    });

    test("TC-LVE-015: Tìm kiếm My Leave theo Leave Type", async ({ page }) => {
      await page.getByRole("link", { name: "Leave" }).click();
      await page.getByRole("menuitem", { name: "My Leave" }).click();
      await page.locator(".oxd-select-text").first().click();
      await page.getByRole("option").nth(1).click();
      await page.getByRole("button", { name: "Search" }).click();
      await expect(page.getByRole("table")).toBeVisible();
    });

    test("TC-LVE-016: Tìm kiếm My Leave theo Status", async ({ page }) => {
      await page.getByRole("link", { name: "Leave" }).click();
      await page.getByRole("menuitem", { name: "My Leave" }).click();
      await page.locator(".oxd-select-text").nth(1).click();
      await page.getByRole("option", { name: "Cancelled" }).click();
      await page.getByRole("button", { name: "Search" }).click();
      await expect(page.getByRole("table")).toBeVisible();
    });

    test("TC-LVE-017: Reset form My Leave", async ({ page }) => {
      await page.getByRole("link", { name: "Leave" }).click();
      await page.getByRole("menuitem", { name: "My Leave" }).click();
      await page.locator("input.oxd-input").nth(0).fill("2025-01-01");
      await page.getByRole("button", { name: "Reset" }).click();
      await expect(page.locator("input.oxd-input").nth(0)).toHaveValue("");
    });
  });

  // ============================================
  // 4. ENTITLEMENTS
  // ============================================
  test.describe("4. Entitlements", () => {
    test("TC-LVE-018: Truy cập Add Entitlements", async ({ page }) => {
      await page.getByRole("link", { name: "Leave" }).click();
      await page.getByRole("menuitem", { name: "Entitlements" }).click();
      await page.getByRole("menuitem", { name: "Add Entitlements" }).click();
      await expect(
        page.getByRole("heading", { name: "Add Leave Entitlement" })
      ).toBeVisible();
    });

    test("TC-LVE-019: Thêm Entitlement thất bại - bỏ trống bắt buộc", async ({
      page,
    }) => {
      await page.getByRole("link", { name: "Leave" }).click();
      await page.getByRole("menuitem", { name: "Entitlements" }).click();
      await page.getByRole("menuitem", { name: "Add Entitlements" }).click();
      await page.getByRole("button", { name: "Save" }).click();
      const requiredMessages = await page.getByText("Required").all();
      expect(requiredMessages.length).toBeGreaterThanOrEqual(1);
    });

    test("TC-LVE-020: Truy cập Employee Entitlements", async ({ page }) => {
      await page.getByRole("link", { name: "Leave" }).click();
      await page.getByRole("menuitem", { name: "Entitlements" }).click();
      await page
        .getByRole("menuitem", { name: "Employee Entitlements" })
        .click();
      await expect(
        page.getByRole("heading", { name: "Leave Entitlements" })
      ).toBeVisible();
    });

    test("TC-LVE-021: Tìm kiếm Employee Entitlements theo Leave Type", async ({
      page,
    }) => {
      await page.getByRole("link", { name: "Leave" }).click();
      await page.getByRole("menuitem", { name: "Entitlements" }).click();
      await page
        .getByRole("menuitem", { name: "Employee Entitlements" })
        .click();
      await page.locator(".oxd-select-text").first().click();
      await page.getByRole("option").nth(1).click();
      await page.getByRole("button", { name: "Search" }).click();
      await expect(page.getByRole("table")).toBeVisible();
    });

    test("TC-LVE-022: Truy cập My Entitlements", async ({ page }) => {
      await page.getByRole("link", { name: "Leave" }).click();
      await page.getByRole("menuitem", { name: "Entitlements" }).click();
      await page.getByRole("menuitem", { name: "My Entitlements" }).click();
      await expect(
        page.getByRole("heading", { name: "My Leave Entitlements" })
      ).toBeVisible();
    });
  });

  // ============================================
  // 5. REPORTS
  // ============================================
  test.describe("5. Reports", () => {
    test("TC-LVE-023: Truy cập Leave Report", async ({ page }) => {
      await page.getByRole("link", { name: "Leave" }).click();
      await page.getByRole("menuitem", { name: "Reports" }).click();
      await page.getByRole("menuitem", { name: "Leave Report" }).click();
      await expect(
        page.getByRole("heading", { name: "Leave Report" })
      ).toBeVisible();
    });

    test("TC-LVE-024: Tìm kiếm Leave Report theo Leave Type", async ({
      page,
    }) => {
      await page.getByRole("link", { name: "Leave" }).click();
      await page.getByRole("menuitem", { name: "Reports" }).click();
      await page.getByRole("menuitem", { name: "Leave Report" }).click();
      await page.locator(".oxd-select-text").first().click();
      await page.getByRole("option").nth(1).click();
      await page.getByRole("button", { name: "Generate" }).click();
      await expect(page.getByRole("table")).toBeVisible();
    });

    test("TC-LVE-025: Truy cập My Leave Report", async ({ page }) => {
      await page.getByRole("link", { name: "Leave" }).click();
      await page.getByRole("menuitem", { name: "Reports" }).click();
      await page.getByRole("menuitem", { name: "My Leave Report" }).click();
      await expect(
        page.getByRole("heading", { name: "My Leave Report" })
      ).toBeVisible();
    });

    test("TC-LVE-026: Generate My Leave Report theo Leave Type", async ({
      page,
    }) => {
      await page.getByRole("link", { name: "Leave" }).click();
      await page.getByRole("menuitem", { name: "Reports" }).click();
      await page.getByRole("menuitem", { name: "My Leave Report" }).click();
      await page.locator(".oxd-select-text").first().click();
      await page.getByRole("option").nth(1).click();
      await page.getByRole("button", { name: "Generate" }).click();
      await expect(page.getByRole("table")).toBeVisible();
    });
  });

  // ============================================
  // 6. CONFIGURE — LEAVE TYPES
  // ============================================
  test.describe("6. Configure — Leave Types", () => {
    test("TC-LVE-027: Hiển thị danh sách Leave Types", async ({ page }) => {
      await navigateToLeaveConfig(page);
      await page.getByRole("menuitem", { name: "Leave Types" }).click();
      await expect(
        page.getByRole("heading", { name: "Leave Types" })
      ).toBeVisible();
      await expect(page.getByRole("table")).toBeVisible();
      await expect(page.getByText("Name")).toBeVisible();
      await expect(page.getByText("Entitlement")).toBeVisible();
    });

    test("TC-LVE-028: Thêm Leave Type mới thành công", async ({ page }) => {
      await navigateToLeaveConfig(page);
      await page.getByRole("menuitem", { name: "Leave Types" }).click();
      await page.getByRole("button", { name: "Add" }).click();
      await expect(
        page.getByRole("heading", { name: "Add Leave Type" })
      ).toBeVisible();

      const leaveName = uniqueName("LeaveType");
      await page.locator("input.oxd-input").first().fill(leaveName);

      // Entitlement type
      await page.locator(".oxd-select-text").first().click();
      await page.getByRole("option").nth(1).click();

      await page.getByRole("button", { name: "Save" }).click();
      await expect(page.getByText("Successfully Saved")).toBeVisible();

      // Teardown: xóa leave type vừa tạo
      await page.locator("input.oxd-input").first().fill(leaveName);
      await page.getByRole("button", { name: "Search" }).click();
      const row = page.locator(".oxd-table-body .oxd-table-row").first();
      await row.locator('[title="Delete"]').click();
      await page.getByRole("button", { name: "Yes, Delete" }).click();
    });

    test("TC-LVE-029: Thêm Leave Type thất bại - tên trống", async ({
      page,
    }) => {
      await navigateToLeaveConfig(page);
      await page.getByRole("menuitem", { name: "Leave Types" }).click();
      await page.getByRole("button", { name: "Add" }).click();
      await page.getByRole("button", { name: "Save" }).click();
      await expect(page.getByText("Required")).toBeVisible();
    });

    test("TC-LVE-030: Tìm kiếm Leave Type theo tên", async ({ page }) => {
      await navigateToLeaveConfig(page);
      await page.getByRole("menuitem", { name: "Leave Types" }).click();
      await page.locator("input.oxd-input").first().fill("Annual");
      await page.getByRole("button", { name: "Search" }).click();
      const rows = await page.locator(".oxd-table-body .oxd-table-row").all();
      expect(rows.length).toBeGreaterThan(0);
    });

    test("TC-LVE-031: Tìm kiếm Leave Type không tìm thấy", async ({
      page,
    }) => {
      await navigateToLeaveConfig(page);
      await page.getByRole("menuitem", { name: "Leave Types" }).click();
      await page.locator("input.oxd-input").first().fill("nonexistent_xyz999");
      await page.getByRole("button", { name: "Search" }).click();
      await expect(page.getByText("No Records Found")).toBeVisible();
    });

    test("TC-LVE-032: Chỉnh sửa Leave Type", async ({ page }) => {
      await navigateToLeaveConfig(page);
      await page.getByRole("menuitem", { name: "Leave Types" }).click();
      await page.getByRole("button", { name: "Search" }).click();

      await page
        .locator(".oxd-table-body .oxd-table-row")
        .first()
        .locator('[title="Edit"]')
        .click();

      await expect(
        page.getByRole("heading", { name: "Edit Leave Type" })
      ).toBeVisible();
    });

    test("TC-LVE-033: Xóa Leave Type", async ({ page }) => {
      // Tạo leave type để xóa
      await navigateToLeaveConfig(page);
      await page.getByRole("menuitem", { name: "Leave Types" }).click();
      await page.getByRole("button", { name: "Add" }).click();

      const leaveName = uniqueName("DeleteLeave");
      await page.locator("input.oxd-input").first().fill(leaveName);
      await page.locator(".oxd-select-text").first().click();
      await page.getByRole("option").nth(1).click();
      await page.getByRole("button", { name: "Save" }).click();
      await expect(page.getByText("Successfully Saved")).toBeVisible();

      // Tìm và xóa
      await page.locator("input.oxd-input").first().fill(leaveName);
      await page.getByRole("button", { name: "Search" }).click();
      await page
        .locator(".oxd-table-body .oxd-table-row")
        .first()
        .locator('[title="Delete"]')
        .click();
      await page.getByRole("button", { name: "Yes, Delete" }).click();
      await expect(page.getByText("Successfully Deleted")).toBeVisible();
    });

    test("TC-LVE-034: Reset form tìm kiếm Leave Types", async ({ page }) => {
      await navigateToLeaveConfig(page);
      await page.getByRole("menuitem", { name: "Leave Types" }).click();
      await page.locator("input.oxd-input").first().fill("Annual");
      await page.getByRole("button", { name: "Reset" }).click();
      await expect(page.locator("input.oxd-input").first()).toHaveValue("");
    });

    test("TC-LVE-035: Bulk delete Leave Types", async ({ page }) => {
      await navigateToLeaveConfig(page);
      await page.getByRole("menuitem", { name: "Leave Types" }).click();
      await page.getByRole("button", { name: "Search" }).click();

      const headerCheckbox = page
        .locator(".oxd-table-header")
        .locator('input[type="checkbox"]');
      if ((await headerCheckbox.count()) > 0) {
        await headerCheckbox.click();
        await expect(
          page.getByRole("button", { name: "Delete Selected" })
        ).toBeVisible();
      }
    });
  });

  // ============================================
  // 7. CONFIGURE — LEAVE PERIODS & HOLIDAYS
  // ============================================
  test.describe("7. Configure — Leave Periods & Holidays", () => {
    test("TC-LVE-036: Truy cập Leave Period settings", async ({ page }) => {
      await navigateToLeaveConfig(page);
      await page.getByRole("menuitem", { name: "Leave Period" }).click();
      await expect(
        page.getByRole("heading", { name: "Leave Period" })
      ).toBeVisible();
    });

    test("TC-LVE-037: Hiển thị danh sách Holidays", async ({ page }) => {
      await navigateToLeaveConfig(page);
      await page.getByRole("menuitem", { name: "Holidays" }).click();
      await expect(
        page.getByRole("heading", { name: "Holidays" })
      ).toBeVisible();
      await expect(page.getByRole("table")).toBeVisible();
    });

    test("TC-LVE-038: Thêm Holiday mới thành công", async ({ page }) => {
      await navigateToLeaveConfig(page);
      await page.getByRole("menuitem", { name: "Holidays" }).click();
      await page.getByRole("button", { name: "Add" }).click();
      await expect(
        page.getByRole("heading", { name: "Add Holiday" })
      ).toBeVisible();

      const holidayName = uniqueName("Holiday");
      await page.locator("input.oxd-input").first().fill(holidayName);
      await page.locator("input.oxd-input").nth(1).fill("2025-12-25");
      await page.getByRole("button", { name: "Save" }).click();
      await expect(page.getByText("Successfully Saved")).toBeVisible();

      // Teardown
      await page.locator("input.oxd-input").first().fill(holidayName);
      await page.getByRole("button", { name: "Search" }).click();
      await page
        .locator(".oxd-table-body .oxd-table-row")
        .first()
        .locator('[title="Delete"]')
        .click();
      await page.getByRole("button", { name: "Yes, Delete" }).click();
    });

    test("TC-LVE-039: Thêm Holiday thất bại - tên trống", async ({ page }) => {
      await navigateToLeaveConfig(page);
      await page.getByRole("menuitem", { name: "Holidays" }).click();
      await page.getByRole("button", { name: "Add" }).click();
      await page.getByRole("button", { name: "Save" }).click();
      const requiredMessages = await page.getByText("Required").all();
      expect(requiredMessages.length).toBeGreaterThanOrEqual(1);
    });

    test("TC-LVE-040: Tìm kiếm Holiday theo tên", async ({ page }) => {
      await navigateToLeaveConfig(page);
      await page.getByRole("menuitem", { name: "Holidays" }).click();
      await page.locator("input.oxd-input").first().fill("Christmas");
      await page.getByRole("button", { name: "Search" }).click();
      await expect(page.getByRole("table")).toBeVisible();
    });

    test("TC-LVE-041: Chỉnh sửa Holiday", async ({ page }) => {
      await navigateToLeaveConfig(page);
      await page.getByRole("menuitem", { name: "Holidays" }).click();
      await page.getByRole("button", { name: "Search" }).click();

      const rows = page.locator(".oxd-table-body .oxd-table-row");
      if ((await rows.count()) > 0) {
        await rows.first().locator('[title="Edit"]').click();
        await expect(
          page.getByRole("heading", { name: "Edit Holiday" })
        ).toBeVisible();
      }
    });

    test("TC-LVE-042: Xóa Holiday", async ({ page }) => {
      // Tạo holiday trước
      await navigateToLeaveConfig(page);
      await page.getByRole("menuitem", { name: "Holidays" }).click();
      await page.getByRole("button", { name: "Add" }).click();

      const holidayName = uniqueName("DelHoliday");
      await page.locator("input.oxd-input").first().fill(holidayName);
      await page.locator("input.oxd-input").nth(1).fill("2025-11-11");
      await page.getByRole("button", { name: "Save" }).click();
      await expect(page.getByText("Successfully Saved")).toBeVisible();

      // Xóa
      await page.locator("input.oxd-input").first().fill(holidayName);
      await page.getByRole("button", { name: "Search" }).click();
      await page
        .locator(".oxd-table-body .oxd-table-row")
        .first()
        .locator('[title="Delete"]')
        .click();
      await page.getByRole("button", { name: "Yes, Delete" }).click();
      await expect(page.getByText("Successfully Deleted")).toBeVisible();
    });

    test("TC-LVE-043: Truy cập Work Week configuration", async ({ page }) => {
      await navigateToLeaveConfig(page);
      await page.getByRole("menuitem", { name: "Work Week" }).click();
      await expect(
        page.getByRole("heading", { name: "Work Week" })
      ).toBeVisible();
    });
  });
});