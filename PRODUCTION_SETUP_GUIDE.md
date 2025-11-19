# Production Environment Setup Guide

**Date:** January 2025  
**Purpose:** Complete guide to set up production environment for ilminate APEX data pipeline

---

## 🎯 Overview

This guide walks you through setting up the complete production environment for ilminate APEX, including:

1. ✅ DynamoDB tables for data storage
2. ✅ IAM roles and policies for Lambda functions
3. ✅ Environment configuration
4. ✅ Data pipeline integration
5. ✅ Testing and verification

---

## 📋 Prerequisites

### Required Tools

```bash
# AWS CLI (v2 recommended)
aws --version

# jq (for JSON parsing)
jq --version

# Bash 4.0+ (for associative arrays)
bash --version
```

### AWS Configuration

```bash
# Set your AWS profile
export AWS_PROFILE=ilminate-prod

# Or configure credentials
aws configure --profile ilminate-prod

# Verify access
aws sts get-caller-identity
```

**Expected Account:** `657258631769`  
**Expected Region:** `us-east-1`

---

## 🚀 Quick Start (Automated)

### Option 1: Run Setup Script

```bash
# Make script executable
chmod +x scripts/setup-production.sh

# Run setup
./scripts/setup-production.sh --region us-east-1 --profile ilminate-prod

# This will create:
# - All DynamoDB tables
# - IAM roles for Lambda functions
# - Required policies
```

### Option 2: Manual Setup

Follow the detailed steps below.

---

## 📊 Step 1: Create DynamoDB Tables

### Table 1: APEX Events (`ilminate-apex-events`)

**Purpose:** Stores all security events (email threats, EDR detections, etc.)

```bash
aws dynamodb create-table \
  --table-name ilminate-apex-events \
  --attribute-definitions \
      AttributeName=customerId,AttributeType=S \
      AttributeName=timestamp,AttributeType=N \
  --key-schema \
      AttributeName=customerId,KeyType=HASH \
      AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1 \
  --tags Key=Application,Value=APEX Key=Environment,Value=Production
```

**Key Schema:**
- **Partition Key:** `customerId` (String) - Customer identifier
- **Sort Key:** `timestamp` (Number) - Unix timestamp

**Wait for table to be active:**
```bash
aws dynamodb wait table-exists \
  --table-name ilminate-apex-events \
  --region us-east-1
```

### Table 2: Quarantined Messages (`ilminate-apex-quarantine`)

**Purpose:** Stores quarantined email messages

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
  --region us-east-1 \
  --tags Key=Application,Value=APEX Key=Environment,Value=Production
```

**Key Schema:**
- **Partition Key:** `customerId` (String)
- **Sort Key:** `quarantineDate#messageId` (String) - Format: `YYYY-MM-DD#messageId`

**Wait for table:**
```bash
aws dynamodb wait table-exists \
  --table-name ilminate-apex-quarantine \
  --region us-east-1
```

### Table 3: Image Scans (`ilminate-image-scans`)

**Purpose:** Stores QR code and image threat scan results

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
  --region us-east-1 \
  --tags Key=Application,Value=APEX Key=Environment,Value=Production
```

**Key Schema:**
- **Partition Key:** `messageId` (String)
- **Sort Key:** `timestamp` (Number)

**Wait for table:**
```bash
aws dynamodb wait table-exists \
  --table-name ilminate-image-scans \
  --region us-east-1
```

### Verify All Tables

```bash
aws dynamodb list-tables --region us-east-1 | grep ilminate

# Should show:
# - ilminate-apex-events
# - ilminate-apex-quarantine
# - ilminate-image-scans
```

---

## 🔐 Step 2: Create IAM Roles

### Role 1: ilminate-email Lambda Role

**Purpose:** Allows `ilminate-email` Lambda functions to write to DynamoDB

```bash
# Create trust policy
cat > /tmp/email-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create role
aws iam create-role \
  --role-name ilminate-email-lambda-role \
  --assume-role-policy-document file:///tmp/email-trust-policy.json \
  --description "IAM role for ilminate-email Lambda functions"

# Attach basic execution policy
aws iam attach-role-policy \
  --role-name ilminate-email-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

# Create DynamoDB access policy
cat > /tmp/email-dynamodb-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:657258631769:table/ilminate-apex-events",
        "arn:aws:dynamodb:us-east-1:657258631769:table/ilminate-apex-quarantine",
        "arn:aws:dynamodb:us-east-1:657258631769:table/ilminate-image-scans"
      ]
    }
  ]
}
EOF

# Attach DynamoDB policy
aws iam put-role-policy \
  --role-name ilminate-email-lambda-role \
  --policy-name DynamoDBAccess \
  --policy-document file:///tmp/email-dynamodb-policy.json

# Get role ARN
aws iam get-role \
  --role-name ilminate-email-lambda-role \
  --query 'Role.Arn' \
  --output text
```

**Save the Role ARN** - You'll need it when deploying Lambda functions.

### Role 2: ilminate-agent Lambda Role

**Purpose:** Allows `ilminate-agent` Lambda functions to write to DynamoDB

```bash
# Create trust policy
cat > /tmp/agent-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create role
aws iam create-role \
  --role-name ilminate-agent-lambda-role \
  --assume-role-policy-document file:///tmp/agent-trust-policy.json \
  --description "IAM role for ilminate-agent Lambda functions"

# Attach basic execution policy
aws iam attach-role-policy \
  --role-name ilminate-agent-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

# Create DynamoDB access policy
cat > /tmp/agent-dynamodb-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:657258631769:table/ilminate-apex-events",
        "arn:aws:dynamodb:us-east-1:657258631769:table/ilminate-image-scans"
      ]
    }
  ]
}
EOF

# Attach DynamoDB policy
aws iam put-role-policy \
  --role-name ilminate-agent-lambda-role \
  --policy-name DynamoDBAccess \
  --policy-document file:///tmp/agent-dynamodb-policy.json

# Get role ARN
aws iam get-role \
  --role-name ilminate-agent-lambda-role \
  --query 'Role.Arn' \
  --output text
```

**Save the Role ARN** - You'll need it when deploying Lambda functions.

### Cleanup Temp Files

```bash
rm -f /tmp/*-trust-policy.json /tmp/*-dynamodb-policy.json
```

---

## ⚙️ Step 3: Configure Environment Variables

### AWS Amplify Environment Variables

Go to **AWS Amplify Console** → Your App → **Environment variables** and add:

```bash
# DynamoDB Configuration
DYNAMODB_REGION=us-east-1
DYNAMODB_EVENTS_TABLE=ilminate-apex-events
DYNAMODB_QUARANTINE_TABLE=ilminate-apex-quarantine
DYNAMODB_IMAGE_SCANS_TABLE=ilminate-image-scans

# AWS Region
AWS_REGION=us-east-1
REGION=us-east-1

# AWS Credentials (if not using IAM role)
# DYNAMODB_ACCESS_KEY_ID=<your-access-key>
# DYNAMODB_SECRET_ACCESS_KEY=<your-secret-key>
```

**Note:** If Amplify is using an IAM role, you don't need to set access keys.

### Lambda Function Environment Variables

When deploying `ilminate-email` and `ilminate-agent` Lambda functions, set:

```bash
# For ilminate-email Lambda
DYNAMODB_EVENTS_TABLE=ilminate-apex-events
DYNAMODB_QUARANTINE_TABLE=ilminate-apex-quarantine
DYNAMODB_REGION=us-east-1
AWS_REGION=us-east-1

# For ilminate-agent Lambda
DYNAMODB_EVENTS_TABLE=ilminate-apex-events
DYNAMODB_IMAGE_SCANS_TABLE=ilminate-image-scans
DYNAMODB_REGION=us-east-1
AWS_REGION=us-east-1
```

---

## 🔗 Step 4: Update Lambda Functions

### Update ilminate-email Lambda

1. **Set IAM Role:**
   ```bash
   # Get role ARN
   EMAIL_ROLE_ARN=$(aws iam get-role \
     --role-name ilminate-email-lambda-role \
     --query 'Role.Arn' \
     --output text)
   
   # Update Lambda function
   aws lambda update-function-configuration \
     --function-name <your-email-lambda-function-name> \
     --role "$EMAIL_ROLE_ARN" \
     --region us-east-1
   ```

2. **Set Environment Variables:**
   ```bash
   aws lambda update-function-configuration \
     --function-name <your-email-lambda-function-name> \
     --environment "Variables={
       DYNAMODB_EVENTS_TABLE=ilminate-apex-events,
       DYNAMODB_QUARANTINE_TABLE=ilminate-apex-quarantine,
       DYNAMODB_REGION=us-east-1
     }" \
     --region us-east-1
   ```

### Update ilminate-agent Lambda

1. **Set IAM Role:**
   ```bash
   # Get role ARN
   AGENT_ROLE_ARN=$(aws iam get-role \
     --role-name ilminate-agent-lambda-role \
     --query 'Role.Arn' \
     --output text)
   
   # Update Lambda function
   aws lambda update-function-configuration \
     --function-name <your-agent-lambda-function-name> \
     --role "$AGENT_ROLE_ARN" \
     --region us-east-1
   ```

2. **Set Environment Variables:**
   ```bash
   aws lambda update-function-configuration \
     --function-name <your-agent-lambda-function-name> \
     --environment "Variables={
       DYNAMODB_EVENTS_TABLE=ilminate-apex-events,
       DYNAMODB_IMAGE_SCANS_TABLE=ilminate-image-scans,
       DYNAMODB_REGION=us-east-1
     }" \
     --region us-east-1
   ```

---

## 🧪 Step 5: Test Data Pipeline

### Test 1: Write Sample Event

```bash
# Write a test event to DynamoDB
aws dynamodb put-item \
  --table-name ilminate-apex-events \
  --region us-east-1 \
  --item '{
    "customerId": {"S": "test-customer"},
    "timestamp": {"N": "'$(date +%s)'"},
    "threat_category": {"S": "Phish"},
    "apex_action": {"S": "QUARANTINE"},
    "threat_score": {"N": "95"},
    "severity": {"S": "CRITICAL"},
    "sender_email": {"S": "phisher@example.com"},
    "subject": {"S": "Test Phishing Email"}
  }'
```

### Test 2: Query Events

```bash
# Query events for test customer
aws dynamodb query \
  --table-name ilminate-apex-events \
  --region us-east-1 \
  --key-condition-expression "customerId = :cid" \
  --expression-attribute-values '{
    ":cid": {"S": "test-customer"}
  }' \
  --limit 10
```

### Test 3: Verify Dashboard

1. **Log in to APEX dashboard** as test customer
2. **Check `/api/reports/stats` endpoint:**
   ```bash
   curl https://apex.ilminate.com/api/reports/stats \
     -H "x-customer-id: test-customer"
   ```
3. **Verify charts show real data** (not mock data)

---

## ✅ Step 6: Disable Mock Data for Production Customers

### Update Tenant Configuration

**File:** `src/lib/tenantUtils.ts`

```typescript
export function isMockDataEnabled(customerId: string | null): boolean {
  if (!customerId) return true // Demo mode
  
  // Production customers - disable mock data
  const productionCustomers = [
    'landseaair-nc.com',
    'customer2.com',
    // Add more production customers here
  ]
  
  return !productionCustomers.includes(customerId)
}
```

### Test Mock Data Toggle

```bash
# For demo customer (should show mock data)
curl https://apex.ilminate.com/api/reports/stats \
  -H "x-customer-id: demo"

# For production customer (should show real data)
curl https://apex.ilminate.com/api/reports/stats \
  -H "x-customer-id: landseaair-nc.com"
```

---

## 📊 Step 7: Monitor Data Flow

### CloudWatch Logs

Monitor Lambda function logs:

```bash
# View ilminate-email logs
aws logs tail /aws/lambda/<email-lambda-function-name> --follow

# View ilminate-agent logs
aws logs tail /aws/lambda/<agent-lambda-function-name> --follow
```

### DynamoDB Metrics

Check table metrics in CloudWatch:

```bash
# Get table metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ConsumedReadCapacityUnits \
  --dimensions Name=TableName,Value=ilminate-apex-events \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Sum
```

---

## 🔍 Troubleshooting

### Issue: Tables Not Found

**Error:** `ResourceNotFoundException`

**Solution:**
```bash
# Verify tables exist
aws dynamodb list-tables --region us-east-1

# If missing, recreate using Step 1
```

### Issue: Access Denied

**Error:** `AccessDeniedException`

**Solution:**
```bash
# Verify IAM role has correct permissions
aws iam get-role-policy \
  --role-name ilminate-email-lambda-role \
  --policy-name DynamoDBAccess

# Verify Lambda function is using correct role
aws lambda get-function-configuration \
  --function-name <your-lambda-function-name> \
  --query 'Role'
```

### Issue: Mock Data Still Showing

**Solution:**
1. Check `isMockDataEnabled()` function
2. Verify customer ID is in production customers list
3. Clear browser cache
4. Check API response includes `"source": "dynamodb"`

---

## 📝 Summary Checklist

- [ ] DynamoDB tables created (`ilminate-apex-events`, `ilminate-apex-quarantine`, `ilminate-image-scans`)
- [ ] IAM roles created (`ilminate-email-lambda-role`, `ilminate-agent-lambda-role`)
- [ ] Lambda functions updated with correct IAM roles
- [ ] Environment variables configured in Amplify
- [ ] Environment variables configured in Lambda functions
- [ ] Test data written and queried successfully
- [ ] Dashboard shows real data (not mock)
- [ ] Mock data disabled for production customers
- [ ] CloudWatch logs monitored
- [ ] Data pipeline tested end-to-end

---

## 🎉 Next Steps

After production environment is set up:

1. **Deploy ilminate-email service** with DynamoDB write capability
2. **Deploy ilminate-agent service** with DynamoDB write capability
3. **Onboard first production customer** (e.g., Land Sea Air)
4. **Monitor data flow** for 24-48 hours
5. **Verify all charts populate** with real data
6. **Document any issues** and iterate

---

**Questions?** Review `DATA_FLOW_ARCHITECTURE.md` for detailed data flow information.

