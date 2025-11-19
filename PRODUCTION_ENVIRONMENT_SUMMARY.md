# Production Environment Setup - Summary

**Date:** January 2025  
**Status:** ✅ Ready to Deploy

---

## 📦 What Was Created

### 1. Automated Setup Script
**File:** `scripts/setup-production.sh`

**Purpose:** One-command setup of entire production environment

**Usage:**
```bash
./scripts/setup-production.sh --region us-east-1 --profile ilminate-prod
```

**What it does:**
- ✅ Creates all 3 DynamoDB tables
- ✅ Creates IAM roles for Lambda functions
- ✅ Attaches required policies
- ✅ Verifies setup completion
- ✅ Outputs role ARNs for Lambda configuration

### 2. Verification Script
**File:** `scripts/verify-production.sh`

**Purpose:** Verify production environment is correctly configured

**Usage:**
```bash
./scripts/verify-production.sh --region us-east-1 --profile ilminate-prod
```

**What it checks:**
- ✅ All DynamoDB tables exist and are ACTIVE
- ✅ IAM roles exist with correct permissions
- ✅ Reports any missing components

### 3. Complete Setup Guide
**File:** `PRODUCTION_SETUP_GUIDE.md`

**Purpose:** Step-by-step manual setup instructions

**Contents:**
- Detailed DynamoDB table creation
- IAM role and policy setup
- Environment variable configuration
- Lambda function updates
- Testing procedures
- Troubleshooting guide

---

## 🚀 Quick Start

### Option 1: Automated (Recommended)

```bash
# 1. Set AWS credentials
export AWS_PROFILE=ilminate-prod

# 2. Run setup script
./scripts/setup-production.sh --region us-east-1

# 3. Verify setup
./scripts/verify-production.sh --region us-east-1

# 4. Save role ARNs from output
#    (You'll need these for Lambda deployment)
```

### Option 2: Manual

Follow the detailed steps in `PRODUCTION_SETUP_GUIDE.md`

---

## 📊 DynamoDB Tables Created

| Table Name | Purpose | Partition Key | Sort Key |
|------------|---------|---------------|----------|
| `ilminate-apex-events` | All security events | `customerId` | `timestamp` |
| `ilminate-apex-quarantine` | Quarantined emails | `customerId` | `quarantineDate#messageId` |
| `ilminate-image-scans` | Image/QR scan results | `messageId` | `timestamp` |

**Billing Mode:** PAY_PER_REQUEST (on-demand)

---

## 🔐 IAM Roles Created

| Role Name | Purpose | Permissions |
|-----------|---------|-------------|
| `ilminate-email-lambda-role` | Email processing Lambda | DynamoDB write to events & quarantine tables |
| `ilminate-agent-lambda-role` | Agent processing Lambda | DynamoDB write to events & image-scans tables |

**Both roles include:**
- Basic Lambda execution permissions
- DynamoDB read/write access to required tables
- CloudWatch Logs permissions

---

## ⚙️ Next Steps

### 1. Run Setup Script

```bash
./scripts/setup-production.sh --region us-east-1 --profile ilminate-prod
```

### 2. Save Role ARNs

The script will output role ARNs. Save these for Lambda deployment:

```
Email Lambda Role ARN: arn:aws:iam::657258631769:role/ilminate-email-lambda-role
Agent Lambda Role ARN: arn:aws:iam::657258631769:role/ilminate-agent-lambda-role
```

### 3. Update Lambda Functions

**In ilminate-email repository:**
- Update Lambda functions to use `ilminate-email-lambda-role`
- Set environment variables (see PRODUCTION_SETUP_GUIDE.md)

**In ilminate-agent repository:**
- Update Lambda functions to use `ilminate-agent-lambda-role`
- Set environment variables (see PRODUCTION_SETUP_GUIDE.md)

### 4. Configure AWS Amplify

Add environment variables in Amplify Console:

```bash
DYNAMODB_REGION=us-east-1
DYNAMODB_EVENTS_TABLE=ilminate-apex-events
DYNAMODB_QUARANTINE_TABLE=ilminate-apex-quarantine
DYNAMODB_IMAGE_SCANS_TABLE=ilminate-image-scans
AWS_REGION=us-east-1
```

### 5. Test Data Pipeline

```bash
# Write test event
aws dynamodb put-item \
  --table-name ilminate-apex-events \
  --region us-east-1 \
  --item '{
    "customerId": {"S": "test-customer"},
    "timestamp": {"N": "'$(date +%s)'"},
    "threat_category": {"S": "Phish"},
    "apex_action": {"S": "QUARANTINE"}
  }'

# Verify in dashboard
curl https://apex.ilminate.com/api/reports/stats \
  -H "x-customer-id: test-customer"
```

---

## 📋 Checklist

- [ ] Run `setup-production.sh` script
- [ ] Verify all tables created successfully
- [ ] Verify IAM roles created successfully
- [ ] Save role ARNs for Lambda deployment
- [ ] Update ilminate-email Lambda functions
- [ ] Update ilminate-agent Lambda functions
- [ ] Configure AWS Amplify environment variables
- [ ] Test data pipeline with sample event
- [ ] Verify dashboard shows real data
- [ ] Disable mock data for production customers

---

## 🔍 Verification

After setup, run verification:

```bash
./scripts/verify-production.sh --region us-east-1 --profile ilminate-prod
```

Expected output:
```
✓ ilminate-apex-events (ACTIVE)
✓ ilminate-apex-quarantine (ACTIVE)
✓ ilminate-image-scans (ACTIVE)
✓ ilminate-email-lambda-role
✓ ilminate-agent-lambda-role
```

---

## 📚 Documentation

- **Setup Guide:** `PRODUCTION_SETUP_GUIDE.md` - Detailed manual setup
- **Data Flow:** `DATA_FLOW_ARCHITECTURE.md` - How data flows through the system
- **DynamoDB Schema:** `DYNAMODB_SCHEMA.md` - Table structure details

---

## 🆘 Troubleshooting

### Script Fails with "Access Denied"

**Solution:** Verify AWS credentials and permissions:
```bash
aws sts get-caller-identity
aws iam list-attached-user-policies --user-name <your-user>
```

### Tables Already Exist

**Solution:** Script will skip existing tables. To recreate:
```bash
aws dynamodb delete-table --table-name <table-name> --region us-east-1
# Wait for deletion, then re-run setup script
```

### Role Already Exists

**Solution:** Script will skip existing roles. To recreate:
```bash
aws iam delete-role --role-name <role-name>
# Then re-run setup script
```

---

## ✅ Success Criteria

Production environment is ready when:

1. ✅ All 3 DynamoDB tables exist and are ACTIVE
2. ✅ Both IAM roles exist with correct policies
3. ✅ Lambda functions can write to DynamoDB
4. ✅ Dashboard can read from DynamoDB
5. ✅ Test events appear in dashboard
6. ✅ Mock data is disabled for production customers

---

**Ready to deploy?** Run the setup script and follow the output instructions!

