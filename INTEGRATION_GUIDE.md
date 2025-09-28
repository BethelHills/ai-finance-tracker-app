# 🔗 Integration Guide - AI Finance Tracker

This guide provides practical examples and templates for integrating with external services in your AI Finance Tracker application.

## 📋 Table of Contents

1. [Plaid Integration](#plaid-integration)
2. [Paystack Integration](#paystack-integration)
3. [Webhook Handling](#webhook-handling)
4. [Database Ledger Models](#database-ledger-models)
5. [Environment Setup](#environment-setup)
6. [Complete Integration Examples](#complete-integration-examples)

## 🏦 Plaid Integration

### React Component Example

```tsx
import {
  PlaidLinkComponent,
  usePlaidLinkManager,
} from '@/components/plaid/plaid-link-component';

function BankLinkingPage() {
  const { linkToken, isLoading, error, createLinkToken, exchangePublicToken } =
    usePlaidLinkManager();

  const handleSuccess = async (publicToken: string, metadata: any) => {
    try {
      const result = await exchangePublicToken(publicToken);
      console.log('Account linked successfully!');
    } catch (error) {
      console.error('Failed to link account:', error);
    }
  };

  return (
    <PlaidLinkComponent
      linkToken={linkToken}
      onSuccess={handleSuccess}
      onExit={(error, metadata) => {
        if (error) console.error('Plaid Link error:', error);
      }}
    />
  );
}
```

### Server Endpoints

#### Create Link Token

```typescript
// POST /api/plaid/link-token
export async function POST(request: NextRequest) {
  const { userId } = await request.json();

  const linkToken = await PlaidService.createLinkToken(userId);

  return NextResponse.json({ link_token: linkToken });
}
```

#### Exchange Public Token

```typescript
// POST /api/plaid/exchange-token
export async function POST(request: NextRequest) {
  const { public_token } = await request.json();

  const { accessToken, itemId } =
    await PlaidService.exchangePublicToken(public_token);

  // Update user with access token
  await prisma.user.update({
    where: { id: session.user.id },
    data: { plaidAccessToken: accessToken, plaidItemId: itemId },
  });

  return NextResponse.json({ success: true });
}
```

## 💳 Paystack Integration

### Transfer Flow Example

```typescript
import { PaystackIntegration } from '@/lib/paystack-integration';

// 1. List banks
const banks = await PaystackIntegration.listBanks();

// 2. Create transfer recipient
const recipient = await PaystackIntegration.createTransferRecipient(
  'John Doe',
  'john@example.com',
  '1234567890',
  '044' // First Bank code
);

// 3. Initiate transfer
const transfer = await PaystackIntegration.initiateTransfer(
  recipient.id,
  5000, // 50.00 NGN (in kobo)
  'Payment for services',
  `TRF_${Date.now()}`
);

// 4. Verify transfer
const verifiedTransfer = await PaystackIntegration.verifyTransfer(
  transfer.reference
);
```

### Payment Request Example

```typescript
// Create payment request
const paymentRequest = await PaystackIntegration.createPaymentRequest(
  'customer@example.com',
  10000, // 100.00 NGN
  `PAY_${Date.now()}`,
  'Payment for product',
  'https://yourapp.com/payment/callback'
);

console.log('Payment URL:', paymentRequest.authorization_url);
```

## 🔔 Webhook Handling

### Paystack Webhook Handler

```typescript
// POST /api/webhooks/paystack
export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get('x-paystack-signature');

  // Verify signature
  if (!verifyPaystackSignature(payload, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(payload);

  // Check idempotency
  if (processedWebhooks.has(event.data?.id)) {
    return NextResponse.json({ message: 'Already processed' });
  }

  // Handle event
  switch (event.event) {
    case 'charge.success':
      await handleChargeSuccess(event.data);
      break;
    case 'transfer.success':
      await handleTransferSuccess(event.data);
      break;
  }

  return NextResponse.json({ message: 'Webhook processed' });
}
```

### Signature Verification

```typescript
function verifyPaystackSignature(payload: string, signature: string): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY!;
  const hash = crypto
    .createHmac('sha512', secret)
    .update(payload)
    .digest('hex');

  return hash === signature;
}
```

## 🗄️ Database Ledger Models

### Transaction Model

```typescript
interface LedgerTransaction {
  id: string;
  external_id: string; // Plaid transaction ID, Paystack reference, etc.
  user_id: string;
  account_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'reversed' | 'cancelled';
  type: 'income' | 'expense' | 'transfer' | 'payment' | 'refund';
  description: string;
  reference: string; // Internal reference
  provider: 'plaid' | 'paystack' | 'flutterwave' | 'stripe' | 'manual';
  provider_data: JsonValue; // Raw provider data
  metadata: JsonValue; // Additional metadata
  created_at: Date;
  updated_at: Date;
  processed_at?: Date;
  reconciled_at?: Date;
}
```

### Ledger Service Example

```typescript
import { LedgerService } from '@/lib/database/ledger-models';

// Create transaction
const transaction = await LedgerService.createTransaction({
  external_id: `TXN_${Date.now()}`,
  user_id: 'user_123',
  account_id: 'account_456',
  amount: 100.0,
  currency: 'USD',
  type: 'income',
  description: 'Salary payment',
  reference: `REF_${Date.now()}`,
  provider: 'manual',
  metadata: { source: 'salary' },
});

// Update transaction status
await LedgerService.updateTransactionStatus(transaction.id, 'completed', {
  paystackData: webhookData,
});

// Get transaction stats
const stats = await LedgerService.getTransactionStats(
  userId,
  startDate,
  endDate
);
```

## ⚙️ Environment Setup

### Required Environment Variables

```bash
# Plaid
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox
PLAID_WEBHOOK_SECRET=your_plaid_webhook_secret

# Paystack
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret

# Flutterwave
FLUTTERWAVE_SECRET_KEY=FLWSECK_test_your_secret_key
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_test_your_public_key

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/ai_finance_tracker

# Redis (for webhook idempotency)
REDIS_URL=redis://localhost:6379

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# OpenAI
OPENAI_API_KEY=sk-your_openai_api_key
```

### Prisma Schema Updates

```prisma
model Transaction {
  id            String   @id @default(cuid())
  external_id   String   @unique
  user_id       String
  account_id    String
  amount        Decimal
  currency      String   @default("USD")
  status        TransactionStatus @default(pending)
  type          TransactionType
  description   String
  reference     String   @unique
  provider      Provider
  provider_data Json?
  metadata      Json?
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt
  processed_at  DateTime?
  reconciled_at DateTime?

  user    User    @relation(fields: [user_id], references: [id], onDelete: Cascade)
  account Account @relation(fields: [account_id], references: [id], onDelete: Cascade)

  @@map("transactions")
}

model Account {
  id                  String   @id @default(cuid())
  user_id             String
  name                String
  type                AccountType
  balance             Decimal  @default(0)
  currency            String   @default("USD")
  provider            Provider
  provider_account_id String?
  is_active           Boolean  @default(true)
  created_at          DateTime @default(now())
  updated_at          DateTime @updatedAt
  last_synced_at      DateTime?

  user         User          @relation(fields: [user_id], references: [id], onDelete: Cascade)
  transactions Transaction[]
  ledgerEntries LedgerEntry[]

  @@map("accounts")
}

model LedgerEntry {
  id            String   @id @default(cuid())
  transaction_id String
  account_id    String
  user_id       String
  amount        Decimal
  balance_after Decimal
  type          LedgerType
  description   String
  reference     String
  created_at    DateTime @default(now())

  transaction Transaction @relation(fields: [transaction_id], references: [id], onDelete: Cascade)
  account     Account     @relation(fields: [account_id], references: [id], onDelete: Cascade)
  user        User        @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@map("ledger_entries")
}

enum TransactionStatus {
  pending
  completed
  failed
  reversed
  cancelled
}

enum TransactionType {
  income
  expense
  transfer
  payment
  refund
}

enum AccountType {
  checking
  savings
  credit
  investment
  cash
  crypto
}

enum Provider {
  plaid
  paystack
  flutterwave
  stripe
  manual
}

enum LedgerType {
  debit
  credit
}
```

## 🚀 Complete Integration Examples

### Full User Onboarding Flow

```typescript
import { CompleteIntegrationExample } from '@/examples/integration-examples';

// Complete user onboarding
const onboardingResult = await CompleteIntegrationExample.fullUserOnboarding(
  'user_123',
  'user@example.com'
);

console.log('Onboarding complete:', onboardingResult);
```

### React Component Integration

```tsx
import { IntegrationReactExample } from '@/examples/integration-examples';

function MyApp() {
  return (
    <div>
      <h1>AI Finance Tracker</h1>
      <IntegrationReactExample />
    </div>
  );
}
```

## 🔧 Implementation Steps

### 1. Install Dependencies

```bash
npm install react-plaid-link @paystack/paystack-sdk flutterwave-node-v3
npm install -D @types/node
```

### 2. Set Up Environment Variables

Copy the environment variables to your `.env.local` file and fill in your API keys.

### 3. Update Database Schema

Run the Prisma migration to update your database schema:

```bash
npx prisma db push
```

### 4. Implement Webhook Handlers

Set up webhook endpoints for each provider:

- `/api/webhooks/paystack` - Paystack webhooks
- `/api/webhooks/plaid` - Plaid webhooks
- `/api/webhooks/flutterwave` - Flutterwave webhooks

### 5. Test Integrations

Use the provided examples to test each integration:

```typescript
// Test Plaid integration
await PlaidIntegrationExample.completePlaidFlow('user_123');

// Test Paystack integration
await PaystackTransferExample.completeTransferFlow();

// Test ledger operations
await LedgerExample.createTransaction();
```

## 📚 Additional Resources

- [Plaid Documentation](https://plaid.com/docs/)
- [Paystack Documentation](https://paystack.com/docs/)
- [Flutterwave Documentation](https://developer.flutterwave.com/docs/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Prisma Documentation](https://www.prisma.io/docs/)

## 🛡️ Security Considerations

1. **Always verify webhook signatures** before processing
2. **Use idempotency keys** to prevent duplicate processing
3. **Store sensitive data encrypted** in the database
4. **Implement rate limiting** on API endpoints
5. **Use HTTPS** for all webhook endpoints
6. **Validate all input data** before processing
7. **Log all webhook events** for audit purposes

## 🐛 Troubleshooting

### Common Issues

1. **Plaid Link not opening**: Check if link token is valid and not expired
2. **Paystack transfers failing**: Verify recipient details and account numbers
3. **Webhook signature verification failing**: Check secret key configuration
4. **Database connection issues**: Verify DATABASE_URL and Prisma configuration

### Debug Tips

1. Enable detailed logging in development
2. Use webhook testing tools (ngrok, webhook.site)
3. Check provider dashboards for transaction status
4. Verify API keys and environment variables
5. Test with sandbox/test environments first

---

This integration guide provides everything you need to implement production-ready financial integrations in your AI Finance Tracker application! 🚀
