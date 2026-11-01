import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, unit?: string): string {
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
  if (!unit) return formatted;
  const unitMap: Record<string, string> = {
    MONTHLY: "/month",
    YEARLY: "/year",
    TOTAL: "",
    DAILY: "/day",
  };
  return `${formatted}${unitMap[unit] ?? ""}`;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const clean = phone.replace(/\D/g, "");
  const number = clean.startsWith("91") ? clean : `91${clean}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}

export const LOCALITIES = [
  "Rajnagar", "Lakhnaur", "Benipatti", "Andharatharhi",
  "Phulparas", "Jaynagar", "Bisfi", "Madhubani Sadar",
  "Pandaul", "Harlakhi", "Khajauli", "Ladania",
];

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  FLAT: "Flat",
  ROOM: "Room",
  HOUSE: "House",
  SHOP: "Shop",
  LAND: "Land",
  WAREHOUSE: "Warehouse",
  OFFICE: "Office",
  VACANT_SPACE: "Vacant Space",
};

export const PROPERTY_TYPE_LABELS_HI: Record<string, string> = {
  FLAT: "फ्लैट",
  ROOM: "कमरा",
  HOUSE: "मकान",
  SHOP: "दुकान",
  LAND: "जमीन",
  WAREHOUSE: "गोदाम",
  OFFICE: "ऑफिस",
  VACANT_SPACE: "खाली जगह",
};
