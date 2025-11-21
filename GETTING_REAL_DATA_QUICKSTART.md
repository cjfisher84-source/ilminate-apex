# Getting Real Data in apex.ilminate.com - Quick Start Guide

## 🎯 Quick Checklist

### 1. ✅ Code is Ready
The code is already updated to fetch real data from DynamoDB. No code changes needed!

### 2. 🔧 Configure Environment Variables

Set these in **AWS Amplify Console** → **App settings** → **Environment variables**:

```bash
# AWS Region (where your DynamoDB tables are)
DYNAMODB_REGION=us-east-2

# DynamoDB Table Names
DYNAMODB_TABLE_NAME=ilminate-apex-quarantine
DYNAMODB_EVENTS_TABLE=ilminate-apex-events
DYNAMODB_IMAGE_SCANS_TABLE=ilminate-image-scans

# AWS Credentials (if not using IAM role)
DYNAMODB_ACCESS_KEY_ID=your-access-key
DYNAMODB_SECRET_ACCESS_KEY=your-secret-key
```

**Note**: If using IAM roles (recommended), you don't need the access keys.

### 3. 📊 Create DynamoDB Tables

#### Table 1: Quarantine Messages
```bash
aws dynamodb create-table \
  --table-name ilminate-apex-quarantine \
  --attribute-definitions \
      AttributeName=customerId,AttributeType=S \
      AttributeName=quarantineDate#messageId,AttributeType=S \
  --key-schema \
      AttributeName=customerId,KeyType=HASH \
      AttributeName=quarantineDate#messageId,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-2
```

**Required Structure:**
- Partition Key: `customerId` (String)
- Sort Key: `quarantineDate#messageId` (String) - Format: `YYYY-MM-DD#messageId`
- Example: `2025-01-15#msg-abc123`

#### Table 2: APEX Events (for ATT&CK reports)
```bash
aws dynamodb create-table \
  --table-name ilminate-apex-events \
  --attribute-definitions \
      AttributeName=event_id,AttributeType=S \
  --key-schema \
      AttributeName=event_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-2
```

**Required Fields:**
- `event_id` (String) - Primary key
- `timestamp` (Number) - Unix timestamp
- `customerId` (String) - Optional
- `techniques` (String or Array) - JSON string of MITRE ATT&CK techniques
- `apex_action` (String) - QUARANTINE, BLOCK, or ALLOW
- `threat_category` (String) - Phish, Malware, Spam, BEC, etc.

#### Table 3: Image Scans (optional)
```bash
aws dynamodb create-table \
  --table-name ilminate-image-scans \
  --attribute-definitions \
      AttributeName=messageId,AttributeType=S \
      AttributeName=timestamp,AttributeType=N \
  --key-schema \
      AttributeName=messageId,KeyType=HASH \
      AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-2
```

### 4. 🔐 Configure IAM Permissions

Your Amplify app needs DynamoDB read permissions. Add this policy to your Amplify service role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:GetItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-2:*:table/ilminate-apex-quarantine",
        "arn:aws:dynamodb:us-east-2:*:table/ilminate-apex-events",
        "arn:aws:dynamodb:us-east-2:*:table/ilminate-image-scans"
      ]
    }
  ]
}
```

### 5. 📝 Configure ilminate-agent to Write Data

Ensure ilminate-agent writes to DynamoDB with this structure:

#### Quarantine Messages Format:
```json
{
  "customerId": "your-customer-id",
  "quarantineDate#messageId": "2025-01-15#msg-abc123",
  "messageId": "msg-abc123",
  "subject": "Urgent: Verify Your Account",
  "sender": "CEO",
  "senderEmail": "ceo@example.com",
  "recipients": ["user@company.com"],
  "quarantineTimestamp": 1736899200000,
  "riskScore": 95,
  "severity": "CRITICAL",
  "detectionReasons": ["Executive impersonation"],
  "bodyPreview": "I need you to process...",
  "status": "quarantined",
  "mailboxType": "microsoft365"
}
```

**Critical**: Sort key must be `YYYY-MM-DD#messageId` format!

#### Events Format:
```json
{
  "event_id": "evt-123",
  "timestamp": 1736899200,
  "customerId": "your-customer-id",
  "techniques": "[{\"id\":\"T1566\",\"tactic\":\"Initial Access\"}]",
  "apex_action": "QUARANTINE",
  "threat_category": "Phish"
}
```

### 6. 👤 Set Customer ID

The API needs to know which customer's data to fetch. This comes from:
- Cookie: `apex_user_display` (contains `customerId`)
- Header: `x-customer-id` (for API calls)

**To test**, you can manually set the customer ID in the browser console:
```javascript
document.cookie = "apex_user_display=" + encodeURIComponent(JSON.stringify({customerId: "your-customer-id"}))
```

### 7. 🚫 Disable Mock Data for Test Customer

Edit `src/lib/tenantUtils.ts`:

```typescript
export const CUSTOMER_FEATURES: Record<string, CustomerFeatures> = {
  'your-customer-id': {
    // ... other features
    mockData: false  // ← Set to false to use real data
  }
}
```

Or add your test customer:
```typescript
'test-customer': {
  email_security: true,
  quarantine: true,
  mockData: false  // Use real data
}
```

### 8. 🧪 Test It

1. **Deploy the code** (if not already deployed)
2. **Send test data** from ilminate-agent to DynamoDB
3. **Visit** https://apex.ilminate.com/quarantine
4. **Check browser console** for logs:
   ```
   Quarantine query: Found X items for customer Y in table Z (region: R)
   ```

### 9. 🔍 Troubleshooting

#### No data showing?
1. **Check logs**: Look for "Quarantine query: Found 0 items"
2. **Verify table name**: Must match `DYNAMODB_TABLE_NAME`
3. **Verify region**: Must match `DYNAMODB_REGION`
4. **Verify customer ID**: Must match exactly (case-sensitive)
5. **Verify sort key format**: Must be `YYYY-MM-DD#messageId`

#### Test with AWS CLI:
```bash
# Check if table exists
aws dynamodb describe-table \
  --table-name ilminate-apex-quarantine \
  --region us-east-2

# Check item count
aws dynamodb scan \
  --table-name ilminate-apex-quarantine \
  --region us-east-2 \
  --select COUNT

# View a sample item
aws dynamodb scan \
  --table-name ilminate-apex-quarantine \
  --region us-east-2 \
  --limit 1
```

#### Test the query:
```bash
aws dynamodb query \
  --table-name ilminate-apex-quarantine \
  --region us-east-2 \
  --key-condition-expression "customerId = :cid AND #sk >= :start AND #sk <= :end" \
  --expression-attribute-names '{"#sk": "quarantineDate#messageId"}' \
  --expression-attribute-values '{
    ":cid": {"S": "your-customer-id"},
    ":start": {"S": "2025-01-01#"},
    ":end": {"S": "2025-01-31#~"}
  }'
```

## 📋 Summary Checklist

- [ ] Environment variables set in Amplify
- [ ] DynamoDB tables created
- [ ] IAM permissions configured
- [ ] ilminate-agent writing data with correct format
- [ ] Customer ID configured
- [ ] Mock data disabled for test customer
- [ ] Code deployed
- [ ] Test data sent
- [ ] Checked browser console logs
- [ ] Verified data appears in UI

## 🎯 What Shows Real Data

Once configured, these pages will show real data:
- ✅ **Quarantine** (`/quarantine`) - From `ilminate-apex-quarantine` table
- ✅ **Reports/ATT&CK** (`/reports/attack`) - From `ilminate-apex-events` table
- ✅ **Dashboard** (`/`) - From `ilminate-apex-events` table
- ✅ **Image Scans** (home page widget) - From `ilminate-image-scans` table

## 📞 Need Help?

See detailed troubleshooting in:
- `QUARANTINE_TROUBLESHOOTING.md` - For quarantine-specific issues
- `REAL_DATA_INTEGRATION.md` - For full technical details
- `DYNAMODB_SCHEMA.md` - For table schemas

