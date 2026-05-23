import { Page, Locator } from "@playwright/test"

export class EmployeePage {
    readonly page: Page;
    readonly employeeIdInput: Locator;

    constructor(page: Page) {
        this.page = page;
        this.employeeIdInput = page.locator("//label[text()='Employee Id']/ancestor::div[2]//input")
    }
    async employee() {
        
    }
}