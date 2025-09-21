declare module '@paystack/paystack-sdk' {
  interface PaystackConfig {
    secretKey: string;
  }

  interface Bank {
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

  interface TransferRecipient {
    id: number;
    name: string;
    details: {
      account_number: string;
      bank_code: string;
      bank_name: string;
    };
    createdAt: string;
  }

  interface TransferResponse {
    status: string;
    message: string;
    data: {
      id: number;
      details: {
        account_number: string;
        bank_code: string;
        bank_name: string;
      };
      amount: number;
      currency: string;
      reference: string;
      status: string;
      createdAt: string;
    };
  }

  class Paystack {
    constructor(secretKey: string);
    misc: {
      listBanks(): Promise<{ data: Bank[] }>;
    };
    transferRecipient: {
      create(data: any): Promise<{ data: TransferRecipient }>;
    };
    transfer: {
      initiate(data: any): Promise<{ data: TransferResponse }>;
      verify(reference: string): Promise<{ data: TransferResponse }>;
    };
    balance: {
      check(): Promise<{ data: { currency: string; balance: number } }>;
    };
  }

  export = Paystack;
}

declare module 'flutterwave-node-v3' {
  interface FlutterwaveConfig {
    public_key: string;
    secret_key: string;
  }

  interface VirtualAccountResponse {
    data: {
      account_number: string;
      bank_name: string;
      bank_code: string;
    };
  }

  interface TransferResponse {
    data: {
      id: number;
      reference: string;
      status: string;
      amount: number;
      currency: string;
    };
  }

  class Flutterwave {
    constructor(publicKey: string, secretKey: string);
    VirtualAcct: {
      create(data: any): Promise<VirtualAccountResponse>;
    };
    Balance: {
      get(): Promise<{ data: { currency: string; available_balance: number } }>;
    };
    Transfer: {
      initiate(data: any): Promise<TransferResponse>;
      get(data: { reference: string }): Promise<TransferResponse>;
    };
  }

  export = Flutterwave;
}
