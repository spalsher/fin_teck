# 🚀 iTeck ERP - Quick Start Guide

## Current Status
✅ **Backend API**: Running on `http://localhost:3001/api`  
🔄 **Frontend Web**: Starting...  
📊 **Swagger Docs**: `http://localhost:3001/api/docs`

---

## 🏃 How to Run

### **Option 1: Quick Start (Development)**

```bash
# Terminal 1 - Start Backend API
cd /home/iteck/Dev_Projects/fin_teck
pnpm --filter @iteck/api dev

# Terminal 2 - Start Web Frontend
cd /home/iteck/Dev_Projects/fin_teck
pnpm --filter @iteck/web dev
```

### **Option 2: Build & Run (Production-like)**

```bash
# Build everything
cd /home/iteck/Dev_Projects/fin_teck
pnpm build

# Terminal 1 - Run API
cd apps/api
NODE_ENV=development node dist/apps/api/src/main.js

# Terminal 2 - Run Web
cd apps/web
pnpm start
```

### **Option 3: Using the Scripts**

```bash
# From project root
./scripts/setup.sh    # First time only - sets up DB
pnpm dev              # Starts both API and Web
```

---

## 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **API** | http://localhost:3001/api | Main backend API |
| **Swagger UI** | http://localhost:3001/api/docs | Interactive API documentation |
| **Web App** | http://localhost:3000 | Main web application |

---

## 🔐 Default Credentials

**Admin User:**
- Email: `admin@itecknologi.com`
- Password: `Admin@123`

---

## 📦 What's Running

### Backend Modules (All Ready!)
- ✅ **Finance**: AR, AP, GL (120+ endpoints)
- ✅ **SCM**: Inventory, Warehouses, Purchase Orders (50+ endpoints)
- ✅ **Assets**: Asset register, Depreciation (15+ endpoints)
- ✅ **HRMS**: Employee management (15+ endpoints)
- ✅ **Manufacturing**: BOM, Production Orders (30+ endpoints)
- ✅ **Reporting**: Dashboard aggregations (6 endpoints)
- ✅ **Core**: Organization, Branch, Services (20+ endpoints)
- ✅ **Auth**: JWT, RBAC, Permissions (8+ endpoints)

**Total: 264+ working API endpoints!**

---

## 🛠️ Troubleshooting

### API won't start?
```bash
# Check if PostgreSQL is running
pg_isready -U postgres

# Check if Redis is running
redis-cli ping

# Check database connection
cd apps/api
cat .env | grep DATABASE_URL
```

### Database issues?
```bash
# Reset and migrate
cd apps/api
npx prisma migrate reset --force
npx prisma migrate deploy
npx prisma db seed
```

### Port conflicts?
```bash
# Check what's using ports 3000, 3001
lsof -i :3000
lsof -i :3001

# Kill processes if needed
pkill -f "node apps/api"
pkill -f "next"
```

---

## 📚 Key API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get current user
- `POST /api/auth/refresh` - Refresh token

### Finance
- `GET /api/finance/customers` - List customers
- `POST /api/finance/invoices` - Create invoice
- `GET /api/finance/invoices/:id` - Get invoice
- `POST /api/finance/invoices/:id/post` - Post invoice
- `POST /api/finance/receipts` - Record receipt

### SCM
- `GET /api/scm/items` - List items
- `GET /api/scm/items/:id/stock` - Get stock levels
- `POST /api/scm/purchase-orders` - Create PO
- `POST /api/scm/purchase-orders/:id/approve` - Approve PO

### Reporting
- `GET /api/reporting/dashboard/overall` - Overall dashboard
- `GET /api/reporting/dashboard/finance` - Finance metrics
- `GET /api/reporting/dashboard/scm` - SCM metrics

---

## 🎯 Next Steps

1. **Access Swagger**: http://localhost:3001/api/docs
2. **Login**: Use admin credentials above
3. **Explore API**: Try creating customers, invoices, etc.
4. **Test Frontend**: Access http://localhost:3000

---

## 📝 Notes

- **Database**: PostgreSQL on `localhost:5432`
- **Redis**: Running on `localhost:6379`
- **Environment**: Development mode
- **Auto-reload**: Backend watches for file changes
- **TypeScript**: Strict mode enabled
- **Validation**: All DTOs validated with class-validator
- **Documentation**: Swagger/OpenAPI auto-generated

---

## 🐛 Common Issues

### "Port 3001 already in use"
```bash
pkill -f "node apps/api"
# Then restart API
```

### "Cannot connect to database"
```bash
# Check PostgreSQL
sudo systemctl status postgresql
# Or
pg_isready -U postgres
```

### "Prisma Client not found"
```bash
cd apps/api
npx prisma generate
pnpm build
```

---

**🎉 Enjoy your ERP system!**
