import {
  format,
  formatDistanceToNow,
  differenceInYears,
  differenceInMonths,
  differenceInDays,
  isToday as checkIsToday,
  isYesterday as checkIsYesterday,
  isSameDay,
  addDays,
  subDays,
} from "date-fns";
import { es } from "date-fns/locale";

export function formatDate(
  date: Date | number,
  options?: { month?: "short" | "long"; year?: "numeric" },
  customPattern?: string
): string {
  if (customPattern) {
    return format(new Date(date), customPattern);
  }

  const month = options?.month || "MMM";
  const year = options?.year || "yyyy";
  const pattern = `d ${month} ${year}`;

  return format(new Date(date), pattern, { locale: es });
}

export function formatDateTime(
  date: Date | number,
  includeSeconds: boolean = false
): string {
  const dateStr = format(new Date(date), "d MMM yyyy", { locale: es });
  const timeStr = includeSeconds
    ? format(new Date(date), "HH:mm:ss")
    : format(new Date(date), "HH:mm");
  return `${dateStr} ${timeStr}`;
}

export function formatRelativeTime(date: Date | number): string {
  const d = new Date(date);
  const now = new Date();

  const diffInSeconds = Math.floor((d.getTime() - now.getTime()) / 1000);

  if (Math.abs(diffInSeconds) < 60) {
    return diffInSeconds > 0 ? "en pocos segundos" : "hace pocos segundos";
  }

  const diffInMinutes = Math.floor(Math.abs(diffInSeconds) / 60);
  if (diffInMinutes < 60) {
    return diffInSeconds > 0
      ? `en ${diffInMinutes} ${diffInMinutes === 1 ? "minuto" : "minutos"}`
      : `hace ${diffInMinutes} ${diffInMinutes === 1 ? "minuto" : "minutos"}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return diffInSeconds > 0
      ? `en ${diffInHours} ${diffInHours === 1 ? "hora" : "horas"}`
      : `hace ${diffInHours} ${diffInHours === 1 ? "hora" : "horas"}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return diffInSeconds > 0
      ? `en ${diffInDays} ${diffInDays === 1 ? "día" : "días"}`
      : `hace ${diffInDays} ${diffInDays === 1 ? "día" : "días"}`;
  }

  return formatDate(d);
}

export function getTimeOfDay(date: Date = new Date()): string {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return "Buenos días";
  }
  if (hour >= 12 && hour < 18) {
    return "Buenas tardes";
  }
  return "Buenas noches";
}

export function isToday(date: Date | number): boolean {
  return checkIsToday(new Date(date));
}

export function isYesterday(date: Date | number): boolean {
  return checkIsYesterday(new Date(date));
}

export function formatAge(birthDate: Date | number): string {
  const birth = new Date(birthDate);
  const now = new Date();

  const years = differenceInYears(now, birth);
  const months = differenceInMonths(now, birth);
  const days = differenceInDays(now, birth);

  if (years >= 2) {
    return `${years} años`;
  }
  if (years >= 1) {
    const remainingMonths = months % 12;
    if (remainingMonths > 0) {
      return `${years} años, ${remainingMonths} meses`;
    }
    return `${years} años`;
  }
  if (months >= 1) {
    return `${months} meses`;
  }
  return `${days} días`;
}

export type ShiftType = "morning" | "afternoon" | "night";

export function getShiftLabel(date: Date = new Date()): string {
  const hour = date.getHours();

  if (hour >= 6 && hour < 13) {
    return "Mañana";
  }
  if (hour >= 13 && hour < 19) {
    return "Tarde";
  }
  return "Noche";
}

export function getShiftFromHour(hour: number): ShiftType {
  if (hour >= 6 && hour < 13) return "morning";
  if (hour >= 13 && hour < 19) return "afternoon";
  return "night";
}

export function formatShiftTime(shift: ShiftType): string {
  const hours: Record<ShiftType, string> = {
    morning: "07:00 - 15:00",
    afternoon: "15:00 - 23:00",
    night: "23:00 - 07:00",
  };
  return hours[shift];
}

export function getCurrentShift(): ShiftType {
  return getShiftFromHour(new Date().getHours());
}

export function isWithinShiftHours(
  date: Date,
  shift: ShiftType
): boolean {
  const hour = date.getHours();

  switch (shift) {
    case "morning":
      return hour >= 7 && hour < 15;
    case "afternoon":
      return hour >= 15 && hour < 23;
    case "night":
      return hour >= 23 || hour < 7;
    default:
      return false;
  }
}

export function getShiftBoundaries(shift: ShiftType): {
  start: Date;
  end: Date;
} {
  const now = new Date();
  const currentHour = now.getHours();
  let startHour: number;
  let endHour: number;

  switch (shift) {
    case "morning":
      startHour = 7;
      endHour = 15;
      break;
    case "afternoon":
      startHour = 15;
      endHour = 23;
      break;
    case "night":
      startHour = 23;
      endHour = 7;
      break;
  }

  const start = new Date(now);
  const end = new Date(now);

  if (endHour > startHour) {
    start.setHours(startHour, 0, 0, 0);
    end.setHours(endHour, 0, 0, 0);
  } else {
    if (currentHour >= startHour) {
      start.setHours(startHour, 0, 0, 0);
      end.setHours(endHour, 0, 0, 0);
      end.setDate(end.getDate() + 1);
    } else {
      start.setHours(startHour, 0, 0, 0);
      start.setDate(start.getDate() - 1);
      end.setHours(endHour, 0, 0, 0);
    }
  }

  return { start, end };
}

export function formatVisitTime(date: Date | number): string {
  return formatDateTime(date, false);
}

export function getDayLabel(date: Date = new Date()): string {
  if (isToday(date)) return "Hoy";
  if (isYesterday(date)) return "Ayer";
  return format(new Date(date), "EEEE, d MMM", { locale: es });
}
