# 🚢 Land Sea Air - Customer Onboarding Plan

## Customer Information
- **Company**: Land Sea Air
- **Domain**: https://landseaair-nc.com/
- **Location**: Wilmington, NC
- **Email Provider**: Google Workspace
- **Customer Type**: Testing/Non-Paid
- **Industry Focus**: Logistics & Freight Fraud Prevention
- **Customer ID**: `landseaair-nc.com` (extracted from email domain)

---

## ✅ Requirements Summary

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 1 | Separate APEX instance | ✅ Ready | Multi-tenant architecture already supports this |
| 2 | No EDR initially | ⏳ TODO | Configure UI to hide EDR sections for this customer |
| 3 | Non-paid/testing customer | ✅ Ready | No billing integration needed yet |
| 4 | Logistics fraud context | 📝 Note | Customer is familiar with fraud landscape - no training needed |
| 5 | No mock data | ⏳ TODO | Disable mock data generation for landseaair-nc.com |
| 6 | Google Workspace onboarding | 📋 TODO | Create step-by-step guide |
| 7 | Private customer repo | ⏳ TODO | Create private repo for customer-specific configs |
| 8 | Customer logo in APEX | ⏳ TODO | Add Land Sea Air logo to their instance |

---

## 🏗️ Architecture Review

### Current Multi-Tenant Setup ✅
APEX already supports multi-tenant architecture:

```typescript
// How it works:
User logs in: admin@landseaair-nc.com
   ↓
Cognito authenticates via Google OAuth
   ↓
Middleware extracts email: "admin@landseaair-nc.com"
   ↓
Extract domain: "landseaair-nc.com"
   ↓
Set customer ID: "landseaair-nc.com"
   ↓
User sees ONLY Land Sea Air data
```

**Key Points:**
- ✅ No separate APEX instance needed - same apex.ilminate.com
- ✅ Data isolation via DynamoDB customerId partition key
- ✅ All queries automatically filtered by customer ID
- ✅ Logo can be customized per customer ID
- ✅ Features can be toggled per customer ID

---

## 📋 IMPLEMENTATION PLAN

### Phase 1: Infrastructure Setup (30 minutes)

#### 1.1 Create Private Customer Repository
```bash
# Create private repo on GitHub
Repository name: ilminate-landseaair
Description: Land Sea Air customer configuration (PRIVATE)
Visibility: Private
Access: cjfisher84-source only

# Directory structure:
ilminate-landseaair/
├── README.md                      # Customer overview
├── config/
│   ├── features.json              # Feature toggles
│   ├── branding.json              # Logo, colors, company name
│   └── integrations.json          # Google Workspace config
├── docs/
│   ├── GOOGLE_WORKSPACE_SETUP.md  # Step-by-step onboarding
│   ├── GMAIL_API_SETUP.md         # Gmail API integration
│   └── CUSTOMER_NOTES.md          # Internal notes about customer
├── assets/
│   └── landseaair-logo.png        # Customer logo
└── scripts/
    └── deploy-config.sh           # Deploy config to APEX
```

**Action Items:**
- [ ] Create GitHub repo `ilminate-landseaair` (private)
- [ ] Set up directory structure
- [ ] Add customer documentation
- [ ] Restrict access to Chris Fisher only

---

#### 1.2 Customer Feature Configuration

Create `config/features.json`:
```json
{
  "customerId": "landseaair-nc.com",
  "features": {
    "email_security": true,
    "dmarc_monitoring": true,
    "apex_trace": true,
    "ai_triage": true,
    "investigations": true,
    "quarantine": true,
    "harborsim": true,
    "edr": false,
    "edr_endpoints": false,
    "edr_metrics": false,
    "edr_threats": false,
    "attack_reports": true,
    "security_events": true,
    "notifications": true
  },
  "mockData": {
    "enabled": false,
    "reason": "Production customer - real data only"
  },
  "billing": {
    "plan": "testing",
    "paid": false,
    "notes": "Non-paid testing customer"
  }
}
```

Create `config/branding.json`:
```json
{
  "customerId": "landseaair-nc.com",
  "companyName": "Land Sea Air",
  "domain": "landseaair-nc.com",
  "logo": {
    "primary": "/logos/landseaair-logo.png",
    "width": 100,
    "height": 100,
    "alt": "Land Sea Air Logo"
  },
  "theme": {
    "primaryColor": "#007070",
    "secondaryColor": "#00a8a8",
    "useCustomTheme": false
  },
  "displayName": "Land Sea Air APEX"
}
```

---

### Phase 2: Code Changes (2 hours)

#### 2.1 Disable Mock Data for Specific Customers

Update `src/lib/mock.ts`:
```typescript
// Add at the top of the file
const CUSTOMER_CONFIG: Record<string, { mockDataEnabled: boolean }> = {
  'landseaair-nc.com': { mockDataEnabled: false },
  // Add more customers as needed
}

export function isMockDataEnabled(customerId: string | null): boolean {
  if (!customerId) return true // Default: show mock data for unauthenticated
  
  const config = CUSTOMER_CONFIG[customerId]
  return config ? config.mockDataEnabled : true // Default: enabled
}

// Update all mock functions to check customer ID
export function mockCategoryCounts(customerId?: string | null) {
  if (!isMockDataEnabled(customerId)) {
    return { Phish: 0, Malware: 0, Spam: 0, BEC: 0, ATO: 0 }
  }
  // ... existing mock data
}

// Apply to all mock functions:
// - mockTimeline30d()
// - mockCyberScore()
// - mockDomainAbuse()
// - mockAIThreats()
// - etc.
```

---

#### 2.2 Add Customer Logo Support

Update `src/lib/tenantUtils.ts` (create if doesn't exist):
```typescript
export interface CustomerBranding {
  companyName: string
  logo: {
    primary: string
    width: number
    height: number
    alt: string
  }
  displayName: string
}

const CUSTOMER_BRANDING: Record<string, CustomerBranding> = {
  'landseaair-nc.com': {
    companyName: 'Land Sea Air',
    logo: {
      primary: '/logos/landseaair-logo.png',
      width: 100,
      height: 100,
      alt: 'Land Sea Air Logo'
    },
    displayName: 'Land Sea Air APEX'
  },
  // Default for all other customers
  'default': {
    companyName: 'Ilminate',
    logo: {
      primary: '/ilminate-logo.png',
      width: 100,
      height: 100,
      alt: 'Ilminate Logo'
    },
    displayName: 'Ilminate APEX'
  }
}

export function getCustomerBranding(customerId: string | null): CustomerBranding {
  if (!customerId) return CUSTOMER_BRANDING['default']
  return CUSTOMER_BRANDING[customerId] || CUSTOMER_BRANDING['default']
}
```

---

#### 2.3 Hide EDR Features for Specific Customers

Update `src/lib/tenantUtils.ts`:
```typescript
export interface CustomerFeatures {
  email_security: boolean
  edr: boolean
  harborsim: boolean
  // ... other features
}

const CUSTOMER_FEATURES: Record<string, CustomerFeatures> = {
  'landseaair-nc.com': {
    email_security: true,
    edr: false, // Disabled for Land Sea Air
    harborsim: true,
    dmarc_monitoring: true,
    apex_trace: true,
    ai_triage: true,
    investigations: true,
    quarantine: true,
    attack_reports: true,
    security_events: true,
    notifications: true
  }
}

export function getCustomerFeatures(customerId: string | null): CustomerFeatures {
  if (!customerId) return DEFAULT_FEATURES
  return CUSTOMER_FEATURES[customerId] || DEFAULT_FEATURES
}

export function isFeatureEnabled(customerId: string | null, feature: keyof CustomerFeatures): boolean {
  const features = getCustomerFeatures(customerId)
  return features[feature] ?? false
}
```

---

#### 2.4 Update Dashboard to Use Customer Branding

Update `src/app/page.tsx`:
```typescript
'use client'
import { getCustomerBranding, isMockDataEnabled } from '@/lib/tenantUtils'
import { useEffect, useState } from 'react'

export default function Home() {
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [branding, setBranding] = useState(getCustomerBranding(null))
  
  useEffect(() => {
    // Get customer ID from cookie set by middleware
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = decodeURIComponent(value)
      return acc
    }, {} as Record<string, string>)
    
    const userDisplay = cookies['apex_user_display']
    if (userDisplay) {
      try {
        const info = JSON.parse(userDisplay)
        setCustomerId(info.customerId)
        setBranding(getCustomerBranding(info.customerId))
      } catch (e) {
        console.error('Failed to parse user display cookie', e)
      }
    }
  }, [])
  
  // Use branding.logo instead of hardcoded logo
  return (
    <Image 
      src={branding.logo.primary}
      alt={branding.logo.alt}
      width={branding.logo.width}
      height={branding.logo.height}
      priority
    />
    
    // Use branding.displayName instead of "Ilminate APEX"
    <Typography variant="h3">
      {branding.displayName}
    </Typography>
    
    // Only show mock data if enabled
    const cats = isMockDataEnabled(customerId) ? mockCategoryCounts(customerId) : { ... }
  )
}
```

---

#### 2.5 Update Navigation to Hide EDR Links

Update `src/app/page.tsx` navigation section:
```typescript
import { isFeatureEnabled } from '@/lib/tenantUtils'

// In the navigation section:
{isFeatureEnabled(customerId, 'edr') && (
  <Link href="/edr/endpoints" passHref legacyBehavior>
    <Button>
      💻 EDR
    </Button>
  </Link>
)}
```

---

### Phase 3: Google Workspace Integration (1 hour)

#### 3.1 Create Onboarding Documentation

Create `docs/GOOGLE_WORKSPACE_ONBOARDING.md` in customer repo:

```markdown
# Google Workspace Integration for Land Sea Air

## Prerequisites
- Land Sea Air Google Workspace Admin access
- User account: *@landseaair-nc.com

## Step 1: Configure Google Workspace

1. **Enable Gmail API**
   - Go to: https://console.cloud.google.com/
   - Select or create project: "Land Sea Air - Ilminate APEX"
   - Enable Gmail API
   - Enable Cloud Pub/Sub API

2. **Create Service Account**
   - Navigate to: IAM & Admin → Service Accounts
   - Create service account: `apex-email-security@...`
   - Download JSON key file
   - Store securely in AWS Secrets Manager

3. **Domain-Wide Delegation**
   - Enable domain-wide delegation for service account
   - Add scopes:
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/gmail.modify`
   - Note the Client ID

4. **Google Workspace Admin Console**
   - Go to: admin.google.com
   - Navigate to: Security → API Controls → Domain-wide Delegation
   - Add Client ID with scopes from step 3
   - Authorize

## Step 2: Configure DMARC Reporting

1. **Update DNS Records**
   Add TXT record for DMARC:
   ```
   _dmarc.landseaair-nc.com
   v=DMARC1; p=none; rua=mailto:dmarc@ilminate.com; ruf=mailto:dmarc@ilminate.com; pct=100
   ```

2. **Verify SPF**
   ```
   v=spf1 include:_spf.google.com ~all
   ```

3. **Verify DKIM**
   - Enable DKIM in Google Workspace Admin
   - Add DKIM DNS records

## Step 3: Connect to ilminate-email Service

1. **Deploy Configuration**
   ```bash
   cd ilminate-email
   # Add Land Sea Air config
   # Deploy to production
   ```

2. **Test Email Flow**
   - Send test email from Land Sea Air domain
   - Verify appears in APEX dashboard
   - Check DMARC alignment

## Step 4: User Authentication

1. **First User Login**
   - Navigate to: https://apex.ilminate.com/login
   - Click "Sign in with Google"
   - Use Land Sea Air Google Workspace account
   - Example: admin@landseaair-nc.com

2. **Automatic Provisioning**
   - Customer ID automatically set to: landseaair-nc.com
   - Tenant isolation enabled
   - Custom branding applied
   - EDR features hidden

3. **Add Additional Users**
   - Any user with @landseaair-nc.com can log in
   - All see the same Land Sea Air data
   - Role-based access control (future)
```

---

#### 3.2 Gmail API Integration Checklist

Create `docs/GMAIL_API_SETUP.md`:
```markdown
# Gmail API Setup Checklist - Land Sea Air

## ✅ Pre-Integration Checklist

- [ ] Land Sea Air Google Workspace admin contact identified
- [ ] GCP project created: "landseaair-apex-integration"
- [ ] Gmail API enabled
- [ ] Cloud Pub/Sub API enabled
- [ ] Service account created with domain-wide delegation
- [ ] JSON key file downloaded and stored in AWS Secrets Manager
- [ ] Scopes authorized in Google Workspace Admin Console

## 🔧 ilminate-email Service Configuration

Update `ilminate-email` repository:

```json
// config/customers/landseaair-nc.com.json
{
  "customerId": "landseaair-nc.com",
  "companyName": "Land Sea Air",
  "emailProvider": "google_workspace",
  "domains": ["landseaair-nc.com"],
  "features": {
    "email_scanning": true,
    "dmarc_reporting": true,
    "quarantine": true,
    "ai_triage": true
  },
  "google": {
    "project_id": "landseaair-apex-integration",
    "service_account_email": "apex-email-security@landseaair-apex-integration.iam.gserviceaccount.com",
    "delegated_user": "admin@landseaair-nc.com",
    "labels": {
      "quarantine": "APEX_QUARANTINE",
      "threat": "APEX_THREAT"
    }
  }
}
```

## 📊 Data Flow

```
Land Sea Air Gmail
  ↓
Gmail API Push Notification (Pub/Sub)
  ↓
ilminate-email Lambda Function
  ↓
Parse & Analyze Email
  ↓
DynamoDB (customerId: landseaair-nc.com)
  ↓
APEX Dashboard (filtered by customer ID)
```

## 🧪 Testing

1. Send test email to Land Sea Air user
2. Verify Lambda processes email
3. Check DynamoDB for new record with customerId="landseaair-nc.com"
4. Verify appears in APEX dashboard when logged in as Land Sea Air user
5. Confirm mock data is NOT shown
6. Verify Land Sea Air logo displays
7. Confirm EDR sections are hidden
```

---

### Phase 4: Logo Integration (30 minutes)

#### 4.1 Get Land Sea Air Logo

**Action Items:**
- [ ] Request logo from Land Sea Air
  - Format: PNG with transparent background
  - Dimensions: 500x500px minimum
  - File name: `landseaair-logo.png`
  
- [ ] Alternative: Extract from website
  ```bash
  # Download from https://landseaair-nc.com/
  # Look for logo in header/footer
  ```

#### 4.2 Add Logo to APEX

```bash
# Add to public/logos/ directory
mkdir -p public/logos
cp landseaair-logo.png public/logos/

# Optimize if needed
# Use imagemin or similar tool
```

#### 4.3 Test Logo Display

- [ ] Log in with Land Sea Air account
- [ ] Verify logo displays on dashboard
- [ ] Check all pages (triage, trace, investigations, etc.)
- [ ] Test mobile responsive display

---

### Phase 5: Deployment & Testing (1 hour)

#### 5.1 Deployment Checklist

```bash
# 1. Create customer repo (private)
gh repo create ilminate-landseaair --private

# 2. Commit code changes to ilminate-apex
git add .
git commit -m "Add Land Sea Air customer support - multi-tenant branding and feature toggles"
git push origin main

# 3. Wait for Amplify deployment (5-10 minutes)

# 4. Verify deployment
curl https://apex.ilminate.com/
```

#### 5.2 Test Plan

**Test Case 1: Authentication**
- [ ] Navigate to apex.ilminate.com/login
- [ ] Click "Sign in with Google"
- [ ] Log in with admin@landseaair-nc.com
- [ ] Verify successful authentication
- [ ] Check cookie contains customerId: landseaair-nc.com

**Test Case 2: Branding**
- [ ] Verify Land Sea Air logo displays
- [ ] Verify company name shows correctly
- [ ] Check all pages for consistent branding

**Test Case 3: No Mock Data**
- [ ] Verify dashboard shows "No data yet" or empty states
- [ ] Confirm no mock threat data displays
- [ ] Check that metrics show 0 or N/A

**Test Case 4: EDR Hidden**
- [ ] Verify no EDR navigation links
- [ ] Attempt to navigate to /edr/endpoints (should show feature disabled or 404)
- [ ] Confirm EDR sections not in dashboard

**Test Case 5: Enabled Features**
- [ ] APEX Trace accessible
- [ ] AI Triage functional
- [ ] Investigations page works
- [ ] Quarantine accessible
- [ ] DMARC monitoring available
- [ ] HarborSim accessible

**Test Case 6: Multi-Tenant Isolation**
- [ ] Log out
- [ ] Log in with different customer (e.g., admin@ilminate.com)
- [ ] Verify sees different data
- [ ] Verify Ilminate logo displays (not Land Sea Air)
- [ ] Log back in as Land Sea Air
- [ ] Confirm Land Sea Air branding returns

---

## 📚 Documentation to Create

### In `ilminate-landseaair` Private Repo:

1. **README.md**
   - Customer overview
   - Contact information
   - Integration status
   - Feature configuration

2. **GOOGLE_WORKSPACE_SETUP.md**
   - Step-by-step Gmail API setup
   - Service account configuration
   - Domain-wide delegation
   - DNS configuration (DMARC, SPF, DKIM)

3. **ONBOARDING_GUIDE.md**
   - How to log in to APEX
   - Overview of available features
   - How to invite team members
   - Support contact information

4. **CUSTOMER_NOTES.md**
   - Internal notes about customer
   - Logistics fraud context
   - Testing objectives
   - Feedback and feature requests

5. **TROUBLESHOOTING.md**
   - Common issues
   - Authentication problems
   - Gmail API connectivity
   - Support escalation

---

## 🚀 Go-Live Timeline

| Phase | Task | Duration | Owner | Status |
|-------|------|----------|-------|--------|
| 1 | Create private customer repo | 30 min | Chris | ⏳ TODO |
| 2 | Code changes (branding, features, mock data) | 2 hours | Chris | ⏳ TODO |
| 3 | Get Land Sea Air logo | Variable | Chris | ⏳ TODO |
| 4 | Deploy code to production | 15 min | Auto | ⏳ TODO |
| 5 | Google Workspace coordination | 1-2 days | Land Sea Air IT | ⏳ TODO |
| 6 | Gmail API configuration | 2 hours | Chris + Land Sea Air | ⏳ TODO |
| 7 | ilminate-email service deployment | 1 hour | Chris | ⏳ TODO |
| 8 | End-to-end testing | 1 hour | Chris | ⏳ TODO |
| 9 | User training/handoff | 30 min | Chris | ⏳ TODO |
| **Total** | | **~2 days** | | |

---

## ⚠️ Important Notes

1. **No Billing Integration**
   - Land Sea Air is a testing customer (non-paid)
   - No Stripe integration needed
   - Usage tracking optional

2. **Logistics Fraud Focus**
   - Customer is familiar with fraud landscape
   - May have specific use cases (BEC, freight fraud, invoice scams)
   - Consider adding logistics-specific threat indicators

3. **Private Repo Security**
   - `ilminate-landseaair` repo must remain PRIVATE
   - Contains customer-specific configs and credentials
   - Access restricted to Chris Fisher only

4. **Multi-Tenant Data Isolation**
   - Land Sea Air users ONLY see their data
   - No risk of data leakage to other customers
   - Automatic isolation via customerId

5. **Google Workspace Dependency**
   - Must have Gmail API access configured
   - Requires Google Workspace admin cooperation
   - Service account with domain-wide delegation required

---

## 📞 Support & Escalation

**Primary Contact:**
- Chris Fisher (cjfisher84-source)
- Role: Platform Administrator

**Land Sea Air Contact:**
- TBD - Needs to be provided
- Role: IT Administrator / Security Lead

**Support Channels:**
- Email: support@ilminate.com
- Triage: triage@ilminate.com
- Emergency: TBD

---

## ✅ Success Criteria

- [ ] Land Sea Air users can log in with Google Workspace SSO
- [ ] Custom branding (logo, company name) displays correctly
- [ ] No mock data appears in their instance
- [ ] EDR features are completely hidden
- [ ] Email security features fully functional
- [ ] DMARC reporting operational
- [ ] Real email data flows from Google Workspace to APEX
- [ ] Multi-tenant isolation verified
- [ ] All pages load without errors
- [ ] Customer satisfied with setup

---

**Status**: 🟡 Ready to Begin  
**Next Step**: Create private `ilminate-landseaair` repository  
**Estimated Completion**: 2 business days from start

