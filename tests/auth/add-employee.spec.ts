import { EmployeePage } from "../../pages/employeePage/employeePage";
import { test, expect } from "../../pages/employeePage/employeePage.fixture";

// ==================== SỬ DỤNG FIXTURE ====================
// Mỗi test nhận employee đã được tạo sẵn.
// Sau khi test kết thúc (pass hay fail), fixture tự động xóa.

test.describe("OrangeHRM - Add Employee Module", () => {
  // ============================================
  // 1. NAVIGATE & HIỂN THỊ FORM
  // ============================================
  test.describe("1. Hiển thị form Add Employee", () => {
    let employeeId: EmployeePage;
    test.beforeEach(async ({ page }) => {
      employeeId = new EmployeePage(page);
    });
    test("TC-EMP-001: Mở trang Add Employee thành công", async ({
      page,
      goToAddEmployee,
    }) => {
      await goToAddEmployee();
      await page.waitForLoadState("networkidle");
      await expect(
        page.getByRole("textbox", { name: "First Name" }),
      ).toBeVisible();
      await expect(
        page.getByRole("textbox", { name: "Middle Name" }),
      ).toBeVisible();
      await expect(
        page.getByRole("textbox", { name: "Last Name" }),
      ).toBeVisible();
      await expect(employeeId.employeeIdInput).toBeVisible();
    });

    test("TC-EMP-002: Employee ID tự động sinh khi mở form", async ({
      page,
      goToAddEmployee,
    }) => {
      await goToAddEmployee();
      const value = await employeeId.employeeIdInput.inputValue();
      await page.waitForLoadState("networkidle");
      await expect(employeeId.employeeIdInput).toBeVisible();
      await expect(value.length).toBeGreaterThan(0);
    });

    test("TC-EMP-003: Checkbox 'Create Login Details' mặc định ẩn", async ({
      page,
      goToAddEmployee,
    }) => {
      await goToAddEmployee();
      const toggle = page.locator(".oxd-switch-input");
      await expect(toggle).toBeVisible();
    });
  });
  // ------------------------------------------
  test.describe("2. Thêm Employee thành công", () => {
    test("TC-EMP-004: Thêm employee cơ bản thành công", async ({
      page,
      createdEmployee,
    }) => {
      // createdEmployee đã được tạo bởi fixture
      // Kiểm tra trang đã redirect sang Personal Details
      await expect(page).toHaveURL(/viewPersonalDetails/);
      await page.waitForLoadState("networkidle");
      await expect(
        page.getByRole("heading", { name: "Personal Details" }),
      ).toBeVisible();

      // Kiểm tra tên hiển thị đúng
      await page.waitForLoadState("networkidle");
      await expect(page.getByText(createdEmployee.firstName)).toBeVisible();
    });

    test("TC-EMP-005: Employee ID hiển thị đúng sau khi tạo", async ({
      page,
      createdEmployee,
    }) => {
      await expect(page).toHaveURL(/viewPersonalDetails/);
      await page.waitForLoadState("networkidle");
      const empIdField = page.locator("input.oxd-input").filter({
        hasText: createdEmployee.employeeId,
      });
      // Kiểm tra qua giá trị input
      const inputs = page.locator("input.oxd-input");
      let found = false;
      const count = await inputs.count();
      for (let i = 0; i < count; i++) {
        const val = await inputs.nth(i).inputValue();
        if (val === createdEmployee.employeeId) {
          found = true;
          break;
        }
      }
      expect(found).toBeTruthy();
    });
    test("TC-EMP-006: Thêm employee với đầy đủ thông tin cá nhân", async ({
      page,
      createdEmployeeWithDetails,
    }) => {
      // Fixture đã tạo + điền personal details
      await expect(page).toHaveURL(/viewPersonalDetails/);
      await page.waitForLoadState("networkidle");
      await expect(
        page.getByText(createdEmployeeWithDetails.firstName),
      ).toBeVisible();
    });

    test("TC-EMP-007: Employee xuất hiện trong Employee List sau khi tạo", async ({
      page,
      createdEmployeeNoCleanup,
      searchEmployee,
    }) => {
      await searchEmployee(createdEmployeeNoCleanup.firstName);
      const rows = page.locator(".oxd-table-body .oxd-table-row");
      await expect(rows.first()).toContainText(
        createdEmployeeNoCleanup.firstName,
      );
    });

    test.skip("TC-EMP-008: Tạo employee với ảnh đại diện", async ({
      page,
      createdEmployeeWithPhoto,
    }) => {
      await expect(page).toHaveURL(/viewPersonalDetails/);
      await expect(
        page.getByText(createdEmployeeWithPhoto.firstName),
      ).toBeVisible();
      // Kiểm tra avatar container hiển thị
      await expect(
        page
          .locator(
            ".employee-image-placeholder, img.emp-picture, .profile-picture",
          )
          .first(),
      ).toBeVisible();
    });
  });
  test.describe("3. Validation form Add Employee", () => {
    test("TC-EMP-009: Submit form trống - báo lỗi required", async ({
      page,
      goToAddEmployee,
    }) => {
      await goToAddEmployee();
      await page.getByRole("button", { name: "Save" }).click();
      const errors = await page.getByText("Required").all();
      expect(errors.length).toBeGreaterThanOrEqual(1);
    });

    test("TC-EMP-010: Thiếu First Name - báo lỗi required", async ({
      page,
      goToAddEmployee,
    }) => {
      await goToAddEmployee();
      // Chỉ điền Last Name, bỏ First Name
      await page.locator("input.oxd-input").nth(3).fill("TestLast");
      await page.getByRole("button", { name: "Save" }).click();
      await expect(page.getByText("Required").first()).toBeVisible();
    });
  });
  test("TC-EMP-011: Thiếu Last Name - báo lỗi required", async ({
    page,
    goToAddEmployee,
  }) => {
    await goToAddEmployee();
    await page.locator("input.oxd-input").nth(1).fill("TestFirst");
    // Không điền Last Name
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Required").first()).toBeVisible();
  });

  test("TC-EMP-012: Employee ID trống - báo lỗi required", async ({
    page,
    goToAddEmployee,
  }) => {
    await goToAddEmployee();
    await page.locator("input.oxd-input").nth(1).fill("TestFirst");
    await page.locator("input.oxd-input").nth(3).fill("TestLast");
    // Xóa Employee ID
    await page.locator("input.oxd-input").nth(4).clear();
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Required").first()).toBeVisible();
  });

  test("TC-EMP-013: First Name vượt quá ký tự cho phép", async ({
    page,
    goToAddEmployee,
  }) => {
    await goToAddEmployee();
    // Nhập chuỗi 100 ký tự
    const longName = "A".repeat(100);
    await page.locator("input.oxd-input").nth(1).fill(longName);
    await page.getByRole("button", { name: "Save" }).click();
    // Kiểm tra lỗi giới hạn ký tự
    await expect(
      page.getByText(/Should not exceed \d+ characters/i).first(),
    ).toBeVisible();
  });

  // ============================================
  // 4. CREATE LOGIN DETAILS
  // ============================================
  test.describe("4. Create Login Details", () => {
    test("TC-EMP-014: Bật toggle Create Login Details hiển thị form login", async ({
      page,
      goToAddEmployee,
    }) => {
      await goToAddEmployee();
      await page.locator(".oxd-switch-input").click();
      await expect(page.getByText("Username")).toBeVisible();
      await expect(
        page.locator("//label[normalize-space()='Password']"),
      ).toBeVisible();
      await expect(
        page.locator("//label[normalize-space()='Confirm Password']"),
      ).toBeVisible();
    });

    test("TC-EMP-015: Submit với login details bỏ trống - báo lỗi", async ({
      page,
      goToAddEmployee,
    }) => {
      await goToAddEmployee();
      await page.locator(".oxd-switch-input").click();
      await page.locator("input.oxd-input").nth(1).fill("LoginFirst");
      await page.locator("input.oxd-input").nth(3).fill("LoginLast");
      await page.getByRole("button", { name: "Save" }).click();
      await page.waitForLoadState("networkidle");
      await expect(
        page.getByText("Required", { exact: true }).nth(0),
      ).toBeVisible();
      await expect(
        page.getByText("Required", { exact: true }).nth(1),
      ).toBeVisible();
      await expect(
        page.getByText("Passwords do not match", { exact: true }),
      ).toBeVisible();
      //   const errors = await page.getByText("Required").all();
      //   await expect(errors.length).toBeGreaterThanOrEqual(1);
    });
    test("TC-EMP-016: Password và Confirm Password không khớp", async ({
      page,
      goToAddEmployee,
    }) => {
      await goToAddEmployee();
      await page.locator(".oxd-switch-input").click();
      await page.locator("input.oxd-input").nth(1).fill("LoginFirst");
      await page.locator("input.oxd-input").nth(3).fill("LoginLast");

      // Điền username
      const usernameInput = page.locator("input.oxd-input").nth(5);
      await usernameInput.fill("loginuser_test");

      // Password không khớp
      await page.locator("input[type='password']").nth(0).fill("Pass@1234!");
      await page.locator("input[type='password']").nth(1).fill("Pass@9999!");

      await page.getByRole("button", { name: "Save" }).click();
      await page.waitForLoadState("networkidle");
      await expect(page.getByText(/Passwords do not match/i)).toBeVisible();
    });

    test("TC-EMP-017: Password không đủ mạnh", async ({
      page,
      goToAddEmployee,
    }) => {
      await goToAddEmployee();
      await page.locator(".oxd-switch-input").click();
      await page.locator("input.oxd-input").nth(1).fill("LoginFirst");
      await page.locator("input.oxd-input").nth(3).fill("LoginLast");

      const usernameInput = page.locator("input.oxd-input").nth(5);
      await usernameInput.fill("weakpassuser");

      // Mật khẩu yếu
      await page.locator("input[type='password']").nth(0).fill("123");
      await page.locator("input[type='password']").nth(1).fill("123");

      await page.getByRole("button", { name: "Save" }).click();
      await expect(
        page.getByText(/Should have at least 7 characters/i),
      ).toBeVisible();
    });
  });

  // ============================================
  // 5. XÓA EMPLOYEE
  // ============================================
  test.describe("5. Xóa Employee", () => {
    let deleteBtn = "//i[@class='oxd-icon bi-trash']";
    test("TC-EMP-018: Xóa employee thành công", async ({
      page,
      createdEmployeeNoCleanup,
      searchEmployee,
    }) => {
      await searchEmployee(createdEmployeeNoCleanup.employeeId);

      await page
        .locator(".oxd-table-body .oxd-table-row")
        .first()
        .locator(deleteBtn)
        .click();

      await page.getByRole("button", { name: "Yes, Delete" }).click();
      await expect(page.getByText("Successfully Deleted")).toBeVisible();
    });

    test("TC-EMP-019: Hộp thoại xác nhận xóa hiển thị đúng", async ({
      page,
      createdEmployee,
      searchEmployee,
    }) => {
      await searchEmployee(createdEmployee.employeeId);

      await page
        .locator(".oxd-table-body .oxd-table-row")
        .first()
        .locator(deleteBtn)
        .click();

      await expect(page.getByText(/Are you sure\?/i)).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Yes, Delete" }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "No, Cancel" }),
      ).toBeVisible();

      // Cancel — không xóa (fixture sẽ tự cleanup)
      await page.getByRole("button", { name: "No, Cancel" }).click();
    });

    test("TC-EMP-020: Hủy xóa employee — employee vẫn còn trong danh sách", async ({
      page,
      createdEmployee,
      searchEmployee,
    }) => {
      await searchEmployee(createdEmployee.employeeId);

      await page
        .locator(".oxd-table-body .oxd-table-row")
        .first()
        .locator(deleteBtn)
        .click();

      await page.getByRole("button", { name: "No, Cancel" }).click();

      // Search lại bằng ID — employee vẫn phải tồn tại
      await searchEmployee(createdEmployee.employeeId);
      const rows = page.locator(".oxd-table-body .oxd-table-row");
      await expect(rows).toHaveCount(1);
    });
  });
});
