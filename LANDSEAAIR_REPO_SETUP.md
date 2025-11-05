# ilminate-landseaair Repository Setup

**Repository**: https://github.com/cjfisher84-source/ilminate-landseaair  
**Visibility**: 🔒 Private  
**Purpose**: Land Sea Air customer-specific configuration and documentation

---

## 📂 Initial Repository Structure

Clone and set up the repository:

```bash
# Clone the repo
cd ~/Documents
git clone git@github.com:cjfisher84-source/ilminate-landseaair.git
cd ilminate-landseaair

# Create directory structure
mkdir -p config docs assets scripts

# Create initial files
touch README.md .gitignore
```

### Directory Structure

```
ilminate-landseaair/
├── README.md                           # Customer overview
├── .gitignore                          # Ignore credentials
├── config/
│   ├── features.json                   # Feature toggles
│   ├── branding.json                   # Logo, colors, theme
│   ├── google-workspace.json           # GWS integration config
│   └── .credentials/                   # Service account keys (NEVER commit)
│       └── .gitkeep
├── docs/
│   ├── GOOGLE_WORKSPACE_SETUP.md       # Step-by-step GWS guide
│   ├── GMAIL_API_INTEGRATION.md        # Gmail API setup
│   ├── DMARC_CONFIGURATION.md          # DNS setup for DMARC
│   ├── USER_ONBOARDING.md              # How to use APEX
│   └── CUSTOMER_NOTES.md               # Internal notes
├── assets/
│   ├── lsa.png                         # Original logo
│   └── screenshots/                    # APEX screenshots for training
└── scripts/
    ├── deploy-config.sh                # Deploy configs to APEX
    └── test-integration.sh             # Test Gmail API connection
```

---

## 📄 File Templates

### 1. `.gitignore`

```gitignore
# Credentials - NEVER commit these
config/.credentials/*.json
*.key
*.pem
service-account*.json

# Sensitive configs
*secret*
*password*
*token*

# OS files
.DS_Store
Thumbs.db

# Editor
.vscode/
.idea/
*.swp

# Logs
*.log
```

### 2. `README.md`

```markdown
# Land Sea Air - APEX Customer Configuration

**Customer**: Land Sea Air  
**Domain**: landseaair-nc.com  
**Location**: Wilmington, NC  
**Status**: Active - Testing Phase  

## Overview

Private repository containing Land Sea Air-specific configuration, credentials, and documentation for the Ilminate APEX platform.

## ⚠️ Security Notice

This repository is **PRIVATE** and contains sensitive information:
- Google Workspace service account credentials
- Integration API keys
- Customer-specific configurations

**Access**: Chris Fisher only

## Quick Links

- APEX Dashboard: https://apex.ilminate.com
- Customer Website: https://landseaair-nc.com/
- Support Email: support@ilminate.com

## Features Enabled

- ✅ Email Security
- ✅ DMARC Monitoring
- ✅ APEX Trace
- ✅ AI Triage
- ✅ Investigations
- ✅ Quarantine Management
- ✅ HarborSim (Phishing Training)
- ❌ EDR (Not enabled initially)

## Integration Status

| Component | Status | Notes |
|-----------|--------|-------|
| Google Workspace OAuth | ✅ Ready | Users can log in |
| Gmail API Integration | ⏳ Pending | Awaiting service account |
| DMARC Reporting | ⏳ Pending | DNS config needed |
| Email Processing | ⏳ Pending | After Gmail API setup |

## Documents

- [Google Workspace Setup](docs/GOOGLE_WORKSPACE_SETUP.md)
- [Gmail API Integration](docs/GMAIL_API_INTEGRATION.md)
- [DMARC Configuration](docs/DMARC_CONFIGURATION.md)
- [User Onboarding Guide](docs/USER_ONBOARDING.md)
- [Customer Notes](docs/CUSTOMER_NOTES.md)

## Contacts

**Land Sea Air:**
- IT Contact: TBD
- Security Lead: TBD

**Ilminate:**
- Technical Lead: Chris Fisher
- Support: support@ilminate.com
- Triage: triage@ilminate.com
```

### 3. `config/features.json`

```json
{
  "customerId": "landseaair-nc.com",
  "companyName": "Land Sea Air",
  "status": "active",
  "plan": "testing",
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
    "notifications": true,
    "mockData": false
  },
  "notes": "Non-paid testing customer. Logistics fraud focus. No EDR initially.",
  "updated": "2024-11-05"
}
```

### 4. `config/branding.json`

```json
{
  "customerId": "landseaair-nc.com",
  "companyName": "Land Sea Air",
  "shortName": "LSA",
  "tagline": "Best Shipping Since Noah",
  "logo": {
    "filename": "lsa.png",
    "apexPath": "/logos/landseaair-logo.png",
    "width": 60,
    "height": 60,
    "alt": "Land Sea Air Logo"
  },
  "theme": {
    "primaryColor": "#2D5016",
    "secondaryColor": "#8FBE00",
    "description": "Dark green and lime green from compass rose logo"
  },
  "website": "https://landseaair-nc.com/",
  "industry": "Logistics & Freight",
  "location": "Wilmington, NC"
}
```

### 5. `config/google-workspace.json`

```json
{
  "customerId": "landseaair-nc.com",
  "provider": "Google Workspace",
  "domains": [
    "landseaair-nc.com"
  ],
  "oauth": {
    "enabled": true,
    "provider": "Google",
    "notes": "Users authenticate via Cognito + Google OAuth"
  },
  "gmailApi": {
    "enabled": false,
    "status": "pending",
    "projectId": "TBD",
    "serviceAccountEmail": "TBD",
    "delegatedUser": "TBD",
    "scopes": [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.modify"
    ],
    "credentialsPath": "config/.credentials/landseaair-service-account.json",
    "notes": "Awaiting service account creation from LSA IT team"
  },
  "dmarc": {
    "enabled": false,
    "status": "pending",
    "reportingEmail": "dmarc@ilminate.com",
    "policy": "none",
    "notes": "DNS records need to be configured"
  }
}
```

### 6. `docs/USER_ONBOARDING.md`

```markdown
# Land Sea Air - APEX User Guide

## Getting Started

### 1. Log In to APEX

1. Navigate to: **https://apex.ilminate.com/login**
2. Click **"Sign in with Google"**
3. Use your Land Sea Air Google Workspace account
   - Example: `yourname@landseaair-nc.com`
4. Authenticate with Google
5. You'll be redirected to your APEX dashboard

### 2. Your Dashboard

When you log in, you'll see:
- **Left**: Ilminate APEX branding (the platform)
- **Right**: Land Sea Air logo (your workspace)
- **Badge**: Shows "landseaair-nc.com" (your environment)

### 3. Available Features

#### 🔍 APEX Trace
Search and investigate email messages across your organization.
- Fast search by sender, recipient, subject
- Advanced filtering options
- Message header analysis
- Threat indicator detection

#### ⚡ AI Triage
AI-powered threat analysis for suspicious emails.
- Submit suspicious emails for analysis
- Get risk scores and threat classifications
- MITRE ATT&CK technique mapping
- Actionable remediation recommendations

#### 🕵️ Investigations
Track and manage security investigations.
- Create investigation cases
- Link related threats
- Collaborate with team members
- Generate investigation reports

#### 🛡️ Quarantine
Review and manage quarantined messages.
- See messages held for security review
- Release false positives
- Delete confirmed threats
- Manage whitelist/blacklist

#### 📧 DMARC Monitoring
Monitor email authentication and domain protection.
- View DMARC compliance status
- Identify unauthorized senders
- SPF/DKIM validation results
- Domain spoofing detection

#### 📚 Resources
- Click your profile picture (top right)
- Select "APEX Command Guide"
- Complete documentation for all features

### 4. Adding Team Members

Any user with an `@landseaair-nc.com` email can access APEX:
1. They visit apex.ilminate.com/login
2. Sign in with Google using LSA account
3. Automatically get access to Land Sea Air workspace
4. See the same data and features

### 5. Support

**Need Help?**
- Email: support@ilminate.com
- Triage Assistance: triage@ilminate.com
- Documentation: Click profile → APEX Command Guide

**Logistics Fraud Resources:**
- Land Sea Air is familiar with freight fraud
- APEX helps detect BEC (Business Email Compromise)
- Invoice scams and impersonation attacks
- Shipping document fraud
```

### 7. `docs/CUSTOMER_NOTES.md`

```markdown
# Land Sea Air - Internal Customer Notes

**Customer ID**: landseaair-nc.com  
**Status**: Active Testing Customer  
**Started**: November 5, 2024

## Company Profile

- **Name**: Land Sea Air
- **Industry**: Logistics & Freight Shipping
- **Location**: Wilmington, NC
- **Website**: https://landseaair-nc.com/
- **Tagline**: "Best Shipping Since Noah"

## Customer Characteristics

- **Fraud Awareness**: Very familiar with logistics fraud landscape
- **Use Cases**: BEC detection, invoice scams, freight fraud
- **Technical Level**: TBD
- **IT Team**: TBD (contact info needed)

## Agreement Terms

- **Plan**: Testing/Pilot (Non-paid)
- **Purpose**: Evaluate APEX for logistics industry
- **Duration**: TBD
- **Conversion Goal**: Convert to paid customer

## Features Enabled

- Email Security: ✅
- DMARC Monitoring: ✅
- EDR: ❌ (Not initially - can enable later)
- Mock Data: ❌ (Disabled - production only)

## Integration Status

### Completed
- ✅ Multi-tenant architecture
- ✅ Co-branded header with LSA logo
- ✅ Feature toggles configured
- ✅ Authentication ready (Google OAuth)

### In Progress
- ⏳ Google Workspace integration
- ⏳ Gmail API service account
- ⏳ DMARC DNS configuration

### Pending
- 📅 User training
- 📅 Email data flow testing
- 📅 Feedback collection
- 📅 Feature requests

## Communication Log

### 2024-11-05
- Initial onboarding started
- Multi-tenant infrastructure deployed
- LSA logo added to APEX
- Private repo created
- Awaiting IT contact for Google Workspace setup

## Action Items

- [ ] Get LSA IT team contact information
- [ ] Schedule Google Workspace integration call
- [ ] Coordinate service account creation
- [ ] Configure DMARC DNS records
- [ ] Test email flow end-to-end
- [ ] User training session
- [ ] Collect initial feedback

## Feedback & Feature Requests

*None yet - will update after initial usage*

## Technical Notes

- Customer ID extracted from email domain automatically
- Logo: 176KB PNG with compass rose design
- Colors: Dark green (#2D5016) + Lime green (#8FBE00)
- No special requirements beyond standard Google Workspace

## Escalation Path

1. Technical issues → support@ilminate.com
2. Urgent security matters → triage@ilminate.com
3. Billing/account questions → Chris Fisher
```

---

## 🔒 Security Best Practices

### NEVER Commit These Files:

```
config/.credentials/*.json
service-account-*.json
*.key
*.pem
*secret*
*password*
```

### Store Credentials in AWS Secrets Manager Instead:

```bash
# Example: Store Gmail service account
aws secretsmanager create-secret \
  --name landseaair/gmail-service-account \
  --secret-string file://service-account.json \
  --region us-east-1
```

---

## 🚀 Next Steps

1. **Clone the repo** and create the directory structure
2. **Add the files** from the templates above
3. **Copy the logo** to `assets/lsa.png`
4. **Update README** with LSA IT contact info (when available)
5. **Create Google Workspace docs** (copy from main APEX onboarding guide)
6. **Store credentials** in AWS Secrets Manager (when received)
7. **Never commit sensitive data** - use .gitignore

---

## 📞 Coordination with Land Sea Air IT

Share these requirements with LSA IT team:
- Gmail API enablement
- Service account creation
- Domain-wide delegation
- DMARC DNS records

Full details in: `docs/GOOGLE_WORKSPACE_SETUP.md` (to be created)

---

**Repository Status**: 🟢 Created and ready for population

