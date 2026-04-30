import { Plan } from "@/generated/prisma"

export function isPremiumPlan(plan: Plan | string | null | undefined): boolean {
  if (!plan) return false
  return plan === "PROFESSIONAL" || plan === "COURTESY"
}
