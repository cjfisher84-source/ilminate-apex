# 📧 Gmail API Setup Guide for APEX MailVault

Complete step-by-step instructions for integrating Google Workspace/Gmail API.

---

## Part 1: Google Cloud Project Setup

### Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**
   - Navigate to: https://console.cloud.google.com
   - Sign in with your Google account

2. **Create New Project**
   - Click the project dropdown at the top
   - Click "New Project"
   - **Project name:** `APEX MailVault`
   - **Organization:** Select your organization (if applicable)
   - Click "Create"

3. **Select the Project**
   - Make sure the new project is selected in the project dropdown

---

### Step 2: Enable Gmail API

1. **Navigate to APIs & Services**
   - Click "APIs & Services" → "Library" in the left menu

2. **Enable Gmail API**
   - Search for "Gmail API"
   - Click on "Gmail API"
   - Click "Enable"

---

### Step 3: Create Service Account

1. **Navigate to Service Accounts**
   - Click "APIs & Services" → "Credentials" in the left menu
   - Click "Create Credentials" → "Service account"

2. **Create Service Account**
   - **Service account name:** `apex-mailvault-service`
   - **Service account ID:** `apex-mailvault-service` (auto-generated)
   - **Description:** `Service account for APEX MailVault Gmail API access`
   - Click "Create and Continue"

3. **Grant Roles** (Skip This Step)
   - **IMPORTANT:** For Gmail API with domain-wide delegation, you do NOT need to grant IAM roles
   - The domain-wide delegation handles authorization to access user mailboxes
   - Click "Skip" or "Continue" without selecting any roles
   - Click "Done"
   
   **Why skip roles?**
   - Domain-wide delegation allows the service account to impersonate users
   - IAM roles are for accessing Google Cloud resources (not needed for Gmail API)
   - The OAuth scopes in Google Workspace Admin provide the necessary permissions

4. **Create Key**
   - Click on the service account you just created
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Choose "JSON"
   - Click "Create"
   - **IMPORTANT:** Download the JSON key file - you'll need this!

---

### Step 4: Enable Domain-Wide Delegation

1. **Enable Domain-Wide Delegation**
   - In the service account details page
   - Check "Enable Google Workspace Domain-wide Delegation"
   - **Note the Client ID** (you'll need this - it's a long number)

2. **Authorize in Google Workspace Admin Console**
   - Go to: https://admin.google.com
   - Navigate to: **Security** → **API Controls** → **Domain-wide Delegation**
   - Click "Add new"
   - **Client ID:** Enter the Client ID from step 1 (the long number)
   - **OAuth scopes** (comma-separated):
     ```
     https://www.googleapis.com/auth/gmail.readonly,https://www.googleapis.com/auth/gmail.modify
     ```
   - Click "Authorize"

---

## Part 2: Store Credentials

### Option A: AWS Secrets Manager (Recommended for Production)

```bash
# Store Gmail service account credentials in AWS Secrets Manager
aws secretsmanager create-secret \
  --name apex-mailvault-gmail-service-account \
  --secret-string file://path/to/your/service-account-key.json \
  --region us-east-1 \
  --profile ilminate-prod
```

**Or manually create secret with JSON content:**

```bash
aws secretsmanager create-secret \
  --name apex-mailvault-gmail-service-account \
  --secret-string '{"type":"service_account","project_id":"your-project-id",...}' \
  --region us-east-1 \
  --profile ilminate-prod
```

### Option B: AWS Amplify Environment Variables

1. **Go to AWS Amplify Console**
   - Navigate to: https://console.aws.amazon.com/amplify/home?region=us-east-1#/dd8npjfuz7rfy
   - Click "Environment variables"

2. **Add Variable**
   - Variable name: `GMAIL_SERVICE_ACCOUNT_KEY`
   - Variable value: Paste the entire JSON content from the service account key file
   - Click "Save"

**Note:** The JSON value should be on a single line or properly escaped.

---

## Part 3: Install Dependencies

```bash
cd ilminate-apex
npm install googleapis
```

---

## Part 4: Implementation Status

### ✅ What's Ready

- Code structure is ready in `src/lib/gmailApi.ts` (placeholder)
- API routes are ready to use Gmail API
- Integration guide exists

### ⏳ What Needs Implementation

The Gmail API client code needs to be implemented. Here's what needs to be added:

**File:** `src/lib/gmailApi.ts`

```typescript
import { google } from 'googleapis'
import { JWT } from 'google-auth-library'

let gmailClient: any = null

/**
 * Get Gmail API client
 */
export async function getGmailClient(): Promise<any> {
  if (gmailClient) {
    return gmailClient
  }

  const credentials = await getGmailCredentials()
  
  const auth = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify'
    ],
    subject: undefined // Use service account directly
  })

  gmailClient = google.gmail({ version: 'v1', auth })
  return gmailClient
}

/**
 * Get Gmail credentials from Secrets Manager or env vars
 */
async function getGmailCredentials(): Promise<any> {
  // Try environment variable first (for local dev)
  if (process.env.GMAIL_SERVICE_ACCOUNT_KEY) {
    return JSON.parse(process.env.GMAIL_SERVICE_ACCOUNT_KEY)
  }

  // Otherwise, fetch from AWS Secrets Manager
  const { SecretsManagerClient, GetSecretValueCommand } = await import('@aws-sdk/client-secrets-manager')
  const secretsClient = new SecretsManagerClient({ region: 'us-east-1' })
  
  const response = await secretsClient.send(
    new GetSecretValueCommand({ SecretId: 'apex-mailvault-gmail-service-account' })
  )
  
  return JSON.parse(response.SecretString || '{}')
}

/**
 * Search messages in a user's mailbox
 */
export async function searchGmailMessages(params: {
  userEmail: string
  subject?: string
  senderEmail?: string
  recipientEmail?: string
  keywords?: string
  dateFrom?: string
  dateTo?: string
  limit?: number
}): Promise<any[]> {
  const credentials = await getGmailCredentials()
  
  const auth = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify'
    ],
    subject: params.userEmail // Impersonate the user
  })
  
  const gmail = google.gmail({ version: 'v1', auth })
  
  // Build Gmail search query
  const queryParts: string[] = []
  
  if (params.subject) {
    queryParts.push(`subject:"${params.subject}"`)
  }
  
  if (params.senderEmail) {
    queryParts.push(`from:${params.senderEmail}`)
  }
  
  if (params.keywords) {
    queryParts.push(params.keywords)
  }
  
  if (params.dateFrom) {
    queryParts.push(`after:${params.dateFrom.replace(/-/g, '/')}`)
  }
  
  if (params.dateTo) {
    queryParts.push(`before:${params.dateTo.replace(/-/g, '/')}`)
  }
  
  const query = queryParts.join(' ')
  
  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: params.limit || 100
    })
    
    const messageIds = response.data.messages?.map(m => m.id) || []
    
    // Fetch full message details
    const messages = await Promise.all(
      messageIds.map(id => getGmailMessage(params.userEmail, id))
    )
    
    return messages
  } catch (error: any) {
    console.error('Gmail API error:', error)
    throw new Error(`Failed to search messages: ${error.message}`)
  }
}

/**
 * Get a specific message by ID
 */
export async function getGmailMessage(userEmail: string, messageId: string): Promise<any> {
  const credentials = await getGmailCredentials()
  
  const auth = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify'
    ],
    subject: userEmail // Impersonate the user
  })
  
  const gmail = google.gmail({ version: 'v1', auth })
  
  try {
    const response = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full'
    })
    
    const message = response.data
    
    // Extract email details
    const headers = message.payload?.headers || []
    const getHeader = (name: string) => headers.find((h: any) => h.name === name)?.value || ''
    
    return {
      messageId: message.id,
      subject: getHeader('Subject'),
      senderEmail: getHeader('From'),
      recipientEmail: getHeader('To'),
      receivedDateTime: getHeader('Date'),
      hasAttachments: (message.payload?.parts || []).some((p: any) => p.filename),
      mailboxType: 'google_workspace',
      preview: message.snippet || ''
    }
  } catch (error: any) {
    console.error('Gmail API error:', error)
    throw new Error(`Failed to get message: ${error.message}`)
  }
}

/**
 * Get message in .eml format
 */
export async function getGmailMessageEml(userEmail: string, messageId: string): Promise<string> {
  const credentials = await getGmailCredentials()
  
  const auth = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify'
    ],
    subject: userEmail // Impersonate the user
  })
  
  const gmail = google.gmail({ version: 'v1', auth })
  
  try {
    const response = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'raw'
    })
    
    // Decode base64url to get .eml content
    const raw = response.data.raw
    if (!raw) {
      throw new Error('No raw message data')
    }
    
    // Convert base64url to buffer, then to string
    const buffer = Buffer.from(raw.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
    return buffer.toString('utf-8')
  } catch (error: any) {
    console.error('Gmail API error:', error)
    throw new Error(`Failed to get message EML: ${error.message}`)
  }
}
```

---

## Part 5: Update API Routes

Once `gmailApi.ts` is implemented, update:

**File:** `src/app/api/admin/messages/search/route.ts`

```typescript
import { searchGmailMessages } from '@/lib/gmailApi'

// Replace searchGoogleWorkspaceMailboxes function
async function searchGoogleWorkspaceMailboxes(params: {
  customerId: string
  subject?: string
  messageId?: string
  senderEmail?: string
  recipientEmail?: string
  dateFrom?: string
  dateTo?: string
  keywords?: string
  limit: number
}): Promise<any[]> {
  if (!params.recipientEmail) {
    throw new Error('recipientEmail is required for Google Workspace search')
  }
  
  const messages = await searchGmailMessages({
    userEmail: params.recipientEmail,
    subject: params.subject,
    senderEmail: params.senderEmail,
    keywords: params.keywords,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    limit: params.limit
  })
  
  return messages
}
```

**File:** `src/app/api/admin/messages/retrieve/route.ts`

```typescript
import { getGmailMessageEml } from '@/lib/gmailApi'

// Replace retrieveGoogleWorkspaceMessage function
async function retrieveGoogleWorkspaceMessage(userEmail: string, messageId: string): Promise<any> {
  const eml = await getGmailMessageEml(userEmail, messageId)
  
  return {
    messageId,
    mailboxType: 'google_workspace',
    retrieved: true,
    retrievedAt: new Date().toISOString(),
    rawMessage: eml
  }
}
```

---

## Part 6: Testing

### Test Gmail API Search

```bash
curl -X POST https://apex.ilminate.com/api/admin/messages/search \
  -H "Content-Type: application/json" \
  -H "x-user-email: cfisher@ilminate.com" \
  -H "x-customer-id: ilminate.com" \
  -d '{
    "mailboxType": "google_workspace",
    "recipientEmail": "user@company.com",
    "subject": "test",
    "limit": 10
  }'
```

---

## Troubleshooting

### Error: "Insufficient Permission"

**Solution:**
- Verify domain-wide delegation is enabled for the service account
- Check OAuth scopes are authorized in Google Workspace Admin Console
- Ensure service account Client ID matches what's authorized

### Error: "User not found"

**Solution:**
- Verify user email exists in Google Workspace
- Check user has Gmail enabled
- Ensure you're using the full email address (user@domain.com)

### Error: "Rate limit exceeded"

**Solution:**
- Gmail API has rate limits (250 quota units per user per second)
- Implement exponential backoff for retries
- Consider caching frequently accessed data

---

## Security Best Practices

1. **Never commit credentials to Git**
   - Use AWS Secrets Manager or environment variables
   - Add `.json` key files to `.gitignore`

2. **Rotate keys regularly**
   - Rotate service account keys periodically
   - Update credentials in Secrets Manager/Amplify

3. **Limit permissions**
   - Only grant minimum required scopes
   - Use read-only permissions when possible

4. **Monitor API usage**
   - Set up alerts for unusual API activity
   - Track API quota usage

---

## Quick Checklist

- [ ] Google Cloud project created
- [ ] Gmail API enabled
- [ ] Service account created
- [ ] JSON key file downloaded
- [ ] Domain-wide delegation enabled
- [ ] Client ID noted
- [ ] Authorized in Google Workspace Admin Console
- [ ] Credentials stored in AWS Secrets Manager or Amplify
- [ ] `googleapis` package installed
- [ ] Gmail API client code implemented
- [ ] API routes updated
- [ ] Tested search functionality
- [ ] Tested retrieve functionality

---

## Next Steps

1. **Complete Google Cloud setup** (Steps 1-4 above)
2. **Store credentials** (Secrets Manager or Amplify)
3. **Implement Gmail API client** (code provided above)
4. **Update API routes** (code provided above)
5. **Test integration** (use curl command above)

---

**Status:** Setup instructions complete. Ready to implement Gmail API integration! 🚀

