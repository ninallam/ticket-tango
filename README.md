# Ticket Tango 🎫

A comprehensive ticket booking website for concerts and workshops built with modern web technologies and designed for Azure deployment.

![Ticket Tango](https://img.shields.io/badge/Status-Complete-green.svg) ![Azure](https://img.shields.io/badge/Azure-Ready-blue.svg) ![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg)

## 🎯 Features

### For Users
- 🔐 **User Authentication** - Simple login/register system with JWT tokens
- 🎵 **Event Discovery** - Browse concerts and workshops with search and filtering
- 🎫 **Easy Booking** - Streamlined ticket booking process with quantity selection
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- 👤 **Personal Dashboard** - View your booking history and upcoming events

### For Developers
- 🚀 **Modern Stack** - React with TypeScript frontend, Node.js with Express backend
- 🔒 **Secure by Design** - JWT authentication, SQL injection protection, input validation
- ☁️ **Azure Ready** - Complete Bicep infrastructure templates with managed identity
- 🗄️ **Dual Database Support** - SQLite for local development, Azure SQL Database for production
- 📊 **API Documentation** - RESTful API with comprehensive endpoints
- 🔧 **Easy Local Setup** - No database installation required for development

## 🏗️ Architecture

### Local Development
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │────│  Express API    │────│  SQLite DB      │
│   (TypeScript)  │    │  (TypeScript)   │    │ (File-based)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Production (Azure)
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │────│  Express API    │────│ Azure SQL DB    │
│   (TypeScript)  │    │  (TypeScript)   │    │ (Managed ID)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐             │
         └──────────────│ Azure App Service│─────────────┘
                        │ (Managed Identity)│
                        └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Azure CLI (for deployment)
- Git

### Local Development

1. **Clone and Install**
   ```bash
   git clone https://github.com/ninallam/ticket-tango.git
   cd ticket-tango
   npm run install:all
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # SQLite is used by default for local development (no additional setup required)
   # To use MSSQL instead, set DB_TYPE=mssql in .env and configure database settings
   ```

3. **Start Development Servers**
   ```bash
   # Start both backend and frontend
   npm run dev
   
   # Or start separately:
   npm run dev:server  # Backend on http://localhost:3001
   npm run dev:client  # Frontend on http://localhost:3000
   ```
   
   **Note**: The SQLite database file (`database.sqlite`) will be created automatically on first run with sample data.

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api

### Demo Credentials
- **Username**: `testuser1` | **Password**: `password123`
- **Username**: `testuser2` | **Password**: `password123`

## 🗄️ Database Configuration

### Local Development (Default: SQLite)
- **Zero Configuration**: SQLite database is created automatically
- **File Location**: `./database.sqlite` in the project root
- **Sample Data**: Automatically populated with users and events
- **No Installation Required**: Works out of the box

### Local Development (Optional: MSSQL)
To use SQL Server for local development:
```bash
# In your .env file
DB_TYPE=mssql
DB_SERVER=localhost
DB_NAME=tickettango
DB_USER=sa
DB_PASSWORD=YourPassword123!
```

### Production (Azure SQL Database)
- **Automatic Detection**: Uses MSSQL when `NODE_ENV=production`
- **Managed Identity**: Secure authentication without connection strings
- **Azure Integration**: Seamless deployment with infrastructure templates

## 🎪 Sample Events

The application comes pre-loaded with exciting events:

### 🎵 Concerts
- **Rock Concert: The Thunder** - Madison Square Garden
- **Jazz Night Live** - Blue Note Club  
- **Classical Symphony** - Concert Hall
- **Pop Concert: City Lights** - Arena Stadium

### 🎓 Workshops
- **Web Development Workshop** - Learn React and Node.js
- **Photography Masterclass** - Professional photography tips
- **Digital Marketing Summit** - Latest marketing strategies
- **Cooking Workshop: Italian Cuisine** - Authentic Italian cooking

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify` - Token verification

### Events
- `GET /api/events` - List events with search/filter
- `GET /api/events/:id` - Get event details
- `GET /api/events/featured/upcoming` - Featured events

### Bookings
- `POST /api/bookings` - Create booking (authenticated)
- `GET /api/bookings/my-bookings` - User's bookings (authenticated)
- `GET /api/bookings/:id` - Booking details (authenticated)

### Health
- `GET /api/health` - Service health check

## ☁️ Azure Deployment

### One-Click Deployment

1. **Configure Parameters**
   ```bash
   cd infrastructure
   # Edit parameters.json with your preferences
   ```

2. **Deploy to Azure**
   ```bash
   # Linux/macOS
   ./deploy.sh
   
   # Windows PowerShell
   ./deploy.ps1
   ```

### Azure Resources Created

- **App Service** (Basic B1) - Hosts the web application
- **Azure SQL Database** (Basic tier) - Stores application data
- **SQL Server** - Database server with firewall rules
- **Storage Account** - For future file storage needs
- **Application Insights** - Application monitoring and logging

### Managed Identity Features

- 🔐 **Secure Database Access** - No connection strings needed
- 🛡️ **Zero Credential Management** - Azure handles authentication
- 🔄 **Automatic Token Refresh** - Seamless authentication flow
- 📊 **Audit Trail** - Complete access logging

## 🧪 Testing

```bash
# Run backend tests
npm test

# Run frontend tests
cd client && npm test

# Run linting
npm run lint
```

## 📁 Project Structure

```
ticket-tango/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   └── types/         # TypeScript type definitions
│   └── public/            # Static assets
├── server/                # Express backend application
│   ├── config/           # Database configuration
│   ├── middleware/       # Custom middleware
│   ├── routes/           # API route handlers
│   └── index.ts          # Server entry point
├── infrastructure/       # Azure Bicep templates
│   ├── main.bicep        # Main infrastructure template
│   ├── parameters.json   # Deployment parameters
│   └── deploy.sh         # Deployment script
└── package.json          # Root package configuration
```

## 🔒 Security Features

- ✅ **JWT Authentication** with secure token handling
- ✅ **SQL Injection Protection** via parameterized queries
- ✅ **CORS Configuration** for secure cross-origin requests
- ✅ **Rate Limiting** to prevent abuse
- ✅ **Helmet.js** for security headers
- ✅ **HTTPS Enforcement** in production
- ✅ **Input Validation** on all endpoints
- ✅ **Managed Identity** for Azure services

## 🎨 UI/UX Features

- 📱 **Fully Responsive** design that works on all devices
- 🎨 **Modern UI** with gradients and smooth animations
- ♿ **Accessibility** considerations throughout
- 🔍 **Search & Filter** functionality for events
- 💳 **Streamlined Booking** process with clear pricing
- 📊 **Personal Dashboard** for managing bookings
- 🎯 **Featured Events** showcase on homepage

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation
- **Axios** for API communication
- **CSS3** with custom styling (no external UI library for minimal bundle)

### Backend  
- **Node.js** with Express framework
- **TypeScript** for type safety
- **Dual Database Support** - SQLite3 for local development, MSSQL for production
- **Database Adapter Pattern** for seamless database switching
- **jsonwebtoken** for authentication
- **bcryptjs** for password hashing
- **helmet** for security headers

### Infrastructure
- **Azure App Service** for hosting
- **Azure SQL Database** for production data storage
- **SQLite** for local development (zero configuration)
- **Azure Managed Identity** for secure authentication
- **Application Insights** for monitoring
- **Bicep** for infrastructure as code

## 📈 Performance Optimizations

- ⚡ **Fast Initial Load** with code splitting
- 🗜️ **Optimized Images** with error handling
- 📦 **Minimal Dependencies** for smaller bundle size
- 🔄 **Efficient State Management** with React hooks
- 💾 **Smart Caching** strategies
- 📱 **Mobile-First** responsive design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♀️ Support

For support and questions:
- Create an issue in the GitHub repository
- Check the API documentation in the code
- Review the deployment logs in Azure

---

**Built with ❤️ for event organizers and ticket buyers everywhere!**
