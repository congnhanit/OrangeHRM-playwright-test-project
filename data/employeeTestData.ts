// ==================== TEST DATA UTILS ====================

/**
 * Tạo tên duy nhất tránh conflict khi chạy parallel
 * Ví dụ: uniqueName("emp") → "emp_1716278400000_x7k2"
 */
export function uniqueName(prefix: string): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 5);
  return `${prefix}_${ts}_${rand}`;
}

/**
 * Tạo Employee ID ngẫu nhiên (6 số)
 */
export function uniqueEmployeeId(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Data mẫu cho Employee
 */
export interface EmployeeData {
  firstName: string;
  middleName: string;
  lastName: string;
  employeeId: string;
}

export function generateEmployeeData(prefix = "Auto"): EmployeeData {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 4).toUpperCase();
  return {
    firstName: `${prefix}First`,
    middleName: `M${rand}`,
    lastName: `${prefix}Last_${ts}`,
    employeeId: uniqueEmployeeId(),
  };
}