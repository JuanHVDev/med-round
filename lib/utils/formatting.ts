export function formatCurrency(
  value: number,
  currency: string = "MXN",
  locale: string = "es-MX"
): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(value).replace("MX$", "MXN ");
}

export function formatNumber(
  value: number,
  locale: string = "es-ES"
): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatPercentage(
  value: number,
  decimals: number = 0,
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phone;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  if (i >= units.length) return `${bytes} B`;

  const size = bytes / Math.pow(k, i);

  if (i === 0) return `${bytes} B`;

  return `${size % 1 === 0 ? size : size.toFixed(1)} ${units[i]}`;
}

export function truncateText(
  text: string,
  maxLength: number,
  suffix: string = "..."
): string {
  if (text.length <= maxLength) return text;
  if (maxLength <= suffix.length) return text.slice(0, maxLength);
  const segmenter = new Intl.Segmenter("es", { granularity: "grapheme" });
  const segments = Array.from(segmenter.segment(text));
  const truncatedLength = maxLength - suffix.length;
  let result = "";
  let charCount = 0;
  for (const segment of segments) {
    if (charCount >= truncatedLength) break;
    result += segment.segment;
    charCount++;
  }
  return result + suffix;
}

export function capitalizeFirst(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatInitials(name: string): string {
  if (!name) return "";
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 3)
    .join("");
}

export function pluralize(
  count: number,
  singular: string,
  plural: string
): string {
  return count === 1 ? singular : plural;
}

export function formatCount(
  count: number,
  singular: string,
  plural: string
): string {
  return `${formatNumber(count)} ${pluralize(count, singular, plural)}`;
}

export function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

export function highlightText(text: string, query: string): string {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}
