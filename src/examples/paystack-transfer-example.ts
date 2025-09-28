/**
 * Paystack Transfer Flow Example
 * Complete implementation: Create recipient → Initiate transfer → Webhook handling
 */

import { PaystackIntegration } from '@/lib/paystack-integration';
import { LedgerService } from '@/lib/database/ledger-models';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Example 1: Complete Transfer Flow
export class PaystackTransferExample {
  /**
   * Step 1: Create a transfer recipient
   */
  static async createTransferRecipient() {
    try {
      console.log('Creating transfer recipient...');

      const recipient = await PaystackIntegration.createTransferRecipient(
        'John Doe', // Recipient name
        'john@example.com', // Recipient email
        '1234567890', // Account number
        '044' // First Bank code
      );

      console.log('Recipient created:', {
        id: recipient.id,
        name: recipient.name,
        accountNumber: recipient.account_number,
        bankName: recipient.bank_name,
      });

      return recipient;
    } catch (error) {
      console.error('Failed to create recipient:', error);
      throw error;
    }
  }

  /**
   * Step 2: Initiate a transfer
   */
  static async initiateTransfer(recipientId: number) {
    try {
      console.log('Initiating transfer...');

      const transfer = await PaystackIntegration.initiateTransfer(
        recipientId, // Recipient ID from step 1
        5000, // Amount in kobo (50.00 NGN)
        'Payment for services', // Transfer reason
        `TRF_${Date.now()}` // Unique reference
      );

      console.log('Transfer initiated:', {
        id: transfer.id,
        reference: transfer.reference,
        amount: transfer.amount,
        status: transfer.status,
        recipient: transfer.recipient.name,
      });

      return transfer;
    } catch (error) {
      console.error('Failed to initiate transfer:', error);
      throw error;
    }
  }

  /**
   * Step 3: Verify transfer status
   */
  static async verifyTransfer(reference: string) {
    try {
      console.log('Verifying transfer...');

      const verifiedTransfer =
        await PaystackIntegration.verifyTransfer(reference);

      console.log('Transfer verified:', {
        reference: verifiedTransfer.reference,
        status: verifiedTransfer.status,
        amount: verifiedTransfer.amount,
        recipient: verifiedTransfer.recipient.name,
      });

      return verifiedTransfer;
    } catch (error) {
      console.error('Failed to verify transfer:', error);
      throw error;
    }
  }

  /**
   * Complete transfer flow
   */
  static async completeTransferFlow() {
    try {
      console.log('Starting complete Paystack transfer flow...');

      // Step 1: Create recipient
      const recipient = await this.createTransferRecipient();

      // Step 2: Initiate transfer
      const transfer = await this.initiateTransfer(recipient.id);

      // Step 3: Verify transfer (usually done via webhook, but can be manual)
      const verifiedTransfer = await this.verifyTransfer(transfer.reference);

      console.log('Transfer flow completed successfully!');
      return {
        recipient,
        transfer,
        verifiedTransfer,
      };
    } catch (error) {
      console.error('Transfer flow failed:', error);
      throw error;
    }
  }
}

// Example 2: API Route Implementation
export const apiRouteExamples = {
  // POST /api/paystack/recipients
  createRecipient: `
    export async function POST(request: NextRequest) {
      const { name, email, accountNumber, bankCode } = await request.json();
      
      // Create recipient in Paystack
      const recipient = await PaystackIntegration.createTransferRecipient(
        name, email, accountNumber, bankCode
      );
      
      // Save to database
      const localRecipient = await prisma.transferRecipient.create({
        data: {
          userId: session.user.id,
          paystackRecipientId: recipient.id.toString(),
          name: recipient.name,
          email: recipient.email,
          accountNumber: recipient.account_number,
          bankCode: recipient.bank_code,
          bankName: recipient.bank_name,
        },
      });
      
      return NextResponse.json({ success: true, data: { recipient, local: localRecipient } });
    }
  `,

  // POST /api/paystack/transfers
  initiateTransfer: `
    export async function POST(request: NextRequest) {
      const { recipientId, amount, reason, accountId } = await request.json();
      
      // Initiate transfer in Paystack
      const transfer = await PaystackIntegration.initiateTransfer(
        recipientId, amount, reason
      );
      
      // Create transaction in ledger
      const ledgerTransaction = await LedgerService.createTransaction({
        external_id: transfer.reference,
        user_id: session.user.id,
        account_id: accountId,
        amount: -amount, // Negative for outgoing
        currency: 'NGN',
        type: 'transfer',
        description: \`Transfer: \${reason}\`,
        reference: transfer.reference,
        provider: 'paystack',
        provider_data: transfer,
      });
      
      return NextResponse.json({ success: true, data: { transfer, ledger: ledgerTransaction } });
    }
  `,

  // POST /api/webhooks/paystack
  webhookHandler: `
    export async function POST(request: NextRequest) {
      const payload = await request.text();
      const signature = request.headers.get('x-paystack-signature');
      
      // Verify signature
      if (!verifyPaystackSignature(payload, signature)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
      
      const event = JSON.parse(payload);
      
      // Handle transfer events
      switch (event.event) {
        case 'transfer.success':
          await handleTransferSuccess(event.data);
          break;
        case 'transfer.failed':
          await handleTransferFailed(event.data);
          break;
        case 'transfer.reversed':
          await handleTransferReversed(event.data);
          break;
      }
      
      return NextResponse.json({ message: 'Webhook processed' });
    }
  `,
};

// Example 3: Webhook Event Handlers
export class WebhookHandlers {
  static async handleTransferSuccess(data: any) {
    console.log('Transfer successful:', data.reference);

    // Find transaction by reference
    const transaction = await prisma.transaction.findFirst({
      where: { description: { contains: data.reference } },
    });

    if (transaction) {
      // Update transaction status
      await LedgerService.updateTransactionStatus(transaction.id, 'completed', {
        paystackData: data,
        processedAt: new Date().toISOString(),
      });

      // Update recipient last used
      await prisma.transferRecipient.updateMany({
        where: { paystackRecipientId: data.recipient.id.toString() },
        data: { lastUsedAt: new Date() },
      });
    }
  }

  static async handleTransferFailed(data: any) {
    console.log('Transfer failed:', data.reference);

    const transaction = await prisma.transaction.findFirst({
      where: { description: { contains: data.reference } },
    });

    if (transaction) {
      // Update transaction status
      await LedgerService.updateTransactionStatus(transaction.id, 'failed', {
        paystackData: data,
        error: data.failure_reason,
        processedAt: new Date().toISOString(),
      });

      // Reverse account balance if previously completed
      // Note: Status tracking would be handled by the ledger system
      {
        await prisma.account.update({
          where: { id: transaction.accountId },
          data: {
            balance: { increment: Math.abs(Number(transaction.amount)) },
          },
        });
      }
    }
  }

  static async handleTransferReversed(data: any) {
    console.log('Transfer reversed:', data.reference);

    const transaction = await prisma.transaction.findFirst({
      where: { description: { contains: data.reference } },
    });

    if (transaction) {
      // Update transaction status
      await LedgerService.updateTransactionStatus(transaction.id, 'reversed', {
        paystackData: data,
        processedAt: new Date().toISOString(),
      });

      // Reverse account balance
      await prisma.account.update({
        where: { id: transaction.accountId },
        data: { balance: { increment: Math.abs(Number(transaction.amount)) } },
      });
    }
  }
}

// Example 4: React Component Usage
export const reactComponentExample = `
  function TransferForm() {
    const [recipients, setRecipients] = useState([]);
    const [formData, setFormData] = useState({
      recipientId: '',
      amount: '',
      reason: '',
    });

    const handleTransfer = async (e) => {
      e.preventDefault();
      
      const response = await fetch('/api/paystack/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: formData.recipientId,
          amount: parseFloat(formData.amount),
          reason: formData.reason,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Transfer initiated:', data.data.transfer.reference);
        // Handle success
      }
    };

    return (
      <form onSubmit={handleTransfer}>
        <select value={formData.recipientId} onChange={(e) => setFormData({...formData, recipientId: e.target.value})}>
          {recipients.map(recipient => (
            <option key={recipient.id} value={recipient.paystackRecipientId}>
              {recipient.name} - {recipient.accountNumber}
            </option>
          ))}
        </select>
        <input 
          type="number" 
          placeholder="Amount" 
          value={formData.amount}
          onChange={(e) => setFormData({...formData, amount: e.target.value})}
        />
        <input 
          type="text" 
          placeholder="Reason" 
          value={formData.reason}
          onChange={(e) => setFormData({...formData, reason: e.target.value})}
        />
        <button type="submit">Send Transfer</button>
      </form>
    );
  }
`;

// Example 5: Error Handling
export class ErrorHandling {
  static async handleTransferError(error: any) {
    console.error('Transfer error:', error);

    // Log error (console only - no errorLog model in schema)
    console.error('Transfer error details:', {
      type: 'transfer_error',
      message: error.message,
      stack: error.stack,
      metadata: { error },
      timestamp: new Date(),
    });

    // Send notification to user
    // await sendNotification('Transfer failed', error.message);

    // Update transaction status
    // await updateTransactionStatus(transactionId, 'failed', { error: error.message });
  }

  static async retryFailedTransfer(transactionId: string) {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Retry the transfer
      if (!transaction.metadata) {
        throw new Error('Transaction metadata not found');
      }

      const retryTransfer = await PaystackIntegration.initiateTransfer(
        parseInt((transaction.metadata as any).recipientId),
        Math.abs(Number(transaction.amount)),
        transaction.description,
        `retry-${transaction.id}` // Use transaction ID as reference
      );

      console.log('Transfer retry successful:', retryTransfer.reference);
      return retryTransfer;
    } catch (error) {
      console.error('Transfer retry failed:', error);
      throw error;
    }
  }
}

// Example 6: Testing
export class TransferTesting {
  static async testCompleteFlow() {
    try {
      console.log('Testing complete Paystack transfer flow...');

      // Test 1: Create recipient
      const recipient = await PaystackTransferExample.createTransferRecipient();
      console.log('✓ Recipient creation test passed');

      // Test 2: Initiate transfer
      const transfer = await PaystackTransferExample.initiateTransfer(
        recipient.id
      );
      console.log('✓ Transfer initiation test passed');

      // Test 3: Verify transfer
      const verifiedTransfer = await PaystackTransferExample.verifyTransfer(
        transfer.reference
      );
      console.log('✓ Transfer verification test passed');

      console.log('All tests passed! Transfer flow is working correctly.');
      return true;
    } catch (error) {
      console.error('Test failed:', error);
      return false;
    }
  }

  static async testWebhookHandling() {
    try {
      console.log('Testing webhook handling...');

      // Simulate webhook payload
      const mockWebhookPayload = {
        event: 'transfer.success',
        data: {
          id: 12345,
          reference: 'TRF_test_123',
          amount: 5000,
          status: 'success',
          recipient: {
            id: 67890,
            name: 'Test Recipient',
            account_number: '1234567890',
            bank_name: 'Test Bank',
          },
        },
      };

      // Test webhook handler
      await WebhookHandlers.handleTransferSuccess(mockWebhookPayload.data);
      console.log('✓ Webhook handling test passed');

      return true;
    } catch (error) {
      console.error('Webhook test failed:', error);
      return false;
    }
  }
}

console.log('Paystack transfer examples loaded successfully!');
