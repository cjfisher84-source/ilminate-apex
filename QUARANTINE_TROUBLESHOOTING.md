# Quarantine Messages Not Showing - Troubleshooting Guide

## Issue Fixed

The query logic was using `begins_with()` which only matched messages from the exact cutoff date, not the full date range. This has been fixed to use a proper date range query with `>=` and `<=` operators.

## What Was Changed

1. **Switched from Scan to Query**: More efficient and uses partition key properly
2. **Fixed date range filtering**: Now uses `>= cutoffDate#` and `<= todayDate#~` to match all dates in range
3. **Added ExpressionAttributeNames**: Properly handles attribute names with special characters (`#`)

## Verification Steps

### 1. Check Table Name and Region

Verify these match what ilminate-agent is using:

```bash
# Check environment variables
echo $DYNAMODB_TABLE_NAME
echo $DYNAMODB_REGION

# Or check Amplify console → Environment variables
```

**Expected:**
- Table: `ilminate-apex-quarantine` (or your configured name)
- Region: `us-east-2` (or your configured region)

### 2. Verify Table Exists and Has Data

```bash
# List tables in region
aws dynamodb list-tables --region us-east-2

# Check item count
aws dynamodb describe-table \
  --table-name ilminate-apex-quarantine \
  --region us-east-2 \
  --query 'Table.ItemCount'

# Scan a few items to verify structure
aws dynamodb scan \
  --table-name ilminate-apex-quarantine \
  --region us-east-2 \
  --limit 5
```

### 3. Verify Customer ID Format

Check what `customerId` value is being used:

```bash
# Check browser console on quarantine page
# Look for: "Quarantine query: Found X items for customer Y"

# Or check API response
curl https://apex.ilminate.com/api/quarantine/list \
  -H "x-customer-id: YOUR_CUSTOMER_ID"
```

**Important**: The `customerId` in the API request must match the `customerId` in DynamoDB items exactly.

### 4. Verify Sort Key Format

The sort key should be in format: `YYYY-MM-DD#messageId`

Example: `2025-01-15#msg-abc123`

Check an actual item:
```bash
aws dynamodb get-item \
  --table-name ilminate-apex-quarantine \
  --key '{"customerId": {"S": "YOUR_CUSTOMER_ID"}, "quarantineDate#messageId": {"S": "2025-01-15#msg-abc123"}}' \
  --region us-east-2
```

### 5. Check API Logs

Look for these log messages in your deployment logs:

```
Quarantine query: Found X items for customer Y in table Z (region: R)
```

If you see `Found 0 items`, check:
- Table name matches
- Region matches  
- Customer ID matches
- Sort key format is correct

### 6. Test Query Directly

Test the query with AWS CLI:

```bash
aws dynamodb query \
  --table-name ilminate-apex-quarantine \
  --region us-east-2 \
  --key-condition-expression "customerId = :customerId AND #sortKey >= :cutoff AND #sortKey <= :today" \
  --expression-attribute-names '{"#sortKey": "quarantineDate#messageId"}' \
  --expression-attribute-values '{
    ":customerId": {"S": "YOUR_CUSTOMER_ID"},
    ":cutoff": {"S": "2025-01-01#"},
    ":today": {"S": "2025-01-31#~"}
  }'
```

## Common Issues

### Issue: Table Not Found
**Error**: `ResourceNotFoundException`

**Solution**: 
- Verify table name in environment variables
- Check region matches
- Ensure table exists in that region

### Issue: Wrong Customer ID
**Symptom**: Query returns 0 items but table has data

**Solution**:
- Check what customerId ilminate-agent is writing
- Check what customerId the API is receiving
- Ensure they match exactly (case-sensitive)

### Issue: Wrong Sort Key Format
**Symptom**: Query returns 0 items but Scan shows data

**Solution**:
- Verify sort key format is `YYYY-MM-DD#messageId`
- Check date format matches (YYYY-MM-DD, not YYYY/MM/DD)
- Ensure `#` separator is present

### Issue: Region Mismatch
**Symptom**: Table exists but query returns 0 items

**Solution**:
- Verify `DYNAMODB_REGION` matches table region
- Check ilminate-agent is writing to same region
- Default is now `us-east-2` (was `us-east-1`)

## Debugging Code

Add this to `/api/quarantine/list/route.ts` for more debugging:

```typescript
console.log('Quarantine API Debug:', {
  customerId,
  table: TABLES.QUARANTINED_MESSAGES,
  region: REGION,
  showMockData,
  queryParams: {
    severity,
    days,
    searchTerm,
  }
})
```

## Next Steps

1. **Deploy the fix** - The updated query logic should now work
2. **Check logs** - Look for the "Quarantine query: Found X items" message
3. **Verify data** - Ensure ilminate-agent is writing with correct format
4. **Test query** - Use AWS CLI to test query directly

If messages still don't show up after this fix, check:
- Table name and region configuration
- Customer ID matching
- Sort key format in DynamoDB items

