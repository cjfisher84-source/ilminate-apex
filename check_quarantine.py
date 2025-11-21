#!/usr/bin/env python3
"""
Check Quarantine Messages in DynamoDB
Quick script to verify quarantine messages are being stored correctly

Requirements:
    pip install boto3

Or use AWS CLI instead:
    unset AWS_PROFILE && aws dynamodb scan --table-name ilminate-apex-quarantine --region us-east-2 --limit 5
"""

import sys

try:
    import boto3
    from datetime import datetime, timedelta
except ImportError:
    print("❌ boto3 not installed. Install with:")
    print("   pip install boto3")
    print()
    print("Or use AWS CLI instead:")
    print("   unset AWS_PROFILE && aws dynamodb scan --table-name ilminate-apex-quarantine --region us-east-2 --limit 5")
    sys.exit(1)

# Configuration
TABLE_NAME = 'ilminate-apex-quarantine'
REGION = 'us-east-2'
CUSTOMER_ID = 'ilminate.com'  # Change if needed

def get_quarantine_messages(customer_id: str = CUSTOMER_ID, days: int = 30, limit: int = 10):
    """Query quarantine messages from DynamoDB"""
    
    # Initialize DynamoDB client
    dynamodb = boto3.client('dynamodb', region_name=REGION)
    
    # Calculate date range
    cutoff_date = datetime.now() - timedelta(days=days)
    cutoff_date_str = cutoff_date.strftime('%Y-%m-%d')
    today_str = datetime.now().strftime('%Y-%m-%d')
    
    try:
        # Query messages
        response = dynamodb.query(
            TableName=TABLE_NAME,
            KeyConditionExpression='customerId = :cid AND #sk BETWEEN :start AND :end',
            ExpressionAttributeNames={
                '#sk': 'quarantineDate#messageId'
            },
            ExpressionAttributeValues={
                ':cid': {'S': customer_id},
                ':start': {'S': f'{cutoff_date_str}#'},
                ':end': {'S': f'{today_str}#~'}
            },
            ScanIndexForward=False,  # Newest first
            Limit=limit
        )
        
        return response.get('Items', [])
    
    except Exception as e:
        print(f"❌ Error querying DynamoDB: {e}")
        return []

def format_message(item):
    """Format DynamoDB item to readable format"""
    # Extract sort key parts
    sort_key = item.get('quarantineDate#messageId', {}).get('S', '')
    date_part = sort_key.split('#')[0] if '#' in sort_key else ''
    
    return {
        'messageId': item.get('messageId', {}).get('S', ''),
        'date': date_part,
        'subject': item.get('subject', {}).get('S', ''),
        'sender': item.get('sender', {}).get('S', ''),
        'senderEmail': item.get('senderEmail', {}).get('S', ''),
        'severity': item.get('severity', {}).get('S', ''),
        'riskScore': int(item.get('riskScore', {}).get('N', '0')),
        'status': item.get('status', {}).get('S', ''),
        'timestamp': int(item.get('quarantineTimestamp', {}).get('N', '0')),
    }

def main():
    """Main function"""
    print("=" * 60)
    print("🔍 Checking Quarantine Messages in DynamoDB")
    print("=" * 60)
    print(f"Table: {TABLE_NAME}")
    print(f"Region: {REGION}")
    print(f"Customer ID: {CUSTOMER_ID}")
    print()
    
    # Query messages
    messages = get_quarantine_messages(customer_id=CUSTOMER_ID, days=30, limit=20)
    
    if not messages:
        print("❌ No messages found")
        print()
        print("Possible reasons:")
        print("  1. No messages have been quarantined yet")
        print("  2. Customer ID mismatch (check what ilminate-agent is using)")
        print("  3. Messages are older than 30 days")
        print()
        print("To check all messages (any customer):")
        print(f"  aws dynamodb scan --table-name {TABLE_NAME} --region {REGION} --limit 5")
        return
    
    print(f"✅ Found {len(messages)} quarantine message(s)")
    print()
    
    # Display messages
    for i, item in enumerate(messages, 1):
        msg = format_message(item)
        timestamp = datetime.fromtimestamp(msg['timestamp'] / 1000) if msg['timestamp'] else None
        
        print(f"Message {i}:")
        print(f"  ID: {msg['messageId']}")
        print(f"  Subject: {msg['subject']}")
        print(f"  From: {msg['sender']} <{msg['senderEmail']}>")
        print(f"  Severity: {msg['severity']}")
        print(f"  Risk Score: {msg['riskScore']}/100")
        print(f"  Date: {msg['date']}")
        if timestamp:
            print(f"  Timestamp: {timestamp.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"  Status: {msg['status']}")
        print()
    
    # Summary
    severity_counts = {}
    for item in messages:
        severity = item.get('severity', {}).get('S', 'UNKNOWN')
        severity_counts[severity] = severity_counts.get(severity, 0) + 1
    
    print("Summary:")
    for severity, count in sorted(severity_counts.items()):
        print(f"  {severity}: {count}")

if __name__ == '__main__':
    main()
