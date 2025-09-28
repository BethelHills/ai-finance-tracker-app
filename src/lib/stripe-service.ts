import Stripe from 'stripe';

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-08-27.basil',
  });
};

export interface StripeAccount {
  id: string;
  email: string;
  country: string;
  currency: string;
  capabilities: string[];
  charges_enabled: boolean;
  payouts_enabled: boolean;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
}

export class StripeService {
  /**
   * Create a Stripe Connect account for a user
   */
  static async createConnectAccount(
    userId: string,
    email: string,
    country: string = 'US'
  ): Promise<StripeAccount> {
    try {
      const stripe = getStripe();
      const account = await stripe.accounts.create({
        type: 'express',
        country,
        email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: {
          user_id: userId,
        },
      });

      return {
        id: account.id,
        email: account.email || email,
        country: account.country || 'US',
        currency: account.default_currency || 'usd',
        capabilities: Object.keys(account.capabilities || {}),
        charges_enabled: account.charges_enabled || false,
        payouts_enabled: account.payouts_enabled || false,
      };
    } catch (error) {
      console.error('Error creating Stripe account:', error);
      throw new Error('Failed to create Stripe account');
    }
  }

  /**
   * Create account link for onboarding
   */
  static async createAccountLink(
    accountId: string,
    refreshUrl: string,
    returnUrl: string
  ): Promise<string> {
    try {
      const stripe = getStripe();
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });

      return accountLink.url;
    } catch (error) {
      console.error('Error creating account link:', error);
      throw new Error('Failed to create account link');
    }
  }

  /**
   * Create payment intent
   */
  static async createPaymentIntent(
    amount: number,
    currency: string,
    metadata: Record<string, string> = {}
  ): Promise<PaymentIntent> {
    try {
      const stripe = getStripe();
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        automatic_payment_methods: {
          enabled: true,
        },
        metadata,
      });

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        client_secret: paymentIntent.client_secret!,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  /**
   * Create transfer to connected account
   */
  static async createTransfer(
    amount: number,
    currency: string,
    destinationAccountId: string,
    description: string
  ): Promise<string> {
    try {
      const stripe = getStripe();
      const transfer = await stripe.transfers.create({
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        destination: destinationAccountId,
        description,
      });

      return transfer.id;
    } catch (error) {
      console.error('Error creating transfer:', error);
      throw new Error('Failed to create transfer');
    }
  }

  /**
   * Get account balance
   */
  static async getAccountBalance(accountId: string): Promise<{
    available: number;
    pending: number;
    currency: string;
  }> {
    try {
      const stripe = getStripe();
      const balance = await stripe.balance.retrieve({
        stripeAccount: accountId,
      });

      const availableBalance =
        balance.available.find(b => b.currency === 'usd') ||
        balance.available[0];
      const pendingBalance =
        balance.pending.find(b => b.currency === 'usd') || balance.pending[0];

      return {
        available: availableBalance?.amount || 0,
        pending: pendingBalance?.amount || 0,
        currency: availableBalance?.currency || 'usd',
      };
    } catch (error) {
      console.error('Error fetching account balance:', error);
      throw new Error('Failed to fetch account balance');
    }
  }

  /**
   * List payment methods for a customer
   */
  static async getPaymentMethods(customerId: string): Promise<any[]> {
    try {
      const stripe = getStripe();
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return paymentMethods.data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw new Error('Failed to fetch payment methods');
    }
  }

  /**
   * Create a customer
   */
  static async createCustomer(
    email: string,
    name: string,
    metadata: Record<string, string> = {}
  ): Promise<string> {
    try {
      const stripe = getStripe();
      const customer = await stripe.customers.create({
        email,
        name,
        metadata,
      });

      return customer.id;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw new Error('Failed to create customer');
    }
  }
}
