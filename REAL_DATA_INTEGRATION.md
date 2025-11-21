# Real Data Integration - Complete

## Overview

The APEX dashboard has been updated to fetch and display real data from ilminate-agent via DynamoDB. The system gracefully falls back to mock data when:
- Tables don't exist yet
- Customer has mock data enabled
- Errors occur

## What Was Implemented

### 1. DynamoDB Client Utility (`src/lib/dynamodb.ts`)
- Centralized DynamoDB client configuration
- Helper functions for querying:
  - `queryQuarantinedMessages()` - Fetch quarantine data
  - `queryApexEvents()` - Fetch security events
  - `queryImageScans()` - Fetch image/QR scan results
  - `getDashboardStats()` - Aggregate statistics

### 2. API Routes Created/Updated

#### `/api/quarantine/list` (NEW)
- Fetches quarantined messages from DynamoDB table `QuarantinedMessages`
- Supports filtering by:
  - Severity (CRITICAL, HIGH, MEDIUM, LOW, ALL)
  - Days (default: 30)
  - Search term (searches subject, sender, body)
- Returns data matching the expected `QuarantinedMessage` interface

#### `/api/reports/stats` (NEW)
- Fetches dashboard statistics from events
- Returns:
  - Category counts (Phish, Malware, Spam, BEC, ATO)
  - Timeline data (last 30 days)
  - Aggregate stats (total events, quarantined, blocked, allowed)

#### `/api/attack/layer` (UPDATED)
- Now fetches real events from DynamoDB
- Extracts MITRE ATT&CK techniques from event data
- Builds technique scores based on occurrence counts
- Falls back to mock data if table doesn't exist

#### `/api/image-scan` (UPDATED)
- Now queries DynamoDB table `ilminate-image-scans`
- Processes scan results to build statistics:
  - QR code detections
  - Malicious QR codes
  - Image threats (offensive, logo impersonation, hidden links, screenshot phishing)
- Returns zeros if table doesn't exist (for customers with mock data disabled)

#### `/api/apex-trace/search` (ALREADY EXISTS)
- Connects to ilminate-agent search API
- Falls back to mock data if search service unavailable
- Set `APEX_SEARCH_API_URL` environment variable to point to search service

### 3. Frontend Updates

#### Home Page (`src/app/page.tsx`)
- Now fetches category counts from `/api/reports/stats`
- Falls back to mock data on error

#### Charts (`src/components/Charts.client.tsx`)
- `TimelineArea` component fetches real timeline data
- `QuarantineDeliveredBars` component fetches real data
- Both gracefully handle errors and fall back to mock data

## DynamoDB Table Structure

### Expected Tables

1. **QuarantinedMessages**
   - Partition Key: `customerId` (String)
   - Sort Key: `quarantineDate#messageId` (String)
   - See `DYNAMODB_SCHEMA.md` for full schema

2. **ilminate-apex-events** (or configured via `DYNAMODB_EVENTS_TABLE`)
   - Should contain events with:
     - `techniques` field (JSON string or array)
     - `timestamp` field
     - `customerId` field (optional)
     - `apex_action` or `action` field
     - `threat_category` or `category` field

3. **ilminate-image-scans** (or configured via `DYNAMODB_IMAGE_SCANS_TABLE`)
   - Should contain scan results with:
     - `scan_type` field ('qr_code' or 'image_threat')
     - `threat_detected` field (boolean)
     - `threat_score` field (number 0-1)
     - `detection_details` field (JSON object)
     - `timestamp` field
     - `customerId` field (optional)

## Environment Variables

Set these in your deployment environment:

```bash
# AWS Configuration
AWS_REGION=us-east-1
REGION=us-east-1

# DynamoDB Table Names (optional, defaults provided)
DYNAMODB_QUARANTINE_TABLE=QuarantinedMessages
DYNAMODB_EVENTS_TABLE=ilminate-apex-events
DYNAMODB_IMAGE_SCANS_TABLE=ilminate-image-scans
DYNAMODB_MESSAGES_TABLE=apex_messages

# Search API (optional)
APEX_SEARCH_API_URL=http://localhost:5000
```

## AWS Credentials

The DynamoDB client automatically picks up credentials from:
1. Environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
2. IAM role (if running on EC2/Lambda)
3. AWS credentials file (`~/.aws/credentials`)
4. AWS SSO (if configured)

For AWS Amplify deployments, ensure the service role has DynamoDB read permissions.

## Customer Configuration

Customers can be configured to show/hide mock data via `src/lib/tenantUtils.ts`:

```typescript
export const CUSTOMER_FEATURES: Record<string, CustomerFeatures> = {
  'landseaair-nc.com': {
    // ... other features
    mockData: false // No mock data - use real data only
  }
}
```

## Data Flow

```
ilminate-agent
    ↓
[Processes emails, detects threats]
    ↓
[Writes to DynamoDB tables]
    ↓
APEX API Routes (/api/*)
    ↓
[Query DynamoDB]
    ↓
[Transform & Return JSON]
    ↓
Frontend Components
    ↓
[Display in UI]
```

## Testing

### Test with Mock Data (Default)
1. Customer has `mockData: true` in tenant config
2. API routes return mock data
3. No DynamoDB tables needed

### Test with Real Data
1. Set customer `mockData: false`
2. Ensure DynamoDB tables exist and have data
3. Ensure AWS credentials are configured
4. API routes will query DynamoDB
5. If tables don't exist, returns empty data (not errors)

### Test Search
1. Start ilminate-agent search service
2. Set `APEX_SEARCH_API_URL` environment variable
3. Search will connect to real search API
4. Falls back to mock data if service unavailable

## Error Handling

All API routes gracefully handle:
- Missing tables (returns empty data)
- Missing customer ID (returns error with 400 status)
- Database errors (logs error, returns fallback data)
- Network errors (frontend falls back to mock data)

## Next Steps

1. **Create DynamoDB Tables**: Use the schemas in `DYNAMODB_SCHEMA.md`
2. **Configure ilminate-agent**: Ensure it writes to the correct tables
3. **Set Environment Variables**: Configure table names and AWS region
4. **Test with Real Data**: Disable mock data for a test customer
5. **Monitor**: Check logs for any errors or missing data

## Files Changed

- ✅ `src/lib/dynamodb.ts` (NEW)
- ✅ `src/lib/useStats.ts` (NEW)
- ✅ `src/app/api/quarantine/list/route.ts` (NEW)
- ✅ `src/app/api/reports/stats/route.ts` (NEW)
- ✅ `src/app/api/attack/layer/route.ts` (UPDATED)
- ✅ `src/app/api/image-scan/route.ts` (UPDATED)
- ✅ `src/app/page.tsx` (UPDATED)
- ✅ `src/components/Charts.client.tsx` (UPDATED)

## Status

✅ **All tasks completed**
- DynamoDB client utility created
- Quarantine API route created
- Reports/stats API route created
- Attack layer API updated
- Image scan API updated
- Search API already connected
- Home page updated to use real data
- Charts updated to use real data

The system is now ready to display real data from ilminate-agent!

