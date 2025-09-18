import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const prisma = new PrismaClient();

export interface SchemaAnalysis {
  models: Array<{
    name: string;
    fields: Array<{
      name: string;
      type: string;
      required: boolean;
      unique?: boolean;
      relation?: {
        model: string;
        type: string;
      };
    }>;
    indexes: string[];
    relations: Array<{
      field: string;
      model: string;
      type: string;
    }>;
  }>;
  enums: Array<{
    name: string;
    values: string[];
  }>;
}

export interface GeneratedCRUDService {
  service: string;
  types: string;
  tests: string;
  apiRoutes: string;
}

export class SchemaAwareGenerator {
  static async analyzeSchema(): Promise<SchemaAnalysis> {
    try {
      // Read the Prisma schema file
      const fs = require('fs');
      const path = require('path');
      const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
      const schemaContent = fs.readFileSync(schemaPath, 'utf8');

      const prompt = `
        Analyze this Prisma schema and extract the structure:
        
        ${schemaContent}
        
        Return JSON with this structure:
        {
          "models": [
            {
              "name": "ModelName",
              "fields": [
                {
                  "name": "fieldName",
                  "type": "String|Int|Float|Boolean|DateTime|Json",
                  "required": true,
                  "unique": false,
                  "relation": {
                    "model": "RelatedModel",
                    "type": "one-to-one|one-to-many|many-to-one|many-to-many"
                  }
                }
              ],
              "indexes": ["field1", "field2"],
              "relations": [
                {
                  "field": "relationField",
                  "model": "RelatedModel",
                  "type": "one-to-one|one-to-many|many-to-one|many-to-many"
                }
              ]
            }
          ],
          "enums": [
            {
              "name": "EnumName",
              "values": ["VALUE1", "VALUE2"]
            }
          ]
        }
      `;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert at analyzing Prisma schemas. Extract the structure and return valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 4000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from AI');

      return JSON.parse(response);
    } catch (error) {
      console.error('Error analyzing schema:', error);
      throw new Error('Failed to analyze schema');
    }
  }

  static async generateCRUDService(
    modelName: string,
    schema: SchemaAnalysis
  ): Promise<GeneratedCRUDService> {
    try {
      const model = schema.models.find(m => m.name === modelName);
      if (!model) throw new Error(`Model ${modelName} not found in schema`);

      const prompt = `
        Generate a complete CRUD service for the ${modelName} model based on this schema:
        
        Model: ${modelName}
        Fields: ${JSON.stringify(model.fields, null, 2)}
        Relations: ${JSON.stringify(model.relations, null, 2)}
        Indexes: ${JSON.stringify(model.indexes, null, 2)}
        
        Generate:
        1. A Prisma-based service class with full CRUD operations
        2. TypeScript interfaces for all operations
        3. Comprehensive unit tests
        4. Next.js API routes for REST endpoints
        
        The service should include:
        - Create, Read, Update, Delete operations
        - Pagination and filtering
        - Search functionality
        - Relationship handling
        - Error handling and validation
        - Type safety throughout
        
        Return as JSON with keys: service, types, tests, apiRoutes
      `;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert at generating Prisma-based CRUD services. Generate production-ready code with proper error handling, validation, and type safety.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 6000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from AI');

      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating CRUD service:', error);
      throw new Error('Failed to generate CRUD service');
    }
  }

  static async generateTypeScriptTypes(
    schema: SchemaAnalysis
  ): Promise<string> {
    try {
      const prompt = `
        Generate TypeScript types for this Prisma schema:
        
        ${JSON.stringify(schema, null, 2)}
        
        Generate:
        1. Base types for each model
        2. Create input types (without id, createdAt, updatedAt)
        3. Update input types (all fields optional except id)
        4. Query input types for filtering and pagination
        5. Response types for API endpoints
        6. Enum types
        
        Follow these patterns:
        - Use PascalCase for types
        - Include JSDoc comments
        - Use utility types where appropriate
        - Include proper null/undefined handling
        - Use generics for reusable types
      `;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert at generating TypeScript types from database schemas. Generate comprehensive, well-documented types.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 4000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from AI');

      return response;
    } catch (error) {
      console.error('Error generating TypeScript types:', error);
      throw new Error('Failed to generate TypeScript types');
    }
  }

  static async generateValidationSchemas(
    schema: SchemaAnalysis
  ): Promise<Record<string, string>> {
    try {
      const prompt = `
        Generate Zod validation schemas for this Prisma schema:
        
        ${JSON.stringify(schema, null, 2)}
        
        Generate Zod schemas for:
        1. Create operations (required fields only)
        2. Update operations (all fields optional)
        3. Query operations (filtering and pagination)
        4. Each model's base validation
        
        Follow these patterns:
        - Use appropriate Zod validators
        - Include custom validation rules
        - Add helpful error messages
        - Use transforms where needed
        - Include enum validations
      `;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert at generating Zod validation schemas. Create comprehensive, well-structured validation schemas.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 4000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from AI');

      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating validation schemas:', error);
      throw new Error('Failed to generate validation schemas');
    }
  }
}
