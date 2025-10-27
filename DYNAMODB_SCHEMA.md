# DynamoDB Schema for APEX Quarantine Management

## Overview

This document outlines the DynamoDB table structure for Phase 1 (Quarantine Viewer).

---

## Table: QuarantinedMessages

### **Primary Keys:**
- **Partition Key:** `customerId` (String)
- **Sort Key:** `quarantineDate#messageId` (String)

This design allows:
- All messages for a customer grouped together
- Sorted by date (most recent first)
- Efficient queries by customer

### **Attributes:**

| Attribute | Type | Description | Example |
|-----------|------|-------------|---------|
| `customerId` | String | Customer organization ID | `cust_abc123` |
| `quarantineDate#messageId` | String | Composite sort key | `2025-10-22T14:30:00#msg-xyz789` |
| `messageId` | String | Original Microsoft 365 message ID | `AAMkADU3...` |
| `subject` | String | Email subject line | `Urgent Wire Transfer Request` |
| `sender` | String | Display name of sender | `CEO` |
| `senderEmail` | String | Email address of sender | `ceo@gmail.com` |
| `recipients` | List | List of recipient addresses | `["user@company.com"]` |
| `quarantineTimestamp` | Number | Unix timestamp | `1729612800` |
| `riskScore` | Number | Risk score (0-100) | `95` |
| `severity` | String | CRITICAL, HIGH, MEDIUM, LOW | `CRITICAL` |
| `detectionReasons` | List | Array of detection reasons | `["Executive impersonation"]` |
| `bodyPreview` | String | First 500 chars of body | `I need you to process...` |
| `s3Key` | String | Full email in S3 | `quarantine/cust_abc123/msg-xyz789.eml` |
| `hasAttachments` | Boolean | Whether email has attachments | `false` |
| `attachments` | List | Attachment metadata | See below |
| `status` | String | quarantined, released, deleted | `quarantined` |
| `mailboxType` | String | microsoft365, google_workspace | `microsoft365` |
| `createdAt` | Number | Record creation timestamp | `1729612800` |
| `ttl` | Number | Auto-delete after 30 days | `1732204800` |

### **Attachment Structure (Map):**
```json
{
  "name": "invoice.pdf.exe",
  "size": 245678,
  "contentType": "application/x-msdownload",
  "malicious": true
}
```

---

## Global Secondary Index (GSI-1): Status and Risk

### **Purpose:** Query messages by status and sort by risk score

### **Keys:**
- **Partition Key:** `customerId#status` (String)
- **Sort Key:** `riskScore` (Number)

### **Usage:**
- Get all quarantined messages sorted by highest risk
- Get all released messages
- Get all deleted messages

### **Example Query:**
```typescript
// Get all CRITICAL quarantined messages for customer
const params = {
  TableName: 'QuarantinedMessages',
  IndexName: 'GSI-1',
  KeyConditionExpression: 'customerIdStatus = :key',
  ExpressionAttributeValues: {
    ':key': 'cust_abc123#quarantined'
  },
  ScanIndexForward: false // Descending (highest risk first)
}
```

---

## Table Configuration

### **Capacity Mode:**
- **On-Demand** (recommended for Phase 1)
- Auto-scales based on traffic
- No capacity planning required

### **TTL (Time To Live):**
- **Enabled** on `ttl` attribute
- Automatically deletes messages after 30 days
- Reduces storage costs

### **Encryption:**
- **Enabled** (AWS-managed KMS key)
- At-rest encryption for compliance

### **Point-in-Time Recovery:**
- **Enabled** for data protection
- 35-day recovery window

---

## CloudFormation/Terraform (Optional)

### **AWS CLI Creation:**
```bash
aws dynamodb create-table \
  --table-name QuarantinedMessages \
  --attribute-definitions \
      AttributeName=customerId,AttributeType=S \
      AttributeName=quarantineDateMessageId,AttributeType=S \
      AttributeName=customerIdStatus,AttributeType=S \
      AttributeName=riskScore,AttributeType=N \
  --key-schema \
      AttributeName=customerId,KeyType=HASH \
      AttributeName=quarantineDateMessageId,KeyType=RANGE \
  --global-secondary-indexes \
      IndexName=GSI-Status-Risk,\
      KeySchema=[{AttributeName=customerIdStatus,KeyType=HASH},{AttributeName=riskScore,KeyType=RANGE}],\
      Projection={ProjectionType=ALL} \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1 \
  --tags Key=Application,Value=APEX Key=Environment,Value=Production
```

### **Enable TTL:**
```bash
aws dynamodb update-time-to-live \
  --table-name QuarantinedMessages \
  --time-to-live-specification \
      Enabled=true,AttributeName=ttl \
  --region us-east-1
```

### **Enable Point-in-Time Recovery:**
```bash
aws dynamodb update-continuous-backups \
  --table-name QuarantinedMessages \
  --point-in-time-recovery-specification \
      PointInTimeRecoveryEnabled=true \
  --region us-east-1
```

---

## S3 Bucket Structure

### **Bucket:** `ilminate-apex-raw`

### **Folder Structure:**
```
ilminate-apex-raw/
├── quarantine/
│   ├── cust_abc123/
│   │   ├── 2025/
│   │   │   ├── 10/
│   │   │   │   ├── 22/
│   │   │   │   │   ├── msg-xyz789.eml
│   │   │   │   │   ├── msg-abc456.eml
│   │   │   │   │   └── ...
```

### **Lifecycle Policy:**
```json
{
  "Rules": [
    {
      "Id": "Delete-Old-Quarantine",
      "Status": "Enabled",
      "Prefix": "quarantine/",
      "Expiration": {
        "Days": 30
      }
    }
  ]
}
```

---

## Sample Queries

### **1. Get Recent Quarantined Messages:**
```typescript
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb'

const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: 'us-east-1' }))

const params = {
  TableName: 'QuarantinedMessages',
  KeyConditionExpression: 'customerId = :customerId',
  ExpressionAttributeValues: {
    ':customerId': 'cust_abc123'
  },
  ScanIndexForward: false, // Newest first
  Limit: 50
}

const result = await client.send(new QueryCommand(params))
```

### **2. Get High-Risk Messages:**
```typescript
const params = {
  TableName: 'QuarantinedMessages',
  IndexName: 'GSI-Status-Risk',
  KeyConditionExpression: 'customerIdStatus = :key AND riskScore >= :minRisk',
  ExpressionAttributeValues: {
    ':key': 'cust_abc123#quarantined',
    ':minRisk': 70
  },
  ScanIndexForward: false // Highest risk first
}
```

### **3. Search by Sender:**
```typescript
const params = {
  TableName: 'QuarantinedMessages',
  KeyConditionExpression: 'customerId = :customerId',
  FilterExpression: 'contains(senderEmail, :search)',
  ExpressionAttributeValues: {
    ':customerId': 'cust_abc123',
    ':search': '@gmail.com'
  }
}
```

---

## Cost Estimation

### **DynamoDB:**
- **Storage:** ~$0.25/GB/month
- **Reads:** $0.25 per million requests (on-demand)
- **Writes:** $1.25 per million requests (on-demand)

### **Estimated Monthly Cost per Customer:**
- **Storage:** ~25 messages × 50KB = 1.25MB (~$0.00)
- **Reads:** ~1,000 page loads = 1,000 queries (~$0.00)
- **Writes:** ~100 new quarantines = 100 writes (~$0.00)

**Total per customer:** ~$0.01-0.10/month

### **S3:**
- **Storage:** ~25 messages × 500KB = 12.5MB (~$0.00)
- **Requests:** Minimal

**Total per customer:** ~$0.00-0.01/month

### **Combined Infrastructure Cost:**
~$0.02-0.15/month per customer for quarantine storage

---

## Migration Path

### **Phase 1 (Current):**
- Use mock data from `mockQuarantinedMessages()`
- No database required
- Demonstrates UX and functionality

### **Phase 2 (Database Integration):**
1. Create DynamoDB table (run commands above)
2. Set up S3 lifecycle policy
3. Update API routes to use DynamoDB
4. Add write functionality for new quarantines

### **Phase 3 (Microsoft 365 Integration):**
1. Set up Microsoft Graph API access
2. Register application in Azure AD
3. Configure OAuth permissions
4. Implement quarantine webhook/polling

---

## Security Considerations

### **Row-Level Security:**
Every query MUST include `customerId` to prevent cross-tenant data access.

```typescript
// ✅ CORRECT - Always filter by customerId
const customerId = await getUserCustomerId(req)
const params = {
  KeyConditionExpression: 'customerId = :customerId',
  ExpressionAttributeValues: { ':customerId': customerId }
}

// ❌ WRONG - Never query without customerId
const params = {
  TableName: 'QuarantinedMessages'
  // This would return ALL customers' data!
}
```

### **Audit Logging:**
All actions should be logged:
- Who viewed which messages
- Who released which messages
- When lists were modified

### **Data Retention:**
- 30-day TTL enforced automatically
- Comply with GDPR right to deletion
- S3 lifecycle deletes after 30 days

---

## Next Steps

### **To Deploy Database:**
1. Run DynamoDB table creation command
2. Run S3 lifecycle policy setup
3. Update API routes to use real DynamoDB
4. Test with real data
5. Deploy to production

### **For Now (Phase 1):**
- ✅ Mock data works perfectly
- ✅ Demonstrates functionality
- ✅ Gets customer feedback
- ✅ No infrastructure costs yet

---

**Ready to create the table when you want to go live with real data!**




