import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim();
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-EU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function riskScore(likelihood: string, severity: string): string {
  const levels: Record<string, number> = {
    minimal: 1,
    low: 2,
    medium: 3,
    high: 4,
    critical: 5,
  };
  const score = (levels[likelihood] || 1) * (levels[severity] || 1);
  if (score <= 4) return "low";
  if (score <= 9) return "medium";
  if (score <= 16) return "high";
  return "critical";
}
