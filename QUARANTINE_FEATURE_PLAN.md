# APEX Quarantine & List Management - Implementation Plan

## 📊 Current State Assessment

### ✅ **What Exists:**
- Triage API with threat analysis and risk scoring
- Mock data showing quarantine statistics in charts
- Recommendations mentioning quarantine actions
- Authentication via AWS Cognito
- DynamoDB table configured (`ilminate-apex-events`)
- S3 bucket configured (`ilminate-apex-raw`)

### ❌ **What's Missing:**
- No actual quarantine storage or retrieval
- No message release functionality
- No allow/block list management
- No email integration (Microsoft Graph API or similar)
- No AI warning banner generation
- No rescan capability

---

## 🎯 Proposed Features - Phased Approach

### **Phase 1: Quarantine Viewer** (Week 1-2)
Build the foundation for viewing quarantined messages.

#### **Features:**
- List view of quarantined messages
- Search and filter capabilities
- Message details modal (headers, body, attachments)
- Risk score display
- Quarantine reason/detection method

#### **Technical Requirements:**
1. **Backend:**
   - DynamoDB table for quarantined messages
   - API endpoint: `GET /api/quarantine/list`
   - API endpoint: `GET /api/quarantine/[messageId]`
   - Integration with Microsoft Graph or Google Workspace API

2. **Frontend:**
   - New page: `/quarantine`
   - Table with sortable columns (date, sender, subject, risk score)
   - Filters (date range, risk level, detection type)
   - Message preview modal

3. **Data Model:**
```typescript
interface QuarantinedMessage {
  id: string
  messageId: string // Original email message ID
  customerId: string
  subject: string
  sender: string
  recipients: string[]
  quarantineDate: Date
  riskScore: number
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  detectionReasons: string[]
  headers: Record<string, string>
  bodyPreview: string
  hasAttachments: boolean
  attachments: {
    name: string
    size: number
    contentType: string
  }[]
  status: 'quarantined' | 'released' | 'deleted'
  mailboxType: 'microsoft365' | 'google_workspace'
}
```

---

### **Phase 2: Release Functionality** (Week 3-4)
Enable customers to release messages with options.

#### **Features:**
- **Release with Rescan:**
  - Re-analyze message with latest threat intelligence
  - Show updated risk score
  - Confirm before delivery
  
- **Release without Rescan:**
  - Immediate delivery
  - Warning confirmation required
  
- **AI-Generated Warning Banner:**
  - Use GPT-4/Claude to analyze message
  - Generate contextual warning
  - Insert as HTML banner at top of email
  - Example: "⚠️ This message was released from quarantine. It contains financial request language from an external sender. Verify authenticity before taking action."

#### **Technical Requirements:**
1. **Backend:**
   - API endpoint: `POST /api/quarantine/release`
   - Microsoft Graph API integration for message delivery
   - Anthropic/OpenAI API for warning generation
   - Email modification to inject warning banner

2. **Frontend:**
   - Release button with dropdown options
   - Confirmation modal with options:
     - [ ] Rescan before release
     - [ ] Add AI warning banner
     - [ ] Notify recipient about release
   - Progress indicator during release

3. **AI Warning Generation:**
```typescript
interface WarningBannerRequest {
  messageId: string
  riskScore: number
  detectionReasons: string[]
  messageContent: {
    subject: string
    sender: string
    bodyPreview: string
  }
}

interface WarningBannerResponse {
  warningHtml: string
  warningText: string
  riskLevel: string
  suggestions: string[]
}
```

**Example AI Prompt:**
```
Analyze this quarantined email and generate a brief, clear warning banner for the recipient:

Subject: {subject}
Sender: {sender}
Risk Score: {riskScore}/100
Detection Reasons: {reasons}

Generate a 2-3 sentence warning that:
1. Explains why it was quarantined
2. Advises caution
3. Suggests verification steps
Keep it non-technical and actionable.
```

---

### **Phase 3: Safe & Block Lists** (Week 5-6)
Customer-managed allow/block lists.

#### **Features:**
- **Safe List (Allow List):**
  - Add trusted senders
  - Add trusted domains
  - Bypass quarantine for safe list entries
  - Temporary safe listing (expires after X days)

- **Block List:**
  - Block specific senders
  - Block domains
  - Auto-quarantine block list matches
  - Import/export capabilities

#### **Technical Requirements:**
1. **Backend:**
   - DynamoDB table for lists
   - API endpoints:
     - `GET /api/lists/safe`
     - `POST /api/lists/safe/add`
     - `DELETE /api/lists/safe/[entryId]`
     - `GET /api/lists/block`
     - `POST /api/lists/block/add`
     - `DELETE /api/lists/block/[entryId]`

2. **Frontend:**
   - New page: `/settings/lists`
   - Two tabs: Safe List | Block List
   - Add entry form (email or domain)
   - List table with search/filter
   - Bulk import from CSV
   - Export to CSV

3. **Data Model:**
```typescript
interface ListEntry {
  id: string
  customerId: string
  type: 'safe' | 'block'
  entryType: 'email' | 'domain'
  value: string // email address or domain
  addedBy: string // user who added it
  addedDate: Date
  expiresAt?: Date
  reason?: string
  matchCount: number // how many times it's been hit
  lastMatch?: Date
}
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     APEX Frontend                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  /quarantine │  │   /settings  │  │    /triage   │ │
│  │     page     │  │    /lists    │  │     page     │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
└─────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────┐
│                    API Layer (Next.js)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  /api/       │  │  /api/lists  │  │  /api/       │ │
│  │  quarantine  │  │              │  │  triage      │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
└─────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────┐
│                     AWS Services                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   DynamoDB   │  │      S3      │  │   Cognito    │ │
│  │  (Messages,  │  │  (Email      │  │    (Auth)    │ │
│  │   Lists)     │  │   Storage)   │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
          │                                      │
          ▼                                      ▼
┌──────────────────────┐            ┌──────────────────────┐
│  Microsoft Graph API │            │  Anthropic/OpenAI    │
│  (Email Operations)  │            │  (AI Warnings)       │
└──────────────────────┘            └──────────────────────┘
```

---

## 💰 Cost Implications

### **AWS Services:**
- **DynamoDB:** ~$5-20/month (depending on quarantine volume)
- **S3:** ~$1-5/month (email storage)
- **Lambda:** Minimal (covered by Amplify)

### **External APIs:**
- **Microsoft Graph API:** Free (included with M365)
- **Google Workspace API:** Free (included with Workspace)
- **Anthropic Claude API:** ~$0.50-2/month for warning generation
- **OpenAI GPT-4:** ~$1-5/month for warning generation

**Estimated Total:** $10-30/month per customer

---

## 🚀 Implementation Timeline

### **Phase 1: Quarantine Viewer (2 weeks)**
- Week 1: Backend API + DynamoDB schema
- Week 2: Frontend UI + Integration

### **Phase 2: Release Functionality (2 weeks)**
- Week 3: Release API + Email integration
- Week 4: AI warning generation + Testing

### **Phase 3: Safe & Block Lists (2 weeks)**
- Week 5: Lists API + Backend logic
- Week 6: Frontend UI + Import/Export

**Total:** 6 weeks for full implementation

---

## ⚠️ Risks & Considerations

### **Technical Challenges:**
1. **Email Integration Complexity:**
   - Different APIs for M365 vs Google Workspace
   - OAuth token management
   - Rate limits and throttling
   
   **Mitigation:** Start with M365, add Google later

2. **Message Storage:**
   - Email size limits
   - Attachment handling
   - Retention policies (GDPR/compliance)
   
   **Mitigation:** Store in S3 with lifecycle policies

3. **AI Warning Quality:**
   - Generic warnings not helpful
   - Over-warning causes alert fatigue
   
   **Mitigation:** Fine-tune prompts, A/B test warnings

### **Security Considerations:**
1. **Authorization:**
   - Ensure customers only see their quarantined messages
   - Row-level security in DynamoDB
   
2. **Audit Logging:**
   - Log all release actions
   - Track who released what and when
   
3. **Email Integrity:**
   - Don't modify original message unnecessarily
   - Warning banner should be clearly distinguishable

---

## 📋 Database Schema

### **QuarantinedMessages Table (DynamoDB)**
```
Partition Key: customerId (String)
Sort Key: quarantineDate#messageId (String)

Attributes:
- messageId (String)
- subject (String)
- sender (String)
- recipients (List)
- quarantineDate (Number - timestamp)
- riskScore (Number)
- severity (String)
- detectionReasons (List)
- s3Key (String) - full email in S3
- status (String)
- releasedBy (String - optional)
- releasedAt (Number - optional)
- releaseOptions (Map - optional)

GSI-1:
- Partition Key: customerId
- Sort Key: status#riskScore
(For filtering by status and sorting by risk)
```

### **CustomerLists Table (DynamoDB)**
```
Partition Key: customerId (String)
Sort Key: type#entryType#value (String)

Attributes:
- id (String - UUID)
- type (String - 'safe' or 'block')
- entryType (String - 'email' or 'domain')
- value (String)
- addedBy (String)
- addedDate (Number)
- expiresAt (Number - optional)
- reason (String - optional)
- matchCount (Number)
- lastMatch (Number - optional)

GSI-1:
- Partition Key: customerId
- Sort Key: type
(For listing all safe or all block entries)
```

---

## 🎨 UI/UX Mockup Descriptions

### **Quarantine Page (`/quarantine`):**
```
┌────────────────────────────────────────────────────────┐
│  Quarantined Messages                    [Search] [⚙️] │
├────────────────────────────────────────────────────────┤
│  Filters: [All] [Critical] [High] [Medium] [Low]      │
│  Date: [Last 7 days ▼]  Detection: [All ▼]           │
├─────┬────────┬─────────────┬───────────┬──────┬───────┤
│ 🔴  │ Date   │ Sender      │ Subject   │ Risk │ Action│
├─────┼────────┼─────────────┼───────────┼──────┼───────┤
│ 🔴  │ Oct 22 │ cfo@gm...   │ Wire Req  │ 85   │[View]│
│ 🟠  │ Oct 22 │ vendor@...  │ Invoice   │ 65   │[View]│
│ 🟡  │ Oct 21 │ hr@outl...  │ Survey    │ 45   │[View]│
└─────┴────────┴─────────────┴───────────┴──────┴───────┘
```

### **Message Detail Modal:**
```
┌────────────────────────────────────────────────────────┐
│  Quarantined Message Detail                      [✕]   │
├────────────────────────────────────────────────────────┤
│  Risk Score: 85/100 🔴 CRITICAL                       │
│                                                        │
│  From: cfo@gmail.com                                  │
│  To: accounting@yourcompany.com                       │
│  Subject: Urgent Wire Transfer Request                │
│  Date: Oct 22, 2025 10:23 AM                         │
│                                                        │
│  Threat Indicators:                                   │
│  • Executive impersonation (CFO from gmail.com)       │
│  • Financial request (wire transfer)                  │
│  • Urgency language detected                          │
│                                                        │
│  Message Preview:                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │ We need to process an urgent wire transfer   │   │
│  │ of $50,000 to a new vendor. Please process   │   │
│  │ immediately and confirm. -CFO                 │   │
│  └──────────────────────────────────────────────┘   │
│                                                        │
│  [Release with Options ▼] [Delete] [Add to Block List]│
└────────────────────────────────────────────────────────┘
```

### **Release Options Modal:**
```
┌────────────────────────────────────────────────────────┐
│  Release Message                                 [✕]   │
├────────────────────────────────────────────────────────┤
│  You are about to release a CRITICAL risk message.    │
│                                                        │
│  Options:                                              │
│  ☑ Rescan before release                             │
│  ☑ Add AI-generated warning banner                   │
│  ☐ Add sender to safe list                           │
│  ☑ Notify recipient about release                    │
│                                                        │
│  Warning Banner Preview:                              │
│  ┌──────────────────────────────────────────────┐   │
│  │ ⚠️ SECURITY NOTICE: This email was released   │   │
│  │ from quarantine. It contains a financial      │   │
│  │ request from an external sender. Verify the   │   │
│  │ sender's identity via phone before taking     │   │
│  │ any action. Never process wire transfers or   │   │
│  │ payments based solely on email requests.      │   │
│  └──────────────────────────────────────────────┘   │
│                                                        │
│  [Cancel] [Confirm Release]                           │
└────────────────────────────────────────────────────────┘
```

### **Lists Management Page (`/settings/lists`):**
```
┌────────────────────────────────────────────────────────┐
│  Email Lists Management                                │
├────────────────────────────────────────────────────────┤
│  [Safe List] [Block List]                              │
├────────────────────────────────────────────────────────┤
│  Add New Entry:                                        │
│  Type: (•) Email Address  ( ) Domain                  │
│  Value: [vendor@trusted.com        ] [Add]            │
│                                                        │
│  Current Safe List (43 entries):        [Import] [Export]│
├────────────────┬──────────────┬────────────┬──────────┤
│ Entry          │ Type         │ Added      │ Action   │
├────────────────┼──────────────┼────────────┼──────────┤
│ hr@company.com │ Email        │ Oct 15     │ [Remove] │
│ vendor.com     │ Domain       │ Oct 10     │ [Remove] │
│ cfo@exec.com   │ Email        │ Oct 8      │ [Remove] │
└────────────────┴──────────────┴────────────┴──────────┘
```

---

## ✅ Deployment Checklist

### **Phase 1 - Quarantine Viewer:**
- [ ] Create DynamoDB table with GSIs
- [ ] Set up S3 bucket with lifecycle policy
- [ ] Build API endpoints for quarantine listing
- [ ] Build API endpoint for message details
- [ ] Create frontend quarantine page
- [ ] Implement message detail modal
- [ ] Add search/filter functionality
- [ ] Test with mock data
- [ ] Integration test with real email API
- [ ] Deploy to staging
- [ ] User acceptance testing
- [ ] Deploy to production

### **Phase 2 - Release Functionality:**
- [ ] Build release API endpoint
- [ ] Integrate Microsoft Graph API for message delivery
- [ ] Implement rescan logic
- [ ] Build AI warning generation
- [ ] Test warning banner injection
- [ ] Add release confirmation modal
- [ ] Implement audit logging
- [ ] Test end-to-end release flow
- [ ] Deploy to staging
- [ ] User acceptance testing
- [ ] Deploy to production

### **Phase 3 - Safe & Block Lists:**
- [ ] Create CustomerLists DynamoDB table
- [ ] Build list management API endpoints
- [ ] Create lists management page
- [ ] Implement add/remove functionality
- [ ] Build import/export features
- [ ] Integrate with quarantine logic
- [ ] Test safe list bypass
- [ ] Test block list auto-quarantine
- [ ] Deploy to staging
- [ ] User acceptance testing
- [ ] Deploy to production

---

## 📊 Success Metrics

### **Phase 1:**
- Customers can view all quarantined messages
- Load time < 2 seconds for list view
- Search returns results < 500ms

### **Phase 2:**
- Release success rate > 99%
- AI warning relevance score > 4/5 (user feedback)
- Rescan completion < 30 seconds

### **Phase 3:**
- Safe list reduces false positives by 50%+
- Block list catches 100% of blocked entries
- List management actions complete < 1 second

---

## 💡 Recommendations

### **Start with Phase 1:**
1. Prove the concept with quarantine viewer
2. Validate customer demand
3. Gather feedback on UX

### **Key Decisions Needed:**
1. **Email Platform Priority:** Microsoft 365 first or Google Workspace?
2. **AI Provider:** Anthropic Claude or OpenAI GPT-4 for warnings?
3. **Retention Policy:** How long to keep quarantined messages? (30 days default?)
4. **Warning Banner Design:** HTML or plain text? Customizable by customer?

### **Quick Wins:**
1. Start with read-only quarantine viewer (no release yet)
2. Use existing triage API risk scoring
3. Leverage current DynamoDB setup

---

## 🎯 Next Steps

1. **Review & Approve** this plan
2. **Decide priorities** (M365 vs Google, AI provider, etc.)
3. **Set up AWS resources** (DynamoDB tables, S3 bucket policies)
4. **Start Phase 1 development**
5. **Deploy to staging for testing**

---

**Questions or adjustments needed?** Let's discuss before starting implementation!

