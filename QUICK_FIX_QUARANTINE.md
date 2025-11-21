# Quick Fix: Sync Quarantine Messages to DynamoDB

## Problem
100 test messages sent to `spam@ilminate.com` are not showing up in the quarantine portal.

## Root Cause
The mailbox protector only syncs messages that are **detected as malicious** (risk_score >= 0.5). Test messages without suspicious keywords won't trigger detection.

## Solution: Force Sync All Quarantine Messages

### Step 1: Run the Force Sync Script

```bash
cd /Users/cfisher/Library/Mobile\ Documents/com~apple~CloudDocs/ilminate-apex
python3 force_sync_quarantine.py
```

This script will:
1. ✅ Connect to Microsoft 365 Graph API
2. ✅ Fetch all messages from the "APEX Quarantine" folder
3. ✅ Sync them to DynamoDB with default risk score (75) and severity (HIGH)
4. ✅ Works regardless of detection logic

### Step 2: Verify in Portal

After running the script, check:
```
https://apex.ilminate.com/quarantine
```

You should see all synced messages.

## Alternative: Make Detection More Aggressive

If you want the mailbox protector to sync more messages automatically, modify the detection threshold:

**File:** `/Users/cfisher/Library/Mobile Documents/com~apple~CloudDocs/ilminate-agent/testing/apex_mailbox_protector.py`

**Change line 186:**
```python
# OLD:
is_malicious = risk_score >= 0.5

# NEW (more aggressive):
is_malicious = risk_score >= 0.3  # Lower threshold
```

Or add a test mode:
```python
# Add at top of file:
TEST_MODE = os.getenv('TEST_MODE', 'false').lower() == 'true'

# Change line 186:
if TEST_MODE:
    is_malicious = True  # Quarantine all messages in test mode
else:
    is_malicious = risk_score >= 0.5
```

Then run with:
```bash
TEST_MODE=true python3 apex_mailbox_protector.py
```

## Check Current Status

```bash
# Check DynamoDB
./run_check_quarantine.sh

# Check mailbox protector logs (if running)
tail -f /path/to/ilminate-agent/testing/mailbox_protector.log
```

