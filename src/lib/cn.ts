import { clsx, type ClassValue } from 'clsx';

/** Joins conditional class names. Kept deliberately small (no tailwind-merge): primitives avoid conflicting variants. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
