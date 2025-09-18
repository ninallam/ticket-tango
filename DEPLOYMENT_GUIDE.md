# Quick Setup Guide for GitHub Actions Deployment

## 🚀 One-Time Setup

### 1. Create Azure App Registration for OIDC Authentication

```bash
# Create Azure AD application
az ad app create --display-name "tickettango-github-actions"

# Get the application ID (client ID)
APP_ID=$(az ad app list --display-name "tickettango-github-actions" --query "[0].appId" -o tsv)

# Create service principal
az ad sp create --id $APP_ID

# Get object ID of the service principal  
SP_OBJECT_ID=$(az ad sp list --display-name "tickettango-github-actions" --query "[0].id" -o tsv)

# Assign contributor role to the service principal
az role assignment create --role contributor --assignee $SP_OBJECT_ID --scopes /subscriptions/YOUR_SUBSCRIPTION_ID
```

### 2. Configure Federated Identity Credentials

Replace `{your-github-username}` with your actual GitHub username:

```bash
# Add federated credential for main branch
az ad app federated-credential create --id $APP_ID --parameters '{
  "name": "tickettango-main-branch", 
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:{your-github-username}/ticket-tango:ref:refs/heads/main",
  "description": "GitHub Actions - Main Branch",
  "audiences": ["api://AzureADTokenExchange"]
}'

# Add federated credential for pull requests  
az ad app federated-credential create --id $APP_ID --parameters '{
  "name": "tickettango-pull-requests",
  "issuer": "https://token.actions.githubusercontent.com", 
  "subject": "repo:{your-github-username}/ticket-tango:pull_request",
  "description": "GitHub Actions - Pull Requests",
  "audiences": ["api://AzureADTokenExchange"]
}'

# Add federated credential for environment deployments (optional)
az ad app federated-credential create --id $APP_ID --parameters '{
  "name": "tickettango-environment",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:{your-github-username}/ticket-tango:environment:dev",
  "description": "GitHub Actions - Dev Environment", 
  "audiences": ["api://AzureADTokenExchange"]
}'
```

### 3. Add GitHub Secrets

Go to **Settings** → **Secrets and variables** → **Actions**

Add these secrets:
- `AZURE_CLIENT_ID`: Application (client) ID from step 1 (the $APP_ID value)
- `AZURE_TENANT_ID`: Your Azure tenant ID (get with `az account show --query tenantId -o tsv`)
- `AZURE_SUBSCRIPTION_ID`: Your Azure subscription ID (get with `az account show --query id -o tsv`)
- `SQL_ADMIN_LOGIN`: `sqladmin` (or your preferred username)
- `SQL_ADMIN_PASSWORD`: A strong password (12+ chars, mixed case, numbers, symbols)

### 3. Verify Files
✅ All workflow files created in `.github/workflows/`
✅ Environment parameter files in `infrastructure/`
✅ README documentation updated

## 🎯 Quick Deployment

### Full Deployment (Infrastructure + Application)
1. Go to **Actions** tab
2. Select **Full Deployment Pipeline**
3. Click **Run workflow**
4. Choose:
   - Environment: `dev`, `staging`, or `prod`
   - Azure region: `East US` (or your preferred region)
   - Deploy infrastructure: ✅
   - Deploy application: ✅
5. Click **Run workflow**

### Application Only (faster for code changes)
1. Go to **Actions** tab
2. Select **Build and Deploy Application**
3. Choose environment and run

## 🔄 Automatic Deployments

Pushes to `main` branch automatically trigger:
- Infrastructure deployment (if `infrastructure/` files change)
- Application deployment (if `client/`, `server/`, or root files change)
- CI tests for all changes

## 📋 Troubleshooting

| Issue | Solution |
|-------|----------|
| Authentication failed | Check `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, and `AZURE_SUBSCRIPTION_ID` secrets are correctly set |
| OIDC token exchange failed | Verify federated identity credentials are configured for your repository |
| Resource names conflict | Resources must be globally unique - try different namePrefix |
| SQL password rejected | Ensure password meets Azure SQL requirements (12+ chars, complexity) |
| Build fails | Check build logs, ensure dependencies install correctly |
| Permission denied | Verify service principal has contributor role on subscription |

## 🎉 Success Indicators

After successful deployment:
- ✅ Green checkmarks in Actions tab
- ✅ Application accessible at `https://tickettango-{env}-app.azurewebsites.net`
- ✅ Resources visible in Azure Portal
- ✅ Application Insights collecting data

## 🔧 Customization

- **Add environments**: Create new `parameters.{env}.json` files
- **Change regions**: Update location in workflow inputs
- **Modify resources**: Edit `infrastructure/main.bicep`
- **Build customization**: Modify workflow YAML files