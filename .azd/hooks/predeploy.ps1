# Pre-deploy hook for Azure Developer CLI (PowerShell)
# This script runs before application deployment

Write-Host "🏗️  Pre-deploy: Building application..." -ForegroundColor Cyan

# Build the full application
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# Create deployment package for combined app (similar to deploy-complete.sh)
Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow
if (Test-Path ".azd/deploy") {
    Remove-Item -Recurse -Force ".azd/deploy"
}
New-Item -ItemType Directory -Path ".azd/deploy" -Force | Out-Null

# Copy server build files
Copy-Item -Recurse -Path "dist/server/*" -Destination ".azd/deploy/"

# Copy client build files to public directory for serving
New-Item -ItemType Directory -Path ".azd/deploy/public" -Force | Out-Null
Copy-Item -Recurse -Path "client/build/*" -Destination ".azd/deploy/public/"

# Create web.config for proper routing
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

Set-Content -Path ".azd/deploy/web.config" -Value $webConfig

# Create production package.json
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

Set-Content -Path ".azd/deploy/package.json" -Value $packageJson

Write-Host "✅ Pre-deploy packaging completed" -ForegroundColor Green