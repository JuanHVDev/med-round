import { test, expect, Page } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto("http://localhost:3000/login");
  });

  test("should display login form with email and password fields", async ({
    page,
  }: { page: Page }) => {
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("should show validation error for empty email", async ({
    page,
  }: { page: Page }) => {
    await page.fill('input[name="password"]', "testpassword123");
    await page.click('button[type="submit"]');
    await expect(page.locator('input[name="email"]')).toHaveAttribute(
      "required"
    );
  });

  test("should show error for invalid credentials", async ({
    page,
  }: { page: Page }) => {
    await page.fill('input[name="email"]', "invalid@test.com");
    await page.fill('input[name="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    await expect(page.locator(".text-destructive")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should navigate to register page when clicking link", async ({
    page,
  }: { page: Page }) => {
    await page.click('a[href="/register"]');
    await expect(page).toHaveURL(/.*register/);
    await expect(
      page.locator("text=Registro de Médico")
    ).toBeVisible();
  });
});

test.describe("Registration Flow", () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto("http://localhost:3000/register");
  });

  test("should display registration form with fullName field", async ({
    page,
  }: { page: Page }) => {
    await expect(page.locator('input[name="fullName"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test("should navigate to login page when clicking link", async ({
    page,
  }: { page: Page }) => {
    await page.click('a[href="/login"]');
    await expect(page).toHaveURL(/.*login/);
  });
});

test.describe("Dashboard Access", () => {
  test("should redirect to login when accessing dashboard without auth", async ({
    page,
  }: { page: Page }) => {
    await page.goto("http://localhost:3000/dashboard");
    await expect(page).toHaveURL(/.*login/);
  });
});

test.describe("Patients Pages (Require Authentication)", () => {
  test("should redirect to login when accessing patients list without auth", async ({
    page,
  }: { page: Page }) => {
    await page.goto("http://localhost:3000/patients");
    await expect(page).toHaveURL(/.*login/);
  });
});
