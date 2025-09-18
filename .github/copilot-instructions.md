# Ticket Tango Development Instructions

Ticket Tango is a full-stack event ticketing web application built with React (TypeScript) frontend, Express/Node.js (TypeScript) backend, and Azure SQL Database. The application allows users to browse events (concerts and workshops), register accounts, login, and book tickets.

**CRITICAL**: Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap and Build
Run these commands in exact order to set up the development environment:

1. **Install all dependencies**:
   ```bash
   npm run install:all
   ```
   - Takes ~60 seconds with warnings (expected)
   - Installs both root and client dependencies

2. **Build the application**:
   ```bash
   npm run build
   ```
   - **Takes 12 seconds total** - NEVER CANCEL
   - Builds both server (TypeScript) and client (React)
   - Set timeout to 30+ seconds minimum

3. **Environment setup**:
   ```bash
   cp .env.example .env
   ```

### Development Servers

#### Start Frontend Only (Recommended for UI development):
```bash
npm run dev:client
```
- Runs on http://localhost:3000
- **Takes 15-20 seconds to start** - wait for "Compiled successfully!"
- Works independently without backend database
- Set timeout to 60+ seconds

#### Start Backend (Requires Database):
```bash
npm run dev:server
```
- Runs on http://localhost:3001
- **WILL FAIL without SQL Server database** - this is expected in sandbox environments
- Requires SQL Server on localhost:1433 or Azure SQL connection

#### Start Both (Full Stack):
```bash
npm run dev
```
- **WILL FAIL without database** - only use when database is available

### Testing

#### Client Tests (Partial):
```bash
cd client && npm test
```
- **ISSUE**: Tests have dependency resolution problems - documented limitation
- React Testing Library is available but not fully configured

#### Root Jest Tests:
```bash
npm test
```
- **FAILS**: Jest not properly configured for root-level TypeScript/React tests
- Known limitation - tests need setup work

#### Linting:
```bash
npm run lint
```
- **FAILS**: No ESLint configuration file present
- Client has built-in React ESLint rules in package.json
- Known limitation - needs .eslintrc setup

## Validation Workflows

### Frontend Validation (Always Do This):
1. Start the client: `npm run dev:client`
2. Navigate to http://localhost:3000
3. **Verify homepage loads** with purple header and "Welcome to Ticket Tango"
4. **Test navigation**: Click "Events" - should show events page with search
5. **Test auth flow**: Click "Login" and "Register" - forms should display
6. **Expect API errors** - backend connection failures are normal without database

### Build Validation:
1. Run `npm run build` (12 second timeout minimum)
2. Check `dist/server/` directory exists with compiled TypeScript
3. Check `client/build/` directory exists with React production build

### Manual Testing Scenarios:
- **Login Flow**: Use demo credentials: testuser1/password123 or testuser2/password123 (visible on login page)
- **Event Browsing**: Browse events, test search and filtering
- **Booking Flow**: Test ticket booking process (requires login and database)
- **Registration**: Test new user account creation (requires database connection)
- **UI Navigation**: Test all main navigation links (Events, Login, Register)
- **Responsive Design**: Test on different screen sizes - application is mobile-first

## Database Requirements

### Local Development:
- **SQL Server**: localhost:1433
- **Credentials**: sa/YourPassword123! (from .env.example)
- **Database**: tickettango
- **Auto-creates**: Tables and demo data on first connection

### Production:
- **Azure SQL Database** with Managed Identity authentication
- No username/password needed in production

### Working Without Database:
- Frontend works completely independently
- Backend will crash - this is expected and normal
- Use `npm run dev:client` for UI development

## Infrastructure and Deployment

### Azure Deployment:
```bash
cd infrastructure
./deploy.sh
```
- **Interactive script** - requires Azure CLI authentication
- **Takes 5-10 minutes** - NEVER CANCEL deployment
- Creates App Service, SQL Database, Storage Account, Application Insights
- Set timeout to 15+ minutes

### Local Production Build:
```bash
npm run build
npm start
```
- Requires database connection to start

## Key Project Structure

```
ticket-tango/
├── client/                 # React frontend (TypeScript)
│   ├── src/
│   │   ├── components/     # UI components (Header, etc.)
│   │   ├── pages/         # Route components (HomePage, LoginPage, etc.)
│   │   ├── services/      # API services (authService, eventService, etc.)
│   │   └── types/         # TypeScript interfaces
│   └── public/            # Static assets
├── server/                # Express backend (TypeScript)
│   ├── config/           # Database configuration
│   ├── routes/           # API routes (auth, events, bookings)
│   └── index.ts          # Server entry point
└── infrastructure/       # Azure Bicep deployment templates
```

## Common Issues and Solutions

### "Cannot find module 'react-router-dom'":
- Run `cd client && npm install`
- Dependencies may not be installed properly

### "Database connection failed":
- **Expected without SQL Server**
- Use `npm run dev:client` for frontend-only development
- Install SQL Server locally or use Azure SQL for full-stack development

### "ESLint couldn't find a configuration file":
- **Known limitation** - no root ESLint config
- Client has React ESLint rules built-in
- Linting works within client directory

### Jest test failures:
- **Known limitation** - tests need configuration work
- Client tests have dependency issues (react-router-dom not found)
- Root-level tests fail due to JSX/TypeScript configuration
- Focus on manual browser testing for validation

## Timing Expectations

- **npm run install:all**: 60 seconds with expected deprecation warnings
- **npm run build**: 11-12 seconds - NEVER CANCEL, set 30+ second timeout minimum
- **npm run dev:client**: 15-20 seconds startup - NEVER CANCEL, set 60+ second timeout  
- **Azure deployment**: 5-10 minutes - NEVER CANCEL, set 15+ minute timeout
- **Clean builds**: Same timing - TypeScript and React compilation is consistent

## Demo Credentials

When backend is running with database:
- **Username**: `testuser1` | **Password**: `password123`
- **Username**: `testuser2` | **Password**: `password123`

## Technology Stack

- **Frontend**: React 18, TypeScript, React Router, Axios, CSS3
- **Backend**: Node.js, Express, TypeScript, mssql, bcryptjs, jsonwebtoken
- **Database**: Azure SQL Database (SQL Server compatible)
- **Infrastructure**: Azure App Service, Bicep templates
- **Build**: TypeScript compiler, Create React App

## Additional Notes

- **Mobile-responsive** design with CSS3
- **Security**: Helmet middleware, rate limiting, CORS protection
- **Authentication**: JWT tokens with bcrypt password hashing
- **Azure Managed Identity** for production database access
- **No external UI libraries** - custom CSS for minimal bundle size

Always test frontend functionality after making changes using the browser validation workflow above.

## Quick Reference Commands

Most common development commands:
```bash
# Complete setup from fresh clone
npm run install:all
cp .env.example .env
npm run build

# Frontend development (recommended)
npm run dev:client

# Full build (clean)
rm -rf dist client/build && npm run build

# Manual validation
# 1. Start frontend: npm run dev:client  
# 2. Navigate to: http://localhost:3000
# 3. Test navigation: Events -> Login -> Register
# 4. Verify API errors are expected without backend
```