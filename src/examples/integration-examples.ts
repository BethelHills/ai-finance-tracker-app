/**
 * Integration Examples
 * Practical examples of how to use the implemented integrations
 */

import { PlaidLinkComponent, usePlaidLinkManager } from '@/components/plaid/plaid-link-component';
import { PaystackIntegration } from '@/lib/paystack-integration';
import { LedgerService } from '@/lib/database/ledger-models';

// Example 1: Complete Plaid Integration Flow
export class PlaidIntegrationExample {
  static async completePlaidFlow(userId: string) {
    try {
      // 1. Create link token
      const response = await fetch('/api/plaid/link-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      
      const { link_token } = await response.json();
      
      // 2. Use PlaidLinkComponent in your React component
      // This would be in your JSX:
      /*
      <PlaidLinkComponent
        linkToken={link_token}
        onSuccess={async (publicToken, metadata) => {
          // 3. Exchange public token
          const exchangeResponse = await fetch('/api/plaid/exchange-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ public_token: publicToken }),
          });
          
          const { accessToken, itemId } = await exchangeResponse.json();
          
          // 4. Fetch accounts and transactions
          const accountsResponse = await fetch('/api/plaid/accounts');
          const transactionsResponse = await fetch('/api/plaid/transactions');
          
          console.log('Plaid integration complete!');
        }}
        onExit={(error, metadata) => {
          if (error) {
            console.error('Plaid Link error:', error);
          }
        }}
      />
      */
      
      return { link_token };
    } catch (error) {
      console.error('Plaid integration failed:', error);
      throw error;
    }
  }
}

// Example 2: Paystack Transfer Flow
export class PaystackTransferExample {
  static async completeTransferFlow() {
    try {
      // 1. List banks
      const banks = await PaystackIntegration.listBanks();
      console.log('Available banks:', banks.length);
      
      // 2. Create transfer recipient
      const recipient = await PaystackIntegration.createTransferRecipient(
        'John Doe',
        'john@example.com',
        '1234567890',
        '044' // First Bank code
      );
      console.log('Recipient created:', recipient.id);
      
      // 3. Initiate transfer
      const transfer = await PaystackIntegration.initiateTransfer(
        recipient.id,
        5000, // 50.00 NGN (in kobo)
        'Payment for services',
        `TRF_${Date.now()}`
      );
      console.log('Transfer initiated:', transfer.reference);
      
      // 4. Verify transfer
      const verifiedTransfer = await PaystackIntegration.verifyTransfer(
        transfer.reference
      );
      console.log('Transfer status:', verifiedTransfer.status);
      
      return verifiedTransfer;
    } catch (error) {
      console.error('Paystack transfer failed:', error);
      throw error;
    }
  }
  
  static async createPaymentRequest() {
    try {
      // Create payment request
      const paymentRequest = await PaystackIntegration.createPaymentRequest(
        'customer@example.com',
        10000, // 100.00 NGN
        `PAY_${Date.now()}`,
        'Payment for product',
        'https://yourapp.com/payment/callback'
      );
      
      console.log('Payment URL:', paymentRequest.authorization_url);
      return paymentRequest;
    } catch (error) {
      console.error('Payment request creation failed:', error);
      throw error;
    }
  }
}

// Example 3: Webhook Handling
export class WebhookExample {
  static async handlePaystackWebhook(payload: string, signature: string) {
    try {
      // Verify signature
      const crypto = require('crypto');
      const secret = process.env.PAYSTACK_SECRET_KEY!;
      const hash = crypto
        .createHmac('sha512', secret)
        .update(payload)
        .digest('hex');
      
      if (hash !== signature) {
        throw new Error('Invalid signature');
      }
      
      const event = JSON.parse(payload);
      console.log('Processing webhook event:', event.event);
      
      // Handle different event types
      switch (event.event) {
        case 'charge.success':
          await this.handleChargeSuccess(event.data);
          break;
        case 'transfer.success':
          await this.handleTransferSuccess(event.data);
          break;
        default:
          console.log('Unhandled event:', event.event);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Webhook handling failed:', error);
      throw error;
    }
  }
  
  private static async handleChargeSuccess(data: any) {
    // Update transaction in ledger
    await LedgerService.updateTransactionStatus(
      data.reference,
      'completed',
      { paystackData: data }
    );
  }
  
  private static async handleTransferSuccess(data: any) {
    // Update transfer status
    await LedgerService.updateTransactionStatus(
      data.reference,
      'completed',
      { paystackData: data }
    );
  }
}

// Example 4: Ledger Operations
export class LedgerExample {
  static async createTransaction() {
    try {
      // Create a new transaction
      const transaction = await LedgerService.createTransaction({
        external_id: `TXN_${Date.now()}`,
        user_id: 'user_123',
        account_id: 'account_456',
        amount: 100.00,
        currency: 'USD',
        type: 'income',
        description: 'Salary payment',
        reference: `REF_${Date.now()}`,
        provider: 'manual',
        metadata: {
          source: 'salary',
          department: 'engineering',
        },
      });
      
      console.log('Transaction created:', transaction.id);
      return transaction;
    } catch (error) {
      console.error('Transaction creation failed:', error);
      throw error;
    }
  }
  
  static async getTransactionStats(userId: string) {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const endDate = new Date();
      
      const stats = await LedgerService.getTransactionStats(
        userId,
        startDate,
        endDate
      );
      
      console.log('Transaction stats:', stats);
      return stats;
    } catch (error) {
      console.error('Failed to get transaction stats:', error);
      throw error;
    }
  }
  
  static async reconcileAccount(accountId: string) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const endDate = new Date();
      
      const reconciliation = await LedgerService.reconcileTransactions(
        'user_123',
        accountId,
        startDate,
        endDate
      );
      
      console.log('Reconciliation results:', reconciliation);
      return reconciliation;
    } catch (error) {
      console.error('Reconciliation failed:', error);
      throw error;
    }
  }
}

// Example 5: Complete Integration Flow
export class CompleteIntegrationExample {
  static async fullUserOnboarding(userId: string, userEmail: string) {
    try {
      console.log('Starting complete user onboarding...');
      
      // 1. Create user account
      const account = await LedgerService.createAccount({
        user_id: userId,
        name: 'Primary Checking',
        type: 'checking',
        balance: 0,
        currency: 'USD',
        provider: 'manual',
      });
      
      // 2. Set up Plaid integration
      const plaidFlow = await PlaidIntegrationExample.completePlaidFlow(userId);
      
      // 3. Set up Paystack for Nigerian payments
      const banks = await PaystackIntegration.listBanks();
      
      // 4. Create initial transaction
      const transaction = await LedgerExample.createTransaction();
      
      // 5. Get initial stats
      const stats = await LedgerExample.getTransactionStats(userId);
      
      console.log('User onboarding complete!');
      return {
        account,
        plaidLinkToken: plaidFlow.link_token,
        availableBanks: banks.length,
        transaction,
        stats,
      };
    } catch (error) {
      console.error('User onboarding failed:', error);
      throw error;
    }
  }
}

// Example 6: React Component Integration
export const IntegrationReactExample = () => {
  const { 
    linkToken, 
    isLoading, 
    error, 
    createLinkToken, 
    exchangePublicToken 
  } = usePlaidLinkManager();
  
  const handlePlaidSuccess = async (publicToken: string, metadata: any) => {
    try {
      // Exchange token
      const result = await exchangePublicToken(publicToken);
      
      // Create ledger transaction
      await LedgerService.createTransaction({
        external_id: metadata.transaction_id,
        user_id: 'user_123',
        account_id: 'account_456',
        amount: 100.00,
        currency: 'USD',
        type: 'income',
        description: 'Plaid transaction',
        reference: `PLAID_${Date.now()}`,
        provider: 'plaid',
        provider_data: metadata,
      });
      
      console.log('Plaid integration successful!');
    } catch (error) {
      console.error('Plaid integration failed:', error);
    }
  };
  
  return (
    <div>
      <PlaidLinkComponent
        linkToken={linkToken}
        onSuccess={handlePlaidSuccess}
        disabled={isLoading}
      />
      {error && <div>Error: {error}</div>}
    </div>
  );
};

// Example 7: Webhook Handler Implementation
export const webhookHandler = async (request: Request) => {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-paystack-signature');
    
    if (!signature) {
      return new Response('Missing signature', { status: 400 });
    }
    
    const result = await WebhookExample.handlePaystackWebhook(payload, signature);
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return new Response('Webhook processing failed', { status: 500 });
  }
};

// Example 8: Database Schema Updates
export const databaseSchemaExample = `
-- Add to your Prisma schema

model Transaction {
  id            String   @id @default(cuid())
  external_id   String   @unique // Plaid transaction ID, Paystack reference, etc.
  user_id       String
  account_id    String
  amount        Decimal
  currency      String   @default("USD")
  status        TransactionStatus @default(pending)
  type          TransactionType
  description   String
  reference     String   @unique // Internal reference
  provider      Provider
  provider_data Json?    // Raw provider data
  metadata      Json?    // Additional metadata
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
  provider_account_id String?  // Plaid account ID, etc.
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

model WebhookEvent {
  id           String   @id @default(cuid())
  provider     Provider
  event_type   String
  payload      Json
  processed    Boolean  @default(false)
  processed_at DateTime?
  error        String?
  created_at   DateTime @default(now())
  
  @@map("webhook_events")
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
`;

// Example 9: Environment Variables
export const environmentVariablesExample = `
# Add to your .env.local

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
`;

console.log('Integration examples loaded successfully!');
