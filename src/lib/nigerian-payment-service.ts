import Paystack from '@paystack/paystack-sdk';
import Flutterwave from 'flutterwave-node-v3';

// Initialize Paystack
const getPaystack = () => {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    throw new Error('PAYSTACK_SECRET_KEY environment variable is not set');
  }
  return new Paystack(process.env.PAYSTACK_SECRET_KEY);
};

// Initialize Flutterwave
const getFlutterwave = () => {
  if (
    !process.env.FLUTTERWAVE_PUBLIC_KEY ||
    !process.env.FLUTTERWAVE_SECRET_KEY
  ) {
    throw new Error(
      'FLUTTERWAVE_PUBLIC_KEY and FLUTTERWAVE_SECRET_KEY environment variables are not set'
    );
  }
  return new Flutterwave(
    process.env.FLUTTERWAVE_PUBLIC_KEY,
    process.env.FLUTTERWAVE_SECRET_KEY
  );
};

export interface NigerianBank {
  id: number;
  name: string;
  code: string;
  longcode: string;
  gateway: string;
  pay_with_bank: boolean;
  active: boolean;
  is_deleted: boolean;
  country: string;
  currency: string;
  type: string;
}

export interface TransferRecipient {
  id: number;
  name: string;
  account_number: string;
  bank_code: string;
  bank_name: string;
  created_at: string;
}

export interface TransferResponse {
  status: string;
  message: string;
  data: {
    id: number;
    account_number: string;
    bank_code: string;
    bank_name: string;
    amount: number;
    currency: string;
    reference: string;
    status: string;
    created_at: string;
  };
}

export class NigerianPaymentService {
  /**
   * Get list of Nigerian banks (Paystack)
   */
  static async getBanks(): Promise<NigerianBank[]> {
    try {
      const paystack = getPaystack();
      const response = await paystack.misc.listBanks();
      return response.data;
    } catch (error) {
      console.error('Error fetching banks:', error);
      throw new Error('Failed to fetch banks');
    }
  }

  /**
   * Create transfer recipient (Paystack)
   */
  static async createTransferRecipient(
    accountNumber: string,
    bankCode: string,
    name: string
  ): Promise<TransferRecipient> {
    try {
      const paystack = getPaystack();
      const response = await paystack.transferRecipient.create({
        type: 'nuban',
        name,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: 'NGN',
      });

      return {
        id: response.data.id,
        name: response.data.name,
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
   * Initiate transfer (Paystack)
   */
  static async initiateTransfer(
    recipientId: number,
    amount: number,
    reason: string
  ): Promise<TransferResponse> {
    try {
      const paystack = getPaystack();
      const response = await paystack.transfer.initiate({
        source: 'balance',
        amount: amount * 100, // Convert to kobo
        recipient: recipientId.toString(),
        reason,
        currency: 'NGN',
      });

      return {
        status: (response as any).status || 'success',
        message: (response as any).message || 'Transfer initiated',
        data: {
          id: (response.data as any).id,
          account_number: (response.data as any).details?.account_number || '',
          bank_code: (response.data as any).details?.bank_code || '',
          bank_name: (response.data as any).details?.bank_name || '',
          amount: (response.data as any).amount || 0,
          currency: (response.data as any).currency || 'NGN',
          reference: (response.data as any).reference || '',
          status: (response.data as any).status || 'pending',
          created_at:
            (response.data as any).createdAt || new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Error initiating transfer:', error);
      throw new Error('Failed to initiate transfer');
    }
  }

  /**
   * Verify transfer (Paystack)
   */
  static async verifyTransfer(reference: string): Promise<TransferResponse> {
    try {
      const paystack = getPaystack();
      const response = await paystack.transfer.verify(reference);
      return {
        status: (response as any).status || 'success',
        message: (response as any).message || 'Transfer verified',
        data: {
          id: (response.data as any).id,
          account_number: (response.data as any).details?.account_number || '',
          bank_code: (response.data as any).details?.bank_code || '',
          bank_name: (response.data as any).details?.bank_name || '',
          amount: (response.data as any).amount || 0,
          currency: (response.data as any).currency || 'NGN',
          reference: (response.data as any).reference || '',
          status: (response.data as any).status || 'completed',
          created_at:
            (response.data as any).createdAt || new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Error verifying transfer:', error);
      throw new Error('Failed to verify transfer');
    }
  }

  /**
   * Get account balance (Paystack)
   */
  static async getBalance(): Promise<{
    currency: string;
    balance: number;
  }> {
    try {
      const paystack = getPaystack();
      const response = await paystack.balance.check();
      return {
        currency: response.data.currency,
        balance: response.data.balance / 100, // Convert from kobo
      };
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw new Error('Failed to fetch balance');
    }
  }

  /**
   * Create Flutterwave virtual account
   */
  static async createVirtualAccount(
    email: string,
    name: string,
    bvn?: string
  ): Promise<{
    account_number: string;
    bank_name: string;
    bank_code: string;
  }> {
    try {
      const flw = getFlutterwave();
      const response = await flw.VirtualAcct.create({
        email,
        is_permanent: true,
        bvn,
        tx_ref: `va_${Date.now()}`,
        firstname: name.split(' ')[0],
        lastname: name.split(' ').slice(1).join(' '),
        narration: 'AI Finance Tracker Virtual Account',
      });

      return {
        account_number: response.data.account_number,
        bank_name: response.data.bank_name,
        bank_code: response.data.bank_code,
      };
    } catch (error) {
      console.error('Error creating virtual account:', error);
      throw new Error('Failed to create virtual account');
    }
  }

  /**
   * Get Flutterwave account balance
   */
  static async getFlutterwaveBalance(): Promise<{
    currency: string;
    balance: number;
  }> {
    try {
      const flw = getFlutterwave();
      const response = await flw.Balance.get();
      return {
        currency: response.data.currency,
        balance: response.data.available_balance,
      };
    } catch (error) {
      console.error('Error fetching Flutterwave balance:', error);
      throw new Error('Failed to fetch Flutterwave balance');
    }
  }

  /**
   * Create Flutterwave transfer
   */
  static async createFlutterwaveTransfer(
    accountBank: string,
    accountNumber: string,
    amount: number,
    narration: string,
    beneficiaryName: string
  ): Promise<{
    id: number;
    reference: string;
    status: string;
  }> {
    try {
      const flw = getFlutterwave();
      const response = await flw.Transfer.initiate({
        account_bank: accountBank,
        account_number: accountNumber,
        amount,
        narration,
        currency: 'NGN',
        reference: `ft_${Date.now()}`,
        callback_url: `${process.env.NEXTAUTH_URL}/api/webhooks/flutterwave`,
        debit_currency: 'NGN',
        beneficiary_name: beneficiaryName,
      });

      return {
        id: response.data.id,
        reference: response.data.reference,
        status: response.data.status,
      };
    } catch (error) {
      console.error('Error creating Flutterwave transfer:', error);
      throw new Error('Failed to create Flutterwave transfer');
    }
  }

  /**
   * Verify Flutterwave transfer
   */
  static async verifyFlutterwaveTransfer(reference: string): Promise<{
    id: number;
    reference: string;
    status: string;
    amount: number;
    currency: string;
  }> {
    try {
      const flw = getFlutterwave();
      const response = await flw.Transfer.get({ reference });
      return {
        id: response.data.id,
        reference: response.data.reference,
        status: response.data.status,
        amount: response.data.amount,
        currency: response.data.currency,
      };
    } catch (error) {
      console.error('Error verifying Flutterwave transfer:', error);
      throw new Error('Failed to verify Flutterwave transfer');
    }
  }
}
