#!/bin/bash

# Script to store Azure AD credentials in AWS Secrets Manager
# Run this after setting up Azure AD app registration

echo "🔐 Storing Azure AD credentials in AWS Secrets Manager..."

# Replace YOUR_CLIENT_ID, YOUR_CLIENT_SECRET, and YOUR_TENANT_ID with actual values
aws secretsmanager create-secret \
  --name apex-mailvault-azure-ad \
  --secret-string "{\"clientId\":\"YOUR_CLIENT_ID\",\"clientSecret\":\"YOUR_CLIENT_SECRET\",\"tenantId\":\"YOUR_TENANT_ID\",\"redirectUri\":\"https://apex.ilminate.com/api/auth/microsoft/callback\"}" \
  --region us-east-1 \
  --profile ilminate-prod

echo "✅ Credentials stored successfully!"
echo ""
echo "Secret Name: apex-mailvault-azure-ad"
echo ""
echo "Note: Replace YOUR_CLIENT_ID, YOUR_CLIENT_SECRET, and YOUR_TENANT_ID with actual values before running this script."
echo "You can also set these as environment variables in AWS Amplify:"
echo "  AZURE_CLIENT_ID=YOUR_CLIENT_ID"
echo "  AZURE_CLIENT_SECRET=YOUR_CLIENT_SECRET"
echo "  AZURE_TENANT_ID=YOUR_TENANT_ID"

