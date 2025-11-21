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
    
    // Parse request body first
    const body = await request.json()
    
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
      return NextResponse.json({
        success: true,
        data: generateMockSearchResults(body),
        count: 5,
        mailboxType: body.mailboxType || 'microsoft365',
        mock: true
      })
    }
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

/**
 * Generate mock search results for UI testing
 */
function generateMockSearchResults(params: any): any[] {
  const now = new Date()
  const messages = [
    {
      messageId: 'AAMkADU3YjE4YzQ1LWM5NzQtNDQ2OS1hYzEwLThmNzI5YjE4YzQ1LgBGAAAAAAC',
      subject: params.subject || 'Quarterly Security Review - Action Required',
      senderEmail: params.senderEmail || 'security@example.com',
      recipientEmail: params.recipientEmail || 'user@ilminate.com',
      receivedDateTime: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      hasAttachments: true,
      isRead: false,
      mailboxType: params.mailboxType || 'microsoft365',
      preview: 'This email contains important security updates that require your immediate attention. Please review the attached report and respond by end of business today.'
    },
    {
      messageId: 'AAMkADU3YjE4YzQ1LWM5NzQtNDQ2OS1hYzEwLThmNzI5YjE4YzQ1LgBGAAAAAAB',
      subject: 'Phishing Alert: Suspicious Email Detected',
      senderEmail: 'noreply@security-alerts.com',
      recipientEmail: params.recipientEmail || 'user@ilminate.com',
      receivedDateTime: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      hasAttachments: false,
      isRead: true,
      mailboxType: params.mailboxType || 'microsoft365',
      preview: 'Our security system detected a suspicious email in your mailbox. The message has been quarantined for review.'
    },
    {
      messageId: 'AAMkADU3YjE4YzQ1LWM5NzQtNDQ2OS1hYzEwLThmNzI5YjE4YzQ1LgBGAAAAAAC',
      subject: 'Invoice #INV-2025-8472 - Payment Overdue',
      senderEmail: 'invoices@payments-processing.net',
      recipientEmail: params.recipientEmail || 'user@ilminate.com',
      receivedDateTime: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      hasAttachments: true,
      isRead: false,
      mailboxType: params.mailboxType || 'microsoft365',
      preview: 'Your invoice payment is overdue. Please make payment immediately to avoid service suspension. Click here to pay now.'
    },
    {
      messageId: 'AAMkADU3YjE4YzQ1LWM5NzQtNDQ2OS1hYzEwLThmNzI5YjE4YzQ1LgBGAAAAAAD',
      subject: 'Meeting Request: Security Incident Review',
      senderEmail: 'calendar@ilminate.com',
      recipientEmail: params.recipientEmail || 'user@ilminate.com',
      receivedDateTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      hasAttachments: false,
      isRead: true,
      mailboxType: params.mailboxType || 'microsoft365',
      preview: 'You have been invited to a meeting to review the security incident that occurred on November 18th. Please confirm your attendance.'
    },
    {
      messageId: 'AAMkADU3YjE4YzQ1LWM5NzQtNDQ2OS1hYzEwLThmNzI5YjE4YzQ1LgBGAAAAAAE',
      subject: 'Password Reset Request',
      senderEmail: 'noreply@ilminate.com',
      recipientEmail: params.recipientEmail || 'user@ilminate.com',
      receivedDateTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      hasAttachments: false,
      isRead: true,
      mailboxType: params.mailboxType || 'microsoft365',
      preview: 'A password reset was requested for your account. If you did not request this, please contact support immediately.'
    }
  ]
  
  // Filter based on search parameters
  let filtered = messages
  
  if (params.subject) {
    filtered = filtered.filter(m => 
      m.subject.toLowerCase().includes(params.subject.toLowerCase())
    )
  }
  
  if (params.senderEmail) {
    filtered = filtered.filter(m => 
      m.senderEmail.toLowerCase().includes(params.senderEmail.toLowerCase())
    )
  }
  
  if (params.keywords) {
    filtered = filtered.filter(m => 
      m.preview.toLowerCase().includes(params.keywords.toLowerCase()) ||
      m.subject.toLowerCase().includes(params.keywords.toLowerCase())
    )
  }
  
  return filtered.slice(0, params.limit || 100)
}

