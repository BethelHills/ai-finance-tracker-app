import Paystack from '@paystack/paystack-sdk';

// Initialize Paystack client
const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY!);

export interface PaystackRecipient {
  id: number;
  name: string;
  email: string;
  account_number: string;
  bank_code: string;
  bank_name: string;
  created_at: string;
}

export interface PaystackTransfer {
  id: number;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  recipient: PaystackRecipient;
  created_at: string;
}

export interface PaystackBank {
  id: number;
  name: string;
  code: string;
  longcode: string;
  gateway: string | null;
  pay_with_bank: boolean;
  active: boolean;
  country: string;
  currency: string;
  type: string;
}

export class PaystackIntegration {
  /**
   * List all Nigerian banks
   */
  static async listBanks(): Promise<PaystackBank[]> {
    try {
      const response = await paystack.misc.listBanks();
      return response.data;
    } catch (error) {
      console.error('Error listing banks:', error);
      throw new Error('Failed to list banks');
    }
  }

  /**
   * Create a transfer recipient
   */
  static async createTransferRecipient(
    name: string,
    email: string,
    accountNumber: string,
    bankCode: string
  ): Promise<PaystackRecipient> {
    try {
      const response = await paystack.transferRecipient.create({
        type: 'nuban',
        name,
        email,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: 'NGN',
      });

      return {
        id: response.data.id,
        name: response.data.name,
        email: 'noreply@example.com',
        account_number: response.data.details.account_number,
        bank_code: response.data.details.bank_code,
        bank_name: response.data.details.bank_name,
        created_at: response.data.createdAt,
      };
    } catch (error) {
      console.error('Error creating transfer recipient:', error);
      throw new Error('Failed to create transfer recipient');
    }
  }

  /**
   * Initiate a transfer
   */
  static async initiateTransfer(
    recipientId: number,
    amount: number,
    reason: string,
    reference?: string
  ): Promise<PaystackTransfer> {
    try {
      const response = await paystack.transfer.initiate({
        source: 'balance',
        amount: amount * 100, // Convert to kobo
        recipient: recipientId.toString(),
        reason,
        currency: 'NGN',
        reference: reference || `TRF_${Date.now()}`,
      });

      const transferData = response.data as any;

      return {
        id: transferData.id,
        reference: transferData.reference,
        amount: transferData.amount,
        currency: transferData.currency,
        status: transferData.status,
        recipient: {
          id: transferData.recipient.id,
          name: transferData.recipient.name,
          email: transferData.recipient.email || '',
          account_number: transferData.recipient.details.account_number,
          bank_code: transferData.recipient.details.bank_code,
          bank_name: transferData.recipient.details.bank_name,
          created_at: transferData.recipient.createdAt,
        },
        created_at: transferData.createdAt,
      };
    } catch (error) {
      console.error('Error initiating transfer:', error);
      throw new Error('Failed to initiate transfer');
    }
  }

  /**
   * Verify a transfer
   */
  static async verifyTransfer(reference: string): Promise<PaystackTransfer> {
    try {
      const response = await paystack.transfer.verify(reference);

      const transferData = response.data as any;

      return {
        id: transferData.id,
        reference: transferData.reference,
        amount: transferData.amount,
        currency: transferData.currency,
        status: transferData.status,
        recipient: {
          id: transferData.recipient.id,
          name: transferData.recipient.name,
          email: transferData.recipient.email || '',
          account_number: transferData.recipient.details.account_number,
          bank_code: transferData.recipient.details.bank_code,
          bank_name: transferData.recipient.details.bank_name,
          created_at: transferData.recipient.createdAt,
        },
        created_at: transferData.createdAt,
      };
    } catch (error) {
      console.error('Error verifying transfer:', error);
      throw new Error('Failed to verify transfer');
    }
  }

  /**
   * List all transfers
   */
  static async listTransfers(
    page: number = 1,
    perPage: number = 50
  ): Promise<{ transfers: PaystackTransfer[]; total: number }> {
    try {
      const response = await (paystack.transfer as any).list({
        page,
        perPage,
      });

      const transfers = response.data.map((transfer: any) => ({
        id: transfer.id,
        reference: transfer.reference,
        amount: transfer.amount,
        currency: transfer.currency,
        status: transfer.status,
        recipient: {
          id: transfer.recipient.id,
          name: transfer.recipient.name,
          email: transfer.recipient.email || '',
          account_number: transfer.recipient.details.account_number,
          bank_code: transfer.recipient.details.bank_code,
          bank_name: transfer.recipient.details.bank_name,
          created_at: transfer.recipient.createdAt,
        },
        created_at: transfer.createdAt,
      }));

      return {
        transfers,
        total: response.meta.total,
      };
    } catch (error) {
      console.error('Error listing transfers:', error);
      throw new Error('Failed to list transfers');
    }
  }

  /**
   * Get transfer recipient by ID
   */
  static async getTransferRecipient(
    recipientId: number
  ): Promise<PaystackRecipient> {
    try {
      const response = await (paystack.transferRecipient as any).fetch(
        recipientId.toString()
      );

      return {
        id: response.data.id,
        name: response.data.name,
        email: 'noreply@example.com',
        account_number: response.data.details.account_number,
        bank_code: response.data.details.bank_code,
        bank_name: response.data.details.bank_name,
        created_at: response.data.createdAt,
      };
    } catch (error) {
      console.error('Error fetching transfer recipient:', error);
      throw new Error('Failed to fetch transfer recipient');
    }
  }

  /**
   * List all transfer recipients
   */
  static async listTransferRecipients(
    page: number = 1,
    perPage: number = 50
  ): Promise<{ recipients: PaystackRecipient[]; total: number }> {
    try {
      const response = await (paystack.transferRecipient as any).list({
        page,
        perPage,
      });

      const recipients = response.data.map((recipient: any) => ({
        id: recipient.id,
        name: recipient.name,
        email: recipient.email || '',
        account_number: recipient.details.account_number,
        bank_code: recipient.details.bank_code,
        bank_name: recipient.details.bank_name,
        created_at: recipient.createdAt,
      }));

      return {
        recipients,
        total: response.meta.total,
      };
    } catch (error) {
      console.error('Error listing transfer recipients:', error);
      throw new Error('Failed to list transfer recipients');
    }
  }

  /**
   * Create a payment request
   */
  static async createPaymentRequest(
    email: string,
    amount: number,
    reference: string,
    description?: string,
    callbackUrl?: string
  ): Promise<{
    authorization_url: string;
    access_code: string;
    reference: string;
  }> {
    try {
      const response = await (paystack as any).transaction.initialize({
        email,
        amount: amount * 100, // Convert to kobo
        reference,
        currency: 'NGN',
        description: description || 'Payment request',
        callback_url: callbackUrl,
      });

      return {
        authorization_url: response.data.authorization_url,
        access_code: response.data.access_code,
        reference: response.data.reference,
      };
    } catch (error) {
      console.error('Error creating payment request:', error);
      throw new Error('Failed to create payment request');
    }
  }

  /**
   * Verify a payment
   */
  static async verifyPayment(reference: string): Promise<{
    status: string;
    amount: number;
    currency: string;
    reference: string;
    customer: {
      email: string;
      name: string;
    };
    created_at: string;
  }> {
    try {
      const response = await (paystack as any).transaction.verify(reference);

      return {
        status: response.data.status,
        amount: response.data.amount,
        currency: response.data.currency,
        reference: response.data.reference,
        customer: {
          email: response.data.customer.email,
          name:
            response.data.customer.first_name +
            ' ' +
            response.data.customer.last_name,
        },
        created_at: response.data.createdAt,
      };
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw new Error('Failed to verify payment');
    }
  }

  /**
   * Get account balance
   */
  static async getBalance(): Promise<{
    currency: string;
    balance: number;
  }> {
    try {
      const response = await (paystack.balance as any).list();

      return {
        currency: response.data[0].currency,
        balance: response.data[0].balance,
      };
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw new Error('Failed to fetch balance');
    }
  }
}
