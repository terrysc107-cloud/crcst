import Stripe from "stripe"

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error("STRIPE_SECRET_KEY environment variable is not set")
    _stripe = new Stripe(key, { apiVersion: "2024-04-10" })
  }
  return _stripe
}

// Keep named export for backwards compatibility — lazily resolved at call time
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as any)[prop]
  },
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
})

export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
export const STRIPE_PRO_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || ""
export const STRIPE_TRIPLE_CROWN_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_TRIPLE_CROWN_PRICE_ID || ""

// Subscription tiers with 90-day expiry
export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: "Free",
    price: 0,
    certs: ["crcst"],
    durationDays: null, // Forever
  },
  PRO: {
    name: "Pro",
    price: 1900, // $19 one-time in cents
    certs: ["crcst"],
    durationDays: 90,
  },
  TRIPLE_CROWN: {
    name: "Triple Crown",
    price: 3900, // $39 one-time in cents
    certs: ["crcst", "chl", "cer"],
    durationDays: 90,
  },
}

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS

// Helper to check if tier is expired
export function isTierExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}

// Helper to get effective tier (returns FREE if expired)
export function getEffectiveTier(tier: SubscriptionTier, expiresAt: string | null): SubscriptionTier {
  if (tier === "FREE") return "FREE"
  if (isTierExpired(expiresAt)) return "FREE"
  return tier
}
