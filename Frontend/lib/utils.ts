import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Truncate a string (or number) to at most `max` characters.
 * @param input  The value to truncate
 * @param max    Maximum length (default: 11)
 */
export function truncate(input: string | number, max = 11): string {
  const s = String(input);
  return s.length <= max ? s : s.slice(0, max);
}