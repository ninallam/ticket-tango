# Quick Setup Guide for GitHub Actions Deployment

## 🚀 One-Time Setup

### 1. Create Azure Service Principal
```bash
az ad sp create-for-rbac --name "tickettango-github-actions" \
  --role contributor \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID
```

### 2. Add GitHub Secrets
Go to **Settings** → **Secrets and variables** → **Actions**

Add these secrets:
- `AZURE_CREDENTIALS`: The complete JSON output from step 1
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
| Authentication failed | Check `AZURE_CREDENTIALS` secret is correctly formatted JSON |
| Resource names conflict | Resources must be globally unique - try different namePrefix |
| SQL password rejected | Ensure password meets Azure SQL requirements (12+ chars, complexity) |
| Build fails | Check build logs, ensure dependencies install correctly |

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