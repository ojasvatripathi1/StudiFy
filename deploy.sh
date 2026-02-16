#!/bin/bash
# StudiFy Deployment Script
# Run this to deploy StudiFy to Firebase

set -e

echo "🚀 StudiFy Deployment Script"
echo "================================"

# Step 1: Install Firebase CLI
echo "✓ Checking Firebase CLI..."
if ! command -v firebase &> /dev/null; then
    echo "Installing Firebase CLI..."
    npm install -g firebase-tools
fi

# Step 2: Build the app
echo "🔨 Building Next.js app..."
npm run build

# Step 3: Ensure webframeworks experiment is enabled
echo "🔧 Enabling Firebase webframeworks..."
firebase experiments:enable webframeworks

# Step 4: Deploy
echo "📤 Deploying to Firebase..."
firebase deploy

# Step 5: Get the URL
echo ""
echo "✅ Deployment complete!"
echo ""
echo "Your app is now live at:"
echo "  📱 https://studify-2.web.app"
echo ""
echo "Cloud Functions deployed to:"
echo "  ⚙️  us-central1 region"
echo ""
