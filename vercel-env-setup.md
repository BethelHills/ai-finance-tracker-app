# Vercel Environment Variables Setup

## Required Environment Variables

Go to your Vercel dashboard → Project Settings → Environment Variables and add these:

### Supabase Configuration

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Encryption

```
NEXT_PUBLIC_ENCRYPTION_KEY=your-super-secure-encryption-key-32-chars-minimum
```

### Optional: Payment Providers (for future use)

```
PAYSTACK_SECRET_KEY=sk_test_your_paystack_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret
STRIPE_SECRET_KEY=sk_test_your_stripe_key
```

### Optional: AI Services

```
OPENAI_API_KEY=sk-your-openai-key
```

## How to Get Supabase Credentials:

1. Go to your Supabase project dashboard
2. Click on "Settings" → "API"
3. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Security Notes:

- Never commit these keys to your repository
- Use different keys for development and production
- Rotate keys regularly in production
- The encryption key should be at least 32 characters long
