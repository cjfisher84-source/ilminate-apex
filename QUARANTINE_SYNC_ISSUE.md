# Quarantine Messages Not Syncing - Issue Analysis

## Problem
100 test messages sent to `spam@ilminate.com` are not showing up in the quarantine portal.

## Root Cause
The mailbox protector (`apex_mailbox_protector.py`) only syncs messages to DynamoDB if they are **detected as malicious** (risk_score >= 0.5).

### Detection Logic
Messages are considered malicious if they contain:
- **Suspicious keywords** in subject/body: "urgent", "verify", "click here", "suspended", "expired", "password", "account", "phishing", "spam", "bitcoin", "crypto", "payment", "invoice", "payment due", "action required", "security alert", "microsoft", "office 365", "verify account", "unusual activity"
- **Suspicious sender domains**: `.tk`, `.ml`, `.ga`, `.cf`, `.gq`, `.xyz`, `.top`
- **Suspicious subdomain structure**: More than 2 dots in domain

**Threshold**: risk_score >= 0.5

## Solutions

### Option 1: Force Sync All Quarantine Messages (Quick Fix)
Use the `force_sync_quarantine.py` script to manually sync all messages from the APEX Quarantine folder:

```bash
# Set Microsoft 365 credentials
export TENANT_ID=your-tenant-id
export CLIENT_ID=your-client-id
export CLIENT_SECRET=your-client-secret

# Run force sync
python3 force_sync_quarantine.py
```

This will:
- Fetch all messages from the APEX Quarantine folder
- Sync them to DynamoDB with default risk score (75) and severity (HIGH)
- Works regardless of detection logic

### Option 2: Ensure Mailbox Protector is Running
The mailbox protector must be running to scan and quarantine messages:

```bash
cd /path/to/ilminate-agent/testing
./start_mailbox_protector.sh
```

Or run in background:
```bash
cd /path/to/ilminate-agent/testing
nohup ./venv/bin/python3 apex_mailbox_protector.py > mailbox_protector.log 2>&1 &
```

Check logs:
```bash
tail -f /path/to/ilminate-agent/testing/mailbox_protector.log
```

### Option 3: Make Detection More Aggressive (For Testing)
Modify `apex_mailbox_protector.py` to lower the threshold or add test mode:

```python
# In is_malicious() method, change threshold:
is_malicious = risk_score >= 0.3  # Lower threshold (was 0.5)

# Or add test mode:
TEST_MODE = os.getenv('TEST_MODE', 'false').lower() == 'true'
if TEST_MODE:
    is_malicious = True  # Quarantine all messages in test mode
```

### Option 4: Check if Messages Are Actually Quarantined
Verify messages are in the APEX Quarantine folder in Microsoft 365:
1. Log into Microsoft 365
2. Check `spam@ilminate.com` mailbox
3. Look for "APEX Quarantine" folder
4. Verify messages are there

## Verification Steps

1. **Check DynamoDB directly:**
```bash
./run_check_quarantine.sh
```

2. **Check mailbox protector logs:**
```bash
tail -f /path/to/ilminate-agent/testing/mailbox_protector.log | grep -E "(Quarantined|Synced|DynamoDB)"
```

3. **Check Microsoft 365 quarantine folder:**
- Log into Microsoft 365 admin portal
- Navigate to `spam@ilminate.com` mailbox
- Check "APEX Quarantine" folder

## Next Steps

1. **Immediate**: Run `force_sync_quarantine.py` to sync existing messages
2. **Short-term**: Ensure mailbox protector is running continuously
3. **Long-term**: Consider making detection logic configurable or adding a "sync all" mode

