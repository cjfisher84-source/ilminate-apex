#!/usr/bin/env python3
"""
Force Sync Quarantine Messages to DynamoDB
This script manually syncs messages from Microsoft 365 to DynamoDB
Useful for testing or when mailbox protector isn't running
"""

import sys
import os

# Add ilminate-agent to path if needed
agent_path = os.path.join(os.path.dirname(__file__), '..', 'ilminate-agent', 'testing')
if os.path.exists(agent_path):
    sys.path.insert(0, agent_path)

try:
    import boto3
    from datetime import datetime
    import requests
    from msal import ConfidentialClientApplication
except ImportError as e:
    print(f"❌ Missing dependency: {e}")
    print("Install with: pip install boto3 requests msal")
    sys.exit(1)

# Configuration - Uses same values as mailbox protector
# Replace with your actual Azure AD credentials
TENANT_ID = os.getenv('TENANT_ID', 'YOUR_TENANT_ID')
CLIENT_ID = os.getenv('CLIENT_ID', 'YOUR_CLIENT_ID')
CLIENT_SECRET = os.getenv('CLIENT_SECRET', 'YOUR_CLIENT_SECRET')
TARGET_EMAIL = 'spam@ilminate.com'
CUSTOMER_ID = 'ilminate.com'

DYNAMODB_TABLE_NAME = 'ilminate-apex-quarantine'
DYNAMODB_REGION = 'us-east-2'

def get_access_token():
    """Get Microsoft Graph API access token"""
    authority = f'https://login.microsoftonline.com/{TENANT_ID}'
    app = ConfidentialClientApplication(
        client_id=CLIENT_ID,
        client_credential=CLIENT_SECRET,
        authority=authority
    )
    
    result = app.acquire_token_for_client(scopes=['https://graph.microsoft.com/.default'])
    return result.get('access_token')

def get_quarantine_folder_id(token, email):
    """Get APEX Quarantine folder ID"""
    headers = {'Authorization': f'Bearer {token}'}
    url = f'https://graph.microsoft.com/v1.0/users/{email}/mailFolders'
    
    # Try to find existing folder
    params = {'$filter': "displayName eq 'APEX Quarantine'"}
    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code == 200:
        folders = response.json().get('value', [])
        if folders:
            return folders[0]['id']
    
    return None

def get_quarantined_messages(token, email, limit=100):
    """Get messages from APEX Quarantine folder"""
    token = get_access_token()
    if not token:
        return []
    
    folder_id = get_quarantine_folder_id(token, email)
    if not folder_id:
        print("❌ Could not find APEX Quarantine folder")
        return []
    
    headers = {'Authorization': f'Bearer {token}'}
    url = f'https://graph.microsoft.com/v1.0/users/{email}/mailFolders/{folder_id}/messages'
    params = {
        '$top': limit,
        '$orderby': 'receivedDateTime desc',
        '$select': 'id,subject,from,receivedDateTime,bodyPreview,hasAttachments,toRecipients'
    }
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        return response.json().get('value', [])
    except Exception as e:
        print(f"❌ Error fetching messages: {e}")
        return []

def sync_message_to_dynamodb(message, dynamodb):
    """Sync a single message to DynamoDB"""
    try:
        email_id = message['id']
        subject = message.get('subject', 'No Subject')
        sender = message.get('from', {}).get('emailAddress', {})
        sender_email = sender.get('address', 'unknown@unknown.com')
        sender_name = sender.get('name', 'Unknown Sender')
        
        # Get recipients
        recipients = []
        for recipient in message.get('toRecipients', []):
            recipients.append(recipient.get('emailAddress', {}).get('address', ''))
        
        # Format date for sort key
        received_date = message.get('receivedDateTime', '')
        if received_date:
            date_str = received_date.split('T')[0]  # Extract YYYY-MM-DD
        else:
            date_str = datetime.now().strftime('%Y-%m-%d')
        
        sort_key = f'{date_str}#{email_id}'
        
        # Default values (since we're forcing sync)
        risk_score = 75  # Default risk score
        severity = 'HIGH'
        reasons = ['Manually synced from quarantine folder']
        
        # Create DynamoDB item
        item = {
            'customerId': {'S': CUSTOMER_ID},
            'quarantineDate#messageId': {'S': sort_key},
            'messageId': {'S': email_id},
            'subject': {'S': subject},
            'sender': {'S': sender_name},
            'senderEmail': {'S': sender_email},
            'recipients': {'L': [{'S': r} for r in recipients]} if recipients else {'L': []},
            'severity': {'S': severity},
            'riskScore': {'N': str(risk_score)},
            'detectionReasons': {'L': [{'S': r} for r in reasons]},
            'bodyPreview': {'S': message.get('bodyPreview', '')[:500]},
            'hasAttachments': {'BOOL': message.get('hasAttachments', False)},
            'status': {'S': 'quarantined'},
            'mailboxType': {'S': 'microsoft365'},
            'quarantineTimestamp': {'N': str(int(datetime.now().timestamp() * 1000))}
        }
        
        # Put item in DynamoDB
        dynamodb.put_item(
            TableName=DYNAMODB_TABLE_NAME,
            Item=item
        )
        
        return True
        
    except Exception as e:
        print(f"❌ Error syncing message {message.get('id', 'unknown')}: {e}")
        return False

def main():
    """Main function"""
    print("=" * 60)
    print("🔄 Force Syncing Quarantine Messages to DynamoDB")
    print("=" * 60)
    
    # Check environment variables
    if TENANT_ID == 'your-tenant-id' or not all([TENANT_ID, CLIENT_ID, CLIENT_SECRET]):
        print("❌ Missing Microsoft 365 credentials!")
        print("Set environment variables:")
        print("  export TENANT_ID=your-tenant-id")
        print("  export CLIENT_ID=your-client-id")
        print("  export CLIENT_SECRET=your-client-secret")
        return
    
    # Get access token
    print("🔐 Getting access token...")
    token = get_access_token()
    if not token:
        print("❌ Failed to get access token")
        return
    
    # Get messages from quarantine folder
    print(f"📧 Fetching messages from {TARGET_EMAIL}...")
    messages = get_quarantined_messages(token, TARGET_EMAIL, limit=200)
    
    if not messages:
        print("❌ No messages found in APEX Quarantine folder")
        print("Make sure:")
        print("  1. Messages are in the 'APEX Quarantine' folder")
        print("  2. Mailbox protector has quarantined them")
        print("  3. Folder exists and is accessible")
        return
    
    print(f"✅ Found {len(messages)} message(s) in quarantine folder")
    print()
    
    # Initialize DynamoDB
    dynamodb = boto3.client('dynamodb', region_name=DYNAMODB_REGION)
    
    # Sync each message
    synced = 0
    failed = 0
    
    print("🔄 Syncing to DynamoDB...")
    for i, message in enumerate(messages, 1):
        subject = message.get('subject', 'No Subject')
        print(f"  [{i}/{len(messages)}] {subject[:50]}...", end=' ')
        
        if sync_message_to_dynamodb(message, dynamodb):
            print("✅")
            synced += 1
        else:
            print("❌")
            failed += 1
    
    print()
    print("=" * 60)
    print(f"✅ Synced: {synced}")
    print(f"❌ Failed: {failed}")
    print("=" * 60)
    print()
    print("Now check the portal: https://apex.ilminate.com/quarantine")

if __name__ == '__main__':
    main()

