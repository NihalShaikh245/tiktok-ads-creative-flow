#!/bin/bash

echo "Testing TikTok OAuth Integration"
echo "================================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create one from .env.example"
    exit 1
fi

# Check environment variables
echo "Checking environment variables..."
if [ -z "$REACT_APP_TIKTOK_CLIENT_KEY" ]; then
    echo "❌ REACT_APP_TIKTOK_CLIENT_KEY is not set"
    exit 1
fi

if [ -z "$REACT_APP_TIKTOK_CLIENT_SECRET" ]; then
    echo "❌ REACT_APP_TIKTOK_CLIENT_SECRET is not set"
    exit 1
fi

echo "✅ Environment variables are set"

# Build the app
echo "Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "🎉 OAuth setup is ready!"
echo "To test the OAuth flow:"
echo "1. Run 'npm start'"
echo "2. Navigate to http://localhost:3000"
echo "3. Click 'Connect TikTok Ads Account'"
echo "4. Authorize the application on TikTok"
echo "5. You should be redirected back with an access token"