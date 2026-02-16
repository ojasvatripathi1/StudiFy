# StudiFy Deployment Script for PowerShell
# Run this to deploy StudiFy to Firebase

Write-Host "🚀 StudiFy Deployment Script" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Step 1: Check Firebase CLI
Write-Host "`n✓ Checking Firebase CLI..."
$firebaseVersion = firebase --version 2>$null
if ($firebaseVersion) {
    Write-Host "Firebase CLI version: $firebaseVersion" -ForegroundColor Green
} else {
    Write-Host "Installing Firebase CLI..." -ForegroundColor Yellow
    npm install -g firebase-tools
}

# Step 2: Build the app
Write-Host "`n🔨 Building Next.js app..."
npm run build

# Step 3: Enable webframeworks experiment
Write-Host "`n🔧 Enabling Firebase webframeworks..."
firebase experiments:enable webframeworks

# Step 4: Deploy
Write-Host "`n📤 Deploying to Firebase..."
firebase deploy

# Step 5: Summary
Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Your app is now live at:" -ForegroundColor Cyan
Write-Host "  📱 https://studify-2.web.app" -ForegroundColor White
Write-Host ""
Write-Host "Cloud Functions deployed to:" -ForegroundColor Cyan
Write-Host "  ⚙️  us-central1 region" -ForegroundColor White
Write-Host ""
