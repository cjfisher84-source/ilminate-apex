import { NextRequest, NextResponse } from 'next/server'
import { getCustomerIdFromHeaders } from '@/lib/tenantUtils'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getMicrosoft365MessageEml, searchMicrosoft365Messages } from '@/lib/microsoftGraph'

/**
 * API Route: /api/admin/messages/retrieve
 * 
 * Admin-only endpoint to retrieve/pull messages from user mailboxes
 * Can retrieve:
 * - Single message by message ID
 * - Multiple messages by attributes (subject, sender, etc.)
 * - All messages matching criteria
 * 
 * Retrieved messages are stored in S3 for analysis/archival
 */
export async function POST(request: NextRequest) {
  try {
    const customerId = getCustomerIdFromHeaders(request.headers)
    const userEmail = request.headers.get('x-user-email')
    
    // Check if user is admin
    const adminEmails = [
      'cfisher@ilminate.com',
      'admin@ilminate.com',
    ]
    
    const isAdmin = userEmail && adminEmails.some(email => 
      userEmail.toLowerCase() === email.toLowerCase()
    )
    
    // Allow mock data for non-admin users (for UI testing)
    const useMockData = !isAdmin || process.env.ENABLE_MAILVAULT_MOCK === 'true'
    
    if (!isAdmin && !useMockData) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized: Admin access required'
      }, { status: 403 })
    }
    
    // Return mock data for testing
    if (useMockData && !isAdmin) {
      const mockResults = (body.messageIds || []).map((messageId: string) => ({
        messageId,
        retrieved: true,
        retrievedAt: new Date().toISOString(),
        s3Key: `admin-retrieved/mock/${new Date().toISOString().split('T')[0]}/${messageId}.eml`,
        mailboxType: body.mailboxType || 'microsoft365'
      }))
      
      return NextResponse.json({
        success: true,
        data: mockResults,
        count: mockResults.length,
        mailboxType: body.mailboxType || 'microsoft365',
        storedInS3: body.storeInS3 !== false,
        mock: true
      })
    }

    const body = await request.json()
    const {
      messageIds, // Array of message IDs to retrieve
      searchCriteria, // Search criteria to find messages
      mailboxType = 'microsoft365',
      storeInS3 = true, // Whether to store retrieved messages in S3
      recipientEmail // Specific user mailbox to search (required for M365)
    } = body

    // Validate parameters
    if (!messageIds && !searchCriteria) {
      return NextResponse.json({
        success: false,
        error: 'Either messageIds or searchCriteria is required'
      }, { status: 400 })
    }

    if (searchCriteria && !recipientEmail) {
      return NextResponse.json({
        success: false,
        error: 'recipientEmail is required when using searchCriteria'
      }, { status: 400 })
    }

    let retrievedMessages: any[] = []
    
    if (messageIds && Array.isArray(messageIds)) {
      // Retrieve specific messages by ID
      if (mailboxType === 'microsoft365' && !recipientEmail) {
        return NextResponse.json({
          success: false,
          error: 'recipientEmail is required for Microsoft 365 message retrieval'
        }, { status: 400 })
      }
      
      retrievedMessages = await retrieveMessagesByIds({
        customerId: customerId || '',
        messageIds,
        mailboxType,
        storeInS3,
        recipientEmail
      })
    } else if (searchCriteria) {
      // Retrieve messages matching criteria
      retrievedMessages = await retrieveMessagesByCriteria({
        customerId: customerId || '',
        searchCriteria,
        recipientEmail,
        mailboxType,
        storeInS3
      })
    }

    return NextResponse.json({
      success: true,
      data: retrievedMessages,
      count: retrievedMessages.length,
      mailboxType,
      storedInS3: storeInS3
    })

  } catch (error: any) {
    console.error('Admin message retrieve error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to retrieve messages'
    }, { status: 500 })
  }
}

/**
 * Retrieve specific messages by their IDs
 */
async function retrieveMessagesByIds(params: {
  customerId: string
  messageIds: string[]
  mailboxType: string
  storeInS3: boolean
  recipientEmail?: string
}): Promise<any[]> {
  console.log('📥 Retrieving messages by IDs:', params.messageIds)
  
  const retrieved: any[] = []
  
  for (const messageId of params.messageIds) {
    try {
      let message: any
      
      if (params.mailboxType === 'microsoft365') {
        if (!params.recipientEmail) {
          throw new Error('recipientEmail is required for Microsoft 365')
        }
        message = await retrieveMicrosoft365Message(params.recipientEmail, messageId)
      } else if (params.mailboxType === 'google_workspace') {
        if (!params.recipientEmail) {
          throw new Error('recipientEmail is required for Google Workspace')
        }
        message = await retrieveGoogleWorkspaceMessage(params.recipientEmail, messageId)
      } else {
        throw new Error(`Unsupported mailbox type: ${params.mailboxType}`)
      }
      
      // Store in S3 if requested
      if (params.storeInS3 && message) {
        const s3Key = await storeMessageInS3({
          customerId: params.customerId,
          messageId,
          message,
          mailboxType: params.mailboxType
        })
        message.s3Key = s3Key
      }
      
      retrieved.push(message)
    } catch (error: any) {
      console.error(`Failed to retrieve message ${messageId}:`, error)
      retrieved.push({
        messageId,
        error: error.message,
        retrieved: false
      })
    }
  }
  
  return retrieved
}

/**
 * Retrieve messages matching search criteria
 */
async function retrieveMessagesByCriteria(params: {
  customerId: string
  searchCriteria: any
  recipientEmail: string
  mailboxType: string
  storeInS3: boolean
}): Promise<any[]> {
  console.log('📥 Retrieving messages by criteria:', params.searchCriteria)
  
  // First, search for matching messages
  let matchingMessages: any[] = []
  
  if (params.mailboxType === 'microsoft365') {
    matchingMessages = await searchMicrosoft365Messages({
      userEmail: params.recipientEmail,
      ...params.searchCriteria,
      limit: 1000
    })
  } else if (params.mailboxType === 'google_workspace') {
    matchingMessages = await searchGoogleWorkspaceMailboxes({
      customerId: params.customerId,
      recipientEmail: params.recipientEmail,
      ...params.searchCriteria,
      limit: 1000
    })
  }
  
  // Then retrieve full message details
  const messageIds = matchingMessages.map(m => m.id || m.messageId)
  return await retrieveMessagesByIds({
    customerId: params.customerId,
    messageIds,
    mailboxType: params.mailboxType,
    storeInS3: params.storeInS3,
    recipientEmail: params.recipientEmail
  })
}

/**
 * Retrieve a single Microsoft 365 message
 */
async function retrieveMicrosoft365Message(userEmail: string, messageId: string): Promise<any> {
  console.log('📧 Retrieving M365 message:', messageId, 'for user:', userEmail)
  
  try {
    const eml = await getMicrosoft365MessageEml(userEmail, messageId)
    
    return {
      messageId,
      mailboxType: 'microsoft365',
      retrieved: true,
      retrievedAt: new Date().toISOString(),
      rawMessage: eml
    }
  } catch (error: any) {
    console.error('Failed to retrieve M365 message:', error)
    throw error
  }
}

/**
 * Retrieve a single Google Workspace message
 */
async function retrieveGoogleWorkspaceMessage(userEmail: string, messageId: string): Promise<any> {
  // TODO: Implement Gmail API call when Gmail integration is added
  // GET /gmail/v1/users/{userId}/messages/{messageId}
  // GET /gmail/v1/users/{userId}/messages/{messageId}?format=raw (for .eml format)
  
  console.log('📧 Retrieving Gmail message:', messageId, 'for user:', userEmail)
  
  // Placeholder until Gmail API is implemented
  return {
    messageId,
    mailboxType: 'google_workspace',
    retrieved: false,
    error: 'Gmail API integration pending',
    retrievedAt: new Date().toISOString(),
    rawMessage: 'Placeholder: Gmail API integration pending'
  }
}

/**
 * Store retrieved message in S3
 */
async function storeMessageInS3(params: {
  customerId: string
  messageId: string
  message: any
  mailboxType: string
}): Promise<string> {
  const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' })
  const bucketName = process.env.S3_BUCKET_NAME || 'ilminate-apex-raw'
  
  // Generate S3 key: admin-retrieved/{customerId}/{date}/{messageId}.eml
  const date = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  const s3Key = `admin-retrieved/${params.customerId}/${date}/${params.messageId}.eml`
  
  // Convert message to .eml format
  const emlContent = convertToEmlFormat(params.message)
  
  await s3Client.send(new PutObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
    Body: emlContent,
    ContentType: 'message/rfc822',
    Metadata: {
      customerId: params.customerId,
      messageId: params.messageId,
      mailboxType: params.mailboxType,
      retrievedAt: new Date().toISOString()
    }
  }))
  
  return s3Key
}

/**
 * Convert message object to .eml (RFC 822) format
 */
function convertToEmlFormat(message: any): string {
  // TODO: Properly format message as .eml
  // This should include headers, body, attachments, etc.
  
  return `From: ${message.senderEmail || ''}
To: ${message.recipientEmail || ''}
Subject: ${message.subject || ''}
Date: ${message.receivedDateTime || new Date().toISOString()}
Message-ID: ${message.messageId || ''}

${message.body || message.preview || ''}
`
}

// Import search functions (would be shared utilities)
async function searchMicrosoft365Mailboxes(params: any): Promise<any[]> {
  // Placeholder - would use actual Graph API
  return []
}

async function searchGoogleWorkspaceMailboxes(params: any): Promise<any[]> {
  // Placeholder - would use actual Gmail API
  return []
}

