/**
 * Utility formatters — YourMithila
 */

/** Format a 10-digit Indian phone number as +91 XXXXX XXXXX */
export function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, "");
  // Strip leading 91 if present
  const digits = clean.startsWith("91") && clean.length === 12 ? clean.slice(2) : clean;
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return phone; // return as-is if unrecognised format
}

/** Format a number as Indian currency (₹1,23,456) */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Truncate a string to n characters with ellipsis */
export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}

/** Format a date as DD MMM YYYY in Indian locale */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
