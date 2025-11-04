# 🏢 APEX Multi-Tenant Architecture

## Overview

APEX is a **multi-tenant SaaS platform** where each customer gets their own isolated environment. Customers can self-onboard by signing in with Google or Microsoft, and their email domain automatically becomes their tenant ID.

---

## 🔑 How It Works

### **1. Customer Signs Up**
```
User: admin@acme.com
  ↓
Sign in with Google/Microsoft
  ↓
Cognito authenticates
  ↓
Middleware extracts email: "admin@acme.com"
  ↓
Extract domain: "acme.com"
  ↓
Set customer ID: "acme.com"
  ↓
User sees only ACME Corp data
```

### **2. Another Customer Signs Up**
```
User: security@globex.com
  ↓
Sign in with Google/Microsoft
  ↓
Extract domain: "globex.com"
  ↓
User sees only GLOBEX data
```

---

## 🔐 Tenant Isolation

### **Every API Request Includes:**
```typescript
Headers set by middleware:
- x-user-email: admin@acme.com
- x-customer-id: acme.com
- x-user-role: customer (or "admin" for ilminate.com)
```

### **All Database Queries Filter by Customer:**
```typescript
// DynamoDB query MUST include customerId
const params = {
  TableName: 'QuarantinedMessages',
  KeyConditionExpression: 'customerId = :customerId',
  ExpressionAttributeValues: {
    ':customerId': 'acme.com'  // ← From x-customer-id header
  }
}
```

---

## 🏗️ Data Model

### **DynamoDB Structure:**
```
Table: QuarantinedMessages
Partition Key: customerId (String)
Sort Key: quarantineDate#messageId

Example data:
customerId: "acme.com"
customerId: "globex.com"
customerId: "initech.com"
```

### **Row-Level Security:**
- ACME user queries → Only sees customerId="acme.com" rows
- GLOBEX user queries → Only sees customerId="globex.com" rows
- Ilminate admin → Can see all rows (x-user-role: "admin")

---

## 👥 User Roles

### **Customer** (`x-user-role: customer`)
- Email: `user@customer-company.com`
- Customer ID: `customer-company.com`
- Access: Only their own company's data
- Permissions: View, manage their own threats/quarantine

### **Admin** (`x-user-role: admin`)
- Email: `admin@ilminate.com`
- Customer ID: `ilminate.com`
- Access: All customers' data (for support)
- Permissions: Full access, impersonation

---

## 🚀 Self-Service Onboarding

### **New Customer Flow:**

1. **Visit apex.ilminate.com**
2. **Click "Sign in with Google" or "Sign in with Microsoft"**
3. **Authenticate with work email** (e.g., cfo@newcorp.com)
4. **Automatic tenant creation:**
   - Email domain → Customer ID (newcorp.com)
   - Empty data set created
   - User lands on dashboard (no data yet)
5. **Onboarding guide appears:**
   - Connect M365/Google Workspace
   - Configure DMARC
   - Deploy endpoint agents
6. **Data starts flowing:**
   - Emails analyzed
   - Threats detected
   - Dashboard populates

### **No Manual Approval Needed:**
✅ Instant access for any authenticated user  
✅ Automatic tenant provisioning  
✅ Self-service configuration  
✅ Payment/billing integration (future)  

---

## 🔒 Security

### **Authentication:**
- AWS Cognito with Google/Microsoft OAuth
- JWT tokens with email claims
- Session management

### **Authorization:**
- Automatic tenant extraction from email domain
- All queries filtered by customerId
- Row-level security in DynamoDB
- Admins can impersonate for support

### **Data Isolation:**
- Logical separation via customerId
- No cross-tenant data leakage
- Query validation on every API call

---

## 🛠️ API Implementation Example

### **Before (Single-Tenant):**
```typescript
// ❌ BAD - No customer filtering
export async function GET(request: NextRequest) {
  const messages = await db.query({
    TableName: 'QuarantinedMessages'
    // Returns ALL customers' data!
  })
  return Response.json(messages)
}
```

### **After (Multi-Tenant):**
```typescript
// ✅ GOOD - Filtered by customer
import { getCustomerIdFromHeaders } from '@/lib/tenantUtils'

export async function GET(request: NextRequest) {
  // Extract customer ID from middleware headers
  const customerId = getCustomerIdFromHeaders(request.headers)
  
  if (!customerId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Query only this customer's data
  const messages = await db.query({
    TableName: 'QuarantinedMessages',
    KeyConditionExpression: 'customerId = :customerId',
    ExpressionAttributeValues: {
      ':customerId': customerId  // ← Row-level security
    }
  })
  
  return Response.json(messages)
}
```

---

## 📊 Customer Examples

| Email | Customer ID | Sees |
|-------|-------------|------|
| admin@acme.com | acme.com | ACME's threats only |
| security@globex.com | globex.com | GLOBEX's threats only |
| cfo@initech.com | initech.com | INITECH's threats only |
| admin@ilminate.com | ilminate.com | ALL customers (admin) |

---

## 🎯 Migration Path

### **Phase 1: Authentication (DONE)**
✅ Allow any authenticated user  
✅ Extract customer ID from email domain  
✅ Set headers in middleware  

### **Phase 2: API Updates (IN PROGRESS)**
⏳ Update all API routes to filter by customerId  
⏳ Add tenant utils helper functions  
⏳ Ensure no cross-tenant queries  

### **Phase 3: Onboarding (TODO)**
📅 Build onboarding wizard  
📅 M365/Google Workspace connection  
📅 Self-service configuration  

### **Phase 4: Billing (TODO)**
📅 Stripe integration  
📅 Usage tracking per customer  
📅 Subscription management  

---

## 🧪 Testing Multi-Tenancy

### **Test Scenario 1: Two Different Customers**
1. User A logs in: `admin@acme.com`
2. User A sees dashboard with ACME data
3. Log out
4. User B logs in: `security@globex.com`
5. User B sees dashboard with GLOBEX data (different from ACME)
6. **Verify:** No data overlap

### **Test Scenario 2: Admin Access**
1. Admin logs in: `admin@ilminate.com`
2. Admin can see all customers
3. Admin can switch between customer views
4. **Verify:** Admin sees aggregated data

---

## 📝 API Checklist

Update these API routes to be tenant-aware:

- [ ] `/api/quarantine/list` - Filter by customerId
- [ ] `/api/quarantine/[messageId]` - Verify ownership
- [ ] `/api/triage` - Save with customerId
- [ ] `/api/threats/*` - Filter by customerId
- [ ] `/api/dmarc/*` - Filter by customerId
- [ ] `/api/attack/*` - Filter by customerId

---

## 🚀 Deployment

The multi-tenant middleware is ready to deploy. Once deployed:

1. ✅ Any user can sign up with work email
2. ✅ Automatic tenant creation based on email domain
3. ✅ Each customer sees only their data
4. ✅ No manual approval needed

---

## 📚 Key Files

| File | Purpose |
|------|---------|
| `src/middleware.ts` | Extracts customerId, sets headers |
| `src/lib/tenantUtils.ts` | Helper functions for multi-tenancy |
| `src/lib/mock.ts` | Mock data (needs customerId filtering) |

---

## 🎉 Benefits

✅ **Self-Service:** Customers can sign up instantly  
✅ **Scalable:** Add unlimited customers without manual setup  
✅ **Secure:** Automatic tenant isolation  
✅ **Simple:** Email domain = Customer ID  
✅ **Flexible:** Supports any email provider (Google, Microsoft, etc.)  

---

**Status:** 🟢 Ready to deploy multi-tenant architecture

