#!/bin/bash

# Azure App Service startup script for Ticket Tango
# This script ensures the application starts correctly in the Azure environment

echo "Starting Ticket Tango application..."

# Set working directory
cd /home/site/wwwroot

# Install production dependencies only
echo "Installing production dependencies..."
npm install --production --verbose

# Verify the built files exist
if [ ! -f "dist/server/index.js" ]; then
    echo "Error: Server build not found at dist/server/index.js"
    exit 1
fi

echo "Build files verified successfully"

# Set environment variables for Azure
export NODE_ENV=production
export PORT=${PORT:-8080}

# Start the application
echo "Starting Node.js server on port $PORT..."
node dist/server/index.js