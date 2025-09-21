/**
 * Simulation Mode - Mock Data Generator
 * Creates realistic financial data for demo purposes
 */

export interface MockUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  tier: 'basic' | 'premium' | 'enterprise';
  country: string;
  currency: string;
  joinedAt: Date;
}

export interface MockAccount {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  currency: string;
  provider: 'plaid' | 'manual' | 'stripe';
  lastUpdated: Date;
  isActive: boolean;
}

export interface MockTransaction {
  id: string;
  amount: number;
  description: string;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  date: Date;
  accountId: string;
  status: 'completed' | 'pending' | 'failed';
  provider: 'plaid' | 'paystack' | 'stripe' | 'manual';
  metadata?: any;
}

export interface MockRecipient {
  id: string;
  name: string;
  email: string;
  accountNumber: string;
  bankName: string;
  country: string;
  lastUsed: Date;
}

export class MockDataGenerator {
  private static readonly CURRENCIES = ['USD', 'EUR', 'GBP', 'NGN', 'CAD', 'AUD'];
  private static readonly COUNTRIES = ['US', 'UK', 'Nigeria', 'Canada', 'Australia', 'Germany'];
  private static readonly CATEGORIES = [
    'Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities',
    'Healthcare', 'Travel', 'Education', 'Business', 'Investment', 'Salary', 'Freelance'
  ];
  private static readonly BANKS = [
    'Chase Bank', 'Bank of America', 'Wells Fargo', 'First Bank', 'Access Bank',
    'HSBC', 'Barclays', 'Deutsche Bank', 'TD Bank', 'RBC'
  ];

  static generateUser(): MockUser {
    const names = [
      'Alex Johnson', 'Sarah Chen', 'Michael Rodriguez', 'Emma Thompson',
      'David Kim', 'Lisa Anderson', 'James Wilson', 'Maria Garcia'
    ];
    const countries = this.COUNTRIES;
    const currencies = this.CURRENCIES;
    const tiers: ('basic' | 'premium' | 'enterprise')[] = ['basic', 'premium', 'enterprise'];

    const name = names[Math.floor(Math.random() * names.length)];
    const country = countries[Math.floor(Math.random() * countries.length)];
    const currency = currencies[Math.floor(Math.random() * currencies.length)];
    const tier = tiers[Math.floor(Math.random() * tiers.length)];

    return {
      id: `user_${Math.random().toString(36).substr(2, 9)}`,
      name,
      email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      tier,
      country,
      currency,
      joinedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    };
  }

  static generateAccounts(userId: string, count: number = 3): MockAccount[] {
    const accounts: MockAccount[] = [];
    const types: ('checking' | 'savings' | 'credit' | 'investment')[] = ['checking', 'savings', 'credit', 'investment'];
    const providers: ('plaid' | 'manual' | 'stripe')[] = ['plaid', 'manual', 'stripe'];

    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const provider = providers[Math.floor(Math.random() * providers.length)];
      const currency = this.CURRENCIES[Math.floor(Math.random() * this.CURRENCIES.length)];
      
      // Generate realistic balance based on account type
      let balance = 0;
      switch (type) {
        case 'checking':
          balance = Math.random() * 50000 + 1000;
          break;
        case 'savings':
          balance = Math.random() * 100000 + 5000;
          break;
        case 'credit':
          balance = -(Math.random() * 10000 + 500);
          break;
        case 'investment':
          balance = Math.random() * 200000 + 10000;
          break;
      }

      accounts.push({
        id: `account_${Math.random().toString(36).substr(2, 9)}`,
        name: `${this.BANKS[Math.floor(Math.random() * this.BANKS.length)]} ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        type,
        balance: Math.round(balance * 100) / 100,
        currency,
        provider,
        lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        isActive: true,
      });
    }

    return accounts;
  }

  static generateTransactions(accountIds: string[], count: number = 50): MockTransaction[] {
    const transactions: MockTransaction[] = [];
    const types: ('income' | 'expense' | 'transfer')[] = ['income', 'expense', 'transfer'];
    const statuses: ('completed' | 'pending' | 'failed')[] = ['completed', 'completed', 'completed', 'pending', 'failed'];
    const providers: ('plaid' | 'paystack' | 'stripe' | 'manual')[] = ['plaid', 'paystack', 'stripe', 'manual'];

    const descriptions = [
      'Coffee Shop Purchase', 'Salary Deposit', 'Grocery Store', 'Gas Station',
      'Online Shopping', 'Restaurant Bill', 'ATM Withdrawal', 'Bank Transfer',
      'Investment Return', 'Freelance Payment', 'Subscription Fee', 'Insurance Payment',
      'Phone Bill', 'Electricity Bill', 'Rent Payment', 'Car Payment',
      'Medical Expense', 'Travel Booking', 'Entertainment', 'Education Fee'
    ];

    for (let i = 0; i < count; i++) {
      const accountId = accountIds[Math.floor(Math.random() * accountIds.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const category = this.CATEGORIES[Math.floor(Math.random() * this.CATEGORIES.length)];
      const description = descriptions[Math.floor(Math.random() * descriptions.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const provider = providers[Math.floor(Math.random() * providers.length)];

      // Generate realistic amount based on type and category
      let amount = 0;
      if (type === 'income') {
        amount = Math.random() * 5000 + 100;
      } else if (type === 'expense') {
        amount = -(Math.random() * 500 + 10);
      } else {
        amount = Math.random() * 2000 + 50;
      }

      // Adjust amount based on category
      if (category === 'Salary' || category === 'Investment') {
        amount = Math.abs(amount) * 10;
      } else if (category === 'Coffee Shop Purchase' || category === 'Gas Station') {
        amount = Math.abs(amount) * 0.1;
      }

      const date = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);

      transactions.push({
        id: `txn_${Math.random().toString(36).substr(2, 9)}`,
        amount: Math.round(amount * 100) / 100,
        description,
        type,
        category,
        date,
        accountId,
        status,
        provider,
        metadata: {
          merchant: this.generateMerchantName(),
          location: this.generateLocation(),
          tags: this.generateTags(category),
        },
      });
    }

    return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  static generateRecipients(count: number = 10): MockRecipient[] {
    const recipients: MockRecipient[] = [];
    const names = [
      'John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis',
      'David Wilson', 'Lisa Miller', 'James Garcia', 'Maria Martinez',
      'Robert Anderson', 'Jennifer Taylor', 'William Thomas', 'Linda Jackson'
    ];

    for (let i = 0; i < count; i++) {
      const name = names[Math.floor(Math.random() * names.length)];
      const country = this.COUNTRIES[Math.floor(Math.random() * this.COUNTRIES.length)];
      const bankName = this.BANKS[Math.floor(Math.random() * this.BANKS.length)];

      recipients.push({
        id: `recipient_${Math.random().toString(36).substr(2, 9)}`,
        name,
        email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
        accountNumber: Math.random().toString().substr(2, 10),
        bankName,
        country,
        lastUsed: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      });
    }

    return recipients;
  }

  static generateInsights(transactions: MockTransaction[]): any[] {
    const insights = [];
    
    // Spending by category
    const categorySpending = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
        return acc;
      }, {} as Record<string, number>);

    const topCategory = Object.entries(categorySpending)
      .sort(([,a], [,b]) => b - a)[0];

    if (topCategory) {
      insights.push({
        id: `insight_${Math.random().toString(36).substr(2, 9)}`,
        type: 'spending_analysis',
        title: 'Top Spending Category',
        description: `You spent the most on ${topCategory[0]} this month: $${topCategory[1].toFixed(2)}`,
        priority: 'high',
        confidence: 0.95,
        actionable: true,
        createdAt: new Date(),
      });
    }

    // Unusual spending
    const avgDailySpending = transactions
      .filter(t => t.type === 'expense' && t.date > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0) / 30;

    const todaySpending = transactions
      .filter(t => t.type === 'expense' && 
        t.date.toDateString() === new Date().toDateString())
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    if (todaySpending > avgDailySpending * 2) {
      insights.push({
        id: `insight_${Math.random().toString(36).substr(2, 9)}`,
        type: 'unusual_spending',
        title: 'Unusual Spending Detected',
        description: `Today's spending ($${todaySpending.toFixed(2)}) is significantly higher than your average ($${avgDailySpending.toFixed(2)})`,
        priority: 'medium',
        confidence: 0.85,
        actionable: true,
        createdAt: new Date(),
      });
    }

    // Budget alerts
    insights.push({
      id: `insight_${Math.random().toString(36).substr(2, 9)}`,
      type: 'budget_alert',
      title: 'Budget Alert',
      description: 'You\'re approaching your monthly budget limit for Entertainment',
      priority: 'low',
      confidence: 0.75,
      actionable: true,
      createdAt: new Date(),
    });

    return insights;
  }

  private static generateMerchantName(): string {
    const merchants = [
      'Starbucks', 'McDonald\'s', 'Amazon', 'Target', 'Walmart',
      'Uber', 'Lyft', 'Netflix', 'Spotify', 'Apple Store',
      'Shell', 'BP', 'Exxon', 'Chevron', 'Whole Foods'
    ];
    return merchants[Math.floor(Math.random() * merchants.length)];
  }

  private static generateLocation(): string {
    const cities = [
      'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
      'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
      'Lagos', 'London', 'Toronto', 'Sydney', 'Berlin'
    ];
    return cities[Math.floor(Math.random() * cities.length)];
  }

  private static generateTags(category: string): string[] {
    const tagMap: Record<string, string[]> = {
      'Food & Dining': ['restaurant', 'food', 'dining'],
      'Transportation': ['transport', 'travel', 'commute'],
      'Shopping': ['retail', 'purchase', 'shopping'],
      'Entertainment': ['entertainment', 'leisure', 'fun'],
      'Bills & Utilities': ['bills', 'utilities', 'monthly'],
      'Healthcare': ['health', 'medical', 'wellness'],
      'Travel': ['travel', 'vacation', 'trip'],
      'Education': ['education', 'learning', 'school'],
      'Business': ['business', 'work', 'professional'],
      'Investment': ['investment', 'savings', 'financial'],
      'Salary': ['income', 'salary', 'work'],
      'Freelance': ['freelance', 'contract', 'gig'],
    };
    return tagMap[category] || ['general'];
  }

  static generateCompleteUserData() {
    const user = this.generateUser();
    const accounts = this.generateAccounts(user.id, 4);
    const accountIds = accounts.map(a => a.id);
    const transactions = this.generateTransactions(accountIds, 100);
    const recipients = this.generateRecipients(8);
    const insights = this.generateInsights(transactions);

    return {
      user,
      accounts,
      transactions,
      recipients,
      insights,
      stats: this.calculateStats(transactions, accounts),
    };
  }

  private static calculateStats(transactions: MockTransaction[], accounts: MockAccount[]) {
    const totalIncome = transactions
      .filter(t => t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = Math.abs(transactions
      .filter(t => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0));

    const netWorth = accounts.reduce((sum, a) => sum + a.balance, 0);

    return {
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      netAmount: Math.round((totalIncome - totalExpenses) * 100) / 100,
      netWorth: Math.round(netWorth * 100) / 100,
      transactionCount: transactions.length,
      accountCount: accounts.length,
    };
  }
}
