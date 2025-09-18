import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface OpenAPISpec {
  openapi: string
  info: {
    title: string
    version: string
    description: string
  }
  servers: Array<{
    url: string
    description: string
  }>
  paths: Record<string, any>
  components: {
    schemas: Record<string, any>
    securitySchemes: Record<string, any>
  }
}

export interface GeneratedAPIClient {
  client: string
  types: string
  tests: string
  hooks: string
}

export class OpenAPIGenerator {
  static async generateOpenAPISpec(schema: any): Promise<OpenAPISpec> {
    try {
      const prompt = `
        Generate a complete OpenAPI 3.0 specification for the AI Finance Tracker API based on this Prisma schema:
        
        ${JSON.stringify(schema, null, 2)}
        
        Generate:
        1. Complete OpenAPI 3.0 specification
        2. All CRUD endpoints for each model
        3. Proper request/response schemas
        4. Authentication schemes
        5. Error response schemas
        6. Pagination and filtering parameters
        7. AI-specific endpoints for insights and categorization
        
        Include these endpoints:
        - GET /api/{model} - List with pagination and filtering
        - GET /api/{model}/{id} - Get by ID
        - POST /api/{model} - Create new record
        - PUT /api/{model}/{id} - Update record
        - DELETE /api/{model}/{id} - Delete record
        - POST /api/ai/categorize - AI categorization
        - POST /api/ai/insights - Generate insights
        - POST /api/ai/optimize-budget - Budget optimization
        
        Return valid OpenAPI 3.0 JSON specification.
      `

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert at generating OpenAPI specifications. Create comprehensive, well-structured API documentation."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 8000
      })

      const response = completion.choices[0]?.message?.content
      if (!response) throw new Error('No response from AI')

      return JSON.parse(response)
    } catch (error) {
      console.error('Error generating OpenAPI spec:', error)
      throw new Error('Failed to generate OpenAPI specification')
    }
  }

  static async generateAPIClient(openApiSpec: OpenAPISpec): Promise<GeneratedAPIClient> {
    try {
      const prompt = `
        Generate a TypeScript API client based on this OpenAPI specification:
        
        ${JSON.stringify(openApiSpec, null, 2)}
        
        Generate:
        1. TypeScript API client class with all endpoints
        2. TypeScript types for all request/response schemas
        3. Comprehensive unit tests
        4. React hooks for each endpoint
        
        The client should include:
        - Type-safe methods for all endpoints
        - Request/response type safety
        - Error handling
        - Authentication support
        - Request/response interceptors
        - Retry logic for failed requests
        - Caching support
        
        Return as JSON with keys: client, types, tests, hooks
      `

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert at generating TypeScript API clients. Create production-ready, type-safe API clients."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 8000
      })

      const response = completion.choices[0]?.message?.content
      if (!response) throw new Error('No response from AI')

      return JSON.parse(response)
    } catch (error) {
      console.error('Error generating API client:', error)
      throw new Error('Failed to generate API client')
    }
  }

  static async generateAPIDocumentation(openApiSpec: OpenAPISpec): Promise<string> {
    try {
      const prompt = `
        Generate comprehensive API documentation in Markdown format based on this OpenAPI specification:
        
        ${JSON.stringify(openApiSpec, null, 2)}
        
        Include:
        1. API overview and authentication
        2. Endpoint documentation with examples
        3. Request/response schemas
        4. Error handling guide
        5. Code examples in TypeScript and JavaScript
        6. Rate limiting and best practices
        7. AI-specific endpoints documentation
      `

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert at generating API documentation. Create clear, comprehensive, and well-structured documentation."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 6000
      })

      const response = completion.choices[0]?.message?.content
      if (!response) throw new Error('No response from AI')

      return response
    } catch (error) {
      console.error('Error generating API documentation:', error)
      throw new Error('Failed to generate API documentation')
    }
  }
}
