import { test, expect, Page } from "@playwright/test";

test.describe("Page Load Tests", () => {
  test("should load login page correctly", async ({ page }: { page: Page }) => {
    await page.goto("http://localhost:3000/login");
    await expect(page).toHaveTitle(/.*MedRound/);
    await expect(page.locator("text=Iniciar Sesión").first()).toBeVisible();
  });

  test("should load register page correctly", async ({ page }: { page: Page }) => {
    await page.goto("http://localhost:3000/register");
    await expect(page).toHaveTitle(/.*MedRound/);
    await expect(page.locator("text=Registro de Médico")).toBeVisible();
  });

  test("should load dashboard redirects to login", async ({ page }: { page: Page }) => {
    await page.goto("http://localhost:3000/dashboard");
    await expect(page).toHaveURL(/.*login/);
  });

  test("should load verify-email page", async ({ page }: { page: Page }) => {
    await page.goto("http://localhost:3000/verify-email");
    await expect(page.locator("h1, h2, [data-slot='card-title']").first()).toBeVisible();
  });
});

test.describe("Input Field Tests", () => {
  test("should have email input with correct type", async ({ page }: { page: Page }) => {
    await page.goto("http://localhost:3000/login");
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toHaveAttribute("type", "email");
  });

  test("should have password input with correct type", async ({ page }: { page: Page }) => {
    await page.goto("http://localhost:3000/login");
    const passwordInput = page.locator('input[name="password"]');
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("should have fullName input in registration", async ({ page }: { page: Page }) => {
    await page.goto("http://localhost:3000/register");
    await expect(page.locator('input[name="fullName"]')).toBeVisible();
  });

  test("should accept valid email format", async ({ page }: { page: Page }) => {
    await page.goto("http://localhost:3000/login");
    await page.fill('input[name="email"]', "user@example.com");
    await expect(page.locator('input[name="email"]')).toHaveValue("user@example.com");
  });

  test("should accept long email addresses", async ({ page }: { page: Page }) => {
    await page.goto("http://localhost:3000/login");
    const longEmail = "very.long.email.address.with.many.parts@testdomain.co.uk";
    await page.fill('input[name="email"]', longEmail);
    await expect(page.locator('input[name="email"]')).toHaveValue(longEmail);
  });
});

test.describe("Button and Link Tests", () => {
  test("should have submit button in login form", async ({ page }: { page: Page }) => {
    await page.goto("http://localhost:3000/login");
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
  });

  test("should have link to register page", async ({ page }: { page: Page }) => {
    await page.goto("http://localhost:3000/login");
    const registerLink = page.locator('a[href="/register"]');
    await expect(registerLink).toBeVisible();
  });

  test("should have link to login page from register", async ({ page }: { page: Page }) => {
    await page.goto("http://localhost:3000/register");
    const loginLink = page.locator('a[href="/login"]');
    await expect(loginLink).toBeVisible();
  });
});

test.describe("Page Title Tests", () => {
  test("should have correct title for login", async ({ page }: { page: Page }) => {
    await page.goto("http://localhost:3000/login");
    await expect(page).toHaveTitle("Iniciar Sesión - MedRound");
  });

  test("should have correct title for register", async ({ page }: { page: Page }) => {
    await page.goto("http://localhost:3000/register");
    await expect(page).toHaveTitle("Registro - MedRound");
  });

  test("should have correct title for dashboard redirect", async ({ page }: { page: Page }) => {
    await page.goto("http://localhost:3000/dashboard");
    await page.waitForURL(/.*login/);
    await expect(page).toHaveTitle("Iniciar Sesión - MedRound");
  });
});

test.describe("Meta Description Tests", () => {
  test("should have meta description on login page", async ({ page }: { page: Page }) => {
    await page.goto("http://localhost:3000/login");
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute("content", /.*MedRound/);
  });
});

test.describe("Accessibility Tests", () => {
  test("should have labels for form inputs", async ({ page }: { page: Page }) => {
    await page.goto("http://localhost:3000/login");
    await expect(page.locator('label[for="email"]')).toBeVisible();
    await expect(page.locator('label[for="password"]')).toBeVisible();
  });
});
