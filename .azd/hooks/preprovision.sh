#!/bin/bash

# Pre-provision hook for Azure Developer CLI
# This script runs before infrastructure provisioning

echo "🔧 Pre-provision: Checking dependencies..."

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm run install:all
fi

echo "✅ Pre-provision checks completed"