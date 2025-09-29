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
    amount: number,
    userHistory?: Array<{
      description: string;
      category: string;
      tags: string[];
      userCorrected?: boolean;
    }>
  ): Promise<{
    category: string;
    confidence: number;
    tags: string[];
    reasoning: string;
  }> {
    try {
      const historyContext = userHistory
        ? `
        
        User's previous categorizations (learn from these):
        ${userHistory
          .slice(-10)
          .map(
            h =>
              `- "${h.description}" → ${h.category} [${h.tags.join(', ')}]${
                h.userCorrected ? ' (user corrected)' : ''
              }`
          )
          .join('\n')}`
        : '';

      const prompt = `
        Categorize this transaction with high accuracy:
        Description: "${description}"
        Amount: $${amount}${historyContext}
        
        Use these categories:
        - Food & Dining (restaurants, groceries, food delivery)
        - Transportation (gas, public transit, rideshare, car maintenance)
        - Housing (rent, mortgage, utilities, home improvement)
        - Entertainment (movies, games, subscriptions, events)
        - Utilities (electricity, water, internet, phone)
        - Healthcare (medical, pharmacy, insurance)
        - Shopping (clothing, electronics, general retail)
        - Education (courses, books, school supplies)
        - Travel (flights, hotels, vacation expenses)
        - Business (work expenses, professional services)
        - Investment (stocks, crypto, savings)
        - Other (miscellaneous expenses)
        
        Return JSON:
        {
          "category": "Food & Dining",
          "confidence": 0.95,
          "tags": ["grocery", "supermarket", "organic"],
          "reasoning": "This appears to be a grocery store purchase based on the description and amount"
        }
      `;

      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert transaction categorization AI. Learn from user corrections and provide accurate categorizations with detailed reasoning. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 300,
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
        reasoning: 'Unable to categorize due to error',
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

  static async generateSmartAlerts(
    currentSpending: Record<string, number>,
    budgets: Record<string, number>,
    previousMonthSpending: Record<string, number>,
    income: number
  ): Promise<{
    alerts: Array<{
      type: 'warning' | 'success' | 'info';
      title: string;
      message: string;
      priority: 'low' | 'medium' | 'high';
      category?: string;
      amount?: number;
      percentage?: number;
    }>;
  }> {
    try {
      const prompt = `
        Generate smart alerts based on this financial data:
        
        Current month spending by category:
        ${Object.entries(currentSpending)
          .map(([cat, amount]) => `- ${cat}: $${amount}`)
          .join('\n')}
        
        Budget limits:
        ${Object.entries(budgets)
          .map(([cat, amount]) => `- ${cat}: $${amount}`)
          .join('\n')}
        
        Previous month spending:
        ${Object.entries(previousMonthSpending)
          .map(([cat, amount]) => `- ${cat}: $${amount}`)
          .join('\n')}
        
        Monthly income: $${income}
        
        Generate relevant alerts like:
        - Budget warnings (when close to or over budget)
        - Savings achievements (when saved more than last month)
        - Spending trends (unusual increases/decreases)
        - Opportunities (potential savings)
        
        Return JSON:
        {
          "alerts": [
            {
              "type": "warning",
              "title": "Food Budget Alert",
              "message": "You're at 85% of your Food budget ($510/$600)",
              "priority": "medium",
              "category": "Food",
              "amount": 510,
              "percentage": 85
            },
            {
              "type": "success", 
              "title": "Savings Achievement",
              "message": "You saved $150 more than last month!",
              "priority": "low",
              "amount": 150
            }
          ]
        }
      `;

      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are a smart financial alert AI. Generate helpful, actionable alerts for budget management and financial health. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 800,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from AI');

      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating smart alerts:', error);
      return {
        alerts: [],
      };
    }
  }

  static async generateExpenseForecast(
    historicalData: Array<{
      month: string;
      spending: Record<string, number>;
      total: number;
    }>,
    currentMonth: string
  ): Promise<{
    nextMonthForecast: Record<string, number>;
    totalForecast: number;
    confidence: number;
    trends: Array<{
      category: string;
      trend: 'increasing' | 'decreasing' | 'stable';
      percentageChange: number;
    }>;
  }> {
    try {
      const prompt = `
        Predict next month's expenses based on historical data:
        
        Historical spending by month:
        ${historicalData
          .map(
            h =>
              `${h.month}: Total $${h.total} - ${Object.entries(h.spending)
                .map(([cat, amount]) => `${cat}: $${amount}`)
                .join(', ')}`
          )
          .join('\n')}
        
        Current month: ${currentMonth}
        
        Analyze trends and predict next month's spending by category.
        Consider seasonality, recent trends, and spending patterns.
        
        Return JSON:
        {
          "nextMonthForecast": {
            "Food": 650,
            "Transportation": 450,
            "Entertainment": 200
          },
          "totalForecast": 2300,
          "confidence": 0.78,
          "trends": [
            {
              "category": "Food",
              "trend": "increasing",
              "percentageChange": 8.5
            }
          ]
        }
      `;

      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are a financial forecasting AI. Analyze spending patterns and predict future expenses with confidence levels. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 600,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from AI');

      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating expense forecast:', error);
      return {
        nextMonthForecast: {},
        totalForecast: 0,
        confidence: 0,
        trends: [],
      };
    }
  }
}
