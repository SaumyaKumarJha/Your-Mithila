/**
 * Shared label and icon maps for property types, job types, org types, etc.
 * Import from here instead of defining inline in components.
 */

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

export const PROPERTY_TYPE_ICONS: Record<string, string> = {
  FLAT: "🏢",
  ROOM: "🛏️",
  HOUSE: "🏠",
  SHOP: "🏪",
  LAND: "🌿",
  WAREHOUSE: "🏭",
  OFFICE: "💼",
  VACANT_SPACE: "📦",
};

export const PURPOSE_LABELS: Record<string, string> = {
  RENT: "Rent",
  SALE: "Sale",
};

export const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACT: "Contract",
  DAILY_WAGE: "Daily Wage",
};

export const ORG_TYPE_CONFIG: Record<string, { icon: string; bg: string; color: string }> = {
  HOTEL:    { icon: "🏨", bg: "bg-orange-100 dark:bg-orange-950", color: "text-orange-700 dark:text-orange-300" },
  HOSPITAL: { icon: "🏥", bg: "bg-red-100 dark:bg-red-950",      color: "text-red-700 dark:text-red-300"      },
  SCHOOL:   { icon: "🏫", bg: "bg-blue-100 dark:bg-blue-950",    color: "text-blue-700 dark:text-blue-300"    },
  SHOP:     { icon: "🏪", bg: "bg-green-100 dark:bg-green-950",  color: "text-green-700 dark:text-green-300"  },
  FACTORY:  { icon: "🏭", bg: "bg-gray-100 dark:bg-gray-800",    color: "text-gray-700 dark:text-gray-300"    },
  OFFICE:   { icon: "🏢", bg: "bg-purple-100 dark:bg-purple-950",color: "text-purple-700 dark:text-purple-300"},
  HOME:     { icon: "🏠", bg: "bg-yellow-100 dark:bg-yellow-950",color: "text-yellow-700 dark:text-yellow-300"},
  OTHER:    { icon: "💼", bg: "bg-violet-100 dark:bg-violet-950",color: "text-violet-700 dark:text-violet-300"},
};

export const PRICE_UNIT_LABELS: Record<string, string> = {
  MONTHLY: "/month",
  YEARLY: "/year",
  TOTAL: "",
  DAILY: "/day",
};

export function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, "");
  if (clean.length === 10) return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
  if (clean.length === 12 && clean.startsWith("91")) {
    return `+91 ${clean.slice(2, 7)} ${clean.slice(7)}`;
  }
  return phone;
}
