import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatPhoneNumber,
  formatFileSize,
  truncateText,
  capitalizeFirst,
  slugify,
  formatInitials,
} from "@/lib/utils/formatting";

describe("formatting utilities", () => {
  describe("formatCurrency", () => {
    it("should format number as MXN currency", () => {
      expect(formatCurrency(1234.56)).toBe("$1,234.56");
    });

    it("should format zero", () => {
      expect(formatCurrency(0)).toBe("$0.00");
    });

    it("should format large numbers", () => {
      expect(formatCurrency(1000000)).toBe("$1,000,000.00");
    });

    it("should handle negative numbers", () => {
      expect(formatCurrency(-500)).toBe("-$500.00");
    });

    it("should format small decimal numbers", () => {
      expect(formatCurrency(99.99)).toBe("$99.99");
    });
  });

  describe("formatNumber", () => {
    it("should format large numbers with dots", () => {
      expect(formatNumber(1000000)).toBe("1.000.000");
    });

    it("should format small numbers", () => {
      expect(formatNumber(42)).toBe("42");
    });

    it("should format zero", () => {
      expect(formatNumber(0)).toBe("0");
    });

    it("should handle negative numbers", () => {
      expect(formatNumber(-100)).toBe("-100");
    });
  });

  describe("formatPercentage", () => {
    it("should format decimal as percentage", () => {
      expect(formatPercentage(0.25)).toBe("25%");
    });

    it("should format 1 as 100%", () => {
      expect(formatPercentage(1)).toBe("100%");
    });

    it("should format 0 as 0%", () => {
      expect(formatPercentage(0)).toBe("0%");
    });

    it("should handle decimal percentages", () => {
      expect(formatPercentage(0.1234, 2)).toBe("12.34%");
    });

    it("should handle negative decimals", () => {
      expect(formatPercentage(-0.5)).toBe("-50%");
    });
  });

  describe("formatPhoneNumber", () => {
    it("should format 10-digit phone number", () => {
      expect(formatPhoneNumber("1234567890")).toBe("(123) 456-7890");
    });

    it("should handle phone number with country code", () => {
      expect(formatPhoneNumber("11234567890")).toBe("+1 (123) 456-7890");
    });

    it("should return original for invalid input", () => {
      expect(formatPhoneNumber("123")).toBe("123");
    });
  });

  describe("formatFileSize", () => {
    it("should format bytes", () => {
      expect(formatFileSize(500)).toBe("500 B");
    });

    it("should format kilobytes", () => {
      expect(formatFileSize(1024)).toBe("1 KB");
    });

    it("should format megabytes", () => {
      expect(formatFileSize(1048576)).toBe("1 MB");
    });

    it("should format gigabytes", () => {
      expect(formatFileSize(1073741824)).toBe("1 GB");
    });

    it("should handle decimal sizes", () => {
      expect(formatFileSize(1536)).toBe("1.5 KB");
    });
  });

  describe("truncateText", () => {
    it("should truncate long text", () => {
      const text = "Esta es una nota muy larga";
      expect(truncateText(text, 16)).toBe("Esta es una n...");
    });

    it("should not truncate short text", () => {
      const text = "Corta";
      expect(truncateText(text, 20)).toBe("Corta");
    });

    it("should handle exact length", () => {
      const text = "Igual";
      expect(truncateText(text, 5)).toBe("Igual");
    });

    it("should handle empty string", () => {
      expect(truncateText("", 10)).toBe("");
    });
  });

  describe("capitalizeFirst", () => {
    it("should capitalize first letter", () => {
      expect(capitalizeFirst("hola")).toBe("Hola");
    });

    it("should lowercase the rest", () => {
      expect(capitalizeFirst("HOLA")).toBe("Hola");
    });

    it("should handle single letter", () => {
      expect(capitalizeFirst("a")).toBe("A");
    });

    it("should handle empty string", () => {
      expect(capitalizeFirst("")).toBe("");
    });
  });

  describe("slugify", () => {
    it("should convert text to slug", () => {
      expect(slugify("Hola Mundo")).toBe("hola-mundo");
    });

    it("should remove special characters", () => {
      expect(slugify("Hola, Mundo!")).toBe("hola-mundo");
    });

    it("should handle multiple spaces", () => {
      expect(slugify("Hola   Mundo")).toBe("hola-mundo");
    });

    it("should preserve accented characters", () => {
      expect(slugify("Teléfono")).toBe("telefono");
    });

    it("should lowercase result", () => {
      expect(slugify("HOLA")).toBe("hola");
    });
  });

  describe("formatInitials", () => {
    it("should extract first letters of words", () => {
      expect(formatInitials("Juan Pérez")).toBe("JP");
    });

    it("should handle single word", () => {
      expect(formatInitials("Juan")).toBe("J");
    });

    it("should handle three names", () => {
      expect(formatInitials("Juan Carlos Pérez")).toBe("JCP");
    });

    it("should handle empty string", () => {
      expect(formatInitials("")).toBe("");
    });

    it("should handle lowercase input", () => {
      expect(formatInitials("juan pérez")).toBe("JP");
    });
  });
});
