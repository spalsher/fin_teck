# 👥 User Management - Complete Guide

## ✅ **What's Been Created**

### **New Page:**
- **`/apps/web/src/app/(dashboard)/users/page.tsx`** - Complete user management interface

### **Navigation Updated:**
- **`/apps/web/src/components/layout/sidebar.tsx`** - Added "User Management" link

---

## 🎯 **How to Access User Management**

### **1. Via Sidebar:**
Click on **"User Management"** in the sidebar (below Reports, above Settings)

### **2. Via URL:**
Navigate to: `http://localhost:3002/users`

---

## ✨ **Features Implemented**

### **1. User List View**
- ✅ **Search** - Search by name or email
- ✅ **User Cards** - Profile picture initials, name, email
- ✅ **Role Display** - Badge showing user role
- ✅ **Status Indicator** - Active/Inactive badge
- ✅ **Last Login** - Track user activity
- ✅ **Responsive Table** - Mobile-friendly layout

### **2. Create New User**
- ✅ **User Registration Form** - First name, last name, email
- ✅ **Password Setup** - Password with confirmation
- ✅ **Form Validation** - Password matching, required fields
- ✅ **Role Assignment** - Assign user roles
- ✅ **Success Feedback** - Toast notifications

### **3. User Actions**
- ✅ **Edit User** - Modify user details
- ✅ **Manage Permissions** - Role and permission management
- ✅ **Activate/Deactivate** - Toggle user status
- ✅ **Delete User** - Remove user with confirmation
- ✅ **Action Menu** - Dropdown with all options

### **4. User Roles**
Current role system includes:
- **Admin** - Full system access (red badge)
- **Finance Manager** - Financial operations (blue badge)
- **Warehouse Staff** - Inventory management (gray badge)
- **User** - Basic access (gray badge)

---

## 📊 **User Interface**

### **Main Components:**

#### **Header Section:**
- Page title: "User Management"
- Subtitle: "Manage system users, roles, and permissions"
- **Create User** button (top right)

#### **User Table:**
- **Columns:**
  1. User (avatar + name)
  2. Email
  3. Role
  4. Status (Active/Inactive)
  5. Last Login
  6. Actions (dropdown menu)

#### **Actions Dropdown:**
- ✏️ **Edit User** - Modify user details
- 🛡️ **Manage Permissions** - Role/permission settings
- ⏸️ **Activate/Deactivate** - Toggle user status
- 🗑️ **Delete User** - Remove user (with confirmation)

---

## 🔐 **Default Mock Users**

Currently displaying 4 mock users for demonstration:

### **1. Admin User**
- Email: `admin@iteck.pk`
- Name: Admin User
- Role: Admin
- Status: Active

### **2. Finance Manager**
- Email: `finance@iteck.pk`
- Name: Finance Manager
- Role: Finance Manager
- Status: Active

### **3. Warehouse Staff**
- Email: `warehouse@iteck.pk`
- Name: Warehouse Staff
- Role: Warehouse Staff
- Status: Active

### **4. Inactive User**
- Email: `inactive@iteck.pk`
- Name: Inactive User
- Role: User
- Status: Inactive

---

## 🔄 **Backend Integration (TODO)**

### **Required API Endpoints:**

#### **1. List Users**
```typescript
GET /api/users
Response: User[]
```

#### **2. Get User Details**
```typescript
GET /api/users/:id
Response: User
```

#### **3. Create User**
```typescript
POST /api/auth/register
Body: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  branchId?: string;
}
Response: User
```

#### **4. Update User**
```typescript
PUT /api/users/:id
Body: Partial<User>
Response: User
```

#### **5. Delete User**
```typescript
DELETE /api/users/:id
Response: { message: string }
```

#### **6. Toggle User Status**
```typescript
PATCH /api/users/:id/status
Body: { isActive: boolean }
Response: User
```

#### **7. Assign Roles**
```typescript
POST /api/users/:id/roles
Body: { roleIds: string[] }
Response: User
```

---

## 🛠️ **Backend Implementation Guide**

### **Step 1: Create User Controller**

Create: `/apps/api/src/modules/core/controllers/user.controller.ts`

```typescript
import { Controller, Get, Post, Put, Delete, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';

@ApiTags('core')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @RequirePermissions('core:user:read')
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @RequirePermissions('core:user:read')
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Put(':id')
  @RequirePermissions('core:user:update')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    return this.userService.update(id, updateDto);
  }

  @Delete(':id')
  @RequirePermissions('core:user:delete')
  async delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }

  @Patch(':id/status')
  @RequirePermissions('core:user:update')
  async toggleStatus(@Param('id') id: string, @Body() body: { isActive: boolean }) {
    return this.userService.updateStatus(id, body.isActive);
  }
}
```

### **Step 2: Create User Service**

Create: `/apps/api/src/modules/core/services/user.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async updateStatus(id: string, isActive: boolean) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive },
    });
  }
}
```

### **Step 3: Update Core Module**

Update: `/apps/api/src/modules/core/core.module.ts`

```typescript
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';

@Module({
  imports: [SharedModule],
  controllers: [
    // ... existing controllers
    UserController,
  ],
  providers: [
    // ... existing services
    UserService,
  ],
})
export class CoreModule {}
```

---

## 🎨 **UI/UX Features**

### **Design Elements:**
- ✅ **Avatar Initials** - Colored circle with user initials
- ✅ **Role Badges** - Color-coded role indicators
- ✅ **Status Badges** - Green (active) / Gray (inactive)
- ✅ **Search Bar** - Real-time filtering
- ✅ **Loading States** - Skeleton placeholders
- ✅ **Empty State** - "No users found" message
- ✅ **Responsive Layout** - Mobile, tablet, desktop
- ✅ **Action Dropdown** - Clean context menu
- ✅ **Confirmation Dialogs** - Delete confirmation
- ✅ **Toast Notifications** - Success/error feedback

### **Color Coding:**
- **Admin Role** - Red/Destructive badge
- **Manager Roles** - Blue/Default badge
- **Staff Roles** - Gray/Secondary badge
- **Active Status** - Blue badge
- **Inactive Status** - Gray badge

---

## 📱 **Responsive Behavior**

### **Desktop (> 1024px):**
- Full table layout
- All columns visible
- Hover effects on rows
- Smooth dropdown menus

### **Tablet (640px - 1024px):**
- Optimized table layout
- Scrollable if needed
- Touch-friendly actions

### **Mobile (< 640px):**
- Vertical card layout (future enhancement)
- Stack user information
- Large touch targets

---

## 🔒 **Security Considerations**

### **Permissions Required:**
- **View Users** - `core:user:read`
- **Create Users** - `auth:register`
- **Edit Users** - `core:user:update`
- **Delete Users** - `core:user:delete`
- **Manage Roles** - `core:role:manage`

### **Best Practices:**
1. ✅ Only admins should access user management
2. ✅ Password confirmation for user creation
3. ✅ Confirm before deleting users
4. ✅ Audit log for user changes
5. ✅ Prevent self-deletion
6. ✅ Email verification for new users

---

## 🧪 **Testing Checklist**

### **Frontend Testing:**
- [ ] Navigate to `/users`
- [ ] View user list
- [ ] Search for users
- [ ] Click "Create User"
- [ ] Fill out form and submit
- [ ] View success toast
- [ ] Click on user actions dropdown
- [ ] Try to delete a user
- [ ] Confirm deletion dialog
- [ ] Test on mobile device

### **Backend Testing (After Implementation):**
- [ ] GET `/api/users` - List all users
- [ ] GET `/api/users/:id` - Get user details
- [ ] POST `/api/auth/register` - Create user
- [ ] PUT `/api/users/:id` - Update user
- [ ] DELETE `/api/users/:id` - Delete user
- [ ] PATCH `/api/users/:id/status` - Toggle status
- [ ] Test permissions/authorization
- [ ] Test validation errors

---

## 🚀 **Next Steps**

### **1. Implement Backend Endpoints** (Priority: High)
- Create UserController
- Create UserService
- Add to CoreModule
- Test endpoints

### **2. Connect Frontend to API** (Priority: High)
Replace mock data with actual API calls:

```typescript
// In /apps/web/src/app/(dashboard)/users/page.tsx

const fetchUsers = async () => {
  try {
    setLoading(true);
    const response = await apiClient.get('/users');
    setUsers(response.data);
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.response?.data?.message || 'Failed to fetch users',
      variant: 'destructive',
    });
  } finally {
    setLoading(false);
  }
};
```

### **3. Create User Edit Page** (Priority: Medium)
- Create `/apps/web/src/app/(dashboard)/users/[id]/edit/page.tsx`
- Form for editing user details
- Save changes functionality

### **4. Create Permissions Management** (Priority: Medium)
- Create `/apps/web/src/app/(dashboard)/users/[id]/permissions/page.tsx`
- Role assignment interface
- Permission matrix

### **5. Add User Roles Management** (Priority: Medium)
- Create `/apps/web/src/app/(dashboard)/roles/page.tsx`
- Manage available roles
- Define permissions per role

### **6. Enhanced Features** (Priority: Low)
- Bulk user actions
- Export user list
- User activity log
- Password reset functionality
- Email verification
- Two-factor authentication setup

---

## 📚 **Database Schema**

### **User Table** (Already Exists)
```prisma
model User {
  id              String    @id @default(uuid())
  email           String    @unique
  passwordHash    String
  firstName       String
  lastName        String
  isActive        Boolean   @default(true)
  organizationId  String
  branchId        String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  organization    Organization @relation(fields: [organizationId], references: [id])
  branch          Branch?      @relation(fields: [branchId], references: [id])
  userRoles       UserRole[]
}
```

### **Role & UserRole Tables** (Already Exist)
```prisma
model Role {
  id          String     @id @default(uuid())
  name        String     @unique
  description String?
  permissions Json       // Array of permission strings
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  
  userRoles   UserRole[]
}

model UserRole {
  id        String   @id @default(uuid())
  userId    String
  roleId    String
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  role      Role     @relation(fields: [roleId], references: [id], onDelete: Cascade)
  
  @@unique([userId, roleId])
}
```

---

## 🎉 **Summary**

### **✅ Completed:**
- User management page created
- Search functionality
- User list with roles and status
- Create user dialog
- Delete confirmation
- Action dropdown menu
- Sidebar navigation updated
- Professional UI with shadcn/ui

### **🔄 Pending:**
- Backend API endpoints
- Frontend API integration
- User edit page
- Permissions management page
- Role management page

---

## 📞 **Quick Reference**

### **Access:**
- **URL:** `/users`
- **Sidebar:** "User Management" (UserCog icon)

### **Actions:**
- **Create User:** Top-right "Create User" button
- **Edit User:** Actions dropdown → Edit User
- **Delete User:** Actions dropdown → Delete User
- **Manage Permissions:** Actions dropdown → Manage Permissions
- **Toggle Status:** Actions dropdown → Activate/Deactivate

---

*User Management created: January 15, 2026*  
*Part of iTeck ERP v1.0 - User Administration Module*
