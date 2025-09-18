import OpenAI from 'openai';

// Initialize OpenAI client only when API key is available
const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
};

export interface FinancialData {
  transactions: Array<{
    amount: number;
    description: string;
    category: string;
    date: string;
  }>;
  budgets: Array<{
    name: string;
    amount: number;
    spent: number;
    period: string;
  }>;
  goals: Array<{
    title: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
  }>;
}

export interface AIInsight {
  type:
    | 'spending_analysis'
    | 'budget_optimization'
    | 'goal_progress'
    | 'investment_opportunity'
    | 'risk_assessment';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  recommendation: string;
  confidence: number;
}

export class AIService {
  static async generateFinancialInsights(
    data: FinancialData
  ): Promise<AIInsight[]> {
    try {
      const prompt = `
        Analyze the following financial data and provide 3-5 actionable insights:
        
        Transactions (last 30 days):
        ${data.transactions.map(t => `- ${t.description}: $${t.amount} (${t.category})`).join('\n')}
        
        Budgets:
        ${data.budgets.map(b => `- ${b.name}: $${b.spent}/${b.amount} (${b.period})`).join('\n')}
        
        Goals:
        ${data.goals.map(g => `- ${g.title}: $${g.currentAmount}/${g.targetAmount} (target: ${g.targetDate})`).join('\n')}
        
        Provide insights in this JSON format:
        [
          {
            "type": "spending_analysis|budget_optimization|goal_progress|investment_opportunity|risk_assessment",
            "title": "Brief title",
            "description": "Detailed description",
            "priority": "low|medium|high",
            "recommendation": "Actionable recommendation",
            "confidence": 0.85
          }
        ]
      `;

      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are a financial advisor AI. Analyze financial data and provide actionable insights. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from AI');

      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating AI insights:', error);
      return [];
    }
  }

  static async categorizeTransaction(
    description: string,
    amount: number
  ): Promise<{
    category: string;
    confidence: number;
    tags: string[];
  }> {
    try {
      const prompt = `
        Categorize this transaction:
        Description: "${description}"
        Amount: $${amount}
        
        Return JSON:
        {
          "category": "Food|Transportation|Housing|Entertainment|Utilities|Healthcare|Shopping|Other",
          "confidence": 0.95,
          "tags": ["grocery", "supermarket"]
        }
      `;

      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a transaction categorization AI. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 200,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from AI');

      return JSON.parse(response);
    } catch (error) {
      console.error('Error categorizing transaction:', error);
      return {
        category: 'Other',
        confidence: 0,
        tags: [],
      };
    }
  }

  static async generateBudgetRecommendations(
    currentSpending: Record<string, number>,
    income: number,
    goals: string[]
  ): Promise<{
    recommendedBudgets: Record<string, number>;
    reasoning: string;
    savingsPotential: number;
  }> {
    try {
      const prompt = `
        Create budget recommendations based on:
        Current spending: ${JSON.stringify(currentSpending)}
        Monthly income: $${income}
        Financial goals: ${goals.join(', ')}
        
        Return JSON:
        {
          "recommendedBudgets": {
            "Housing": 2000,
            "Food": 600,
            "Transportation": 400
          },
          "reasoning": "Based on your income and goals...",
          "savingsPotential": 500
        }
      `;

      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are a budget optimization AI. Provide realistic budget recommendations. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 500,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from AI');

      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating budget recommendations:', error);
      return {
        recommendedBudgets: {},
        reasoning: 'Unable to generate recommendations at this time.',
        savingsPotential: 0,
      };
    }
  }

  static async analyzeSpendingPatterns(
    transactions: Array<{
      amount: number;
      description: string;
      category: string;
      date: string;
    }>
  ): Promise<{
    trends: string[];
    anomalies: string[];
    recommendations: string[];
  }> {
    try {
      const prompt = `
        Analyze these spending patterns:
        ${transactions.map(t => `- ${t.date}: ${t.description} - $${t.amount} (${t.category})`).join('\n')}
        
        Return JSON:
        {
          "trends": ["Spending increased 15% this month", "More dining out than usual"],
          "anomalies": ["Unusual $500 expense on 2024-01-15"],
          "recommendations": ["Consider meal planning to reduce dining costs"]
        }
      `;

      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are a spending pattern analysis AI. Identify trends, anomalies, and provide recommendations. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.4,
        max_tokens: 600,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from AI');

      return JSON.parse(response);
    } catch (error) {
      console.error('Error analyzing spending patterns:', error);
      return {
        trends: [],
        anomalies: [],
        recommendations: [],
      };
    }
  }
}
