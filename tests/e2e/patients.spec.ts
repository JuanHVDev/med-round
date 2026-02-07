import { test, expect, Page } from "@playwright/test";

test.describe("Patients Pages (Public/Protected)", () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto("http://localhost:3000/patients");
  });

  test("should redirect to login when accessing patients list without auth", async ({
    page,
  }: { page: Page }) => {
    await expect(page).toHaveURL(/.*login/);
  });

  test("should show login form on patients redirect", async ({
    page,
  }: { page: Page }) => {
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });
});

test.describe("New Patient Page (Protected)", () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto("http://localhost:3000/patients/new");
  });

  test("should redirect to login when accessing new patient form without auth", async ({
    page,
  }: { page: Page }) => {
    await expect(page).toHaveURL(/.*login/);
  });
});

test.describe("Patient Import Page (Protected)", () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto("http://localhost:3000/patients/import");
  });

  test("should redirect to login when accessing import page without auth", async ({
    page,
  }: { page: Page }) => {
    await expect(page).toHaveURL(/.*login/);
  });
});

test.describe("Patient Edit Page (Protected)", () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto("http://localhost:3000/patients/123/edit");
  });

  test("should redirect to login when accessing edit page without auth", async ({
    page,
  }: { page: Page }) => {
    await expect(page).toHaveURL(/.*login/);
  });
});

test.describe("Patient Detail Page (Protected)", () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto("http://localhost:3000/patients/123");
  });

  test("should redirect to login when accessing patient detail without auth", async ({
    page,
  }: { page: Page }) => {
    await expect(page).toHaveURL(/.*login/);
  });
});
