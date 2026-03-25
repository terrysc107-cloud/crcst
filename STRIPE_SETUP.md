# Stripe Configuration

Add the following environment variables to your Vercel project:

## Public Environment Variables (visible to client)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key (starts with `pk_`)
- `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` - Price ID for Pro monthly subscription (from Stripe Dashboard)
- `NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID` - Price ID for Lifetime one-time purchase (from Stripe Dashboard)
- `NEXT_PUBLIC_APP_URL` - Your app URL (e.g., `https://yourapp.com`)

## Secret Environment Variables (server-only)
- `STRIPE_SECRET_KEY` - Your Stripe secret key (starts with `sk_`)
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret (from Stripe Webhooks settings)

## Setup Instructions

### 1. Create Stripe Account
- Go to https://stripe.com and create an account
- Go to API Keys page and copy your publishable and secret keys

### 2. Create Products and Prices
In Stripe Dashboard:
1. Go to Products → Create Product
   - Name: "Pro Monthly"
   - Price: $9.99/month (recurring)
2. Go to Products → Create Product
   - Name: "Lifetime Access"
   - Price: $49.99 (one-time)

Copy the Price IDs from each product.

### 3. Set Up Webhooks
1. Go to Webhooks in Stripe Dashboard
2. Add endpoint: `https://yourapp.com/api/payment/stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the Webhook Signing Secret

### 4. Add to Vercel
In your Vercel project settings → Environment Variables, add all the keys above.

## Testing in Development

For local testing, you can use Stripe's test keys:
- Test Publishable Key: `pk_test_...`
- Test Secret Key: `sk_test_...`

Use these test card numbers:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Expiry: Any future date
- CVC: Any 3 digits

## Database Schema Updates

The `subscriptions` table needs these columns:
- `id` (UUID, user ID)
- `tier` (text: 'free', 'pro', 'lifetime')
- `stripe_customer_id` (text)
- `stripe_subscription_id` (text, nullable)
- `status` (text: 'active', 'cancelled', 'past_due')
- `current_period_start` (timestamp)
- `current_period_end` (timestamp)
- `created_at` (timestamp)
- `updated_at` (timestamp)

The `daily_usage` table needs:
- `user_id` (UUID)
- `created_at` (timestamp, default now)
- `questions_attempted` (integer, default 0)
- `ai_chats_used` (integer, default 0)
