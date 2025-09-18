#!/bin/bash

# AI Finance Tracker Setup Script
echo "🚀 Setting up AI Finance Tracker..."

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

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating environment file..."
    cp env.example .env.local
    echo "⚠️  Please edit .env.local with your actual API keys and database URL"
else
    echo "✅ Environment file already exists"
fi

# Generate Prisma client
echo "🗄️  Setting up database..."
npx prisma generate

# Check if database is accessible
echo "🔍 Checking database connection..."
if npx prisma db push --accept-data-loss; then
    echo "✅ Database setup successful"
else
    echo "⚠️  Database setup failed. Please check your DATABASE_URL in .env.local"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your API keys:"
echo "   - OpenAI API key for AI features"
echo "   - Database URL for data storage"
echo "   - Supabase credentials (optional)"
echo ""
echo "2. Run the development server:"
echo "   npm run dev"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Happy coding! 🤖💰"
