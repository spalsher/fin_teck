# Legacy ATS_GL to fin_teck Auth & Permission Mapping

This document maps the legacy .NET (ATS_GL_260126) authentication and authorization model to the fin_teck stack for migration.

## 1. Authentication

| Legacy (ATS_GL_260126) | fin_teck |
|------------------------|----------|
| `POST Api/Controller/AuthenticateUser` (User_Name, User_Password) | `POST /auth/login` (email, password) |
| Returns JWT in `RequestResponse.Data` | Returns `accessToken`, `refreshToken`, `user` |
| Session / IsUserLoggedIn | JWT in `Authorization: Bearer <token>`; refresh via `POST /auth/refresh` |
| GetUserDetails (stored procedure) | AuthService validates email + password via Prisma (User table) |

**Note:** Legacy uses `User_Name` as login; fin_teck uses `email`. During migration, ensure user records have `email` set (e.g. from User_Email or a derived value).

## 2. Companies / Organizations

| Legacy | fin_teck |
|--------|----------|
| GetUserCompanies(userID) → List of GroupOfCompanies (CoID, company name, Server_Name, DB_Name, etc.) | User has single `organizationId` and optional `branchId`. List branches: `GET /branches` (scoped to user's organization). |
| GetCompany(CoID) → single company connection info | `GET /core/organizations/:id` or organization from `GET /auth/me`; branches via `GET /branches`. |
| Company selection drives connection string in legacy | In fin_teck, one PostgreSQL database; `organizationId` and `branchId` in JWT/me scope all queries. |

For multi-company in fin_teck: use multiple Organizations and assign users to an organization; optionally allow branch switching via `branchId` if needed.

## 3. Menu / Forms (GetUserMenuAndForms)

Legacy returns a list of **FormDescription** (FormID, FormDescr, MnuID, MnuDescr, MnuSubID, MnuSubDescr, ModuleID, ModuleDescr, FormSeq, FormType, Status). Access control is per form: user has a list of forms they can access.

In fin_teck:

- **Permissions** are permission **codes** (e.g. `finance:invoice:read`, `hrms:employee:create`) stored in `Permission` and assigned to roles; users get permissions via `UserRole` → `Role` → `RolePermission` → `Permission`.
- **Menu building:** Use the list of permission codes returned in login payload and in `GET /auth/me` (see below). Frontend can show/hide menu items or routes based on these codes.

### Legacy Form/Module to fin_teck Permission Code (recommended mapping)

| Legacy area / form concept | fin_teck permission code(s) |
|----------------------------|-----------------------------|
| Organization / Company | `core:organization:read`, `core:organization:update` |
| Branch | `core:branch:create`, `core:branch:read`, `core:branch:update`, `core:branch:delete` |
| User management | `auth:user:create`, `auth:user:read`, `auth:user:update`, `auth:user:delete` |
| Roles / User privileges | `auth:role:create`, `auth:role:read`, `auth:role:update`, `auth:role:delete` |
| GL – Organization Unit, Cost Center, Natural Account, Sub Account, Account Combination | `finance:account:create`, `finance:account:read`, `finance:account:update` |
| Trial Balance / Audit Trial / Account Ledger reports | `report:financial:read`, `report:any:export` |
| Journal Voucher / Journal Posting | `finance:journal:create`, `finance:journal:read`, `finance:journal:post` |
| AP – Supplier, Purchase Invoice, Payment | `finance:vendor:*`, `finance:bill:*`, `finance:payment:*` |
| AR – Customer, Invoice, Receipt | `finance:customer:*`, `finance:invoice:*`, `finance:receipt:*` |
| Inventory / Item Category / Item Master / UOM / Packing | `scm:item:*`, `scm:inventory:*` |
| HRMS – Employee, Department, Designation, Leave, Payroll, etc. | `hrms:employee:*`, `hrms:department:*`, `hrms:designation:*`, `hrms:leave_*`, `hrms:payroll:*`, etc. |
| Data Loader (AP load, Bank statement, Un-presented cheques) | `finance:dataloader:*` or specific permissions (to be defined in module) |
| Reports / RDLC | `report:dashboard:read`, `report:financial:read`, `report:any:export` |

All permission codes are defined in `packages/shared/src/constants/permissions.ts` and used in API with `@RequirePermissions(PERMISSIONS.XXX)`.

## 4. API Equivalents

| Legacy endpoint / behavior | fin_teck |
|----------------------------|----------|
| GetUserCompanies | User's org from `GET /auth/me`; branches from `GET /branches` |
| GetUserMenuAndForms(UserID, CoID) | Permissions in JWT and in `GET /auth/me` response; frontend builds menu from permission codes |
| UserPrivileges (assign forms to user) | Assign roles to user (UserRole); role has RolePermissions. Use User Management and Roles UI. |

## 5. Implementing menu from permissions in the frontend

- Call `GET /auth/me` after login (or use stored user + permissions from login).
- Response includes `permissions: string[]` (array of permission codes).
- For each menu item, define which permission code(s) are required; show the item if the user has at least one of them (or all, depending on design).
- Sidebar and route guards should use the same permission codes as the API (e.g. `PERMISSIONS` from `@iteck/shared`).
