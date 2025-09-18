# Migration Guide: Service Principal to OIDC Authentication

## Overview

This guide helps you migrate from Azure Service Principal authentication using secrets to OpenID Connect (OIDC) authentication for GitHub Actions workflows.

## Benefits of OIDC

- 🔐 **No long-lived secrets** - More secure than storing credentials as secrets
- 🔄 **Automatic token rotation** - Tokens are short-lived and automatically refreshed
- 🛡️ **Enhanced security** - Federated identity provides better access control
- 📊 **Better audit trail** - Improved tracking of authentication events

## Migration Steps

### 1. Remove Old Secrets (After Setup)

Once OIDC is working, you can safely remove these GitHub secrets:
- `AZURE_CREDENTIALS` (no longer needed)

### 2. Set Up Azure App Registration

```bash
# Create Azure AD application
az ad app create --display-name "tickettango-github-actions"

# Get the application ID (client ID)
APP_ID=$(az ad app list --display-name "tickettango-github-actions" --query "[0].appId" -o tsv)
echo "AZURE_CLIENT_ID: $APP_ID"

# Create service principal
az ad sp create --id $APP_ID

# Get object ID of the service principal
SP_OBJECT_ID=$(az ad sp list --display-name "tickettango-github-actions" --query "[0].id" -o tsv)

# Assign contributor role to the service principal
az role assignment create --role contributor --assignee $SP_OBJECT_ID --scopes /subscriptions/$(az account show --query id -o tsv)

# Get tenant and subscription IDs
echo "AZURE_TENANT_ID: $(az account show --query tenantId -o tsv)"
echo "AZURE_SUBSCRIPTION_ID: $(az account show --query id -o tsv)"
```

### 3. Configure Federated Identity Credentials

**Replace `{your-github-username}` with your actual GitHub username:**

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
```

### 4. Add New GitHub Secrets

Go to **Settings** → **Secrets and variables** → **Actions** and add:

- `AZURE_CLIENT_ID`: Application (client) ID from step 2
- `AZURE_TENANT_ID`: Tenant ID from step 2  
- `AZURE_SUBSCRIPTION_ID`: Subscription ID from step 2

Keep existing secrets:
- `SQL_ADMIN_LOGIN`: (unchanged)
- `SQL_ADMIN_PASSWORD`: (unchanged)

### 5. Test the Migration

1. Go to **Actions** tab in GitHub
2. Run **Deploy Infrastructure** workflow manually
3. Verify authentication works with new OIDC setup
4. If successful, remove old `AZURE_CREDENTIALS` secret

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Authentication failed | Check that all three new secrets are correctly set |
| OIDC token exchange failed | Verify federated credentials match your repository exactly |
| Permission denied | Ensure service principal has contributor role on subscription |
| Subject mismatch | Double-check your GitHub username in federated credential subject |

## Rollback Plan

If you need to rollback:

1. Re-add the `AZURE_CREDENTIALS` secret with the original Service Principal JSON
2. Revert the workflow changes by checking out the previous version
3. The old Service Principal should still work unless explicitly deleted

## Verification

After migration, verify:

- ✅ Workflows run successfully without `AZURE_CREDENTIALS`
- ✅ Azure authentication uses OIDC tokens
- ✅ Deployments complete successfully
- ✅ No authentication errors in workflow logs

## Benefits Achieved

After successful migration:

- 🔒 **Improved Security**: No long-lived secrets stored in GitHub
- 🚀 **Better Performance**: Faster authentication with short-lived tokens
- 📈 **Enhanced Monitoring**: Better audit trails in Azure AD
- 🛡️ **Reduced Risk**: Automatic token rotation eliminates credential leakage risks