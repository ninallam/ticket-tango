# Azure Deployment Scripts

This directory contains the Azure infrastructure deployment templates and scripts for the Ticket Tango application.

## Files

- `main.bicep` - Main Bicep template defining all Azure resources
- `parameters.json` - Parameter file for deployment
- `deploy.sh` - Deployment script for Linux/macOS
- `deploy.ps1` - Deployment script for Windows PowerShell

## Resources Created

The deployment creates the following Azure resources:

1. **App Service Plan** (Basic B1)
2. **App Service** with System-Assigned Managed Identity
3. **Azure SQL Server** and Database
4. **Storage Account** (for future use)
5. **Application Insights** (for monitoring)

## Prerequisites

1. Azure CLI installed and authenticated
2. Bicep CLI installed
3. Appropriate Azure subscription permissions

## Deployment

### Using Azure CLI (Linux/macOS)

```bash
chmod +x deploy.sh
./deploy.sh
```

### Using PowerShell (Windows)

```powershell
.\deploy.ps1
```

### Manual Deployment

```bash
# Create resource group
az group create --name tickettango-rg --location "East US"

# Deploy template
az deployment group create \
  --resource-group tickettango-rg \
  --template-file main.bicep \
  --parameters @parameters.json
```

## Configuration

Update the `parameters.json` file with your desired configuration:

- `namePrefix`: Prefix for all resource names
- `environment`: Environment name (dev, staging, prod)
- `location`: Azure region
- `sqlAdminLogin`: SQL Server admin username
- `sqlAdminPassword`: SQL Server admin password (use secure value)
- `clientUrl`: Frontend URL for CORS (optional)

## Security Features

- **Managed Identity**: App Service uses system-assigned managed identity for SQL Database access
- **HTTPS Only**: App Service configured for HTTPS only
- **SQL Firewall**: Configured to allow Azure services only
- **TLS 1.2**: Minimum TLS version enforced on storage account

## Post-Deployment

After deployment:

1. **Application is automatically deployed** - Visit the Web App URL to access your application
2. Configure any additional firewall rules if needed
3. Set up CI/CD pipeline for automatic deployments  
4. Configure custom domain and SSL certificate if required
5. Set up monitoring and alerting
6. Configure backup policies

## Deployment Options

| Method | Command | Description |
|--------|---------|-------------|
| **Azure Developer CLI** | `azd up` | ✨ Recommended: Complete one-command deployment (cross-platform) |
| **Complete Deployment (Linux/macOS)** | `./deploy-complete.sh` | Infrastructure + Application deployment |
| **Complete Deployment (Windows)** | `.\deploy-complete.ps1` | Infrastructure + Application deployment |
| **Infrastructure Only (Linux/macOS)** | `./deploy.sh` | Traditional infrastructure-only deployment |
| **Infrastructure Only (Windows)** | `.\deploy.ps1` | Traditional infrastructure-only deployment |

### Azure Developer CLI Setup

To use Azure Developer CLI (cross-platform support):

1. **Install azd**: 
   - Linux/macOS: `curl -fsSL https://aka.ms/install-azd.sh | bash`
   - Windows: `winget install microsoft.azd` or download from [aka.ms/azd](https://aka.ms/azd)
2. **Deploy**: `azd up`

Azure Developer CLI automatically detects your platform and uses the appropriate scripts (shell scripts on Linux/macOS, PowerShell scripts on Windows). This creates a single Azure App Service that serves both the React frontend and Express.js backend API with proper routing.

## Costs

The Basic B1 App Service Plan and Basic SQL Database are suitable for development/testing. For production, consider upgrading to higher tiers based on your needs.