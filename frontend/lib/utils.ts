import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Combine Tailwind classes with conditionals
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Capitalize first letter
export function capitalize(str: string): string {
  if (!str) return ""
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Format numbers as prices (USD by default)
export function formatPrice(amount: number, currency = "USD", locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}
