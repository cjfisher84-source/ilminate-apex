# 🔐 Store Azure AD Credentials Guide

## Option 1: AWS Secrets Manager (Recommended for Production)

### Store Credentials

```bash
aws secretsmanager create-secret \
  --name apex-mailvault-azure-ad \
  --secret-string '{"clientId":"YOUR_CLIENT_ID","clientSecret":"YOUR_CLIENT_SECRET","tenantId":"YOUR_TENANT_ID","redirectUri":"https://apex.ilminate.com/api/auth/microsoft/callback"}' \
  --region us-east-1 \
  --profile ilminate-prod
```

### Update Existing Secret (if already exists)

```bash
aws secretsmanager update-secret \
  --secret-id apex-mailvault-azure-ad \
  --secret-string '{"clientId":"YOUR_CLIENT_ID","clientSecret":"YOUR_CLIENT_SECRET","tenantId":"YOUR_TENANT_ID","redirectUri":"https://apex.ilminate.com/api/auth/microsoft/callback"}' \
  --region us-east-1 \
  --profile ilminate-prod
```

### Verify Secret Stored

```bash
aws secretsmanager get-secret-value \
  --secret-id apex-mailvault-azure-ad \
  --region us-east-1 \
  --profile ilminate-prod \
  --query SecretString \
  --output text
```

---

## Option 2: AWS Amplify Environment Variables (Easier for Quick Setup)

### Via AWS Console

1. **Go to AWS Amplify Console**
   - Navigate to: https://console.aws.amazon.com/amplify/home?region=us-east-1#/dd8npjfuz7rfy
   - Click on your app: `ilminate-apex`

2. **Navigate to Environment Variables**
   - Click "Environment variables" in the left menu
   - Or go to: App settings → Environment variables

3. **Add Variables**
   Click "Manage variables" and add:

   ```
   AZURE_CLIENT_ID = YOUR_CLIENT_ID
   AZURE_CLIENT_SECRET = YOUR_CLIENT_SECRET
   AZURE_TENANT_ID = YOUR_TENANT_ID
   ```

4. **Save and Redeploy**
   - Click "Save"
   - Amplify will automatically trigger a new build

### Via AWS CLI

```bash
# Get current app ID
APP_ID="dd8npjfuz7rfy"

# Add environment variables
aws amplify update-app \
  --app-id $APP_ID \
  --environment-variables \
    AZURE_CLIENT_ID=YOUR_CLIENT_ID \
    AZURE_CLIENT_SECRET=YOUR_CLIENT_SECRET \
    AZURE_TENANT_ID=YOUR_TENANT_ID \
  --region us-east-1 \
  --profile ilminate-prod
```

---

## Option 3: Local Development (.env.local)

For local testing, create `.env.local`:

```bash
# Azure AD Credentials
AZURE_CLIENT_ID=YOUR_CLIENT_ID
AZURE_CLIENT_SECRET=YOUR_CLIENT_SECRET
AZURE_TENANT_ID=YOUR_TENANT_ID

# AWS Configuration
AWS_REGION=us-east-1
S3_BUCKET_NAME=ilminate-apex-raw
```

**Important:** Add `.env.local` to `.gitignore` to prevent committing secrets!

---

## How the Code Chooses Credentials

The `microsoftGraph.ts` client checks in this order:

1. **Environment Variables** (AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID)
   - Used if set (Amplify or local dev)

2. **AWS Secrets Manager** (`apex-mailvault-azure-ad`)
   - Fallback if environment variables not set
   - Requires IAM permissions to read secrets

---

## IAM Permissions Required

If using Secrets Manager, your Lambda/EC2/Amplify needs:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:us-east-1:657258631769:secret:apex-mailvault-azure-ad-*"
    }
  ]
}
```

---

## Recommended Approach

**For Production (Amplify):**
- ✅ Use **AWS Amplify Environment Variables** (easiest)
- ✅ No IAM permissions needed
- ✅ Easy to update via console
- ✅ Automatically available to all builds

**For EC2/Lambda:**
- ✅ Use **AWS Secrets Manager**
- ✅ Centralized secret management
- ✅ Automatic rotation support
- ✅ Audit logging

**For Local Development:**
- ✅ Use **.env.local** file
- ✅ Fast iteration
- ✅ No AWS access needed

---

## Verification

After storing credentials, test the integration:

1. Go to `/admin/messages`
2. Select "Microsoft 365" as mailbox type
3. Enter a recipient email
4. Search for messages

If you see real messages (not placeholder), credentials are working! ✅

