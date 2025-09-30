#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up environment variables for AI Finance Tracker...\n');

const envContent = `# Resend API Configuration
RESEND_API_KEY=re_ihz4ngZ3_J9HVJQ53WycnJkZcjcvUw8Uv
EMAIL_FROM="AI Finance Tracker <noreply@aifinancetracker.com>"

# Supabase Configuration (Demo values for development)
NEXT_PUBLIC_SUPABASE_URL=https://demo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=demo-anon-key-for-development-only
SUPABASE_SERVICE_ROLE_KEY=demo-service-role-key-for-development-only

# Database Configuration
DATABASE_URL="postgresql://demo:demo@demo.supabase.co:5432/demo"

# Redis Configuration (Optional - for production)
REDIS_URL=redis://localhost:6379

# Plaid Configuration (Optional)
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox

# Paystack Configuration (Optional)
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key

# Stripe Configuration (Optional)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Email Configuration (Fallback SMTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false

# Security
NEXTAUTH_SECRET=your-nextauth-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Development
NODE_ENV=development
`;

const envPath = path.join(__dirname, '.env.local');

try {
  // Check if .env.local already exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.local already exists. Backing up to .env.local.backup');
    fs.copyFileSync(envPath, path.join(__dirname, '.env.local.backup'));
  }

  // Write the new .env.local file
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ Environment variables configured successfully!');
  console.log('📧 Resend API Key: re_ihz4ngZ3_J9HVJQ53WycnJkZcjcvUw8Uv');
  console.log('📧 Email From: AI Finance Tracker <noreply@aifinancetracker.com>');
  console.log('\n🚀 You can now test the email configuration by visiting:');
  console.log('   http://localhost:3000/api/test-resend-config');
  console.log('\n📝 To test OTP functionality, visit:');
  console.log('   http://localhost:3000/auth/enhanced-signup');
  console.log('   http://localhost:3000/test-otp');
  
} catch (error) {
  console.error('❌ Failed to create .env.local:', error.message);
  console.log('\n📝 Please create .env.local manually with the following content:');
  console.log(envContent);
}
