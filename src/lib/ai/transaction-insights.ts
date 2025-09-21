import { AIService } from '@/lib/ai-service';

/**
 * AI Transaction Insights Service
 * Provides intelligent categorization and insights for financial transactions
 */

export interface TransactionInsight {
  id: string;
  transactionId: string;
  category: string;
  subcategory?: string;
  confidence: number;
  tags: string[];
  insights: string[];
  recommendations: string[];
  spendingPattern: 'normal' | 'unusual' | 'concerning';
  merchantInfo?: {
    name: string;
    category: string;
    location?: string;
  };
  createdAt: Date;
}

export interface SpendingAnalysis {
  totalSpent: number;
  totalIncome: number;
  netAmount: number;
  topCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
    transactionCount: number;
  }>;
  spendingTrends: Array<{
    period: string;
    amount: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  unusualSpending: Array<{
    description: string;
    amount: number;
    reason: string;
  }>;
  budgetAlerts: Array<{
    category: string;
    spent: number;
    budget: number;
    percentage: number;
  }>;
}

export interface FinancialRecommendation {
  id: string;
  type: 'savings' | 'spending' | 'investment' | 'debt' | 'budget';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  action: string;
  potentialSavings?: number;
  confidence: number;
  category?: string;
}

export class TransactionInsightsService {
  /**
   * Categorize a single transaction using AI
   */
  static async categorizeTransaction(
    transaction: {
      id: string;
      amount: number;
      description: string;
      date: Date;
      merchant?: string;
    }
  ): Promise<TransactionInsight> {
    try {
      const prompt = `
        Analyze this financial transaction and provide detailed insights:
        
        Transaction: ${transaction.description}
        Amount: $${transaction.amount}
        Date: ${transaction.date.toISOString().split('T')[0]}
        Merchant: ${transaction.merchant || 'Unknown'}
        
        Please provide:
        1. Primary category (e.g., Food & Dining, Transportation, Shopping, etc.)
        2. Subcategory if applicable
        3. Confidence score (0-1)
        4. Relevant tags
        5. Key insights about this transaction
        6. Spending pattern classification (normal/unusual/concerning)
        7. Recommendations for this type of spending
        
        Respond in JSON format with the following structure:
        {
          "category": "string",
          "subcategory": "string",
          "confidence": 0.95,
          "tags": ["tag1", "tag2"],
          "insights": ["insight1", "insight2"],
          "recommendations": ["rec1", "rec2"],
          "spendingPattern": "normal|unusual|concerning",
          "merchantInfo": {
            "name": "string",
            "category": "string",
            "location": "string"
          }
        }
      `;

      const response = await AIService.generateText(prompt);
      const aiData = JSON.parse(response);

      const insight: TransactionInsight = {
        id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        transactionId: transaction.id,
        category: aiData.category || 'Uncategorized',
        subcategory: aiData.subcategory,
        confidence: aiData.confidence || 0.5,
        tags: aiData.tags || [],
        insights: aiData.insights || [],
        recommendations: aiData.recommendations || [],
        spendingPattern: aiData.spendingPattern || 'normal',
        merchantInfo: aiData.merchantInfo,
        createdAt: new Date(),
      };

      return insight;
    } catch (error) {
      console.error('Error categorizing transaction:', error);
      
      // Fallback categorization
      return {
        id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        transactionId: transaction.id,
        category: 'Uncategorized',
        confidence: 0.1,
        tags: [],
        insights: ['Unable to analyze transaction'],
        recommendations: ['Review transaction manually'],
        spendingPattern: 'normal',
        createdAt: new Date(),
      };
    }
  }

  /**
   * Analyze spending patterns across multiple transactions
   */
  static async analyzeSpendingPatterns(
    transactions: Array<{
      id: string;
      amount: number;
      description: string;
      date: Date;
      category?: string;
    }>
  ): Promise<SpendingAnalysis> {
    try {
      const prompt = `
        Analyze these financial transactions and provide comprehensive spending analysis:
        
        Transactions:
        ${transactions.map(tx => 
          `- ${tx.description}: $${tx.amount} (${tx.date.toISOString().split('T')[0]})`
        ).join('\n')}
        
        Please provide:
        1. Total spending and income
        2. Top spending categories with amounts and percentages
        3. Spending trends over time
        4. Unusual spending patterns
        5. Budget alerts for overspending
        
        Respond in JSON format:
        {
          "totalSpent": 1500.00,
          "totalIncome": 3000.00,
          "netAmount": 1500.00,
          "topCategories": [
            {
              "category": "Food & Dining",
              "amount": 400.00,
              "percentage": 26.7,
              "transactionCount": 15
            }
          ],
          "spendingTrends": [
            {
              "period": "2024-01",
              "amount": 1500.00,
              "trend": "up"
            }
          ],
          "unusualSpending": [
            {
              "description": "Large purchase at electronics store",
              "amount": 299.99,
              "reason": "Significantly higher than usual spending"
            }
          ],
          "budgetAlerts": [
            {
              "category": "Entertainment",
              "spent": 250.00,
              "budget": 200.00,
              "percentage": 125
            }
          ]
        }
      `;

      const response = await AIService.generateText(prompt);
      const analysis = JSON.parse(response);

      return {
        totalSpent: analysis.totalSpent || 0,
        totalIncome: analysis.totalIncome || 0,
        netAmount: analysis.netAmount || 0,
        topCategories: analysis.topCategories || [],
        spendingTrends: analysis.spendingTrends || [],
        unusualSpending: analysis.unusualSpending || [],
        budgetAlerts: analysis.budgetAlerts || [],
      };
    } catch (error) {
      console.error('Error analyzing spending patterns:', error);
      
      // Fallback analysis
      const totalSpent = transactions
        .filter(tx => tx.amount < 0)
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      
      const totalIncome = transactions
        .filter(tx => tx.amount > 0)
        .reduce((sum, tx) => sum + tx.amount, 0);

      return {
        totalSpent,
        totalIncome,
        netAmount: totalIncome - totalSpent,
        topCategories: [],
        spendingTrends: [],
        unusualSpending: [],
        budgetAlerts: [],
      };
    }
  }

  /**
   * Generate personalized financial recommendations
   */
  static async generateRecommendations(
    spendingAnalysis: SpendingAnalysis,
    userProfile?: {
      age?: number;
      income?: number;
      goals?: string[];
    }
  ): Promise<FinancialRecommendation[]> {
    try {
      const prompt = `
        Based on this spending analysis, generate personalized financial recommendations:
        
        Spending Analysis:
        - Total Spent: $${spendingAnalysis.totalSpent}
        - Total Income: $${spendingAnalysis.totalIncome}
        - Net Amount: $${spendingAnalysis.netAmount}
        - Top Categories: ${spendingAnalysis.topCategories.map(c => `${c.category} (${c.percentage}%)`).join(', ')}
        - Unusual Spending: ${spendingAnalysis.unusualSpending.length} items
        - Budget Alerts: ${spendingAnalysis.budgetAlerts.length} categories over budget
        
        User Profile:
        - Age: ${userProfile?.age || 'Not specified'}
        - Income: $${userProfile?.income || 'Not specified'}
        - Goals: ${userProfile?.goals?.join(', ') || 'Not specified'}
        
        Generate 5-10 actionable recommendations covering:
        1. Savings opportunities
        2. Spending optimization
        3. Budget management
        4. Investment suggestions
        5. Debt management
        
        Respond in JSON format:
        {
          "recommendations": [
            {
              "id": "rec_1",
              "type": "savings",
              "priority": "high",
              "title": "Reduce Dining Out",
              "description": "You're spending 30% of your income on dining out",
              "action": "Set a monthly dining budget of $200",
              "potentialSavings": 150.00,
              "confidence": 0.85,
              "category": "Food & Dining"
            }
          ]
        }
      `;

      const response = await AIService.generateText(prompt);
      const data = JSON.parse(response);

      return data.recommendations || [];
    } catch (error) {
      console.error('Error generating recommendations:', error);
      
      // Fallback recommendations
      return [
        {
          id: 'rec_fallback_1',
          type: 'budget',
          priority: 'medium',
          title: 'Review Your Spending',
          description: 'Consider reviewing your transaction history to identify spending patterns',
          action: 'Set up monthly budget reviews',
          confidence: 0.5,
        },
        {
          id: 'rec_fallback_2',
          type: 'savings',
          priority: 'low',
          title: 'Build Emergency Fund',
          description: 'Consider setting aside money for unexpected expenses',
          action: 'Aim to save 3-6 months of expenses',
          confidence: 0.6,
        },
      ];
    }
  }

  /**
   * Detect unusual spending patterns
   */
  static async detectUnusualSpending(
    transactions: Array<{
      id: string;
      amount: number;
      description: string;
      date: Date;
      category?: string;
    }>
  ): Promise<Array<{
    transactionId: string;
    reason: string;
    severity: 'low' | 'medium' | 'high';
    suggestion: string;
  }>> {
    try {
      const prompt = `
        Analyze these transactions for unusual spending patterns:
        
        ${transactions.map(tx => 
          `- ${tx.description}: $${tx.amount} (${tx.date.toISOString().split('T')[0]})`
        ).join('\n')}
        
        Look for:
        1. Unusually large amounts
        2. Unusual merchants or categories
        3. Spending at unusual times
        4. Rapid successive transactions
        5. Transactions that don't match typical patterns
        
        Respond in JSON format:
        {
          "unusualTransactions": [
            {
              "transactionId": "tx_123",
              "reason": "Amount significantly higher than average",
              "severity": "medium",
              "suggestion": "Verify this transaction and consider if it's necessary"
            }
          ]
        }
      `;

      const response = await AIService.generateText(prompt);
      const data = JSON.parse(response);

      return data.unusualTransactions || [];
    } catch (error) {
      console.error('Error detecting unusual spending:', error);
      return [];
    }
  }

  /**
   * Generate monthly financial summary
   */
  static async generateMonthlySummary(
    transactions: Array<{
      id: string;
      amount: number;
      description: string;
      date: Date;
      category?: string;
    }>,
    month: string
  ): Promise<string> {
    try {
      const prompt = `
        Generate a comprehensive monthly financial summary for ${month}:
        
        Transactions:
        ${transactions.map(tx => 
          `- ${tx.description}: $${tx.amount} (${tx.date.toISOString().split('T')[0]})`
        ).join('\n')}
        
        Include:
        1. Executive summary of financial health
        2. Key spending categories and trends
        3. Notable transactions or patterns
        4. Budget performance
        5. Recommendations for next month
        6. Financial goals progress
        
        Write in a professional, easy-to-understand tone suitable for personal finance management.
      `;

      const response = await AIService.generateText(prompt);
      return response;
    } catch (error) {
      console.error('Error generating monthly summary:', error);
      
      // Fallback summary
      const totalSpent = transactions
        .filter(tx => tx.amount < 0)
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      
      const totalIncome = transactions
        .filter(tx => tx.amount > 0)
        .reduce((sum, tx) => sum + tx.amount, 0);

      return `
# Monthly Financial Summary - ${month}

## Overview
- Total Income: $${totalIncome.toLocaleString()}
- Total Expenses: $${totalSpent.toLocaleString()}
- Net Amount: $${(totalIncome - totalSpent).toLocaleString()}
- Transaction Count: ${transactions.length}

## Key Insights
- Your financial data has been successfully analyzed
- Consider reviewing your spending patterns for optimization opportunities
- Set up monthly budget reviews to track your progress

## Recommendations
- Review your transaction history regularly
- Set up automated savings transfers
- Consider using budgeting tools to track your spending
      `.trim();
    }
  }

  /**
   * Categorize multiple transactions in batch
   */
  static async categorizeTransactionsBatch(
    transactions: Array<{
      id: string;
      amount: number;
      description: string;
      date: Date;
      merchant?: string;
    }>
  ): Promise<TransactionInsight[]> {
    const insights: TransactionInsight[] = [];
    
    // Process transactions in batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      
      const batchInsights = await Promise.all(
        batch.map(transaction => this.categorizeTransaction(transaction))
      );
      
      insights.push(...batchInsights);
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < transactions.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return insights;
  }
}
