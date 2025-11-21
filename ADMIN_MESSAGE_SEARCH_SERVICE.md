# Admin Message Search & Retrieval Service

## Overview

This service allows administrators to search for delivered messages in user mailboxes and retrieve them for analysis, investigation, or archival purposes. Messages can be searched by various attributes (subject, message ID, sender, recipient, keywords) and retrieved either individually or in bulk.

---

## Features

### ✅ Search Capabilities
- **Search by Subject** - Find messages matching a subject line
- **Search by Message ID** - Locate specific messages by their unique ID
- **Search by Sender** - Find all messages from a specific sender
- **Search by Recipient** - Find all messages to a specific user
- **Search by Keywords** - Search message body content
- **Date Range Filtering** - Filter messages by received date
- **Multi-Mailbox Support** - Works with Microsoft 365 and Google Workspace

### ✅ Retrieval Capabilities
- **Single Message Retrieval** - Pull individual messages by ID
- **Bulk Retrieval** - Retrieve multiple messages at once
- **Criteria-Based Retrieval** - Retrieve all messages matching search criteria
- **S3 Storage** - Automatically stores retrieved messages in S3 for analysis
- **Message Format** - Retrieves messages in .eml (RFC 822) format

---

## Architecture

### API Endpoints

#### 1. `/api/admin/messages/search` (POST)
Search for messages in user mailboxes.

**Request Body:**
```json
{
  "subject": "Urgent: Wire Transfer Request",
  "messageId": "AAMkADU3...",
  "senderEmail": "ceo@example.com",
  "recipientEmail": "user@company.com",
  "keywords": "urgent wire transfer",
  "dateFrom": "2025-01-01",
  "dateTo": "2025-01-31",
  "mailboxType": "microsoft365",
  "limit": 100
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "messageId": "AAMkADU3...",
      "subject": "Urgent: Wire Transfer Request",
      "senderEmail": "ceo@example.com",
      "recipientEmail": "user@company.com",
      "receivedDateTime": "2025-01-15T10:30:00Z",
      "hasAttachments": false,
      "isRead": true,
      "mailboxType": "microsoft365",
      "preview": "I need you to process..."
    }
  ],
  "count": 1,
  "mailboxType": "microsoft365"
}
```

#### 2. `/api/admin/messages/retrieve` (POST)
Retrieve/pull messages from mailboxes.

**Request Body:**
```json
{
  "messageIds": ["AAMkADU3...", "18c1234567890abcdef"],
  "mailboxType": "microsoft365",
  "storeInS3": true,
  "recipientEmail": "user@company.com"
}
```

**Or with search criteria:**
```json
{
  "searchCriteria": {
    "subject": "Urgent: Wire Transfer",
    "senderEmail": "ceo@example.com"
  },
  "recipientEmail": "user@company.com",
  "mailboxType": "microsoft365",
  "storeInS3": true
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "messageId": "AAMkADU3...",
      "retrieved": true,
      "retrievedAt": "2025-01-15T11:00:00Z",
      "s3Key": "admin-retrieved/ilminate.com/2025-01-15/AAMkADU3....eml",
      "mailboxType": "microsoft365"
    }
  ],
  "count": 1,
  "mailboxType": "microsoft365",
  "storedInS3": true
}
```

---

## Admin UI

### Access
- **URL:** `/admin/messages`
- **Access:** Admin only (cfisher@ilminate.com, admin@ilminate.com)
- **Navigation:** Appears in navigation bar for admin users only

### Features
1. **Search Form**
   - Mailbox type selector (Microsoft 365 / Google Workspace)
   - Search fields (subject, message ID, sender, recipient, keywords, date range)
   - Search button

2. **Results Table**
   - Displays search results
   - Select individual or all messages
   - View message details
   - Retrieve selected messages

3. **Message Details Dialog**
   - Full message information
   - S3 storage location (if retrieved)
   - Error messages (if retrieval failed)

---

## Integration Requirements

### Microsoft 365 Integration

**Required Setup:**
1. Azure AD App Registration
   - Application ID
   - Client Secret or Certificate
   - Redirect URIs

2. API Permissions
   - `Mail.Read` - Read user mail
   - `Mail.ReadWrite` - Read and write user mail
   - `User.Read.All` - Read all users (for admin search)

3. Admin Consent
   - Grant admin consent for organization

**Implementation:**
```typescript
// TODO: Implement Microsoft Graph API calls
// GET /users/{userId}/messages?$filter=...
// GET /users/{userId}/messages/{messageId}
// GET /users/{userId}/messages/{messageId}/$value (for .eml)
```

### Google Workspace Integration

**Required Setup:**
1. Google Cloud Project
   - Gmail API enabled
   - Service account created

2. Domain-Wide Delegation
   - Service account authorized
   - Scopes:
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/gmail.modify`

3. Service Account Credentials
   - JSON key file stored in AWS Secrets Manager

**Implementation:**
```typescript
// TODO: Implement Gmail API calls
// GET /gmail/v1/users/{userId}/messages?q=...
// GET /gmail/v1/users/{userId}/messages/{messageId}
// GET /gmail/v1/users/{userId}/messages/{messageId}?format=raw (for .eml)
```

---

## S3 Storage

### Structure
```
ilminate-apex-raw/
└── admin-retrieved/
    └── {customerId}/
        └── {YYYY-MM-DD}/
            └── {messageId}.eml
```

### Example
```
ilminate-apex-raw/
└── admin-retrieved/
    └── ilminate.com/
        └── 2025-01-15/
            ├── AAMkADU3....eml
            └── 18c1234567890abcdef.eml
```

### Metadata
Each stored message includes metadata:
- `customerId` - Customer organization ID
- `messageId` - Original message ID
- `mailboxType` - microsoft365 or google_workspace
- `retrievedAt` - Timestamp of retrieval

---

## Security

### Authorization
- **Admin Only** - Only admin users can access this service
- **Customer Isolation** - Messages are filtered by customer ID
- **Audit Logging** - All search and retrieval actions are logged

### Admin Users
Currently hardcoded in code:
- `cfisher@ilminate.com`
- `admin@ilminate.com`

**Future Enhancement:**
- Move to database/configuration
- Role-based access control (RBAC)
- Admin role assignment via UI

---

## Usage Examples

### Example 1: Search for Phishing Emails
```json
POST /api/admin/messages/search
{
  "subject": "Urgent: Verify Your Account",
  "keywords": "click here verify",
  "mailboxType": "microsoft365",
  "dateFrom": "2025-01-01",
  "limit": 50
}
```

### Example 2: Retrieve Specific Message
```json
POST /api/admin/messages/retrieve
{
  "messageIds": ["AAMkADU3..."],
  "mailboxType": "microsoft365",
  "storeInS3": true
}
```

### Example 3: Bulk Retrieve by Criteria
```json
POST /api/admin/messages/retrieve
{
  "searchCriteria": {
    "senderEmail": "suspicious@example.com",
    "dateFrom": "2025-01-01"
  },
  "recipientEmail": "user@company.com",
  "mailboxType": "google_workspace",
  "storeInS3": true
}
```

---

## Implementation Status

### ✅ Completed
- [x] API endpoint structure (`/api/admin/messages/search`)
- [x] API endpoint structure (`/api/admin/messages/retrieve`)
- [x] Admin UI page (`/admin/messages`)
- [x] Navigation link (admin-only)
- [x] S3 storage integration
- [x] Message format conversion (.eml)

### ⏳ Pending
- [ ] Microsoft Graph API integration
- [ ] Gmail API integration
- [ ] Azure AD authentication setup
- [ ] Google Workspace service account setup
- [ ] Error handling for API failures
- [ ] Rate limiting for API calls
- [ ] Pagination for large result sets
- [ ] Export functionality (CSV, JSON)
- [ ] Audit logging to DynamoDB

---

## Next Steps

1. **Set up Microsoft Graph API**
   - Register Azure AD application
   - Configure API permissions
   - Implement authentication flow
   - Add Graph API client code

2. **Set up Gmail API**
   - Create Google Cloud project
   - Enable Gmail API
   - Create service account
   - Configure domain-wide delegation
   - Store credentials in AWS Secrets Manager

3. **Testing**
   - Test search functionality
   - Test retrieval functionality
   - Test S3 storage
   - Test error handling

4. **Production Deployment**
   - Deploy API endpoints
   - Deploy admin UI
   - Configure environment variables
   - Set up monitoring and alerts

---

## Files Created

- `src/app/api/admin/messages/search/route.ts` - Search API endpoint
- `src/app/api/admin/messages/retrieve/route.ts` - Retrieve API endpoint
- `src/app/admin/messages/page.tsx` - Admin UI page
- `src/components/NavigationBar.tsx` - Updated with admin link

---

## Notes

- Currently returns placeholder data until API integrations are complete
- Admin check is based on email address (hardcoded)
- S3 bucket name: `ilminate-apex-raw` (from environment variable)
- AWS region: `us-east-1` (from environment variable)

---

**Status:** ✅ Framework Complete - Pending API Integrations

