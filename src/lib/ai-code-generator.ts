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

export interface ComponentRequirements {
  name: string;
  description: string;
  props: Array<{
    name: string;
    type: string;
    required: boolean;
    description?: string;
  }>;
  features: string[];
  styling?: 'tailwind' | 'css-modules' | 'styled-components';
  accessibility?: boolean;
  responsive?: boolean;
}

export interface GeneratedComponent {
  component: string;
  types: string;
  tests: string;
  storybook: string;
  documentation: string;
}

export class AICodeGenerator {
  static async generateComponent(
    requirements: ComponentRequirements
  ): Promise<GeneratedComponent> {
    try {
      const prompt = `
        Generate a React component for the AI Finance Tracker application.
        
        Requirements:
        - Name: ${requirements.name}
        - Description: ${requirements.description}
        - Props: ${JSON.stringify(requirements.props, null, 2)}
        - Features: ${requirements.features.join(', ')}
        - Styling: ${requirements.styling || 'tailwind'}
        - Accessibility: ${requirements.accessibility ? 'Yes' : 'No'}
        - Responsive: ${requirements.responsive ? 'Yes' : 'No'}
        
        Please generate:
        1. The main component file (TypeScript React)
        2. TypeScript interfaces
        3. Unit tests (Jest + React Testing Library)
        4. Storybook story
        5. Documentation
        
        Follow these patterns:
        - Use Next.js 14 App Router patterns
        - Use Tailwind CSS for styling
        - Use Radix UI primitives where appropriate
        - Include proper TypeScript types
        - Follow accessibility best practices
        - Use the existing design system colors and spacing
        
        Return as JSON with keys: component, types, tests, storybook, documentation
      `;

      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert React/TypeScript developer. Generate high-quality, production-ready code that follows best practices. Always return valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from AI');

      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating component:', error);
      throw new Error('Failed to generate component');
    }
  }

  static async generateHook(requirements: {
    name: string;
    description: string;
    parameters: Array<{ name: string; type: string; description: string }>;
    returnType: string;
    dependencies?: string[];
  }): Promise<{ hook: string; types: string; tests: string }> {
    try {
      const prompt = `
        Generate a custom React hook for the AI Finance Tracker.
        
        Requirements:
        - Name: ${requirements.name}
        - Description: ${requirements.description}
        - Parameters: ${JSON.stringify(requirements.parameters, null, 2)}
        - Return Type: ${requirements.returnType}
        - Dependencies: ${requirements.dependencies?.join(', ') || 'None'}
        
        The hook should:
        - Follow React hooks best practices
        - Include proper TypeScript types
        - Handle loading and error states
        - Include cleanup logic if needed
        - Be optimized for performance
        
        Return as JSON with keys: hook, types, tests
      `;

      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert React developer specializing in custom hooks. Generate clean, reusable, and well-typed hooks.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 3000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from AI');

      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating hook:', error);
      throw new Error('Failed to generate hook');
    }
  }

  static async generateAPIEndpoint(requirements: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    description: string;
    parameters?: Array<{ name: string; type: string; required: boolean }>;
    responseType: string;
    authentication?: boolean;
  }): Promise<{ endpoint: string; types: string; tests: string }> {
    try {
      const prompt = `
        Generate a Next.js API route for the AI Finance Tracker.
        
        Requirements:
        - Method: ${requirements.method}
        - Path: ${requirements.path}
        - Description: ${requirements.description}
        - Parameters: ${JSON.stringify(requirements.parameters || [], null, 2)}
        - Response Type: ${requirements.responseType}
        - Authentication: ${requirements.authentication ? 'Required' : 'Not required'}
        
        The endpoint should:
        - Use Next.js 14 App Router API routes
        - Include proper error handling
        - Validate input parameters
        - Return appropriate HTTP status codes
        - Include TypeScript types
        - Follow REST API best practices
        
        Return as JSON with keys: endpoint, types, tests
      `;

      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert Next.js developer. Generate secure, well-structured API endpoints that follow best practices.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 3000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from AI');

      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating API endpoint:', error);
      throw new Error('Failed to generate API endpoint');
    }
  }

  static async generateDatabaseModel(requirements: {
    name: string;
    description: string;
    fields: Array<{
      name: string;
      type: string;
      required: boolean;
      unique?: boolean;
      relation?: { model: string; type: string };
    }>;
    indexes?: string[];
  }): Promise<{ model: string; migration: string }> {
    try {
      const prompt = `
        Generate a Prisma model for the AI Finance Tracker database.
        
        Requirements:
        - Name: ${requirements.name}
        - Description: ${requirements.description}
        - Fields: ${JSON.stringify(requirements.fields, null, 2)}
        - Indexes: ${requirements.indexes?.join(', ') || 'None'}
        
        The model should:
        - Follow Prisma schema conventions
        - Include proper field types and constraints
        - Include appropriate relations
        - Include indexes for performance
        - Follow the existing schema patterns
        
        Also generate the corresponding migration SQL.
        
        Return as JSON with keys: model, migration
      `;

      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert database designer. Generate well-structured Prisma models that follow best practices for performance and data integrity.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 3000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from AI');

      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating database model:', error);
      throw new Error('Failed to generate database model');
    }
  }
}
