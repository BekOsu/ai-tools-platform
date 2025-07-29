#!/bin/bash

echo "🚀 Starting AI Tools Platform Development Server"
echo "================================================"

# Clean cache and dependencies
echo "🧹 Cleaning cache..."
rm -rf .next
rm -rf node_modules/.cache

# Verify components
echo "🔍 Verifying components..."
node verify-components.js

# Check if codegen service is needed
echo "🔧 Checking codegen service..."
if curl -f http://localhost:8002/health >/dev/null 2>&1; then
    echo "✅ Codegen service is running on port 8002"
else
    echo "⚠️  Codegen service not running on port 8002"
    echo "   To start it: cd services/codegen-service && npm run dev"
fi

# Start development server
echo ""
echo "🚀 Starting Next.js development server..."
echo "   Frontend will be available at: http://localhost:3000"
echo "   Press Ctrl+C to stop"
echo ""

npm run dev