#!/bin/bash

# AI Finance Tracker - Development Setup Script
echo "🚀 Setting up AI Finance Tracker development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npm run db:generate

# Run linting
echo "🔍 Running linter..."
npm run lint

# Run type checking
echo "🔧 Running type checking..."
npm run type-check

# Format code
echo "✨ Formatting code..."
npm run format

echo "✅ Development setup complete!"
echo ""
echo "🎯 Available commands:"
echo "  npm run dev          - Start development server"
echo "  npm run build        - Build for production"
echo "  npm run lint         - Run ESLint"
echo "  npm run format       - Format code with Prettier"
echo "  npm run type-check   - Run TypeScript type checking"
echo "  npm run db:studio    - Open Prisma Studio"
echo ""
echo "🌐 Start the development server with: npm run dev"
