# Threat Graphs & Reports Data Flow Architecture

**Date:** January 2025  
**Status:** Current Implementation & Production Architecture

---

## 🎯 Executive Summary

Currently, **apex.ilminate.com** displays **mock data** for demonstration purposes. In production, threat graphs and reports will be populated from multiple real-time data sources:

1. **Email Security Data** (`ilminate-email`) → DynamoDB → APEX Dashboard
2. **EDR/Endpoint Data** (`ilminate-agent`) → DynamoDB → APEX Dashboard  
3. **Image/QR Scan Data** (`ilminate-agent`) → DynamoDB → APEX Dashboard
4. **DMARC Reports** (`ilminate-email`) → DynamoDB → APEX Dashboard
5. **MITRE ATT&CK Mapping** (Lambda) → DynamoDB → APEX Dashboard

---

## 📊 Current State: Mock Data

### Where Mock Data is Used

**Location:** `src/lib/mock.ts`

The dashboard currently uses mock data functions that generate deterministic sample data:

```typescript
// Example: Threat category counts
mockCategoryCounts() → { Phish: 750, Malware: 180, Spam: 1350, BEC: 100, ATO: 40 }

// Example: 30-day timeline
mockTimeline30d() → Array of daily stats with random volumes

// Example: Threat families
mockThreatFamilies() → Array of threat family breakdowns
```

**Mock Data Toggle:**
- Controlled by `isMockDataEnabled(customerId)` in `src/lib/tenantUtils.ts`
- Demo customers (like apex.ilminate.com) show mock data
- Production customers return empty arrays when mock is disabled

---

## 🏗️ Production Data Flow Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATA SOURCES                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────┐│
│  │ ilminate-email   │  │ ilminate-agent   │  │ ilminate-    ││
│  │                  │  │                  │  │ infrastructure││
│  │ • Gmail API      │  │ • EDR Events     │  │ • Lambda     ││
│  │ • Graph API      │  │ • Image Scans    │  │   Pipeline   ││
│  │ • DMARC Parser   │  │ • QR Detection   │  │ • Webhooks   ││
│  └────────┬─────────┘  └────────┬─────────┘  └──────┬───────┘│
│           │                      │                    │        │
│           └──────────────────────┼────────────────────┘        │
│                                  │                              │
│                                  ▼                              │
│                    ┌──────────────────────────┐                 │
│                    │    AWS DynamoDB          │                 │
│                    │                          │                 │
│                    │ • ilminate-apex-events   │                 │
│                    │ • ilminate-image-scans   │                 │
│                    │ • QuarantinedMessages    │                 │
│                    │ • apex_messages (ES)     │                 │
│                    └────────────┬──────────────┘                 │
│                                 │                               │
│                                 ▼                               │
│                    ┌──────────────────────────┐                 │
│                    │   Next.js API Routes    │                 │
│                    │   (ilminate-apex)       │                 │
│                    │                          │                 │
│                    │ • /api/reports/stats    │                 │
│                    │ • /api/image-scan       │                 │
│                    │ • /api/quarantine/list │                 │
│                    │ • /api/attack/map      │                 │
│                    └────────────┬──────────────┘                 │
│                                 │                               │
│                                 ▼                               │
│                    ┌──────────────────────────┐                 │
│                    │   React Components       │                 │
│                    │   (Charts & Reports)    │                 │
│                    │                          │                 │
│                    │ • TimelineArea          │                 │
│                    │ • ThreatFamilyTypesChart│                 │
│                    │ • EDRThreatDetections    │                 │
│                    │ • ImageScanResults      │                 │
│                    └──────────────────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📧 Data Source 1: Email Security (`ilminate-email`)

### What It Provides

- **Email threat detection** (phishing, BEC, malware, spam)
- **DMARC/SPF/DKIM analysis**
- **Quarantine management**
- **Email authentication compliance**

### Data Flow

```
Gmail API / Microsoft Graph API
  ↓ (Push notifications via Pub/Sub/Webhooks)
ilminate-email Lambda Functions
  ↓ (Process & analyze emails)
DynamoDB Table: ilminate-apex-events
  ↓ (Query via API)
/api/reports/stats
  ↓ (Aggregate & format)
Dashboard Charts
```

### DynamoDB Schema: `ilminate-apex-events`

```typescript
{
  customerId: string,           // Partition key
  timestamp: number,            // Sort key
  threat_category: string,      // 'Phish', 'BEC', 'Malware', 'Spam', 'ATO'
  apex_action: string,          // 'QUARANTINE', 'BLOCK', 'ALLOW'
  sender_email: string,
  sender_domain: string,
  subject: string,
  threat_score: number,         // 0-100
  severity: string,             // 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
  detection_reasons: string[],
  // ... more fields
}
```

### API Integration

**File:** `src/app/api/reports/stats/route.ts`

```typescript
// Fetches real data from DynamoDB
const stats = await getDashboardStats({ customerId, days: 30 })
const events = await queryApexEvents({ customerId, days: 30 })

// Builds category counts and timeline
const categoryCounts = aggregateByCategory(events)
const timeline = buildTimelineData(events)
```

**Charts Using This Data:**
- `TimelineArea` - 30-day threat timeline
- `QuarantineDeliveredBars` - Quarantine vs delivered breakdown
- Threat category cards (Phish, Malware, Spam, BEC, ATO)

---

## 🖥️ Data Source 2: EDR/Endpoint Detection (`ilminate-agent`)

### What It Provides

- **Endpoint threat detections** (ransomware, trojans, suspicious behavior)
- **Endpoint status** (protected, vulnerable, updating, offline)
- **30-day EDR metrics** (detections, blocks, endpoints online)

### Data Flow

```
ilminate-agent (Windows/Linux/macOS)
  ↓ (Detects threats on endpoints)
DynamoDB Table: ilminate-apex-events
  ↓ (Query with threat_category filter)
/api/reports/stats
  ↓ (Filter by EDR-specific categories)
EDR Charts
```

### DynamoDB Schema: EDR Events

```typescript
{
  customerId: string,
  timestamp: number,
  threat_category: string,      // 'Ransomware', 'Trojan', 'Suspicious Behavior'
  source: 'edr',                // Identifies as EDR event
  endpoint_id: string,
  endpoint_status: string,      // 'Protected', 'Vulnerable', 'Offline'
  detected: boolean,
  blocked: boolean,
  // ... more fields
}
```

### Charts Using This Data

**File:** `src/components/Charts.client.tsx`

- `EDREndpointStatus` - Endpoint protection status breakdown
- `EDRThreatDetections` - Threat types detected by EDR
- `EDRMetricsLines` - 30-day EDR detection trends

**Current Implementation:**
- Uses `mockEDREndpointBreakdown()` and `mockEDRThreatTypes()`
- **Production:** Will query DynamoDB filtering by `source: 'edr'`

---

## 🖼️ Data Source 3: Image & QR Code Scanning (`ilminate-agent`)

### What It Provides

- **QR code detection** (quishing attacks)
- **Image threat detection** (logo impersonation, hidden links, screenshot phishing)
- **Scan statistics** (total scans, malicious QR codes, offensive images)

### Data Flow

```
Email with Image Attachments
  ↓ (Processed by ilminate-agent)
Image/QR Scanner (pyzbar, YOLOv8, CLIP Vision)
  ↓ (Detects threats)
DynamoDB Table: ilminate-image-scans
  ↓ (Query last 24h)
/api/image-scan
  ↓ (Aggregate statistics)
ImageScanResults Component
```

### DynamoDB Schema: `ilminate-image-scans`

```typescript
{
  messageId: string,            // Partition key
  timestamp: number,            // Sort key
  customerId: string,
  scan_type: string,           // 'qr_code', 'image_threat'
  threat_detected: boolean,
  threat_score: number,        // 0-1
  sender: string,
  subject: string,
  detection_details: {
    qr_url?: string,           // For QR codes
    threat_type?: string,      // 'logo_impersonation', 'hidden_link', etc.
    brand?: string,            // Impersonated brand
    indicators: string[],
    detection_method: string
  }
}
```

### API Integration

**File:** `src/app/api/image-scan/route.ts`

```typescript
// Queries DynamoDB for image scans
const scans = await queryImageScans({ customerId, days: 1 })

// Aggregates statistics
const stats = {
  total_scans_24h: scans.length,
  qr_codes_detected: countQRCodes(scans),
  malicious_qr_codes: countMaliciousQR(scans),
  logo_impersonations: countLogoImpersonations(scans),
  // ... more stats
}
```

**Charts Using This Data:**
- `ImageScanResults` component - Shows all image scan statistics
- QR code threat cards
- Image threat breakdown

---

## 📈 Data Source 4: DMARC Reports (`ilminate-email`)

### What It Provides

- **DMARC compliance** per domain
- **Domain abuse detection** (domains sending "as you")
- **SPF/DKIM alignment** status
- **Message volume** by domain

### Data Flow

```
DMARC Reports (Email)
  ↓ (Parsed by ilminate-email)
DynamoDB Table: ilminate-apex-events
  ↓ (Query with DMARC metadata)
/api/reports/stats
  ↓ (Aggregate by domain)
Domain Abuse Table
```

### Charts Using This Data

**File:** `src/app/page.tsx`

- Domain abuse table showing:
  - Domains sending "as you"
  - First seen date
  - Message count
  - DMARC alignment status

**Current Implementation:**
- Uses `mockDomainAbuse()` function
- **Production:** Will query DynamoDB filtering by `threat_category: 'domain_abuse'` or similar

---

## 🎯 Data Source 5: MITRE ATT&CK Mapping (Lambda)

### What It Provides

- **Technique mapping** (maps security events to MITRE ATT&CK techniques)
- **Technique scores** (frequency of each technique)
- **Attack layer data** (for ATT&CK matrix visualization)

### Data Flow

```
Security Events (from all sources)
  ↓ (Sent to Lambda)
ilminate-attack-mapper Lambda
  ↓ (Pattern matching + MITRE metadata)
DynamoDB Table: ilminate-apex-events
  ↓ (Query with techniques array)
/api/attack/layer
  ↓ (Aggregate technique scores)
ATT&CK Matrix Component
```

### Lambda Function

**Location:** `ilminate-attack/lambda/attack_mapper/`

- **Input:** Event text/description
- **Output:** Array of MITRE ATT&CK technique IDs (e.g., `T1566`, `T1059.001`)
- **Deployed:** AWS Lambda with API Gateway endpoint

### API Integration

**File:** `src/app/api/attack/layer/route.ts`

```typescript
// Queries events and aggregates by technique
const events = await queryApexEvents({ customerId, days: 30 })
const techniques = aggregateTechniques(events)
```

**Charts Using This Data:**
- `AttackMatrix` component - Interactive MITRE ATT&CK matrix
- `/reports/attack` page - Technique frequency report

---

## 🔄 Real-Time Data Flow Example

### Example: New Phishing Email Detected

```
1. Email arrives → Gmail API
   ↓
2. Pub/Sub notification → ilminate-email Lambda
   ↓
3. Lambda processes email:
   - Analyzes content (AI triage)
   - Checks sender reputation
   - Scores threat (0-100)
   ↓
4. Writes to DynamoDB:
   Table: ilminate-apex-events
   {
     customerId: "landseaair-nc.com",
     timestamp: 1729612800,
     threat_category: "Phish",
     apex_action: "QUARANTINE",
     threat_score: 95,
     severity: "CRITICAL"
   }
   ↓
5. User refreshes dashboard
   ↓
6. Frontend calls /api/reports/stats
   ↓
7. API queries DynamoDB:
   - Gets last 30 days of events
   - Aggregates by category
   - Builds timeline data
   ↓
8. Returns JSON:
   {
     categoryCounts: { Phish: 751, ... },
     timeline: [{ date: "2025-01-15", quarantined: 45, delivered: 120 }, ...]
   }
   ↓
9. React components update:
   - TimelineArea chart shows new data point
   - Threat category card increments Phish count
   - Cyber score recalculates
```

---

## 📊 Chart-by-Chart Data Mapping

### Dashboard Charts & Their Data Sources

| Chart Component | Current Data | Production Data Source | DynamoDB Table |
|----------------|--------------|----------------------|----------------|
| `TimelineArea` | `mockTimeline30d()` | `/api/reports/stats` → `queryApexEvents()` | `ilminate-apex-events` |
| `QuarantineDeliveredBars` | `mockTimeline30d()` | `/api/reports/stats` → `queryApexEvents()` | `ilminate-apex-events` |
| Threat Category Cards | `mockCategoryCounts()` | `/api/reports/stats` → `getDashboardStats()` | `ilminate-apex-events` |
| `EDREndpointStatus` | `mockEDREndpointBreakdown()` | `/api/reports/stats` → Filter by `source: 'edr'` | `ilminate-apex-events` |
| `EDRThreatDetections` | `mockEDRThreatTypes()` | `/api/reports/stats` → Filter by EDR categories | `ilminate-apex-events` |
| `ImageScanResults` | Mock data in API | `/api/image-scan` → `queryImageScans()` | `ilminate-image-scans` |
| `ThreatFamilyTypesChart` | `mockThreatFamilies()` | `/api/reports/stats` → Aggregate by threat family | `ilminate-apex-events` |
| `PeerComparisonChart` | `mockPeerComparison()` | External API or aggregated stats | Multiple sources |
| Domain Abuse Table | `mockDomainAbuse()` | `/api/reports/stats` → Filter by domain abuse | `ilminate-apex-events` |
| `AttackMatrix` | Lambda mapping | `/api/attack/layer` → Aggregate techniques | `ilminate-apex-events` |

---

## 🔧 Implementation Status

### ✅ Completed

- **API Routes:** All API routes exist and are ready to query DynamoDB
- **DynamoDB Client:** `src/lib/dynamodb.ts` has all query functions
- **Mock Data Toggle:** `isMockDataEnabled()` controls mock vs real data
- **Chart Components:** All charts can accept real data (already implemented)

### ⏳ Pending (Production Deployment)

1. **DynamoDB Tables:** Need to be created in production AWS account
   - `ilminate-apex-events`
   - `ilminate-image-scans`
   - `QuarantinedMessages`

2. **Data Pipeline:** `ilminate-email` and `ilminate-agent` need to write to DynamoDB
   - Currently being deployed/configured
   - Lambda functions need IAM permissions to write to DynamoDB

3. **Customer Configuration:** Production customers need:
   - `mockDataEnabled: false` in tenant config
   - DynamoDB access configured
   - Data pipeline connected

---

## 🚀 Enabling Real Data for a Customer

### Step 1: Create DynamoDB Tables

```bash
# Create events table
aws dynamodb create-table \
  --table-name ilminate-apex-events \
  --attribute-definitions \
    AttributeName=customerId,AttributeType=S \
    AttributeName=timestamp,AttributeType=N \
  --key-schema \
    AttributeName=customerId,KeyType=HASH \
    AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Create image scans table
aws dynamodb create-table \
  --table-name ilminate-image-scans \
  --attribute-definitions \
    AttributeName=messageId,AttributeType=S \
    AttributeName=timestamp,AttributeType=N \
  --key-schema \
    AttributeName=messageId,KeyType=HASH \
    AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### Step 2: Configure Data Pipeline

**In `ilminate-email` service:**
- Update Lambda functions to write to `ilminate-apex-events` table
- Include `customerId` in all records
- Set `threat_category`, `apex_action`, `threat_score`, etc.

**In `ilminate-agent` service:**
- Update to write image scans to `ilminate-image-scans` table
- Write EDR events to `ilminate-apex-events` with `source: 'edr'`

### Step 3: Disable Mock Data for Customer

**File:** `src/lib/tenantUtils.ts`

```typescript
// For production customer
export function isMockDataEnabled(customerId: string | null): boolean {
  if (!customerId) return true // Demo mode
  
  // Production customers
  const productionCustomers = [
    'landseaair-nc.com',
    'customer2.com',
    // ... more customers
  ]
  
  return !productionCustomers.includes(customerId)
}
```

### Step 4: Verify Data Flow

1. Send test email to customer
2. Verify Lambda processes and writes to DynamoDB
3. Check dashboard shows real data (not mock)
4. Verify charts update with actual metrics

---

## 📝 Summary

**Current State:**
- ✅ All infrastructure code is ready
- ✅ API routes can query DynamoDB
- ✅ Charts can display real data
- ⏳ Waiting for data pipeline deployment

**Production Flow:**
1. **Email arrives** → `ilminate-email` Lambda processes it
2. **Threat detected** → Writes to DynamoDB `ilminate-apex-events`
3. **Dashboard loads** → Calls `/api/reports/stats`
4. **API queries DynamoDB** → Aggregates last 30 days
5. **Charts render** → Real-time threat metrics displayed

**Key Tables:**
- `ilminate-apex-events` - All security events (email + EDR)
- `ilminate-image-scans` - Image/QR scan results
- `QuarantinedMessages` - Quarantined email details

**Next Steps:**
1. Deploy `ilminate-email` with DynamoDB write permissions
2. Deploy `ilminate-agent` with DynamoDB write permissions
3. Create DynamoDB tables in production
4. Configure customer tenant settings to disable mock data
5. Test end-to-end data flow

---

**Questions?** Review this document and check the API route implementations in `src/app/api/` for specific query patterns.


