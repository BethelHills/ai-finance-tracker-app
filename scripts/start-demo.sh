#!/bin/bash

# AI Finance Tracker Demo Startup Script
echo "🚀 Starting AI Finance Tracker Demo..."

# Get local IP address
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

echo "📱 Demo URLs:"
echo "   Local:    http://localhost:3000"
echo "   Network:  http://$LOCAL_IP:3000"
echo ""
echo "🌐 Access from other devices on your network using:"
echo "   http://$LOCAL_IP:3000"
echo ""
echo "📋 Demo Features:"
echo "   ✅ Interactive Dashboard with AI Insights"
echo "   ✅ Transaction Management with AI Categorization"
echo "   ✅ Budget Tracking with AI Optimization"
echo "   ✅ Real-time Analytics and Charts"
echo "   ✅ Responsive Design for Mobile & Desktop"
echo ""
echo "🤖 AI Features (Note: Requires OpenAI API key for full functionality):"
echo "   - Smart Transaction Categorization"
echo "   - Financial Insights Generation"
echo "   - Budget Optimization Recommendations"
echo "   - Predictive Analytics"
echo ""
echo "⚙️  To enable AI features:"
echo "   1. Copy env.example to .env.local"
echo "   2. Add your OpenAI API key"
echo "   3. Restart the server"
echo ""
echo "🛑 Press Ctrl+C to stop the demo"
echo ""

# Start the development server
HOST=0.0.0.0 npm run dev
