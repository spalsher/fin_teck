# Production-Ready Code Rule

## CRITICAL: NO MOCK DATA - ALWAYS PRODUCTION READY

When implementing ANY feature, you MUST:

### Backend Requirements (MANDATORY)
1. **Create Complete Backend Implementation**
   - ✅ Create Prisma schema models if needed
   - ✅ Create service layer with business logic
   - ✅ Create controller with all CRUD endpoints
   - ✅ Add proper error handling and validation
   - ✅ Include authentication/authorization guards
   - ✅ Add API documentation (Swagger)
   - ❌ NO mock data or simulated responses

2. **Database Integration**
   - ✅ Define proper Prisma models with relationships
   - ✅ Create migrations for schema changes
   - ✅ Add indexes for performance
   - ✅ Include seed data if needed

3. **API Endpoints**
   - ✅ Full REST API with all operations
   - ✅ Proper HTTP status codes
   - ✅ Request/response DTOs
   - ✅ Input validation using class-validator
   - ✅ Error handling with meaningful messages

### Frontend Requirements (MANDATORY)
1. **Real API Integration**
   - ✅ Use apiClient for all data fetching
   - ✅ Proper error handling with user feedback
   - ✅ Loading states during API calls
   - ✅ Success/error toasts
   - ❌ NO setTimeout or fake delays
   - ❌ NO mock data arrays
   - ❌ NO "TODO: Replace with actual API call" comments

2. **State Management**
   - ✅ Use React Query or similar for server state
   - ✅ Proper cache invalidation
   - ✅ Optimistic updates where appropriate

### Code Quality (MANDATORY)
1. **No Placeholders**
   - ❌ NO "TODO" comments without implementation
   - ❌ NO mock data
   - ❌ NO simulated API responses
   - ❌ NO fake delays or timeouts

2. **Complete Implementation**
   - ✅ All CRUD operations working
   - ✅ All features fully functional
   - ✅ Proper error handling at every layer
   - ✅ Edge cases handled

3. **Testing Ready**
   - ✅ Code that can be tested immediately
   - ✅ No missing dependencies
   - ✅ No broken imports

## Examples

### ❌ WRONG (Mock Data):
```typescript
// ❌ BAD - DO NOT DO THIS
const mockData = [{ id: 1, name: 'Test' }];
await new Promise(resolve => setTimeout(resolve, 1000)); // ❌ Fake delay
// TODO: Replace with actual API call // ❌ Placeholder
```

### ✅ CORRECT (Production Ready):
```typescript
// ✅ GOOD - Real API call
const response = await apiClient.get('/api/payroll-runs');
const data = response.data;
```

## Workflow

When asked to create a feature:

1. **Ask yourself**: "Is this production-ready?"
2. **Check**: Does it use real APIs and database?
3. **Verify**: No mock data, no TODOs, no placeholders
4. **Confirm**: All CRUD operations implemented

If the answer to ANY check is NO, DO NOT PROCEED. Implement the complete backend first.

## Module Registration

Always update module imports in `app.module.ts` when creating new modules.

## Migration Required

When creating new Prisma models, remind the user to:
```bash
cd apps/api
npx prisma migrate dev --name description_of_changes
npx prisma generate
npm run build && npm run dev
```

## User Notification

If a feature requires backend work, tell the user:
"I'm implementing the complete production-ready solution with backend API, database models, and frontend integration. This will take a few minutes."

---

**Remember**: The user has explicitly requested NO MOCK DATA. Every feature must be fully functional and production-ready from the start.
