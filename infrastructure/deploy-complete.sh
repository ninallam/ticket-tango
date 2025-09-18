#!/bin/bash

# Complete Azure deployment script for Ticket Tango
# This script handles both infrastructure and application deployment

set -e

# Configuration
RESOURCE_GROUP_NAME="tickettango-rg"
LOCATION="East US"
DEPLOYMENT_NAME="tickettango-deployment-$(date +%Y%m%d-%H%M%S)"

echo "🚀 Starting complete Azure deployment for Ticket Tango..."
echo ""

# Check for Azure Developer CLI first
if command -v azd &> /dev/null; then
    echo "✨ Azure Developer CLI found! Using azd for deployment..."
    read -p "Do you want to use Azure Developer CLI (azd) for deployment? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔧 Using Azure Developer CLI for complete deployment..."
        
        # Initialize azd if needed
        if [ ! -f ".azure/environments/.env" ]; then
            echo "📋 Initializing Azure Developer CLI environment..."
            azd init --location "$LOCATION"
        fi
        
        # Deploy everything with azd
        azd up
        exit 0
    fi
fi

echo "🔧 Using traditional Azure CLI deployment..."
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed. Please install it first."
    exit 1
fi

# Check if user is logged in
if ! az account show &> /dev/null; then
    echo "❌ Not logged in to Azure. Please run 'az login' first."
    exit 1
fi

# Get current subscription
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
SUBSCRIPTION_NAME=$(az account show --query name -o tsv)

echo "📋 Deployment Configuration:"
echo "   Subscription: $SUBSCRIPTION_NAME ($SUBSCRIPTION_ID)"
echo "   Resource Group: $RESOURCE_GROUP_NAME"
echo "   Location: $LOCATION"
echo "   Deployment Name: $DEPLOYMENT_NAME"
echo ""

# Confirm deployment
read -p "Do you want to proceed with the deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled."
    exit 1
fi

echo "🏗️  Creating resource group..."
az group create \
    --name $RESOURCE_GROUP_NAME \
    --location "$LOCATION" \
    --output table

echo "📦 Deploying infrastructure..."
az deployment group create \
    --resource-group $RESOURCE_GROUP_NAME \
    --name $DEPLOYMENT_NAME \
    --template-file main.bicep \
    --parameters @parameters.json \
    --output table

echo "📊 Getting deployment outputs..."
WEB_APP_URL=$(az deployment group show \
    --resource-group $RESOURCE_GROUP_NAME \
    --name $DEPLOYMENT_NAME \
    --query properties.outputs.webAppUrl.value \
    --output tsv)

WEB_APP_NAME=$(az deployment group show \
    --resource-group $RESOURCE_GROUP_NAME \
    --name $DEPLOYMENT_NAME \
    --query properties.outputs.webAppName.value \
    --output tsv)

SQL_SERVER_NAME=$(az deployment group show \
    --resource-group $RESOURCE_GROUP_NAME \
    --name $DEPLOYMENT_NAME \
    --query properties.outputs.sqlServerName.value \
    --output tsv)

echo ""
echo "✅ Infrastructure deployment completed successfully!"
echo ""

# Deploy application code automatically
echo "🏗️  Building and deploying application..."

# Build the application
echo "📦 Building application..."
cd ..
npm run build

# Create deployment package for combined app
echo "📦 Creating combined deployment package..."
mkdir -p deployment-temp

# Copy server build files
cp -r dist/server/* deployment-temp/
cp package.json deployment-temp/

# Copy client build files to public directory for serving
mkdir -p deployment-temp/public
cp -r client/build/* deployment-temp/public/

# Create web.config for proper routing
cat > deployment-temp/web.config << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="index.js" verb="*" modules="iisnode"/>
    </handlers>
    <rewrite>
      <rules>
        <!-- Handle static files -->
        <rule name="StaticContent" stopProcessing="true">
          <match url="^public/(.*)"/>
          <action type="Rewrite" url="public/{R:1}"/>
        </rule>
        <!-- Handle API routes -->
        <rule name="API" stopProcessing="true">
          <match url="^api/(.*)"/>
          <action type="Rewrite" url="index.js"/>
        </rule>
        <!-- Handle client-side routing - serve index.html for non-API routes -->
        <rule name="SPA" stopProcessing="true">
          <match url=".*"/>
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true"/>
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true"/>
            <add input="{REQUEST_URI}" pattern="^/(api|public)" negate="true"/>
          </conditions>
          <action type="Rewrite" url="public/index.html"/>
        </rule>
      </rules>
    </rewrite>
    <iisnode node_env="production" 
             nodeProcessCommandLine="&quot;%programfiles%\nodejs\node.exe&quot;"
             interceptor="&quot;%programfiles%\iisnode\interceptor.js&quot;" />
  </system.webServer>
</configuration>
EOF

# Create production package.json
cat > deployment-temp/package.json << 'EOF'
{
  "name": "ticket-tango",
  "version": "1.0.0",
  "description": "A sample website to book tickets for concerts and events",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "@azure/identity": "^4.0.1",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-rate-limit": "^7.1.5",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "mssql": "^10.0.1"
  }
}
EOF

# Create deployment ZIP
cd deployment-temp
zip -r ../app.zip . > /dev/null
cd ..

# Deploy to Azure App Service
echo "🚀 Deploying to Azure App Service..."
az webapp deployment source config-zip \
    --resource-group $RESOURCE_GROUP_NAME \
    --name $WEB_APP_NAME \
    --src app.zip \
    --timeout 600

# Cleanup
rm -rf deployment-temp app.zip

# Back to infrastructure directory
cd infrastructure

echo ""
echo "🎉 Complete deployment finished successfully!"
echo ""
echo "📋 Deployment Summary:"
echo "   Web App URL: $WEB_APP_URL"
echo "   Web App Name: $WEB_APP_NAME"
echo "   SQL Server: $SQL_SERVER_NAME"
echo "   Resource Group: $RESOURCE_GROUP_NAME"
echo ""
echo "🔗 Next Steps:"
echo "   1. Visit your application at: $WEB_APP_URL"
echo "   2. Configure CI/CD pipeline for automatic deployments"
echo "   3. Set up custom domain (optional)"
echo "   4. Configure monitoring and alerts"
echo ""
echo "💡 For future deployments:"
echo "   # Complete infrastructure + application deployment"
echo "   ./deploy-complete.sh"
echo ""
echo "   # Azure Developer CLI (if available)"
echo "   azd up"
echo ""
echo "   # Infrastructure only"
echo "   ./deploy.sh"
echo ""