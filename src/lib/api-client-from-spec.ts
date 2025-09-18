// AI-Generated API Client from OpenAPI Specification
// This demonstrates API-aware AI generation based on our OpenAPI spec

import { z } from 'zod'

// AI analyzed our OpenAPI spec and generated these TypeScript types
interface OpenAPISpec {
  openapi: string
  info: {
    title: string
    version: string
    description: string
  }
  paths: {
    '/api/transactions': {
      get: {
        parameters: Array<{
          name: string
          in: 'query'
          schema: { type: string }
          required?: boolean
        }>
        responses: {
          '200': {
            content: {
              'application/json': {
                schema: {
                  type: 'object'
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/Transaction' } }
                    pagination: { $ref: '#/components/schemas/Pagination' }
                  }
                }
              }
            }
          }
        }
      }
      post: {
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateTransactionRequest' }
            }
          }
        }
        responses: {
          '201': {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Transaction' }
              }
            }
          }
        }
      }
    }
    '/api/ai/categorize': {
      post: {
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CategorizeRequest' }
            }
          }
        }
        responses: {
          '200': {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CategorizeResponse' }
              }
            }
          }
        }
      }
    }
  }
  components: {
    schemas: {
      Transaction: {
        type: 'object'
        properties: {
          id: { type: 'string' }
          amount: { type: 'number' }
          description: { type: 'string' }
          date: { type: 'string', format: 'date-time' }
          type: { type: 'string', enum: ['INCOME', 'EXPENSE', 'TRANSFER'] }
          categoryId: { type: 'string' }
          accountId: { type: 'string' }
          userId: { type: 'string' }
          aiCategory: { type: 'string' }
          aiConfidence: { type: 'number' }
          aiTags: { type: 'array', items: { type: 'string' } }
        }
        required: ['id', 'amount', 'description', 'date', 'type', 'accountId', 'userId']
      }
      CreateTransactionRequest: {
        type: 'object'
        properties: {
          amount: { type: 'number' }
          description: { type: 'string' }
          date: { type: 'string', format: 'date-time' }
          type: { type: 'string', enum: ['INCOME', 'EXPENSE', 'TRANSFER'] }
          categoryId: { type: 'string' }
          accountId: { type: 'string' }
        }
        required: ['amount', 'description', 'date', 'type', 'accountId']
      }
      CategorizeRequest: {
        type: 'object'
        properties: {
          description: { type: 'string' }
          amount: { type: 'number' }
        }
        required: ['description', 'amount']
      }
      CategorizeResponse: {
        type: 'object'
        properties: {
          category: { type: 'string' }
          confidence: { type: 'number' }
          tags: { type: 'array', items: { type: 'string' } }
        }
        required: ['category', 'confidence', 'tags']
      }
      Pagination: {
        type: 'object'
        properties: {
          page: { type: 'number' }
          limit: { type: 'number' }
          total: { type: 'number' }
          totalPages: { type: 'number' }
          hasNext: { type: 'boolean' }
          hasPrev: { type: 'boolean' }
        }
        required: ['page', 'limit', 'total', 'totalPages', 'hasNext', 'hasPrev']
      }
    }
  }
}

// AI-Generated TypeScript Types from OpenAPI Schema
export type Transaction = {
  id: string
  amount: number
  description: string
  date: string
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
  categoryId?: string
  accountId: string
  userId: string
  aiCategory?: string
  aiConfidence?: number
  aiTags?: string[]
}

export type CreateTransactionRequest = {
  amount: number
  description: string
  date: string
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
  categoryId?: string
  accountId: string
}

export type CategorizeRequest = {
  description: string
  amount: number
}

export type CategorizeResponse = {
  category: string
  confidence: number
  tags: string[]
}

export type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// AI-Generated Zod Validation Schemas from OpenAPI
export const CreateTransactionRequestSchema = z.object({
  amount: z.number().finite(),
  description: z.string().min(1).max(255),
  date: z.string().datetime(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  categoryId: z.string().uuid().optional(),
  accountId: z.string().uuid()
})

export const CategorizeRequestSchema = z.object({
  description: z.string().min(1).max(255),
  amount: z.number().finite()
})

// AI-Generated API Client Class from OpenAPI Specification
export class OpenAPIGeneratedClient {
  private baseURL: string
  private apiKey?: string

  constructor(baseURL: string, apiKey?: string) {
    this.baseURL = baseURL
    this.apiKey = apiKey
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  // AI-Generated Methods from OpenAPI Paths
  async getTransactions(params: {
    page?: number
    limit?: number
    search?: string
    type?: 'INCOME' | 'EXPENSE' | 'TRANSFER'
    categoryId?: string
    accountId?: string
    userId: string
    startDate?: string
    endDate?: string
    sortBy?: 'date' | 'amount' | 'description'
    sortOrder?: 'asc' | 'desc'
  }): Promise<{ data: Transaction[]; pagination: Pagination }> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })

    return this.request<{ data: Transaction[]; pagination: Pagination }>(
      `/api/transactions?${searchParams}`
    )
  }

  async createTransaction(data: CreateTransactionRequest): Promise<Transaction> {
    // Validate input using AI-generated schema
    const validatedData = CreateTransactionRequestSchema.parse(data)
    
    return this.request<Transaction>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(validatedData)
    })
  }

  async categorizeTransaction(data: CategorizeRequest): Promise<CategorizeResponse> {
    // Validate input using AI-generated schema
    const validatedData = CategorizeRequestSchema.parse(data)
    
    return this.request<CategorizeResponse>('/api/ai/categorize', {
      method: 'POST',
      body: JSON.stringify(validatedData)
    })
  }
}

// AI-Generated Usage Example
export const apiClient = new OpenAPIGeneratedClient(
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  process.env.NEXT_PUBLIC_API_KEY
)

/*
AI PROMPT USED:
"Generate a complete TypeScript API client from this OpenAPI specification. 
Include:
1. TypeScript types for all schemas
2. Zod validation schemas for request validation
3. A complete API client class with methods for all endpoints
4. Proper error handling and type safety
5. Usage examples

OpenAPI Spec: [provided the full specification]"

This demonstrates API-aware AI generation where the AI analyzed the OpenAPI 
specification and generated corresponding TypeScript types, validation schemas, 
and a complete API client class.
*/
