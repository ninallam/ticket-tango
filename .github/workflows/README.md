# GitHub Workflows for Azure Deployment

This directory contains GitHub Actions workflows for deploying the Ticket Tango application to Azure.

## Workflows

### 1. Infrastructure Deployment (`deploy-infrastructure.yml`)

Deploys Azure infrastructure using Bicep templates.

**Triggers:**
- Manual workflow dispatch
- Push to `main` branch (when infrastructure files change)
- Called by other workflows

**Features:**
- Creates Azure Resource Group
- Deploys Bicep template with environment-specific parameters
- Outputs deployment information for subsequent workflows

### 2. Application Deployment (`deploy-application.yml`)

Builds and deploys the application code to Azure App Service.

**Triggers:**
- Manual workflow dispatch
- Push to `main` branch (when application files change)
- Called by other workflows

**Features:**
- Builds both client (React) and server (Node.js) applications
- Creates deployment package with proper Azure App Service configuration
- Deploys application using Azure Web Apps Deploy action

### 3. Full Deployment Pipeline (`full-deployment.yml`)

Orchestrates both infrastructure and application deployment.

**Triggers:**
- Manual workflow dispatch with options to deploy infrastructure and/or application

**Features:**
- Conditional deployment of infrastructure and application
- Sequential execution with proper dependency handling
- Flexible deployment options

## Prerequisites

### 1. Azure Service Principal

Create an Azure Service Principal with appropriate permissions:

```bash
# Create service principal
az ad sp create-for-rbac --name "tickettango-github-actions" --role contributor --scopes /subscriptions/{subscription-id}
```

This will output JSON similar to:
```json
{
  "clientId": "xxxx",
  "clientSecret": "xxxx",
  "subscriptionId": "xxxx",
  "tenantId": "xxxx"
}
```

### 2. GitHub Secrets

Set up the following secrets in your GitHub repository:

#### Required Secrets:
- `AZURE_CREDENTIALS`: Complete JSON output from service principal creation
- `SQL_ADMIN_LOGIN`: SQL Server administrator username (e.g., `sqladmin`)
- `SQL_ADMIN_PASSWORD`: Strong password for SQL Server administrator

#### Setting up secrets:
1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the appropriate name and value

### 3. GitHub Environments (Optional)

For better security and approval workflows, set up GitHub environments:

1. Go to **Settings** → **Environments**
2. Create environments: `dev`, `staging`, `prod`
3. Configure protection rules and required reviewers as needed

## Usage

### Quick Deployment

For a complete deployment (infrastructure + application):

1. Go to **Actions** tab in GitHub
2. Select **Full Deployment Pipeline**
3. Click **Run workflow**
4. Select environment (`dev`, `staging`, `prod`)
5. Choose deployment options
6. Click **Run workflow**

### Infrastructure Only

To deploy only infrastructure:

1. Go to **Actions** tab
2. Select **Deploy Infrastructure**
3. Click **Run workflow**
4. Select environment and Azure region
5. Click **Run workflow**

### Application Only

To deploy only the application (infrastructure must exist):

1. Go to **Actions** tab
2. Select **Build and Deploy Application**
3. Click **Run workflow**
4. Select environment
5. Click **Run workflow**

## Automatic Deployments

The workflows are configured to trigger automatically on pushes to the `main` branch:

- **Infrastructure changes** (files in `infrastructure/` directory) → Triggers infrastructure deployment
- **Application changes** (files in `client/`, `server/`, or root `package.json`) → Triggers application deployment

## Environment Configuration

### Parameter Files

Environment-specific parameters are stored in:
- `infrastructure/parameters.json` (dev environment)
- `infrastructure/parameters.staging.json` (staging environment)
- `infrastructure/parameters.prod.json` (production environment)

### Customizing Deployments

Update the parameter files to customize:
- Resource naming prefixes
- Azure regions
- SQL Server configurations
- CORS settings

## Monitoring and Troubleshooting

### Viewing Deployment Status

1. Go to **Actions** tab to see workflow runs
2. Click on a specific run to see detailed logs
3. Check the deployment summary in the workflow output

### Common Issues

1. **Authentication failures**: Verify `AZURE_CREDENTIALS` secret is correctly set
2. **Resource naming conflicts**: Resources names must be globally unique
3. **SQL password requirements**: Ensure password meets Azure SQL requirements
4. **Permission issues**: Verify service principal has appropriate permissions

### Logs and Monitoring

- Application logs are available in Azure Portal → App Service → Log stream
- Application insights data is automatically collected
- Deployment artifacts are stored temporarily in workflow runs

## Security Best Practices

1. **Use GitHub Environments** for production deployments with required approvals
2. **Rotate secrets regularly**, especially service principal credentials
3. **Use least privilege principle** for service principal permissions
4. **Enable branch protection** for main branch to require PR reviews
5. **Monitor Azure resources** for unusual activity

## Customization

### Adding New Environments

1. Create new parameter file: `infrastructure/parameters.{env}.json`
2. Add environment option to workflow choice inputs
3. Create corresponding GitHub environment (optional)

### Modifying Build Process

Edit the `deploy-application.yml` workflow to:
- Add additional build steps
- Include testing phases
- Add code quality checks
- Customize deployment packaging

### Infrastructure Changes

Modify the Bicep templates in the `infrastructure/` directory:
- Add new Azure resources
- Update existing resource configurations
- Modify output values as needed

The workflows will automatically use the updated templates on the next deployment.