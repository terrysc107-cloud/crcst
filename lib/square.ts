import { Client, Environment } from 'square'

let squareClient: Client | null = null

export function getSquareClient(): Client {
  if (squareClient) return squareClient

  const accessToken = process.env.SQUARE_ACCESS_TOKEN
  if (!accessToken) {
    throw new Error('SQUARE_ACCESS_TOKEN is not configured')
  }

  squareClient = new Client({
    accessToken,
    environment:
      process.env.SQUARE_ENVIRONMENT === 'production'
        ? Environment.Production
        : Environment.Sandbox,
  })

  return squareClient
}

export const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID!
export const SQUARE_APP_ID = process.env.NEXT_PUBLIC_SQUARE_APP_ID!

export const PLAN_PRICES = {
  pro: {
    amount: 1499n, // $14.99 in cents
    currency: 'USD',
    label: 'Pro Monthly',
    // Square catalog variation ID for the recurring subscription plan
    // Set SQUARE_PRO_PLAN_VARIATION_ID in your env after creating it in Square Dashboard
    planVariationId: process.env.SQUARE_PRO_PLAN_VARIATION_ID,
  },
  lifetime: {
    amount: 9900n, // $99.00 in cents
    currency: 'USD',
    label: 'Lifetime Access',
  },
} as const
