# 🔐 APEX MailVault - Integration Guide

Complete step-by-step guide for integrating Microsoft Graph API and Gmail API into APEX MailVault.

---

## Part 1: Microsoft Graph API Integration

### Step 1: Azure AD App Registration

#### 1.1 Create Azure AD Application

1. **Go to Azure Portal**
   - Navigate to: https://portal.azure.com
   - Sign in with your Microsoft account

2. **Open Azure Active Directory**
   - Click "Azure Active Directory" in the left menu
   - Or search for "Azure AD" in the top search bar

3. **Register New Application**
   - Click "App registrations" in the left menu
   - Click "+ New registration"
   - Fill in:
     - **Name:** `APEX MailVault`
     - **Supported account types:** `Accounts in any organizational directory and personal Microsoft accounts`
     - **Redirect URI:** 
       - Platform: `Web`
       - URI: `https://apex.ilminate.com/api/auth/microsoft/callback`
   - Click "Register"

4. **Save Application Details**
   - Copy the **Application (client) ID** - you'll need this
   - Copy the **Directory (tenant) ID** - you'll need this
   - Note these down securely

#### 1.2 Configure API Permissions

1. **Navigate to API Permissions**
   - In your app registration, click "API permissions" in the left menu

2. **Add Microsoft Graph Permissions**
   - Click "+ Add a permission"
   - Select "Microsoft Graph"
   - Choose "Application permissions" (not Delegated)
   - Add these permissions:
     - `Mail.Read` - Read mail in all mailboxes
     - `Mail.ReadWrite` - Read and write mail in all mailboxes
     - `User.Read.All` - Read all users' profiles
   - Click "Add permissions"

3. **Grant Admin Consent**
   - Click "Grant admin consent for [Your Organization]"
   - Confirm the consent
   - Status should show "✓ Granted for [Your Organization]"

#### 1.3 Create Client Secret

1. **Navigate to Certificates & secrets**
   - In your app registration, click "Certificates & secrets" in the left menu

2. **Create New Secret**
   - Click "+ New client secret"
   - Description: `APEX MailVault Secret`
   - Expires: Choose expiration (recommend 24 months)
   - Click "Add"

3. **Copy Secret Value**
   - **IMPORTANT:** Copy the secret value immediately
   - You won't be able to see it again after leaving this page
   - Store it securely (we'll add it to AWS Secrets Manager)

#### 1.4 Store Credentials in AWS Secrets Manager

```bash
# Store Azure AD credentials in AWS Secrets Manager
aws secretsmanager create-secret \
  --name apex-mailvault-azure-ad \
  --secret-string '{
    "clientId": "YOUR_APPLICATION_CLIENT_ID",
    "clientSecret": "YOUR_CLIENT_SECRET_VALUE",
    "tenantId": "YOUR_TENANT_ID",
    "redirectUri": "https://apex.ilminate.com/api/auth/microsoft/callback"
  }' \
  --region us-east-1 \
  --profile ilminate-prod
```

---

### Step 2: Implement Microsoft Graph API Client

#### 2.1 Install Dependencies

```bash
cd ilminate-apex
npm install @azure/identity @microsoft/microsoft-graph-client
```

#### 2.2 Create Graph API Client Utility

Create `src/lib/microsoftGraph.ts`:

```typescript
import { ClientSecretCredential } from '@azure/identity'
import { Client } from '@microsoft/microsoft-graph-client'
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials'

interface AzureADConfig {
  clientId: string
  clientSecret: string
  tenantId: string
}

let graphClient: Client | null = null

/**
 * Get Microsoft Graph API client
 */
export async function getMicrosoftGraphClient(): Promise<Client> {
  if (graphClient) {
    return graphClient
  }

  // Get credentials from AWS Secrets Manager or environment variables
  const config = await getAzureADConfig()
  
  const credential = new ClientSecretCredential(
    config.tenantId,
    config.clientId,
    config.clientSecret
  )

  const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes: ['https://graph.microsoft.com/.default']
  })

  graphClient = Client.initWithMiddleware({ authProvider })
  return graphClient
}

/**
 * Get Azure AD configuration from Secrets Manager or env vars
 */
async function getAzureADConfig(): Promise<AzureADConfig> {
  // Try environment variables first (for local dev)
  if (process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET && process.env.AZURE_TENANT_ID) {
    return {
      clientId: process.env.AZURE_CLIENT_ID,
      clientSecret: process.env.AZURE_CLIENT_SECRET,
      tenantId: process.env.AZURE_TENANT_ID
    }
  }

  // Otherwise, fetch from AWS Secrets Manager
  const { SecretsManagerClient, GetSecretValueCommand } = await import('@aws-sdk/client-secrets-manager')
  const secretsClient = new SecretsManagerClient({ region: 'us-east-1' })
  
  const response = await secretsClient.send(
    new GetSecretValueCommand({ SecretId: 'apex-mailvault-azure-ad' })
  )
  
  return JSON.parse(response.SecretString || '{}')
}

/**
 * Search messages in a user's mailbox
 */
export async function searchMicrosoft365Messages(params: {
  userEmail: string
  subject?: string
  senderEmail?: string
  recipientEmail?: string
  keywords?: string
  dateFrom?: string
  dateTo?: string
  limit?: number
}): Promise<any[]> {
  const client = await getMicrosoftGraphClient()
  
  // Build OData filter query
  const filters: string[] = []
  
  if (params.subject) {
    filters.push(`contains(subject, '${params.subject}')`)
  }
  
  if (params.senderEmail) {
    filters.push(`from/emailAddress/address eq '${params.senderEmail}'`)
  }
  
  if (params.keywords) {
    filters.push(`contains(body/content, '${params.keywords}')`)
  }
  
  if (params.dateFrom) {
    filters.push(`receivedDateTime ge ${params.dateFrom}T00:00:00Z`)
  }
  
  if (params.dateTo) {
    filters.push(`receivedDateTime le ${params.dateTo}T23:59:59Z`)
  }
  
  const filterQuery = filters.length > 0 ? `$filter=${filters.join(' and ')}` : ''
  const limitQuery = params.limit ? `$top=${params.limit}` : '$top=100'
  const selectQuery = '$select=id,subject,sender,toRecipients,receivedDateTime,hasAttachments,bodyPreview,isRead'
  
  const query = `users/${params.userEmail}/messages?${filterQuery}&${limitQuery}&${selectQuery}&$orderby=receivedDateTime desc`
  
  try {
    const response = await client.api(query).get()
    return response.value || []
  } catch (error: any) {
    console.error('Microsoft Graph API error:', error)
    throw new Error(`Failed to search messages: ${error.message}`)
  }
}

/**
 * Get a specific message by ID
 */
export async function getMicrosoft365Message(userEmail: string, messageId: string): Promise<any> {
  const client = await getMicrosoftGraphClient()
  
  try {
    const message = await client
      .api(`users/${userEmail}/messages/${messageId}`)
      .get()
    
    return message
  } catch (error: any) {
    console.error('Microsoft Graph API error:', error)
    throw new Error(`Failed to get message: ${error.message}`)
  }
}

/**
 * Get message in .eml format
 */
export async function getMicrosoft365MessageEml(userEmail: string, messageId: string): Promise<string> {
  const client = await getMicrosoftGraphClient()
  
  try {
    const eml = await client
      .api(`users/${userEmail}/messages/${messageId}/$value`)
      .get()
    
    return eml
  } catch (error: any) {
    console.error('Microsoft Graph API error:', error)
    throw new Error(`Failed to get message EML: ${error.message}`)
  }
}

/**
 * List all users in the organization
 */
export async function listMicrosoft365Users(): Promise<any[]> {
  const client = await getMicrosoftGraphClient()
  
  try {
    const response = await client
      .api('/users')
      .select('id,mail,userPrincipalName,displayName')
      .get()
    
    return response.value || []
  } catch (error: any) {
    console.error('Microsoft Graph API error:', error)
    throw new Error(`Failed to list users: ${error.message}`)
  }
}
```

---

### Step 3: Update API Routes

Update `src/app/api/admin/messages/search/route.ts`:

```typescript
// Add import at top
import { searchMicrosoft365Messages } from '@/lib/microsoftGraph'

// Replace the placeholder function
async function searchMicrosoft365Mailboxes(params: {
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
    throw new Error('recipientEmail is required for Microsoft 365 search')
  }
  
  const messages = await searchMicrosoft365Messages({
    userEmail: params.recipientEmail,
    subject: params.subject,
    senderEmail: params.senderEmail,
    keywords: params.keywords,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    limit: params.limit
  })
  
  // Transform Graph API response to our format
  return messages.map(msg => ({
    messageId: msg.id,
    subject: msg.subject || '',
    senderEmail: msg.sender?.emailAddress?.address || '',
    recipientEmail: params.recipientEmail,
    receivedDateTime: msg.receivedDateTime,
    hasAttachments: msg.hasAttachments || false,
    isRead: msg.isRead || false,
    mailboxType: 'microsoft365',
    preview: msg.bodyPreview || ''
  }))
}
```

Update `src/app/api/admin/messages/retrieve/route.ts`:

```typescript
// Add import at top
import { getMicrosoft365MessageEml } from '@/lib/microsoftGraph'

// Replace the placeholder function
async function retrieveMicrosoft365Message(messageId: string): Promise<any> {
  // Note: You'll need to pass userEmail from the request
  // This is a simplified version - update based on your needs
  
  const userEmail = 'user@example.com' // Get from request params
  
  const eml = await getMicrosoft365MessageEml(userEmail, messageId)
  
  return {
    messageId,
    mailboxType: 'microsoft365',
    retrieved: true,
    retrievedAt: new Date().toISOString(),
    rawMessage: eml
  }
}
```

---

## Part 2: Gmail API Integration

### Step 1: Google Cloud Project Setup

#### 1.1 Create Google Cloud Project

1. **Go to Google Cloud Console**
   - Navigate to: https://console.cloud.google.com
   - Sign in with your Google account

2. **Create New Project**
   - Click the project dropdown at the top
   - Click "New Project"
   - Project name: `APEX MailVault`
   - Organization: Select your organization (if applicable)
   - Click "Create"

3. **Select the Project**
   - Make sure the new project is selected in the project dropdown

#### 1.2 Enable Gmail API

1. **Navigate to APIs & Services**
   - Click "APIs & Services" → "Library" in the left menu

2. **Enable Gmail API**
   - Search for "Gmail API"
   - Click on "Gmail API"
   - Click "Enable"

#### 1.3 Create Service Account

1. **Navigate to Service Accounts**
   - Click "APIs & Services" → "Credentials" in the left menu
   - Click "Create Credentials" → "Service account"

2. **Create Service Account**
   - Service account name: `apex-mailvault-service`
   - Service account ID: `apex-mailvault-service` (auto-generated)
   - Description: `Service account for APEX MailVault Gmail API access`
   - Click "Create and Continue"

3. **Grant Roles** (Optional)
   - For now, you can skip roles
   - Click "Continue" → "Done"

4. **Create Key**
   - Click on the service account you just created
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Choose "JSON"
   - Click "Create"
   - **IMPORTANT:** Download the JSON key file - you'll need this

#### 1.4 Enable Domain-Wide Delegation

1. **Enable Domain-Wide Delegation**
   - In the service account details page
   - Check "Enable Google Workspace Domain-wide Delegation"
   - Note the **Client ID** (you'll need this)

2. **Authorize in Google Workspace Admin Console**
   - Go to: https://admin.google.com
   - Navigate to: Security → API Controls → Domain-wide Delegation
   - Click "Add new"
   - Client ID: Enter the Client ID from step 1
   - OAuth scopes (comma-separated):
     ```
     https://www.googleapis.com/auth/gmail.readonly,https://www.googleapis.com/auth/gmail.modify
     ```
   - Click "Authorize"

#### 1.5 Store Credentials in AWS Secrets Manager

```bash
# Store Gmail service account credentials in AWS Secrets Manager
aws secretsmanager create-secret \
  --name apex-mailvault-gmail-service-account \
  --secret-string file://path/to/your/service-account-key.json \
  --region us-east-1 \
  --profile ilminate-prod
```

---

### Step 2: Implement Gmail API Client

#### 2.1 Install Dependencies

```bash
npm install googleapis
```

#### 2.2 Create Gmail API Client Utility

Create `src/lib/gmailApi.ts`:

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
  const gmail = await getGmailClient()
  
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
    // Use domain-wide delegation to impersonate the user
    const auth = new JWT({
      email: (await getGmailCredentials()).client_email,
      key: (await getGmailCredentials()).private_key,
      scopes: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.modify'
      ],
      subject: params.userEmail // Impersonate the user
    })
    
    const gmailWithUser = google.gmail({ version: 'v1', auth })
    
    const response = await gmailWithUser.users.messages.list({
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

### Step 3: Update API Routes

Update `src/app/api/admin/messages/search/route.ts`:

```typescript
// Add import at top
import { searchGmailMessages } from '@/lib/gmailApi'

// Replace the placeholder function
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

Update `src/app/api/admin/messages/retrieve/route.ts`:

```typescript
// Add import at top
import { getGmailMessageEml } from '@/lib/gmailApi'

// Replace the placeholder function
async function retrieveGoogleWorkspaceMessage(messageId: string): Promise<any> {
  // Note: You'll need to pass userEmail from the request
  const userEmail = 'user@example.com' // Get from request params
  
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

## Step 4: Environment Variables

Add to your `.env` file or AWS Amplify environment variables:

```bash
# Microsoft Graph API (Optional - can use Secrets Manager instead)
AZURE_CLIENT_ID=your_client_id
AZURE_CLIENT_SECRET=your_client_secret
AZURE_TENANT_ID=your_tenant_id

# Gmail API (Optional - can use Secrets Manager instead)
GMAIL_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# AWS Configuration
AWS_REGION=us-east-1
S3_BUCKET_NAME=ilminate-apex-raw
```

---

## Step 5: Testing

### Test Microsoft Graph API

```bash
# Test search endpoint
curl -X POST https://apex.ilminate.com/api/admin/messages/search \
  -H "Content-Type: application/json" \
  -H "x-user-email: cfisher@ilminate.com" \
  -H "x-customer-id: ilminate.com" \
  -d '{
    "mailboxType": "microsoft365",
    "recipientEmail": "user@company.com",
    "subject": "test",
    "limit": 10
  }'
```

### Test Gmail API

```bash
# Test search endpoint
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

### Microsoft Graph API Issues

**Error: "Insufficient privileges"**
- Check that admin consent was granted for all permissions
- Verify permissions are "Application permissions" not "Delegated"

**Error: "Invalid client secret"**
- Verify client secret is correct
- Check if secret has expired

**Error: "User not found"**
- Verify user email exists in the organization
- Check user has a mailbox

### Gmail API Issues

**Error: "Insufficient Permission"**
- Verify domain-wide delegation is enabled
- Check OAuth scopes are authorized in Google Workspace Admin Console
- Ensure service account has correct Client ID

**Error: "User not found"**
- Verify user email exists in Google Workspace
- Check user has Gmail enabled

**Error: "Rate limit exceeded"**
- Gmail API has rate limits (250 quota units per user per second)
- Implement exponential backoff for retries

---

## Security Best Practices

1. **Never commit credentials to Git**
   - Use AWS Secrets Manager
   - Use environment variables for local development

2. **Rotate secrets regularly**
   - Set expiration dates on Azure AD client secrets
   - Rotate Gmail service account keys periodically

3. **Limit permissions**
   - Only grant minimum required permissions
   - Use read-only permissions when possible

4. **Monitor API usage**
   - Set up alerts for unusual API activity
   - Track API quota usage

5. **Audit access**
   - Log all search and retrieval operations
   - Track which admins accessed which messages

---

## Next Steps After Integration

1. **Test thoroughly**
   - Test search with various criteria
   - Test retrieval functionality
   - Verify S3 storage works

2. **Add error handling**
   - Handle rate limits gracefully
   - Add retry logic with exponential backoff
   - Provide user-friendly error messages

3. **Add monitoring**
   - Track API usage and costs
   - Monitor for errors
   - Set up alerts

4. **Optimize performance**
   - Implement pagination for large result sets
   - Cache frequently accessed data
   - Optimize API calls

---

**Status:** Ready for implementation! Follow these steps to integrate both APIs into APEX MailVault.

