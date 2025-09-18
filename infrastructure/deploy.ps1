# Azure Deployment Script for Ticket Tango (PowerShell)
# This script deploys the infrastructure to Azure using Bicep templates

$ErrorActionPreference = "Stop"

# Configuration
$RESOURCE_GROUP_NAME = "tickettango-rg"
$LOCATION = "East US"
$DEPLOYMENT_NAME = "tickettango-deployment-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

Write-Host "🚀 Starting Azure deployment for Ticket Tango..." -ForegroundColor Cyan

# Check if Azure CLI is installed
try {
    az --version | Out-Null
} catch {
    Write-Host "❌ Azure CLI is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Check if user is logged in
try {
    az account show | Out-Null
} catch {
    Write-Host "❌ Not logged in to Azure. Please run 'az login' first." -ForegroundColor Red
    exit 1
}

# Get current subscription
$SUBSCRIPTION_ID = az account show --query id -o tsv
$SUBSCRIPTION_NAME = az account show --query name -o tsv

Write-Host "📋 Deployment Configuration:" -ForegroundColor Yellow
Write-Host "   Subscription: $SUBSCRIPTION_NAME ($SUBSCRIPTION_ID)"
Write-Host "   Resource Group: $RESOURCE_GROUP_NAME"
Write-Host "   Location: $LOCATION"
Write-Host "   Deployment Name: $DEPLOYMENT_NAME"
Write-Host ""

# Confirm deployment
$response = Read-Host "Do you want to proceed with the deployment? (y/N)"
if ($response -ne "y" -and $response -ne "Y") {
    Write-Host "❌ Deployment cancelled." -ForegroundColor Red
    exit 1
}

Write-Host "🏗️  Creating resource group..." -ForegroundColor Green
az group create --name $RESOURCE_GROUP_NAME --location $LOCATION --output table
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create resource group" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Deploying infrastructure..." -ForegroundColor Green
az deployment group create --resource-group $RESOURCE_GROUP_NAME --name $DEPLOYMENT_NAME --template-file main.bicep --parameters '@parameters.json' --output table
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Infrastructure deployment failed" -ForegroundColor Red
    exit 1
}

Write-Host "📊 Getting deployment outputs..." -ForegroundColor Yellow
$WEB_APP_URL = az deployment group show --resource-group $RESOURCE_GROUP_NAME --name $DEPLOYMENT_NAME --query properties.outputs.webAppUrl.value --output tsv
$WEB_APP_NAME = az deployment group show --resource-group $RESOURCE_GROUP_NAME --name $DEPLOYMENT_NAME --query properties.outputs.webAppName.value --output tsv
$SQL_SERVER_NAME = az deployment group show --resource-group $RESOURCE_GROUP_NAME --name $DEPLOYMENT_NAME --query properties.outputs.sqlServerName.value --output tsv

Write-Host ""
Write-Host "✅ Infrastructure deployment completed successfully!" -ForegroundColor Green
Write-Host ""

# Check if user wants to deploy application code
$response = Read-Host "Do you want to deploy the application code now? (y/N)"
if ($response -eq "y" -or $response -eq "Y") {
    Write-Host "🏗️  Building and deploying application..." -ForegroundColor Cyan
    
    # Build the application
    Write-Host "📦 Building application..." -ForegroundColor Yellow
    Set-Location ..
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed" -ForegroundColor Red
        exit 1
    }
    
    # Create deployment package
    Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow
    if (Test-Path "deployment-temp") {
        Remove-Item -Recurse -Force "deployment-temp"
    }
    New-Item -ItemType Directory -Path "deployment-temp" | Out-Null
    
    # Copy server build files
    Copy-Item -Recurse -Path "dist\server\*" -Destination "deployment-temp\"
    Copy-Item "package.json" -Destination "deployment-temp\"
    
    # Copy client build files to public directory
    New-Item -ItemType Directory -Path "deployment-temp\public" | Out-Null
    Copy-Item -Recurse -Path "client\build\*" -Destination "deployment-temp\public\"
    
    # Create web.config for Azure App Service
    $webConfig = @'
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
'@
    
    Set-Content -Path "deployment-temp\web.config" -Value $webConfig
    
    # Create package.json for production deployment
    $packageJson = @'
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
'@
    
    Set-Content -Path "deployment-temp\package.json" -Value $packageJson
    
    # Create deployment ZIP
    Set-Location deployment-temp
    Compress-Archive -Path ".\*" -DestinationPath "..\app.zip" -Force
    Set-Location ..
    
    # Deploy to Azure App Service
    Write-Host "🚀 Deploying to Azure App Service..." -ForegroundColor Green
    az webapp deployment source config-zip --resource-group $RESOURCE_GROUP_NAME --name $WEB_APP_NAME --src app.zip --timeout 600
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Application deployment failed" -ForegroundColor Red
        exit 1
    }
    
    # Cleanup
    Remove-Item -Recurse -Force "deployment-temp"
    Remove-Item "app.zip"
    
    # Back to infrastructure directory
    Set-Location infrastructure
    
    Write-Host ""
    Write-Host "🎉 Application deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "⏭️  Skipping application deployment." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Deployment Summary:" -ForegroundColor Yellow
Write-Host "   Web App URL: $WEB_APP_URL"
Write-Host "   Web App Name: $WEB_APP_NAME"
Write-Host "   SQL Server: $SQL_SERVER_NAME"
Write-Host "   Resource Group: $RESOURCE_GROUP_NAME"
Write-Host ""
Write-Host "🔗 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Visit your application at: $WEB_APP_URL"
Write-Host "   2. Configure CI/CD pipeline for automatic deployments"
Write-Host "   3. Set up custom domain (optional)"
Write-Host "   4. Configure monitoring and alerts"
Write-Host ""
Write-Host "💡 For future deployments, you can use:" -ForegroundColor Cyan
Write-Host "   # Infrastructure + Application (full deployment)"
Write-Host "   .\deploy.ps1"
Write-Host ""
Write-Host "   # Or use Azure Developer CLI:"
Write-Host "   azd up"
Write-Host ""