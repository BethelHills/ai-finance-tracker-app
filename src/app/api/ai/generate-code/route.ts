import { NextRequest, NextResponse } from 'next/server';
import { AICodeGenerator } from '@/lib/ai-code-generator';

export async function POST(request: NextRequest) {
  try {
    const { type, requirements } = await request.json();

    if (!type || !requirements) {
      return NextResponse.json(
        { error: 'Type and requirements are required' },
        { status: 400 }
      );
    }

    let generatedCode;

    switch (type) {
      case 'component':
        generatedCode = await AICodeGenerator.generateComponent(requirements);
        break;
      case 'hook':
        generatedCode = await AICodeGenerator.generateHook(requirements);
        break;
      case 'api':
        generatedCode = await AICodeGenerator.generateAPIEndpoint(requirements);
        break;
      case 'model':
        generatedCode =
          await AICodeGenerator.generateDatabaseModel(requirements);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid type. Must be component, hook, api, or model' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      type,
      generatedCode,
    });
  } catch (error) {
    console.error('Error generating code:', error);
    return NextResponse.json(
      { error: 'Failed to generate code' },
      { status: 500 }
    );
  }
}

// GET endpoint to list available code generation types
export async function GET() {
  return NextResponse.json({
    availableTypes: [
      {
        type: 'component',
        description:
          'Generate React components with TypeScript, Tailwind CSS, and accessibility features',
        requiredFields: ['name', 'description', 'props', 'features'],
      },
      {
        type: 'hook',
        description:
          'Generate custom React hooks with proper TypeScript types and error handling',
        requiredFields: ['name', 'description', 'parameters', 'returnType'],
      },
      {
        type: 'api',
        description:
          'Generate Next.js API routes with proper error handling and validation',
        requiredFields: ['method', 'path', 'description', 'responseType'],
      },
      {
        type: 'model',
        description:
          'Generate Prisma database models with proper relations and indexes',
        requiredFields: ['name', 'description', 'fields'],
      },
    ],
    examples: {
      component: {
        name: 'BudgetCard',
        description: 'A card component for displaying budget information',
        props: [
          {
            name: 'budget',
            type: 'Budget',
            required: true,
            description: 'Budget data to display',
          },
          {
            name: 'onEdit',
            type: '() => void',
            required: false,
            description: 'Edit callback',
          },
        ],
        features: ['responsive', 'accessible', 'animated'],
        styling: 'tailwind',
        accessibility: true,
        responsive: true,
      },
      hook: {
        name: 'useTransactions',
        description:
          'A hook for managing transaction data with AI categorization',
        parameters: [
          {
            name: 'filters',
            type: 'TransactionFilters',
            description: 'Filters for transactions',
          },
        ],
        returnType: 'TransactionHookReturn',
        dependencies: ['react', 'ai-service'],
      },
      api: {
        method: 'POST',
        path: '/transactions',
        description: 'Create a new transaction with AI categorization',
        parameters: [
          { name: 'description', type: 'string', required: true },
          { name: 'amount', type: 'number', required: true },
        ],
        responseType: 'TransactionResponse',
        authentication: true,
      },
      model: {
        name: 'Investment',
        description: 'A model for tracking investment data',
        fields: [
          { name: 'id', type: 'String', required: true, unique: true },
          { name: 'symbol', type: 'String', required: true },
          { name: 'shares', type: 'Float', required: true },
          { name: 'purchasePrice', type: 'Float', required: true },
          {
            name: 'userId',
            type: 'String',
            required: true,
            relation: { model: 'User', type: 'many-to-one' },
          },
        ],
        indexes: ['symbol', 'userId'],
      },
    },
  });
}
