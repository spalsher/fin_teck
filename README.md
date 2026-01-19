# iTeck ERP System

Enterprise Resource Planning system for iTecknologi Tracking Services (Pvt) Ltd.

## Architecture

- **Backend**: NestJS (TypeScript) - Modular Monolith
- **Frontend**: Next.js 14 with App Router
- **Database**: PostgreSQL 15+
- **Cache/Queue**: Redis 7+
- **ORM**: Prisma
- **Deployment**: Docker Compose (On-premise)

## Features

### Core Modules
- **Financial Management**: AR, AP, GL, Cash Management, Budgeting
- **Supply Chain Management**: Inventory, Procurement, Distribution
- **Asset Management**: Asset Register, Depreciation, Lifecycle Management
- **HRMS**: Employees, Payroll, Performance Management
- **Manufacturing**: BOM, Production Orders, Quality Control (Wiring Harness)
- **Integration**: CRM Adapter, Payment Gateways (1LINK, JazzCash, Easypaisa, HBL)
- **Reporting**: BI Dashboards, Management Reports

### Business Lines Supported
- Asset Tracking Services
- Fleet Management Solutions
- Hardware/Device Sales
- Installation & Maintenance Services
- Software Licensing / White-label Solutions

## Prerequisites

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose
- PostgreSQL 15+ (via Docker)
- Redis 7+ (via Docker)

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd fin_teck

# Run setup script
chmod +x scripts/*.sh
./scripts/setup.sh
```

### 2. Manual Setup (Alternative)

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Start Docker services
pnpm run docker:dev

# Setup database
cd apps/api
pnpm prisma migrate dev
pnpm prisma db seed
```

### 3. Start Development Servers

```bash
# Terminal 1 - API
cd apps/api
pnpm dev

# Terminal 2 - Web
cd apps/web
pnpm dev
```

### 4. Access the Application

- **Web App**: http://localhost:3000
- **API**: http://localhost:3001/api
- **Swagger Docs**: http://localhost:3001/api/docs
- **PostgreSQL**: localhost:5432 (postgres/postgres)
- **Redis**: localhost:6379

### Default Credentials

```
Email: admin@iteck.pk
Password: Admin@123!
```

## Project Structure

```
fin_teck/
├── apps/
│   ├── api/                 # NestJS Backend
│   │   ├── src/
│   │   │   ├── modules/     # Domain modules
│   │   │   ├── shared/      # Shared infrastructure
│   │   │   └── main.ts
│   │   └── prisma/          # Database schema & migrations
│   ├── web/                 # Next.js Frontend
│   └── mobile/              # React Native (future)
├── packages/
│   └── shared/              # Shared types, DTOs, utilities
├── docker/                  # Docker configurations
├── scripts/                 # Utility scripts
└── docs/                    # Documentation

```

## Development

### Database Migrations

```bash
# Create a new migration
./scripts/migrate.sh create <migration-name>

# Run pending migrations
./scripts/migrate.sh

# Deploy migrations (production)
./scripts/migrate.sh deploy
```

### Database Seeding

```bash
./scripts/seed.sh
```

### Database Backup

```bash
./scripts/backup.sh
```

### Docker Management

```bash
# Start services
pnpm run docker:dev

# Stop services
pnpm run docker:down

# View logs
pnpm run docker:logs
```

### Code Formatting

```bash
pnpm run format
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests for specific app
cd apps/api && pnpm test
```

## Modules Overview

### 1. Core Module
- Organization & Branch Management
- Settings & Configuration
- Document Numbering Sequences
- Service Offerings

### 2. Auth/RBAC Module
- JWT Authentication
- Role-Based Access Control
- User Management
- Session Management
- Audit Logging

### 3. Finance Module
**Accounts Receivable (AR)**
- Customer Master
- Service Subscriptions
- Invoicing (Manual & Automated)
- Credit Notes
- Receipts & Allocations
- Aging Reports

**Accounts Payable (AP)**
- Vendor Master
- Bills & Payments
- Aging Reports

**General Ledger (GL)**
- Chart of Accounts
- Journal Entries
- Fiscal Period Management
- Financial Reports

**Cash & Bank**
- Bank Accounts
- Transactions
- Reconciliation

**Budgeting**
- Budget Versions
- Period Allocations
- Variance Analysis

### 4. Supply Chain Module
- Item Master
- Warehouse Management
- Stock Ledger
- Purchase Requisitions
- Purchase Orders
- Goods Receipt Notes (GRN)
- Stock Transfers

### 5. Asset Management
- Asset Register
- Asset Categories
- Depreciation Methods
- Lifecycle Management
- Maintenance Records

### 6. HRMS
- Employee Master
- Payroll Processing
- Performance Management

### 7. Manufacturing
- Bill of Materials (BOM)
- Production Orders
- Work-in-Progress (WIP)
- Quality Control Inspections

### 8. Integration Module
- CRM Adapter (Custom REST API)
- Payment Gateways
  - 1LINK IBFT
  - JazzCash
  - Easypaisa
  - HBL Connect

### 9. Reporting Module
- Dashboard KPIs
- Custom Reports
- Data Exports

## API Documentation

Access the interactive API documentation at:
- Development: http://localhost:3001/api/docs
- Production: https://your-domain.com/api/docs

## Deployment

### Production Docker Deployment

```bash
# Build images
docker compose -f docker/docker-compose.yml build

# Start services
docker compose -f docker/docker-compose.yml up -d

# View logs
docker compose -f docker/docker-compose.yml logs -f
```

### Environment Variables

See `.env.example` for all available environment variables.

## Security

- JWT-based authentication
- Bcrypt password hashing (12 rounds)
- Rate limiting on auth endpoints
- CORS protection
- SQL injection prevention (Prisma ORM)
- XSS protection
- HTTPS in production (via nginx)

## Performance

- Redis caching for frequently accessed data
- Database indexing on foreign keys
- Pagination for large datasets
- Query optimization with Prisma
- Horizontal scaling ready (API replicas)

## Support

For issues and questions:
- Create an issue in the repository
- Contact: dev@iteck.pk

## License

Proprietary - iTecknologi Tracking Services (Pvt) Ltd

---

Built with ❤️ for iTecknologi Tracking Services
