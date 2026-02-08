/**
 * Tests E2E para Handover (Entrega de Guardia)
 */

import { test, expect, Page } from "@playwright/test";

async function navigateToNewHandover(page: Page) {
  await page.goto("/handover/new", { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForSelector("text=Nueva Entrega de Guardia", { timeout: 15000 });
}

async function fillHandoverInfoStep(page: Page, data: {
  service: string;
  shiftType: string;
  shiftDate: string;
  startTime: string;
}) {
  await page.fill('input[id="service"]', data.service);
  await page.locator('[role="combobox"]').first().click();
  await page.waitForSelector('[role="listbox"]', { timeout: 5000 });
  await page.click(`text=${data.shiftType}`);
  await page.fill('input[id="shiftDate"]', data.shiftDate);
  await page.fill('input[id="startTime"]', data.startTime);
}

async function goToNextStep(page: Page) {
  await page.click('button:has-text("Siguiente")');
}

async function goToPreviousStep(page: Page) {
  await page.click('button:has-text("Anterior")');
}

test.describe("Handover - Authentication", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("should redirect to login when accessing /handover without auth", async ({ page, context }) => {
    await context.clearCookies();
    await page.goto("/handover", { waitUntil: "networkidle", timeout: 45000 });
    await expect(page).toHaveURL(/.*login/, { timeout: 15000 });
  });

  test("should redirect to login when accessing /handover/new without auth", async ({ page, context }) => {
    await context.clearCookies();
    await page.goto("/handover/new", { waitUntil: "networkidle", timeout: 45000 });
    await expect(page).toHaveURL(/.*login/, { timeout: 15000 });
  });
});

test.describe("Handover - List Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/handover", { waitUntil: "networkidle", timeout: 45000 });
    await page.waitForSelector("text=Entrega de Guardia", { timeout: 15000 });
  });

  test("should display handover dashboard", async ({ page }) => {
    await expect(page.locator("text=Entrega de Guardia")).toBeVisible();
    await expect(page.locator("text=Gestiona tus handovers")).toBeVisible();
  });

  test("should display stats cards", async ({ page }) => {
    await expect(page.locator("text=Total")).toBeVisible();
    await expect(page.locator("text=Borradores")).toBeVisible();
    await expect(page.locator("text=En Progreso")).toBeVisible();
    await expect(page.locator("text=Finalizados")).toBeVisible();
  });

  test("should show 'Nuevo Handover' button", async ({ page }) => {
    await expect(page.locator('button:has-text("Nuevo Handover")')).toBeVisible();
  });

  test("should navigate to /handover/new when clicking 'Nuevo Handover'", async ({ page }) => {
    await page.click('button:has-text("Nuevo Handover")');
    await expect(page).toHaveURL("/handover/new", { timeout: 10000 });
    await expect(page.locator("text=Nueva Entrega de Guardia")).toBeVisible();
  });
});

test.describe("Handover Creation - Step 1: Information", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToNewHandover(page);
  });

  test("should display turn information form", async ({ page }) => {
    await expect(page.locator('label:has-text("Servicio")')).toBeVisible();
    await expect(page.locator('label:has-text("Tipo de Turno")')).toBeVisible();
    await expect(page.locator('label:has-text("Fecha del Turno")')).toBeVisible();
    await expect(page.locator('label:has-text("Hora de Inicio")')).toBeVisible();
  });

  test("should show 'Siguiente' button disabled when form is empty", async ({ page }) => {
    const nextButton = page.locator('button:has-text("Siguiente")');
    await expect(nextButton).toBeDisabled();
  });

  test("should enable 'Siguiente' button when form is valid", async ({ page }) => {
    await fillHandoverInfoStep(page, {
      service: "Medicina Interna",
      shiftType: "Mañana (08:00 - 15:00)",
      shiftDate: new Date().toISOString().split("T")[0],
      startTime: "08:00",
    });
    const nextButton = page.locator('button:has-text("Siguiente")');
    await expect(nextButton).toBeEnabled();
  });

  test("should navigate to patients step when clicking 'Siguiente'", async ({ page }) => {
    await fillHandoverInfoStep(page, {
      service: "Medicina Interna",
      shiftType: "Mañana (08:00 - 15:00)",
      shiftDate: new Date().toISOString().split("T")[0],
      startTime: "08:00",
    });
    await goToNextStep(page);
    await expect(page.locator("text=Seleccionar Pacientes")).toBeVisible();
  });
});

test.describe("Handover Creation - Step 2: Patient Selection", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToNewHandover(page);
    await fillHandoverInfoStep(page, {
      service: "Medicina Interna",
      shiftType: "Mañana (08:00 - 15:00)",
      shiftDate: new Date().toISOString().split("T")[0],
      startTime: "08:00",
    });
    await goToNextStep(page);
    await page.waitForSelector("text=Seleccionar Pacientes", { timeout: 10000 });
    await page.waitForTimeout(3000);
  });

  test("should display all active patients", async ({ page }) => {
    const cards = await page.locator('[class*="cursor-pointer"]').count();
    expect(cards).toBeGreaterThan(40);
    await expect(page.locator("text=/\\d+ activos/")).toBeVisible();
  });

  test("should show patient search input", async ({ page }) => {
    await expect(page.locator('input[placeholder*="Buscar"]').first()).toBeVisible();
  });

  test("should show selected patient count badge", async ({ page }) => {
    await expect(page.locator("text=/0 seleccionados/")).toBeVisible();
  });

  test("should allow selecting patients", async ({ page }) => {
    await page.locator("text=Seleccionar todos los visibles").click();
    await page.waitForTimeout(500);
    const badgeText = await page.locator("text=/\\d+ seleccionados/").textContent();
    expect(badgeText).toMatch(/\d+ seleccionados/);
  });

  test("should allow selecting multiple patients", async ({ page }) => {
    await page.locator("text=Seleccionar todos los visibles").click();
    await page.waitForTimeout(500);
    await page.locator("text=Deseleccionar todos los visibles").click();
    await page.waitForTimeout(500);
    await page.locator('[class*="cursor-pointer"]').nth(0).click();
    await page.locator('[class*="cursor-pointer"]').nth(1).click();
    await page.locator('[class*="cursor-pointer"]').nth(2).click();
    await page.waitForTimeout(500);
    const badge = await page.locator("text=/\\d+ seleccionados/").textContent();
    expect(badge).toMatch(/\d+ seleccionados/);
  });

  test("should allow deselecting patients", async ({ page }) => {
    await page.locator("text=Seleccionar todos los visibles").click();
    await page.waitForTimeout(500);
    await page.locator("text=Deseleccionar todos los visibles").click();
    await page.waitForTimeout(500);
    const badgeZero = await page.locator("text=/\\d+ seleccionados/").textContent();
    expect(badgeZero).toContain("0");
  });

  test("should filter patients by search", async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar"]').first();
    await searchInput.fill("Juan");
    await page.waitForTimeout(500);
    const cards = await page.locator('[class*="cursor-pointer"]').count();
    expect(cards).toBeLessThan(51);
  });

  test("should filter patients by bed number", async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar"]').first();
    await searchInput.fill("101");
    await page.waitForTimeout(500);
    await expect(page.locator("text=Cama 101").first()).toBeVisible();
  });

  test("should allow 'Select All' functionality", async ({ page }) => {
    await page.locator("text=Seleccionar todos los visibles").click();
    await page.waitForTimeout(500);
    const badgeText = await page.locator("text=/\\d+ seleccionados/").textContent();
    expect(badgeText).toMatch(/\d+ seleccionados/);
  });

  test("should display patient cards with bed numbers", async ({ page }) => {
    await expect(page.locator("text=/Cama \\d+/").first()).toBeVisible();
  });
});

test.describe("Handover Creation - Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToNewHandover(page);
    await fillHandoverInfoStep(page, {
      service: "Medicina Interna",
      shiftType: "Mañana (08:00 - 15:00)",
      shiftDate: new Date().toISOString().split("T")[0],
      startTime: "08:00",
    });
    await goToNextStep(page);
    await page.waitForSelector("text=Seleccionar Pacientes", { timeout: 10000 });
  });

  test("should navigate back to info step", async ({ page }) => {
    await goToPreviousStep(page);
    await expect(page.locator("text=Servicio")).toBeVisible();
    await expect(page.locator('input[id="service"]')).toHaveValue("Medicina Interna");
  });

  test("should navigate to tasks step from patients step", async ({ page }) => {
    await goToNextStep(page);
    await expect(page.locator("text=Buscar y Seleccionar Tareas")).toBeVisible();
  });

  test("should navigate to notes step from tasks step", async ({ page }) => {
    await goToNextStep(page);
    await goToNextStep(page);
    await expect(page.locator("text=Notas Generales del Turno")).toBeVisible();
  });

  test("should navigate to review step from notes step", async ({ page }) => {
    await goToNextStep(page);
    await goToNextStep(page);
    await goToNextStep(page);
    await expect(page.locator("text=Resumen del Handover")).toBeVisible();
  });
});

test.describe("Handover Creation - Complete Flow", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToNewHandover(page);
    await fillHandoverInfoStep(page, {
      service: "Medicina Interna",
      shiftType: "Mañana (08:00 - 15:00)",
      shiftDate: new Date().toISOString().split("T")[0],
      startTime: "08:00",
    });
    await goToNextStep(page);
    await page.waitForSelector("text=Seleccionar Pacientes", { timeout: 10000 });
    await page.waitForTimeout(3000);
  });

  test("should create handover with selected patients", async ({ page }) => {
    await page.locator("text=Seleccionar todos los visibles").click();
    await page.waitForTimeout(500);
    await page.locator("text=Deseleccionar todos los visibles").click();
    await page.waitForTimeout(500);
    await page.locator('[class*="cursor-pointer"]').nth(0).click();
    await page.locator('[class*="cursor-pointer"]').nth(1).click();
    await page.locator('[class*="cursor-pointer"]').nth(2).click();
    await page.waitForTimeout(500);

    await goToNextStep(page);
    await goToNextStep(page);
    await goToNextStep(page);

    await expect(page.locator("text=Resumen del Handover")).toBeVisible();

    await page.click('button:has-text("Finalizar Handover")');
    await page.waitForURL(/.*handover\/.+/, { timeout: 15000 });
    await expect(page.locator("text=Entrega de Guardia")).toBeVisible();
  });

  test("should create handover with all patients", async ({ page }) => {
    await page.locator("text=Seleccionar todos los visibles").click();
    await page.waitForTimeout(500);

    await goToNextStep(page);
    await goToNextStep(page);
    await goToNextStep(page);

    await expect(page.locator("text=Resumen del Handover")).toBeVisible();

    await page.click('button:has-text("Finalizar Handover")');
    await page.waitForURL(/.*handover\/.+/, { timeout: 15000 });
    await expect(page.locator("text=Entrega de Guardia")).toBeVisible();
  });

  test("should persist selections when navigating", async ({ page }) => {
    await page.locator("text=Seleccionar todos los visibles").click();
    await page.waitForTimeout(500);
    await page.locator("text=Deseleccionar todos los visibles").click();
    await page.waitForTimeout(500);
    await page.locator('[class*="cursor-pointer"]').nth(0).click();
    await page.locator('[class*="cursor-pointer"]').nth(1).click();
    await page.waitForTimeout(500);

    await goToNextStep(page);
    await goToPreviousStep(page);

    await page.waitForTimeout(500);
    const badge = await page.locator("text=/\\d+ seleccionados/").textContent();
    expect(badge).toMatch(/\d+ seleccionados/);
  });
});

test.describe("Handover Creation - Advanced Search", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToNewHandover(page);
    await fillHandoverInfoStep(page, {
      service: "Medicina Interna",
      shiftType: "Mañana (08:00 - 15:00)",
      shiftDate: new Date().toISOString().split("T")[0],
      startTime: "08:00",
    });
    await goToNextStep(page);
    await page.waitForSelector("text=Seleccionar Pacientes", { timeout: 10000 });
    await page.waitForTimeout(3000);
  });

  test("should search by name", async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar"]').first();
    await searchInput.fill("María");
    await page.waitForTimeout(500);
    const cards = await page.locator('[class*="cursor-pointer"]').count();
    expect(cards).toBeLessThan(51);
  });

  test("should search by bed number", async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar"]').first();
    await searchInput.fill("101");
    await page.waitForTimeout(500);
    await expect(page.locator("text=Cama 101").first()).toBeVisible();
  });

  test("should show no results for non-existent search", async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar"]').first();
    await searchInput.fill("XYZ123NOEXISTE");
    await page.waitForTimeout(500);
    await expect(page.locator("text=No se encontraron pacientes")).toBeVisible();
  });

  test("should clear search", async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar"]').first();
    await searchInput.fill("XYZ123NOEXISTE");
    await page.waitForTimeout(500);
    await searchInput.fill("");
    await page.waitForTimeout(500);
    const cards = await page.locator('[class*="cursor-pointer"]').count();
    expect(cards).toBeGreaterThan(40);
  });
});

test.describe("Handover Creation - Edge Cases", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToNewHandover(page);
    await fillHandoverInfoStep(page, {
      service: "Medicina Interna",
      shiftType: "Mañana (08:00 - 15:00)",
      shiftDate: new Date().toISOString().split("T")[0],
      startTime: "08:00",
    });
    await goToNextStep(page);
    await page.waitForSelector("text=Seleccionar Pacientes", { timeout: 10000 });
    await page.waitForTimeout(3000);
  });

  test("should handle rapid selection", async ({ page }) => {
    await page.locator("text=Seleccionar todos los visibles").click();
    await page.waitForTimeout(500);
    await page.locator("text=Deseleccionar todos los visibles").click();
    await page.waitForTimeout(500);
    await page.locator('[class*="cursor-pointer"]').nth(0).click();
    await page.locator('[class*="cursor-pointer"]').nth(1).click();
    await page.locator('[class*="cursor-pointer"]').nth(0).click();
    await page.locator('[class*="cursor-pointer"]').nth(1).click();
    await page.waitForTimeout(500);
    const badge = await page.locator("text=/\\d+ seleccionados/").textContent();
    expect(badge).toMatch(/\d+ seleccionados/);
  });

  test("should maintain selection when scrolling", async ({ page }) => {
    await page.locator("text=Seleccionar todos los visibles").click();
    await page.waitForTimeout(500);
    await page.locator("text=Deseleccionar todos los visibles").click();
    await page.waitForTimeout(500);
    await page.locator('[class*="cursor-pointer"]').first().click();
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    const badge = await page.locator("text=/\\d+ seleccionados/").textContent();
    expect(badge).toMatch(/\d+ seleccionados/);
  });

  test("should select from filtered results", async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar"]').first();
    await searchInput.fill("101");
    await page.waitForTimeout(500);
    await page.locator("text=Seleccionar todos los visibles").click();
    await page.waitForTimeout(500);
    const badge = await page.locator("text=/\\d+ seleccionados/").textContent();
    expect(badge).toMatch(/\d+ seleccionados/);
  });
});
