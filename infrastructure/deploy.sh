#!/bin/bash

# Azure Deployment Script for Ticket Tango
# This script deploys the infrastructure to Azure using Bicep templates

set -e

# Configuration
RESOURCE_GROUP_NAME="tickettango-rg"
LOCATION="East US"
DEPLOYMENT_NAME="tickettango-deployment-$(date +%Y%m%d-%H%M%S)"

echo "🚀 Starting Azure deployment for Ticket Tango..."

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
echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Deployment Summary:"
echo "   Web App URL: $WEB_APP_URL"
echo "   Web App Name: $WEB_APP_NAME"
echo "   SQL Server: $SQL_SERVER_NAME"
echo "   Resource Group: $RESOURCE_GROUP_NAME"
echo ""
echo "🔗 Next Steps:"
echo "   1. Deploy your application code to the App Service"
echo "   2. Configure CI/CD pipeline"
echo "   3. Set up custom domain (optional)"
echo "   4. Configure monitoring and alerts"
echo ""
echo "💡 To deploy application code:"
echo "   az webapp deployment source config-zip \\"
echo "     --resource-group $RESOURCE_GROUP_NAME \\"
echo "     --name $WEB_APP_NAME \\"
echo "     --src app.zip"
echo ""