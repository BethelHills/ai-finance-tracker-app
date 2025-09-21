import { Configuration, PlaidApi, PlaidEnvironments, LinkTokenCreateRequest, AccountsGetRequest, TransactionsGetRequest } from 'plaid';

// Initialize Plaid client
const plaidClient = new PlaidApi(
  new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments] || PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID!,
        'PLAID-SECRET': process.env.PLAID_SECRET!,
      },
    },
  })
);

export interface PlaidAccount {
  account_id: string;
  name: string;
  official_name?: string;
  type: string;
  subtype?: string;
  mask?: string;
  balances: {
    available: number | null;
    current: number | null;
    limit: number | null;
    iso_currency_code?: string;
  };
}

export interface PlaidTransaction {
  transaction_id: string;
  account_id: string;
  amount: number;
  date: string;
  name: string;
  merchant_name?: string;
  category?: string[];
  subcategory?: string[];
  account_owner?: string;
  pending: boolean;
  iso_currency_code?: string;
}

export class PlaidService {
  /**
   * Create a link token for Plaid Link
   */
  static async createLinkToken(userId: string): Promise<string> {
    try {
      const request: LinkTokenCreateRequest = {
        user: {
          client_user_id: userId,
        },
        client_name: 'AI Finance Tracker',
        products: ['transactions', 'auth', 'identity'],
        country_codes: ['US', 'CA', 'GB', 'NG'], // Including Nigeria
        language: 'en',
        webhook: `${process.env.NEXTAUTH_URL}/api/webhooks/plaid`,
      };

      const response = await plaidClient.linkTokenCreate(request);
      return response.data.link_token;
    } catch (error) {
      console.error('Error creating link token:', error);
      throw new Error('Failed to create link token');
    }
  }

  /**
   * Exchange public token for access token
   */
  static async exchangePublicToken(publicToken: string): Promise<string> {
    try {
      const response = await plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
      });
      return response.data.access_token;
    } catch (error) {
      console.error('Error exchanging public token:', error);
      throw new Error('Failed to exchange public token');
    }
  }

  /**
   * Get all accounts for a user
   */
  static async getAccounts(accessToken: string): Promise<PlaidAccount[]> {
    try {
      const request: AccountsGetRequest = {
        access_token: accessToken,
      };

      const response = await plaidClient.accountsGet(request);
      return response.data.accounts;
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw new Error('Failed to fetch accounts');
    }
  }

  /**
   * Get transactions for a specific account
   */
  static async getTransactions(
    accessToken: string,
    accountId: string,
    startDate: string,
    endDate: string
  ): Promise<PlaidTransaction[]> {
    try {
      const request: TransactionsGetRequest = {
        access_token: accessToken,
        account_ids: [accountId],
        start_date: startDate,
        end_date: endDate,
        count: 500,
        offset: 0,
      };

      const response = await plaidClient.transactionsGet(request);
      return response.data.transactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw new Error('Failed to fetch transactions');
    }
  }

  /**
   * Get all transactions for all accounts
   */
  static async getAllTransactions(
    accessToken: string,
    startDate: string,
    endDate: string
  ): Promise<PlaidTransaction[]> {
    try {
      const accounts = await this.getAccounts(accessToken);
      const allTransactions: PlaidTransaction[] = [];

      for (const account of accounts) {
        const transactions = await this.getTransactions(
          accessToken,
          account.account_id,
          startDate,
          endDate
        );
        allTransactions.push(...transactions);
      }

      return allTransactions;
    } catch (error) {
      console.error('Error fetching all transactions:', error);
      throw new Error('Failed to fetch all transactions');
    }
  }

  /**
   * Categorize transaction using AI
   */
  static async categorizeTransaction(transaction: PlaidTransaction): Promise<{
    category: string;
    confidence: number;
    tags: string[];
  }> {
    try {
      const prompt = `
        Categorize this financial transaction:
        Name: "${transaction.name}"
        Merchant: "${transaction.merchant_name || 'N/A'}"
        Amount: ${transaction.amount}
        Current Categories: ${transaction.category?.join(', ') || 'None'}
        
        Return JSON:
        {
          "category": "Food|Transportation|Housing|Entertainment|Utilities|Healthcare|Shopping|Income|Transfer|Other",
          "confidence": 0.95,
          "tags": ["grocery", "supermarket"]
        }
      `;

      // Use OpenAI to categorize
      const response = await fetch('/api/ai/categorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: transaction.name,
          amount: Math.abs(transaction.amount),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to categorize transaction');
      }

      return await response.json();
    } catch (error) {
      console.error('Error categorizing transaction:', error);
      return {
        category: 'Other',
        confidence: 0,
        tags: [],
      };
    }
  }
}
