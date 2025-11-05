# 🚢 Land Sea Air - Quick Start Action Plan

## 🎯 Executive Summary

Land Sea Air can be onboarded to APEX in **~2 business days** using the existing multi-tenant architecture. No separate instance needed - they get automatic data isolation via their email domain (`landseaair-nc.com`).

---

## ✅ What's Already Working

| Feature | Status | Notes |
|---------|--------|-------|
| Multi-tenant architecture | ✅ Ready | Automatic tenant isolation by email domain |
| Google OAuth | ✅ Ready | Land Sea Air uses Google Workspace |
| Data isolation | ✅ Ready | DynamoDB partitioned by customerId |
| Authentication | ✅ Ready | Sign in with Google at apex.ilminate.com |

---

## 📋 What Needs to be Done

### Priority 1: Code Changes (2 hours)
1. ✏️ Add customer configuration for `landseaair-nc.com`
2. 🚫 Disable mock data for their instance
3. 🎨 Add logo support per customer
4. 📵 Hide EDR features for Land Sea Air
5. 🚀 Deploy to production

### Priority 2: Logo & Branding (30 minutes)
1. 📸 Get Land Sea Air logo from customer or website
2. 🖼️ Add to `public/logos/landseaair-logo.png`
3. ✅ Test logo displays correctly

### Priority 3: Google Workspace Integration (1-2 days)
1. 📧 Coordinate with Land Sea Air IT team
2. 🔧 Configure Gmail API access
3. 🔑 Set up service account with domain-wide delegation
4. 📊 Configure DMARC DNS records
5. 🔗 Connect to `ilminate-email` service

### Priority 4: Documentation & Repo (1 hour)
1. 📂 Create private `ilminate-landseaair` GitHub repo
2. 📝 Add onboarding documentation
3. 🔒 Store credentials securely (AWS Secrets Manager)

---

## 🚀 Quick Implementation Steps

### Step 1: Create Private Customer Repo (15 min)
```bash
# Create private repo
gh repo create ilminate-landseaair --private

# Clone and set up structure
git clone git@github.com:cjfisher84-source/ilminate-landseaair.git
cd ilminate-landseaair

# Create directory structure
mkdir -p config docs assets scripts
touch README.md
```

### Step 2: Update APEX Code (2 hours)

**File 1:** `src/lib/tenantUtils.ts` (create new file)
```typescript
// Customer branding configuration
export const CUSTOMER_BRANDING = {
  'landseaair-nc.com': {
    companyName: 'Land Sea Air',
    logo: '/logos/landseaair-logo.png',
    displayName: 'Land Sea Air APEX'
  }
}

// Feature toggles per customer
export const CUSTOMER_FEATURES = {
  'landseaair-nc.com': {
    edr: false,  // Hide EDR for Land Sea Air
    email_security: true,
    mockData: false  // No mock data
  }
}

export function getCustomerBranding(customerId: string | null) { ... }
export function isFeatureEnabled(customerId: string, feature: string) { ... }
```

**File 2:** Update `src/lib/mock.ts`
```typescript
// Disable mock data for specific customers
const NO_MOCK_DATA_CUSTOMERS = ['landseaair-nc.com']

export function mockCategoryCounts(customerId?: string | null) {
  if (customerId && NO_MOCK_DATA_CUSTOMERS.includes(customerId)) {
    return { Phish: 0, Malware: 0, Spam: 0, BEC: 0, ATO: 0 }
  }
  // ... existing code
}
```

**File 3:** Update `src/app/page.tsx`
```typescript
import { getCustomerBranding, isFeatureEnabled } from '@/lib/tenantUtils'

// Use dynamic branding
const branding = getCustomerBranding(customerId)

<Image 
  src={branding.logo}
  alt={branding.companyName}
/>

// Conditionally show EDR links
{isFeatureEnabled(customerId, 'edr') && (
  <Link href="/edr/endpoints">EDR</Link>
)}
```

### Step 3: Add Logo (15 min)
```bash
# Get logo from Land Sea Air website or customer
wget https://landseaair-nc.com/logo.png -O public/logos/landseaair-logo.png

# Or request from customer via email
```

### Step 4: Deploy (15 min)
```bash
cd ilminate-apex
git add .
git commit -m "Add Land Sea Air customer: branding, feature toggles, no mock data"
git push origin main

# Amplify auto-deploys in 5-10 minutes
```

### Step 5: Test (30 min)
```bash
# 1. Navigate to apex.ilminate.com/login
# 2. Click "Sign in with Google"
# 3. Use Land Sea Air Google account
# 4. Verify:
#    - ✅ Land Sea Air logo displays
#    - ✅ No mock data shown
#    - ✅ EDR links hidden
#    - ✅ Email features visible
```

---

## 📧 Google Workspace Integration

### Land Sea Air IT Team Needs to Complete:

1. **Enable Gmail API**
   - Go to: https://console.cloud.google.com/
   - Create project or use existing
   - Enable Gmail API & Cloud Pub/Sub API

2. **Create Service Account**
   - Create service account
   - Download JSON key
   - Send to Chris (encrypt/secure transfer)

3. **Domain-Wide Delegation**
   - Enable for service account
   - Add scopes:
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/gmail.modify`

4. **Google Workspace Admin Console**
   - Authorize service account
   - Add scopes to domain-wide delegation

5. **DNS Configuration**
   ```
   # Add DMARC record
   _dmarc.landseaair-nc.com TXT "v=DMARC1; p=none; rua=mailto:dmarc@ilminate.com"
   
   # Verify SPF
   landseaair-nc.com TXT "v=spf1 include:_spf.google.com ~all"
   
   # Enable DKIM in Google Workspace
   ```

### On Ilminate Side:

1. **Update `ilminate-email` service**
   ```bash
   cd ilminate-email
   # Add Land Sea Air customer config
   # Deploy with new credentials
   ```

2. **Store credentials in AWS Secrets Manager**
   ```bash
   aws secretsmanager create-secret \
     --name landseaair-gmail-service-account \
     --secret-string file://landseaair-service-account.json \
     --region us-east-1
   ```

---

## 🎓 User Onboarding

Once technical setup is complete:

### For Land Sea Air Users:

1. **Go to**: https://apex.ilminate.com/login
2. **Click**: "Sign in with Google"
3. **Sign in** with your @landseaair-nc.com email
4. **Automatically**:
   - Logged in to Land Sea Air's APEX instance
   - See only Land Sea Air data
   - Custom branding applied
   - EDR features hidden

### Available Features:
- ✅ **APEX Trace** - Email message search
- ✅ **AI Triage** - Threat analysis
- ✅ **Investigations** - Campaign tracking
- ✅ **Quarantine** - Message management
- ✅ **DMARC Monitoring** - Domain protection
- ✅ **HarborSim** - Phishing training
- ✅ **Security Events** - Real-time monitoring
- ✅ **Notifications** - Alert management
- ❌ **EDR** - Not available initially

---

## 💡 Key Points

### For You (Chris):
1. ✅ No separate APEX instance needed
2. ✅ Same codebase, automatic multi-tenant isolation
3. ✅ Private repo for customer-specific configs
4. ✅ Logo and branding per customer
5. ✅ Feature toggles per customer
6. ✅ Mock data disabled for Land Sea Air

### For Land Sea Air:
1. ✅ Free testing/pilot program
2. ✅ Familiar with logistics fraud landscape
3. ✅ Google Workspace integration
4. ✅ Real data only (no mock data)
5. ✅ Email security focus (no EDR initially)
6. ✅ Can add EDR later by flipping feature toggle

---

## ⚠️ Critical Requirements

1. **Private Repo**: `ilminate-landseaair` MUST be private (contains credentials)
2. **Access Control**: Only Chris Fisher has access
3. **Secure Credentials**: Store Gmail service account JSON in AWS Secrets Manager
4. **Testing Customer**: Non-paid, for testing/pilot
5. **Logistics Focus**: Customer knows fraud landscape well

---

## 📞 Next Steps

1. ✅ Review this plan
2. 📧 Contact Land Sea Air IT team with Google Workspace integration requirements
3. 💻 Implement code changes (2 hours)
4. 🎨 Get/add Land Sea Air logo
5. 🚀 Deploy to production
6. 🧪 Test with Land Sea Air user
7. 📋 Coordinate Google Workspace integration
8. 🎓 User onboarding/training

---

## 📊 Timeline

| Day | Tasks | Duration |
|-----|-------|----------|
| **Day 1 AM** | Code changes, logo, deploy | 3 hours |
| **Day 1 PM** | Testing, private repo setup | 2 hours |
| **Day 2** | Google Workspace coordination | Variable |
| **Day 3** | Gmail API integration, final testing | 3 hours |

**Total**: ~2-3 business days from start to fully operational

---

**Status**: 🟢 Ready to start  
**Estimated Effort**: 8-10 hours (Chris) + 2-4 hours (Land Sea Air IT)  
**Complexity**: Low-Medium (existing architecture supports it)  
**Risk**: Low (no infrastructure changes needed)

