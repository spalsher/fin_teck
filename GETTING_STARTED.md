# Getting Started with iTeck ERP

## 🎉 Iteration 1: Foundations - Complete!

You now have a fully functional foundation for the iTeck ERP system with:

### ✅ Backend (NestJS + PostgreSQL + Prisma)
- **Authentication & Authorization**: JWT + refresh tokens, RBAC with permissions
- **Core Module**: Organization, Branch, Service Offerings, Document Sequencing
- **Database**: Comprehensive Prisma schema for all modules
- **Infrastructure**: Audit logging, correlation IDs, API documentation (Swagger)
- **Security**: Password policies, rate limiting, permission guards

### ✅ Frontend (Next.js + React)
- **Authentication**: Login page with persistent auth state
- **Dashboard**: Main dashboard with KPI cards
- **Layout**: Sidebar navigation with all module sections
- **API Client**: Axios client with automatic token refresh

### ✅ Shared Package
- **Types**: TypeScript interfaces for all entities
- **DTOs**: Data transfer objects with validation
- **Constants**: Permissions, error codes, configuration
- **Utilities**: Formatting and validation helpers

## 📋 Prerequisites

Ensure you have the following installed:
- **Node.js**: 18+ 
- **pnpm**: 8+
- **Docker**: Latest version
- **Docker Compose**: Latest version

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# From project root
pnpm install
```

### 2. Start Infrastructure Services

```bash
# Start PostgreSQL and Redis
pnpm run docker:dev

# This starts:
# - PostgreSQL on localhost:5432
# - Redis on localhost:6379
```

### 3. Setup Database

```bash
# Navigate to API directory
cd apps/api

# Run migrations
pnpm prisma migrate dev

# Generate Prisma Client
pnpm prisma generate

# Seed initial data
pnpm prisma db seed
```

### 4. Start API Server

```bash
# From apps/api directory
pnpm dev

# API will be available at:
# - http://localhost:3001/api
# - Swagger Docs: http://localhost:3001/api/docs
```

### 5. Start Web Application

```bash
# In a new terminal, from apps/web directory
cd apps/web

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local

# Start development server
pnpm dev

# Web app will be available at:
# - http://localhost:3000
```

## 🔐 Default Credentials

Use these credentials to log in:

```
Email: admin@iteck.pk
Password: Admin@123!
```

## 📁 Project Structure

```
fin_teck/
├── apps/
│   ├── api/                  # NestJS Backend
│   │   ├── src/
│   │   │   ├── modules/      # Domain modules
│   │   │   │   ├── auth/     # ✅ Complete
│   │   │   │   └── core/     # ✅ Complete
│   │   │   └── shared/       # ✅ Complete
│   │   └── prisma/           # ✅ Complete
│   │       ├── schema.prisma # Full database schema
│   │       └── seed.ts       # Seed script
│   │
│   └── web/                  # Next.js Frontend
│       ├── src/
│       │   ├── app/          # ✅ Complete
│       │   ├── components/   # ✅ Complete
│       │   ├── lib/          # ✅ Complete
│       │   └── stores/       # ✅ Complete
│
├── packages/
│   └── shared/               # ✅ Complete
│       └── src/
│           ├── types/        # TypeScript types
│           ├── dto/          # DTOs
│           ├── validation/   # Zod schemas
│           ├── constants/    # Enums & constants
│           └── utils/        # Utilities
│
├── docker/                   # ✅ Complete
└── scripts/                  # ✅ Complete
```

## 🔧 Development Workflow

### Working with the API

```bash
# View Prisma Studio (database GUI)
cd apps/api
pnpm prisma studio

# Create a new migration
pnpm prisma migrate dev --name your_migration_name

# Reset database (development only)
pnpm prisma migrate reset
```

### Testing API Endpoints

Visit **http://localhost:3001/api/docs** to access interactive Swagger documentation where you can:
1. View all available endpoints
2. Test endpoints directly
3. See request/response schemas

### Key API Endpoints

**Authentication:**
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout
- `POST /api/auth/change-password` - Change password

**Core:**
- `GET /api/organizations/:id` - Get organization
- `PUT /api/organizations/:id` - Update organization
- `GET /api/branches` - List branches
- `POST /api/branches` - Create branch
- `GET /api/service-offerings` - List service offerings

## 🎯 What's Next?

### Iteration 2: Finance MVP (Next Steps)
- Customer master with CRM fields
- Invoice CRUD with line items
- Credit notes
- Receipts with allocations
- Chart of Accounts
- Journal entries
- Payment gateway integration (mock)

### Iteration 3: Supply Chain
- Item master
- Warehouse management
- Stock ledger
- Purchase orders
- Goods receipt notes (GRN)

### Iteration 4: HRMS + Assets
- Employee master
- Payroll processing
- Asset register
- Depreciation

### Iteration 5: Manufacturing
- Bill of Materials (BOM)
- Production orders
- Quality Control

### Iteration 6: Integration + BI
- CRM adapter
- Payment gateway implementations
- Automated billing
- Dashboard KPIs

## 📚 Available Commands

### Root Level

```bash
pnpm dev              # Start all apps in development mode
pnpm build            # Build all apps
pnpm lint             # Lint all apps
pnpm test             # Run all tests
pnpm docker:dev       # Start Docker services
pnpm docker:down      # Stop Docker services
pnpm docker:logs      # View Docker logs
```

### API (apps/api)

```bash
pnpm dev              # Start API in development mode
pnpm build            # Build for production
pnpm start            # Start production build
pnpm prisma:generate  # Generate Prisma Client
pnpm prisma:migrate   # Run migrations
pnpm prisma:studio    # Open Prisma Studio
pnpm prisma:seed      # Seed database
pnpm test             # Run tests
```

### Web (apps/web)

```bash
pnpm dev              # Start Next.js in development
pnpm build            # Build for production
pnpm start            # Start production build
pnpm lint             # Lint code
```

## 🔍 Exploring the System

### 1. Login to Web Application
- Navigate to http://localhost:3000
- Use default credentials: `admin@iteck.pk / Admin@123!`
- You'll be redirected to the dashboard

### 2. Explore the Sidebar
Navigate through different modules:
- **Dashboard**: Overview with KPI cards
- **Finance**: Customer, invoices, receipts (placeholders)
- **Supply Chain**: Items, inventory, POs (placeholders)
- **HRMS**: Employees, payroll (placeholders)
- **Assets**: Asset register (placeholder)
- **Manufacturing**: BOM, production (placeholder)
- **Reports**: BI dashboards (placeholder)
- **Settings**: System configuration (placeholder)

### 3. Test API with Swagger
- Visit http://localhost:3001/api/docs
- Click "Authorize" and enter your access token
- Test various endpoints

### 4. View Database
```bash
cd apps/api
pnpm prisma studio
```
This opens a GUI to browse your database at http://localhost:5555

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Refresh token rotation
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Role-based access control (RBAC)
- ✅ Permission-based authorization
- ✅ Rate limiting (100 req/min general, 5 req/min for auth)
- ✅ Audit logging with correlation IDs
- ✅ CORS protection
- ✅ SQL injection prevention (Prisma)

## 🎨 UI/UX Features

- ✅ Responsive design
- ✅ Clean, professional interface
- ✅ Sidebar navigation
- ✅ User profile display
- ✅ Persistent authentication
- ✅ Automatic token refresh
- ✅ Loading states
- ✅ Error handling

## 📊 Database Schema Highlights

The Prisma schema includes comprehensive models for:

- **Core**: Organization, Branch, ServiceOffering, DocumentSequence
- **Auth**: User, Role, Permission, UserRole, RolePermission, RefreshToken, AuditLog
- **Finance**: Customer, Invoice, Receipt, Vendor, Bill, ChartOfAccount, JournalEntry, BankAccount
- **SCM**: Item, Warehouse, StockLedger, PurchaseOrder, GoodsReceipt
- **Asset**: Asset, AssetCategory, DepreciationMethod
- **HRMS**: Employee, PayrollRun, Payslip
- **Manufacturing**: BOM, ProductionOrder, QCInspection
- **Integration**: PaymentProvider, PaymentIntent, PaymentTransaction, CRMSyncLog

All with proper relationships, indexes, and constraints!

## 🐛 Troubleshooting

### Port Already in Use

```bash
# If port 3000 or 3001 is busy, kill the process:
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### Database Connection Issues

```bash
# Restart Docker services
pnpm run docker:down
pnpm run docker:dev

# Wait a few seconds for PostgreSQL to start
sleep 5

# Run migrations again
cd apps/api
pnpm prisma migrate dev
```

### Module Not Found Errors

```bash
# Rebuild shared package
cd packages/shared
pnpm build

# Reinstall dependencies
cd ../../
pnpm install
```

## 📞 Support

For issues or questions:
- Review this guide
- Check the plan file in `.cursor/plans/`
- Refer to the comprehensive README.md
- Review API documentation at `/api/docs`

## 🎊 Congratulations!

You now have a solid foundation for the iTeck ERP system. All Iteration 1 todos are complete:

✅ Monorepo setup with Turborepo
✅ Prisma schema with all entities
✅ Auth module with JWT
✅ RBAC with permissions
✅ Core module
✅ Audit logging
✅ Shared package
✅ Web shell with authentication
✅ Seed data
✅ API documentation

Ready to move to **Iteration 2: Finance MVP**! 🚀
