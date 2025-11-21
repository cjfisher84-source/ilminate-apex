import { NextRequest, NextResponse } from 'next/server'
import { getCustomerIdFromHeaders } from '@/lib/tenantUtils'
import { searchMicrosoft365Messages } from '@/lib/microsoftGraph'

/**
 * API Route: /api/admin/messages/search
 * 
 * Admin-only endpoint to search for delivered messages in user mailboxes
 * Supports searching by:
 * - Subject
 * - Message ID
 * - Sender email
 * - Recipient email
 * - Date range
 * - Keywords in body
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
    
    if (!isAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized: Admin access required'
      }, { status: 403 })
    }

    const body = await request.json()
    const {
      subject,
      messageId,
      senderEmail,
      recipientEmail,
      dateFrom,
      dateTo,
      keywords,
      mailboxType = 'microsoft365', // microsoft365 or google_workspace
      limit = 100
    } = body

    // Validate search parameters
    if (!subject && !messageId && !senderEmail && !recipientEmail && !keywords) {
      return NextResponse.json({
        success: false,
        error: 'At least one search parameter is required'
      }, { status: 400 })
    }

    // Build search query based on mailbox type
    let results: any[] = []
    
    if (mailboxType === 'microsoft365') {
      results = await searchMicrosoft365Mailboxes({
        customerId: customerId || '',
        subject,
        messageId,
        senderEmail,
        recipientEmail,
        dateFrom,
        dateTo,
        keywords,
        limit
      })
    } else if (mailboxType === 'google_workspace') {
      results = await searchGoogleWorkspaceMailboxes({
        customerId: customerId || '',
        subject,
        messageId,
        senderEmail,
        recipientEmail,
        dateFrom,
        dateTo,
        keywords,
        limit
      })
    } else {
      return NextResponse.json({
        success: false,
        error: `Unsupported mailbox type: ${mailboxType}`
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
      mailboxType
    })

  } catch (error: any) {
    console.error('Admin message search error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to search messages'
    }, { status: 500 })
  }
}

/**
 * Search Microsoft 365 mailboxes using Graph API
 */
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
  
  console.log('🔍 Searching M365 mailboxes:', params)
  
  try {
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
  } catch (error: any) {
    console.error('Microsoft Graph API search error:', error)
    throw error
  }
}

/**
 * Search Google Workspace mailboxes using Gmail API
 */
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
  // TODO: Implement Gmail API integration
  // This requires:
  // 1. Google Cloud project with Gmail API enabled
  // 2. Service account with domain-wide delegation
  // 3. Gmail API calls to search user mailboxes
  
  console.log('🔍 Searching Google Workspace mailboxes:', params)
  
  // Placeholder implementation
  // In production, this would:
  // 1. Authenticate with service account
  // 2. Query Gmail API: users.messages.list with q parameter
  // 3. Fetch full message details
  // 4. Format and return results
  
  return [
    {
      messageId: '18c1234567890abcdef',
      subject: params.subject || 'Sample Message',
      senderEmail: params.senderEmail || 'sender@example.com',
      recipientEmail: params.recipientEmail || 'user@example.com',
      receivedDateTime: new Date().toISOString(),
      hasAttachments: false,
      isRead: true,
      mailboxType: 'google_workspace',
      preview: 'This is a placeholder result. Gmail API integration pending.'
    }
  ]
}

