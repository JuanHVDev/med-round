import { describe, it, expect } from "vitest";
import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  getTimeOfDay,
  isToday,
  isYesterday,
  formatAge,
  getShiftLabel,
  formatShiftTime,
} from "@/lib/utils/date";
import { addDays, subDays, addHours, subHours, format } from "date-fns";
import { es } from "date-fns/locale";

describe("date utilities", () => {
  const testDate = new Date(2026, 1, 8, 14, 30, 0);

  describe("formatDate", () => {
    it("should format date in Spanish", () => {
      expect(formatDate(testDate)).toBe("8 feb. 2026");
    });

    it("should format date with full month", () => {
      expect(formatDate(testDate, { month: "long" })).toBe("8 de febrero de 2026");
    });

    it("should handle custom pattern", () => {
      expect(formatDate(testDate, undefined, "dd/MM/yyyy")).toBe("08/02/2026");
    });

    it("should handle year only", () => {
      expect(formatDate(testDate, undefined, "yyyy")).toBe("2026");
    });
  });

  describe("formatDateTime", () => {
    it("should format date and time", () => {
      expect(formatDateTime(testDate)).toContain("8 feb. 2026");
      expect(formatDateTime(testDate)).toContain("14:30");
    });

    it("should include seconds when requested", () => {
      expect(formatDateTime(testDate, true)).toContain("14:30:00");
    });
  });

  describe("formatRelativeTime", () => {
    it("should format recent past", () => {
      const recentDate = subHours(new Date(), 2);
      expect(formatRelativeTime(recentDate)).toContain("hace");
    });

    it("should format recent future", () => {
      const futureDate = addHours(new Date(), 1);
      expect(formatRelativeTime(futureDate)).toContain("en");
    });

    it("should format minutes", () => {
      const minutesAgo = subHours(new Date(), 0.1);
      const result = formatRelativeTime(minutesAgo);
      expect(result).toContain("minuto");
    });

    it("should format days", () => {
      const daysAgo = subDays(new Date(), 3);
      const result = formatRelativeTime(daysAgo);
      expect(result).toContain("3 días");
    });
  });

  describe("getTimeOfDay", () => {
    it("should return morning for early hours", () => {
      expect(getTimeOfDay(new Date(2026, 1, 8, 8))).toBe("Buenos días");
    });

    it("should return afternoon for midday", () => {
      expect(getTimeOfDay(new Date(2026, 1, 8, 14))).toBe("Buenas tardes");
    });

    it("should return evening for night hours", () => {
      expect(getTimeOfDay(new Date(2026, 1, 8, 20))).toBe("Buenas noches");
    });

    it("should return night for late hours", () => {
      expect(getTimeOfDay(new Date(2026, 1, 8, 2))).toBe("Buenas noches");
    });
  });

  describe("isToday", () => {
    it("should return true for today", () => {
      expect(isToday(new Date())).toBe(true);
    });

    it("should return false for yesterday", () => {
      expect(isToday(subDays(new Date(), 1))).toBe(false);
    });

    it("should return false for tomorrow", () => {
      expect(isToday(addDays(new Date(), 1))).toBe(false);
    });
  });

  describe("isYesterday", () => {
    it("should return true for yesterday", () => {
      expect(isYesterday(subDays(new Date(), 1))).toBe(true);
    });

    it("should return false for today", () => {
      expect(isYesterday(new Date())).toBe(false);
    });

    it("should return false for two days ago", () => {
      expect(isYesterday(subDays(new Date(), 2))).toBe(false);
    });
  });

  describe("formatAge", () => {
    it("should format age in years", () => {
      const birthDate = subDays(new Date(), 365 * 30);
      expect(formatAge(birthDate)).toContain("30");
      expect(formatAge(birthDate)).toContain("años");
    });

    it("should format age in months for infants", () => {
      const birthDate = subDays(new Date(), 6 * 30);
      expect(formatAge(birthDate)).toContain("6");
      expect(formatAge(birthDate)).toContain("meses");
    });

    it("should format age in days for newborns", () => {
      const birthDate = subDays(new Date(), 10);
      expect(formatAge(birthDate)).toContain("10");
      expect(formatAge(birthDate)).toContain("días");
    });
  });

  describe("getShiftLabel", () => {
    it("should return morning shift", () => {
      expect(getShiftLabel(new Date(2026, 1, 8, 7))).toBe("Mañana");
      expect(getShiftLabel(new Date(2026, 1, 8, 11))).toBe("Mañana");
    });

    it("should return afternoon shift", () => {
      expect(getShiftLabel(new Date(2026, 1, 8, 12))).toBe("Tarde");
      expect(getShiftLabel(new Date(2026, 1, 8, 17))).toBe("Tarde");
    });

    it("should return night shift", () => {
      expect(getShiftLabel(new Date(2026, 1, 8, 20))).toBe("Noche");
      expect(getShiftLabel(new Date(2026, 1, 8, 23))).toBe("Noche");
    });
  });

  describe("formatShiftTime", () => {
    it("should format morning shift", () => {
      expect(formatShiftTime("morning")).toBe("07:00 - 15:00");
    });

    it("should format afternoon shift", () => {
      expect(formatShiftTime("afternoon")).toBe("15:00 - 23:00");
    });

    it("should format night shift", () => {
      expect(formatShiftTime("night")).toBe("23:00 - 07:00");
    });
  });
});
