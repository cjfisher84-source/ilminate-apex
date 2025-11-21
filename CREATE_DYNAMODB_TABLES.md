# Creating DynamoDB Tables - Step by Step

## Method 1: AWS CLI (Recommended)

### Prerequisites
```bash
# Make sure AWS CLI is installed and configured
aws --version

# Set your AWS profile (if using profiles)
export AWS_PROFILE=ilminate-prod

# Or set credentials directly
export AWS_ACCESS_KEY_ID=your-key
export AWS_SECRET_ACCESS_KEY=your-secret
```

### Table 1: Quarantine Messages

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
  --region us-east-2 \
  --tags Key=Application,Value=APEX Key=Environment,Value=Production
```

**Verify it was created:**
```bash
aws dynamodb describe-table \
  --table-name ilminate-apex-quarantine \
  --region us-east-2
```

### Table 2: APEX Events

```bash
aws dynamodb create-table \
  --table-name ilminate-apex-events \
  --attribute-definitions \
      AttributeName=event_id,AttributeType=S \
  --key-schema \
      AttributeName=event_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-2 \
  --tags Key=Application,Value=APEX Key=Environment,Value=Production
```

**Verify it was created:**
```bash
aws dynamodb describe-table \
  --table-name ilminate-apex-events \
  --region us-east-2
```

### Table 3: Image Scans (Optional)

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
  --region us-east-2 \
  --tags Key=Application,Value=APEX Key=Environment,Value=Production
```

## Method 2: AWS Console (Web UI)

### Step 1: Go to DynamoDB Console
1. Open: https://console.aws.amazon.com/dynamodbv2/home?region=us-east-2
2. Make sure region is set to **us-east-2** (top right)

### Step 2: Create Quarantine Table
1. Click **"Create table"**
2. **Table name**: `ilminate-apex-quarantine`
3. **Partition key**: 
   - Name: `customerId`
   - Type: `String`
4. **Sort key**:
   - Name: `quarantineDate#messageId` (yes, include the `#` symbol)
   - Type: `String`
5. **Table settings**: 
   - Select **"On-demand"** (Pay per request)
6. Click **"Create table"**

### Step 3: Create Events Table
1. Click **"Create table"** again
2. **Table name**: `ilminate-apex-events`
3. **Partition key**:
   - Name: `event_id`
   - Type: `String`
4. **Sort key**: Leave empty (no sort key)
5. **Table settings**: 
   - Select **"On-demand"** (Pay per request)
6. Click **"Create table"**

## Method 3: Terraform (If Using Infrastructure as Code)

```hcl
resource "aws_dynamodb_table" "quarantine" {
  name           = "ilminate-apex-quarantine"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "customerId"
  range_key      = "quarantineDate#messageId"

  attribute {
    name = "customerId"
    type = "S"
  }

  attribute {
    name = "quarantineDate#messageId"
    type = "S"
  }

  tags = {
    Application = "APEX"
    Environment = "Production"
  }
}

resource "aws_dynamodb_table" "events" {
  name         = "ilminate-apex-events"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "event_id"

  attribute {
    name = "event_id"
    type = "S"
  }

  tags = {
    Application = "APEX"
    Environment = "Production"
  }
}
```

## Verify Tables Exist

```bash
# List all tables in region
aws dynamodb list-tables --region us-east-2

# Should show:
# - ilminate-apex-quarantine
# - ilminate-apex-events
```

## Test with Sample Data

### Add a test quarantine message:
```bash
aws dynamodb put-item \
  --table-name ilminate-apex-quarantine \
  --region us-east-2 \
  --item '{
    "customerId": {"S": "test-customer"},
    "quarantineDate#messageId": {"S": "2025-01-15#msg-test-001"},
    "messageId": {"S": "msg-test-001"},
    "subject": {"S": "Test Quarantine Message"},
    "sender": {"S": "Test Sender"},
    "senderEmail": {"S": "test@example.com"},
    "recipients": {"L": [{"S": "user@company.com"}]},
    "quarantineTimestamp": {"N": "1736899200"},
    "riskScore": {"N": "95"},
    "severity": {"S": "CRITICAL"},
    "detectionReasons": {"L": [{"S": "Test detection"}]},
    "bodyPreview": {"S": "This is a test message"},
    "status": {"S": "quarantined"},
    "mailboxType": {"S": "microsoft365"}
  }'
```

### Query it back:
```bash
aws dynamodb query \
  --table-name ilminate-apex-quarantine \
  --region us-east-2 \
  --key-condition-expression "customerId = :cid AND #sk >= :start AND #sk <= :end" \
  --expression-attribute-names '{"#sk": "quarantineDate#messageId"}' \
  --expression-attribute-values '{
    ":cid": {"S": "test-customer"},
    ":start": {"S": "2025-01-01#"},
    ":end": {"S": "2025-01-31#~"}
  }'
```

You should see your test message returned!

