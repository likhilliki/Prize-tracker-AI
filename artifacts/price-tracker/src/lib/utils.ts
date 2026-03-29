import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(priceStr?: string) {
  if (!priceStr) return "N/A";
  // Clean up price string if needed, but usually we just display what was scraped
  return priceStr;
}
