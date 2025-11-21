#!/bin/bash

# Create Cognito User for APEX
# User: spam@ilminate.com
# Password: BanksDad23032!

set -e

# Cognito Configuration
USER_POOL_ID="us-east-1_l1TLx7JDv"
REGION="us-east-1"
USER_EMAIL="spam@ilminate.com"
TEMP_PASSWORD="BanksDad23032!"

echo "🔐 Creating Cognito User: $USER_EMAIL"
echo "User Pool: $USER_POOL_ID"
echo "Region: $REGION"
echo ""

# Create the user
aws cognito-idp admin-create-user \
  --user-pool-id "$USER_POOL_ID" \
  --username "$USER_EMAIL" \
  --user-attributes Name=email,Value="$USER_EMAIL" Name=email_verified,Value=true \
  --temporary-password "$TEMP_PASSWORD" \
  --message-action SUPPRESS \
  --region "$REGION"

echo ""
echo "✅ User created successfully!"
echo ""
echo "📧 User Details:"
echo "   Email: $USER_EMAIL"
echo "   Temporary Password: $TEMP_PASSWORD"
echo ""
echo "⚠️  User must change password on first login"
echo ""
echo "To set permanent password (optional):"
echo "aws cognito-idp admin-set-user-password \\"
echo "  --user-pool-id $USER_POOL_ID \\"
echo "  --username $USER_EMAIL \\"
echo "  --password \"$TEMP_PASSWORD\" \\"
echo "  --permanent \\"
echo "  --region $REGION"

