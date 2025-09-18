import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface APIClientConfig {
  baseURL: string
  apiKey?: string
  timeout?: number
  retries?: number
  cache?: boolean
}

export interface GeneratedAPIClient {
  client: string
  types: string
  hooks: string
  tests: string
  documentation: string
}

export class APIClientGenerator {
  static async generateFromOpenAPI(openApiSpec: any, config: APIClientConfig): Promise<GeneratedAPIClient> {
    try {
      const prompt = `
        Generate a complete TypeScript API client based on this OpenAPI specification:
        
        OpenAPI Spec: ${JSON.stringify(openApiSpec, null, 2)}
        Config: ${JSON.stringify(config, null, 2)}
        
        Generate:
        1. TypeScript API client class with all endpoints
        2. TypeScript types for all request/response schemas
        3. React hooks for each endpoint
        4. Comprehensive unit tests
        5. API documentation
        
        The client should include:
        - Type-safe methods for all endpoints
        - Request/response type safety
        - Error handling with custom error types
        - Authentication support (Bearer token, API key)
        - Request/response interceptors
        - Retry logic for failed requests
        - Caching support with configurable TTL
        - Request cancellation
        - Progress tracking for file uploads
        - Batch operations support
        - Rate limiting handling
        
        Follow these patterns:
        - Use fetch API with proper error handling
        - Include proper TypeScript generics
        - Use async/await throughout
        - Include JSDoc comments for all methods
        - Use Zod for runtime validation
        - Include proper error types
        - Use React Query patterns for hooks
        
        Return as JSON with keys: client, types, hooks, tests, documentation
      `

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert at generating TypeScript API clients from OpenAPI specifications. Create production-ready, type-safe API clients with comprehensive error handling and React integration."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 12000
      })

      const response = completion.choices[0]?.message?.content
      if (!response) throw new Error('No response from AI')

      return JSON.parse(response)
    } catch (error) {
      console.error('Error generating API client:', error)
      throw new Error('Failed to generate API client')
    }
  }

  static async generateFromPrismaSchema(schema: any, config: APIClientConfig): Promise<GeneratedAPIClient> {
    try {
      const prompt = `
        Generate a complete TypeScript API client based on this Prisma schema:
        
        Prisma Schema: ${JSON.stringify(schema, null, 2)}
        Config: ${JSON.stringify(config, null, 2)}
        
        Generate:
        1. TypeScript API client class with CRUD operations for all models
        2. TypeScript types for all models and operations
        3. React hooks for each model's operations
        4. Comprehensive unit tests
        5. API documentation
        
        Include these operations for each model:
        - create(data) - Create new record
        - getById(id) - Get record by ID
        - getMany(query) - Get records with pagination and filtering
        - update(id, data) - Update record
        - delete(id) - Delete record
        - search(query) - Search records
        - getStats() - Get statistics
        
        The client should include:
        - Type-safe methods for all operations
        - Request/response type safety
        - Error handling with custom error types
        - Authentication support
        - Request/response interceptors
        - Retry logic for failed requests
        - Caching support
        - Request cancellation
        - Batch operations support
        - Pagination handling
        - Filtering and sorting support
        
        Follow these patterns:
        - Use fetch API with proper error handling
        - Include proper TypeScript generics
        - Use async/await throughout
        - Include JSDoc comments for all methods
        - Use Zod for runtime validation
        - Include proper error types
        - Use React Query patterns for hooks
        
        Return as JSON with keys: client, types, hooks, tests, documentation
      `

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert at generating TypeScript API clients from Prisma schemas. Create production-ready, type-safe API clients with comprehensive CRUD operations and React integration."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 12000
      })

      const response = completion.choices[0]?.message?.content
      if (!response) throw new Error('No response from AI')

      return JSON.parse(response)
    } catch (error) {
      console.error('Error generating API client:', error)
      throw new Error('Failed to generate API client')
    }
  }

  static async generateMockData(schema: any): Promise<Record<string, any[]>> {
    try {
      const prompt = `
        Generate realistic mock data for this Prisma schema:
        
        ${JSON.stringify(schema, null, 2)}
        
        Generate:
        1. Mock data for each model
        2. Realistic relationships between models
        3. Proper data types and constraints
        4. Financial data that makes sense for a finance tracker
        
        For the finance tracker, include:
        - Realistic transaction descriptions
        - Proper date ranges
        - Realistic amounts
        - Proper category assignments
        - Realistic user data
        - Proper account types
        - Realistic budget data
        - Financial goals that make sense
        
        Return as JSON with model names as keys and arrays of mock data as values.
      `

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert at generating realistic mock data for financial applications. Create data that makes sense for a personal finance tracker."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 8000
      })

      const response = completion.choices[0]?.message?.content
      if (!response) throw new Error('No response from AI')

      return JSON.parse(response)
    } catch (error) {
      console.error('Error generating mock data:', error)
      throw new Error('Failed to generate mock data')
    }
  }
}
