import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert numbers like 0.7758 to "77.6%"
export function formatPercentage(val: number): string {
  return (val * 100).toFixed(1) + "%";
}

// Ensure array data isn't typed as unknown[] for charts
export function safelyCast<T>(data: unknown): T {
  return data as T;
}
