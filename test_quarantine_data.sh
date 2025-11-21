#!/bin/bash
# Test script to add a sample quarantine message to DynamoDB

# Configuration
TABLE_NAME="ilminate-apex-quarantine"
REGION="us-east-2"
CUSTOMER_ID="ilminate.com"  # Change this to match your customer ID
MESSAGE_ID="test-msg-$(date +%s)"
DATE=$(date +%Y-%m-%d)
SORT_KEY="${DATE}#${MESSAGE_ID}"

echo "Adding test quarantine message..."
echo "Customer ID: $CUSTOMER_ID"
echo "Sort Key: $SORT_KEY"
echo ""

aws dynamodb put-item \
  --table-name "$TABLE_NAME" \
  --region "$REGION" \
  --item "{
    \"customerId\": {\"S\": \"$CUSTOMER_ID\"},
    \"quarantineDate#messageId\": {\"S\": \"$SORT_KEY\"},
    \"messageId\": {\"S\": \"$MESSAGE_ID\"},
    \"subject\": {\"S\": \"Test Quarantine Message\"},
    \"sender\": {\"S\": \"Test Sender\"},
    \"senderEmail\": {\"S\": \"test@example.com\"},
    \"recipients\": {\"L\": [{\"S\": \"user@company.com\"}]},
    \"quarantineTimestamp\": {\"N\": \"$(date +%s)000\"},
    \"riskScore\": {\"N\": \"95\"},
    \"severity\": {\"S\": \"CRITICAL\"},
    \"detectionReasons\": {\"L\": [{\"S\": \"Test detection\"}]},
    \"bodyPreview\": {\"S\": \"This is a test quarantine message to verify the API is working correctly.\"},
    \"status\": {\"S\": \"quarantined\"},
    \"mailboxType\": {\"S\": \"microsoft365\"}
  }"

echo ""
echo "✅ Test message added!"
echo ""
echo "Now query it back:"
aws dynamodb query \
  --table-name "$TABLE_NAME" \
  --region "$REGION" \
  --key-condition-expression "customerId = :cid AND #sk >= :start AND #sk <= :end" \
  --expression-attribute-names '{"#sk": "quarantineDate#messageId"}' \
  --expression-attribute-values "{
    \":cid\": {\"S\": \"$CUSTOMER_ID\"},
    \":start\": {\"S\": \"$DATE#\"},
    \":end\": {\"S\": \"$DATE#~\"}
  }"

