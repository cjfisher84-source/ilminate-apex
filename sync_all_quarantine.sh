#!/bin/bash
# Quick script to sync all messages from APEX Quarantine folder to DynamoDB

echo "🔄 Syncing all quarantine messages to DynamoDB..."
echo ""

# Check if force_sync_quarantine.py exists
if [ ! -f "force_sync_quarantine.py" ]; then
    echo "❌ force_sync_quarantine.py not found"
    exit 1
fi

# Check for required environment variables
if [ -z "$TENANT_ID" ] || [ -z "$CLIENT_ID" ] || [ -z "$CLIENT_SECRET" ]; then
    echo "❌ Missing Microsoft 365 credentials!"
    echo ""
    echo "Set environment variables:"
    echo "  export TENANT_ID=your-tenant-id"
    echo "  export CLIENT_ID=your-client-id"
    echo "  export CLIENT_SECRET=your-client-secret"
    echo ""
    echo "Or create a .env file with:"
    echo "  TENANT_ID=your-tenant-id"
    echo "  CLIENT_ID=your-client-id"
    echo "  CLIENT_SECRET=your-client-secret"
    exit 1
fi

# Run the sync script
python3 force_sync_quarantine.py

