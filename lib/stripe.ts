import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-04-10",
})

export const STRIPE_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || ""
export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""

// Subscription tiers
export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: "Free",
    price: 0,
    practiceQuestionsPerHour: 20,
    flashcardsPerHour: 1,
    aiChatsPerDay: 5,
  },
  PRO: {
    name: "Pro",
    price: 999, // $9.99/month in cents
    practiceQuestionsPerHour: -1, // unlimited
    flashcardsPerHour: -1, // unlimited
    aiChatsPerDay: -1, // unlimited
  },
  LIFETIME: {
    name: "Lifetime",
    price: 4999, // $49.99 one-time in cents
    practiceQuestionsPerHour: -1, // unlimited
    flashcardsPerHour: -1, // unlimited
    aiChatsPerDay: -1, // unlimited
  },
}

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS
