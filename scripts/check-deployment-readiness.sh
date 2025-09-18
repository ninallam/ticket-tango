#!/bin/bash

# GitHub Actions Deployment Readiness Check
# This script helps verify that GitHub deployment is properly configured

echo "🔍 GitHub Actions Deployment Readiness Check"
echo "=============================================="

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository"
    exit 1
fi

# Check required files exist
echo ""
echo "📁 Checking required files..."

required_files=(
    ".github/workflows/deploy-infrastructure.yml"
    ".github/workflows/deploy-application.yml"
    ".github/workflows/full-deployment.yml"
    ".github/workflows/ci.yml"
    "infrastructure/main.bicep"
    "infrastructure/parameters.json"
    "infrastructure/parameters.staging.json"
    "infrastructure/parameters.prod.json"
    "startup.sh"
)

all_files_exist=true
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (missing)"
        all_files_exist=false
    fi
done

if [ "$all_files_exist" = true ]; then
    echo "✅ All required files present"
else
    echo "❌ Some required files are missing"
fi

# Check YAML syntax
echo ""
echo "🔧 Validating YAML syntax..."
yaml_valid=true
for file in .github/workflows/*.yml; do
    if command -v python3 > /dev/null 2>&1; then
        if python3 -c "import yaml; yaml.safe_load(open('$file'))" 2>/dev/null; then
            echo "✅ $(basename $file)"
        else
            echo "❌ $(basename $file) (syntax error)"
            yaml_valid=false
        fi
    else
        echo "⚠️  Cannot validate YAML (python3 not available)"
        break
    fi
done

# Check build process
echo ""
echo "🏗️  Testing build process..."
if [ -f "package.json" ]; then
    if npm run build > /dev/null 2>&1; then
        echo "✅ Build process works"
    else
        echo "❌ Build process failed"
        echo "   Run 'npm run build' to see detailed errors"
    fi
else
    echo "❌ package.json not found"
fi

# Summary
echo ""
echo "📋 Summary"
echo "=========="

if [ "$all_files_exist" = true ] && [ "$yaml_valid" = true ]; then
    echo "✅ Repository is ready for GitHub Actions deployment!"
    echo ""
    echo "🔗 Next steps:"
    echo "1. Set up Azure Service Principal (see DEPLOYMENT_GUIDE.md)"
    echo "2. Configure GitHub secrets (AZURE_CREDENTIALS, SQL_ADMIN_LOGIN, SQL_ADMIN_PASSWORD)"
    echo "3. Go to Actions tab and run 'Full Deployment Pipeline'"
else
    echo "❌ Repository needs attention before deployment"
    echo ""
    echo "🔧 Fix the issues above and run this script again"
fi

echo ""
echo "📚 For detailed instructions, see:"
echo "   - DEPLOYMENT_GUIDE.md"
echo "   - .github/workflows/README.md"