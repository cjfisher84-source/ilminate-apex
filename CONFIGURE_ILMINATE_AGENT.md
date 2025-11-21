# Configuring ilminate-agent to Write to DynamoDB

## Current Implementation

The ilminate-agent already has DynamoDB sync code in `testing/apex_mailbox_protector.py`. Here's how to ensure it writes with the correct format.

## Required Format

### Sort Key Format
**CRITICAL**: The sort key must be: `YYYY-MM-DD#messageId`

Example: `2025-01-15#msg-abc123`

**NOT**: 
- ❌ `2025-01-15T14:30:00#msg-abc123` (includes time)
- ❌ `2025/01/15#msg-abc123` (wrong date separator)
- ❌ `1736899200#msg-abc123` (timestamp instead of date)

### Customer ID Format
The `customerId` must match exactly what the API expects. Common formats:
- Domain-based: `ilminate.com`, `landseaair-nc.com`
- ID-based: `cust_abc123`, `test-customer`

## Code Example for ilminate-agent

Here's the correct Python code to write quarantine messages:

```python
import boto3
from datetime import datetime
from typing import Dict, List

# Configuration
DYNAMODB_TABLE_NAME = 'ilminate-apex-quarantine'
DYNAMODB_REGION = 'us-east-2'
CUSTOMER_ID = 'ilminate.com'  # Change to your customer ID

# Initialize DynamoDB client
dynamodb = boto3.client('dynamodb', region_name=DYNAMODB_REGION)

def sync_quarantine_to_dynamodb(
    message_id: str,
    email_data: Dict,
    risk_score: float,
    detection_reasons: List[str]
) -> bool:
    """
    Sync quarantined email to DynamoDB with correct format
    
    Args:
        message_id: Unique message identifier
        email_data: Email data dict with subject, sender, etc.
        risk_score: Risk score (0-100)
        detection_reasons: List of detection reasons
    """
    try:
        # Get current date in YYYY-MM-DD format
        quarantine_date = datetime.now().strftime('%Y-%m-%d')
        
        # Build sort key: YYYY-MM-DD#messageId
        sort_key = f"{quarantine_date}#{message_id}"
        
        # Determine severity from risk score
        if risk_score >= 90:
            severity = 'CRITICAL'
        elif risk_score >= 70:
            severity = 'HIGH'
        elif risk_score >= 50:
            severity = 'MEDIUM'
        else:
            severity = 'LOW'
        
        # Get quarantine timestamp (Unix timestamp in milliseconds)
        quarantine_timestamp = int(datetime.now().timestamp() * 1000)
        
        # Build DynamoDB item
        item = {
            'customerId': {'S': CUSTOMER_ID},
            'quarantineDate#messageId': {'S': sort_key},
            'messageId': {'S': message_id},
            'subject': {'S': email_data.get('subject', 'No Subject')},
            'sender': {'S': email_data.get('sender_display_name', '')},
            'senderEmail': {'S': email_data.get('sender_email', '')},
            'recipients': {'L': [{'S': r} for r in email_data.get('recipients', [])]},
            'quarantineTimestamp': {'N': str(quarantine_timestamp)},
            'riskScore': {'N': str(int(risk_score))},
            'severity': {'S': severity},
            'detectionReasons': {'L': [{'S': reason} for reason in detection_reasons]},
            'bodyPreview': {'S': email_data.get('body_preview', '')[:500]},
            'status': {'S': 'quarantined'},
            'mailboxType': {'S': email_data.get('mailbox_type', 'microsoft365')},
            'createdAt': {'N': str(int(datetime.now().timestamp()))},
        }
        
        # Add optional fields
        if email_data.get('has_attachments'):
            item['hasAttachments'] = {'BOOL': True}
            if email_data.get('attachments'):
                item['attachments'] = {'L': [
                    {
                        'M': {
                            'name': {'S': att.get('name', '')},
                            'size': {'N': str(att.get('size', 0))},
                            'contentType': {'S': att.get('content_type', '')},
                        }
                    }
                    for att in email_data.get('attachments', [])
                ]}
        
        # Put item in DynamoDB
        dynamodb.put_item(
            TableName=DYNAMODB_TABLE_NAME,
            Item=item
        )
        
        print(f"✅ Synced to DynamoDB: {message_id} (severity: {severity})")
        return True
        
    except Exception as e:
        print(f"❌ Error syncing to DynamoDB: {e}")
        return False
```

## Using boto3 Resource (Alternative - Simpler)

If you prefer using the higher-level boto3 resource API:

```python
import boto3
from datetime import datetime
from boto3.dynamodb.conditions import Key

# Configuration
DYNAMODB_TABLE_NAME = 'ilminate-apex-quarantine'
DYNAMODB_REGION = 'us-east-2'
CUSTOMER_ID = 'ilminate.com'

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb', region_name=DYNAMODB_REGION)
table = dynamodb.Table(DYNAMODB_TABLE_NAME)

def sync_quarantine_to_dynamodb(
    message_id: str,
    email_data: Dict,
    risk_score: float,
    detection_reasons: List[str]
) -> bool:
    """Sync quarantined email to DynamoDB"""
    try:
        # Get current date in YYYY-MM-DD format
        quarantine_date = datetime.now().strftime('%Y-%m-%d')
        
        # Build sort key: YYYY-MM-DD#messageId
        sort_key = f"{quarantine_date}#{message_id}"
        
        # Determine severity
        if risk_score >= 90:
            severity = 'CRITICAL'
        elif risk_score >= 70:
            severity = 'HIGH'
        elif risk_score >= 50:
            severity = 'MEDIUM'
        else:
            severity = 'LOW'
        
        # Build item (boto3 resource handles type conversion automatically)
        item = {
            'customerId': CUSTOMER_ID,
            'quarantineDate#messageId': sort_key,
            'messageId': message_id,
            'subject': email_data.get('subject', 'No Subject'),
            'sender': email_data.get('sender_display_name', ''),
            'senderEmail': email_data.get('sender_email', ''),
            'recipients': email_data.get('recipients', []),
            'quarantineTimestamp': int(datetime.now().timestamp() * 1000),
            'riskScore': int(risk_score),
            'severity': severity,
            'detectionReasons': detection_reasons,
            'bodyPreview': email_data.get('body_preview', '')[:500],
            'status': 'quarantined',
            'mailboxType': email_data.get('mailbox_type', 'microsoft365'),
            'createdAt': int(datetime.now().timestamp()),
        }
        
        # Put item
        table.put_item(Item=item)
        
        print(f"✅ Synced to DynamoDB: {message_id} (severity: {severity})")
        return True
        
    except Exception as e:
        print(f"❌ Error syncing to DynamoDB: {e}")
        return False
```

## Update Existing Code

If you're using `testing/apex_mailbox_protector.py`, update the `sync_to_dynamodb` method:

**Find this line** (around line 252):
```python
# Create sort key - CURRENT (might be wrong format)
sort_key = f"{quarantine_date}#{email_id}"
```

**Ensure it's**:
```python
# Get date in YYYY-MM-DD format (no time!)
quarantine_date = datetime.now().strftime('%Y-%m-%d')
sort_key = f"{quarantine_date}#{email_id}"
```

**Key points**:
1. ✅ Use `strftime('%Y-%m-%d')` - NOT `isoformat()` (which includes time)
2. ✅ Format: `YYYY-MM-DD#messageId`
3. ✅ Customer ID must match exactly

## Testing

### Test the write:
```python
# Test function
test_email_data = {
    'subject': 'Test Quarantine Message',
    'sender_display_name': 'Test Sender',
    'sender_email': 'test@example.com',
    'recipients': ['user@company.com'],
    'body_preview': 'This is a test message',
    'mailbox_type': 'microsoft365',
}

sync_quarantine_to_dynamodb(
    message_id='msg-test-001',
    email_data=test_email_data,
    risk_score=95,
    detection_reasons=['Test detection']
)
```

### Verify in DynamoDB:
```bash
aws dynamodb query \
  --table-name ilminate-apex-quarantine \
  --region us-east-2 \
  --key-condition-expression "customerId = :cid AND #sk >= :start AND #sk <= :end" \
  --expression-attribute-names '{"#sk": "quarantineDate#messageId"}' \
  --expression-attribute-values '{
    ":cid": {"S": "ilminate.com"},
    ":start": {"S": "2025-01-01#"},
    ":end": {"S": "2025-01-31#~"}
  }'
```

## Common Mistakes to Avoid

1. ❌ **Wrong date format**: Using `isoformat()` includes time → `2025-01-15T14:30:00`
   - ✅ Use: `strftime('%Y-%m-%d')` → `2025-01-15`

2. ❌ **Wrong customer ID**: Using different format than API expects
   - ✅ Check what customer ID the API uses (check browser console)

3. ❌ **Missing `#` separator**: Sort key without `#` → `2025-01-15msg-abc123`
   - ✅ Must include: `2025-01-15#msg-abc123`

4. ❌ **Wrong region**: Writing to different region than API reads from
   - ✅ Both must use `us-east-2` (or same configured region)

## Configuration Checklist

- [ ] Table name matches: `ilminate-apex-quarantine`
- [ ] Region matches: `us-east-2`
- [ ] Sort key format: `YYYY-MM-DD#messageId`
- [ ] Customer ID matches API expectations
- [ ] Date uses `strftime('%Y-%m-%d')` not `isoformat()`
- [ ] Test write succeeds
- [ ] Test query returns the item

