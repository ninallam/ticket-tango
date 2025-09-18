#!/bin/bash

# Pre-deploy hook for Azure Developer CLI
# This script runs before application deployment

echo "🏗️  Pre-deploy: Building application..."

# Build the full application
npm run build

# Create deployment package for combined app (similar to deploy-complete.sh)
echo "📦 Creating deployment package..."
rm -rf .azd/deploy
mkdir -p .azd/deploy

# Copy server build files
cp -r dist/server/* .azd/deploy/

# Copy client build files to public directory for serving
mkdir -p .azd/deploy/public
cp -r client/build/* .azd/deploy/public/

# Create web.config for proper routing
cat > .azd/deploy/web.config << 'EOF'
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
cat > .azd/deploy/package.json << 'EOF'
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

echo "✅ Pre-deploy packaging completed"