# Pre-provision hook for Azure Developer CLI (PowerShell)
# This script runs before infrastructure provisioning

Write-Host "🔧 Pre-provision: Checking dependencies..." -ForegroundColor Cyan

# Check if npm is available
try {
    npm --version | Out-Null
} catch {
    Write-Host "❌ npm is not installed. Please install Node.js and npm first." -ForegroundColor Red
    exit 1
}

# Install dependencies if not already installed
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm run install:all
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Pre-provision checks completed" -ForegroundColor Green