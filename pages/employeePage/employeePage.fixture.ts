import { test as base, expect, Page } from "@playwright/test";
import { generateEmployeeData, EmployeeData } from "../../data/employeeTestData";

// ==================== TYPES ====================

export interface CreatedEmployee {
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  employeeId: string;
}

export interface EmployeeFixtures {
  /** Tạo 1 employee cơ bản, tự xóa sau test */
  createdEmployee: CreatedEmployee;

  /** Tạo employee có upload avatar, tự xóa sau test */
  createdEmployeeWithPhoto: CreatedEmployee;

  /** Tạo employee có thêm thông tin cá nhân đầy đủ, tự xóa sau test */
  createdEmployeeWithDetails: CreatedEmployee;

  /** Tạo employee nhưng KHÔNG tự xóa — dùng cho test xóa employee */
  createdEmployeeNoCleanup: CreatedEmployee;

  /** Helper: navigate đến trang add employee */
  goToAddEmployee: () => Promise<void>;

  /** Helper: tìm employee trong danh sách theo tên */
  searchEmployee: (name: string) => Promise<void>;
}

// ==================== HELPERS ====================

/**
 * Điền form Add Employee và submit
 */
async function fillAddEmployeeForm(
  page: Page,
  data: EmployeeData
): Promise<void> {
  await page.goto(
    "https://opensource-demo.orangehrmlive.com/web/index.php/pim/addEmployee"
  );
  await expect(
    page.getByRole("heading", { name: "Add Employee" })
  ).toBeVisible();

  // Họ tên
  await page
    .locator("input.oxd-input")
    .nth(1)
    .fill(data.firstName);
  await page
    .locator("input.oxd-input")
    .nth(2)
    .fill(data.middleName);
  await page
    .locator("input.oxd-input")
    .nth(3)
    .fill(data.lastName);

  // Employee ID (tự sinh nhưng override để unique)
  const empIdInput = page.locator("input.oxd-input").nth(4);
  await empIdInput.clear();
  await empIdInput.fill(data.employeeId);

  await page.getByRole("button", { name: "Save" }).click();
  await expect(page).toHaveURL(/viewPersonalDetails/);
}

/**
 * Xóa employee khỏi hệ thống theo tên
 */
async function deleteEmployee(page: Page, fullName: string): Promise<void> {
  try {
    await page.goto(
      "https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewEmployeeList"
    );

    // Tìm theo tên
    const nameInput = page
      .locator("input.oxd-input[placeholder]")
      .first();
    await nameInput.fill(fullName.split(" ")[0]); // Tìm theo firstName
    await page.getByRole("button", { name: "Search" }).click();
    await page.waitForLoadState("domcontentloaded");

    const rows = page.locator(".oxd-table-body .oxd-table-row");
    const rowCount = await rows.count();

    for (let i = 0; i < rowCount; i++) {
      const rowText = await rows.nth(i).textContent();
      if (rowText?.includes(fullName.split("Last_")[0].trim()) ?? false) {
        await rows.nth(i).locator('[title="Delete"]').click();
        await page.getByRole("button", { name: "Yes, Delete" }).click();
        await page.waitForLoadState("domcontentloaded");
        break;
      }
    }
  } catch {
    // Teardown không được throw lỗi để che lỗi test thật
    console.warn(`[fixture] Không thể xóa employee: ${fullName}`);
  }
}

// ==================== FIXTURE ====================

export const test = base.extend<EmployeeFixtures>({
  // --------------------------------------------------
  // FIXTURE: createdEmployee
  // Tạo employee cơ bản với firstName, middleName, lastName, employeeId
  // → Tự xóa sau khi test kết thúc (pass hay fail)
  // --------------------------------------------------
  createdEmployee: async ({ page }, use) => {
    const data = generateEmployeeData("Auto");

    // SETUP
    await fillAddEmployeeForm(page, data);

    const employee: CreatedEmployee = {
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      fullName: `${data.firstName} ${data.lastName}`,
      employeeId: data.employeeId,
    };

    // Trả data cho test
    await use(employee);

    // TEARDOWN — luôn chạy dù test pass hay fail
    await deleteEmployee(page, employee.fullName);
  },

  // --------------------------------------------------
  // FIXTURE: createdEmployeeWithPhoto
  // Tạo employee + upload ảnh đại diện placeholder
  // → Tự xóa sau test
  // --------------------------------------------------
  createdEmployeeWithPhoto: async ({ page }, use) => {
    const data = generateEmployeeData("Photo");

    await fillAddEmployeeForm(page, data);

    // Upload ảnh placeholder (1x1 px PNG base64)
    const placeholderPng = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64"
    );

    // Tạo file input trigger
    const fileInput = page.locator('input[type="file"]');
    if ((await fileInput.count()) > 0) {
      await fileInput.setInputFiles({
        name: "avatar.png",
        mimeType: "image/png",
        buffer: placeholderPng,
      });
      // Đợi preview xuất hiện nếu có
      await page.waitForTimeout(500);
    }

    const employee: CreatedEmployee = {
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      fullName: `${data.firstName} ${data.lastName}`,
      employeeId: data.employeeId,
    };

    await use(employee);

    await deleteEmployee(page, employee.fullName);
  },

  // --------------------------------------------------
  // FIXTURE: createdEmployeeWithDetails
  // Tạo employee + điền thêm thông tin personal details
  // (Gender, Marital Status, Date of Birth, Nationality)
  // → Tự xóa sau test
  // --------------------------------------------------
  createdEmployeeWithDetails: async ({ page }, use) => {
    const data = generateEmployeeData("Detail");

    await fillAddEmployeeForm(page, data);

    // Sau khi save, trang chuyển sang Personal Details — điền thêm
    await expect(page).toHaveURL(/viewPersonalDetails/);

    // Gender
    const genderRadio = page.locator(
      'input[type="radio"][value="1"]' // 1 = Male
    );
    if ((await genderRadio.count()) > 0) {
      await genderRadio.check();
    }

    // Marital Status
    const maritalDropdown = page
      .locator(".oxd-select-text")
      .filter({ hasText: /Select|Single|Married/i })
      .first();
    if ((await maritalDropdown.count()) > 0) {
      await maritalDropdown.click();
      await page.getByRole("option", { name: "Single" }).click();
    }

    // Date of Birth
    const dobInput = page.locator('input[placeholder="yyyy-dd-mm"]').first();
    if ((await dobInput.count()) > 0) {
      await dobInput.fill("1990-01-15");
    }

    // Nationality
    const nationalityDropdown = page
      .locator(".oxd-select-text")
      .nth(1);
    if ((await nationalityDropdown.count()) > 0) {
      await nationalityDropdown.click();
      await page.getByRole("option", { name: "Vietnamese" }).click();
    }

    // Lưu Personal Details
    const saveBtn = page.getByRole("button", { name: "Save" }).first();
    if ((await saveBtn.count()) > 0) {
      await saveBtn.click();
      await expect(page.getByText("Successfully Saved")).toBeVisible();
    }

    const employee: CreatedEmployee = {
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      fullName: `${data.firstName} ${data.lastName}`,
      employeeId: data.employeeId,
    };

    await use(employee);

    await deleteEmployee(page, employee.fullName);
  },

  // --------------------------------------------------
  // FIXTURE: createdEmployeeNoCleanup
  // Tạo employee KHÔNG tự xóa
  // → Dùng cho test case "Xóa Employee" tự xóa trong test body
  // --------------------------------------------------
  createdEmployeeNoCleanup: async ({ page }, use) => {
    const data = generateEmployeeData("Del");

    await fillAddEmployeeForm(page, data);

    const employee: CreatedEmployee = {
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      fullName: `${data.firstName} ${data.lastName}`,
      employeeId: data.employeeId,
    };

    // Không teardown — test tự xử lý
    await use(employee);
  },

  // --------------------------------------------------
  // FIXTURE: goToAddEmployee (helper action)
  // Trả về hàm điều hướng đến trang Add Employee
  // --------------------------------------------------
  goToAddEmployee: async ({ page }, use) => {
    await use(async () => {
      await page.goto(
        "https://opensource-demo.orangehrmlive.com/web/index.php/pim/addEmployee"
      );
      await expect(
        page.getByRole("heading", { name: "Add Employee" })
      ).toBeVisible();
    });
  },

  // --------------------------------------------------
  // FIXTURE: searchEmployee (helper action)
  // Trả về hàm tìm employee trong Employee List theo tên
  // --------------------------------------------------
  searchEmployee: async ({ page }, use) => {
    await use(async (name: string) => {
      await page.goto(
        "https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewEmployeeList"
      );
      await page.waitForLoadState('networkidle')
      const nameInput = page
        .locator("input[placeholder='Type for hints...']").nth(0);
      await nameInput.fill(name);
      await page.getByRole("button", { name: "Search" }).click();
      await page.waitForLoadState("domcontentloaded");
    });
  },
});

export { expect };