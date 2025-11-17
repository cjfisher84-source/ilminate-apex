import { NextRequest, NextResponse } from 'next/server'
import { queryQuarantinedMessages } from '@/lib/dynamodb'
import { getCustomerIdFromHeaders } from '@/lib/tenantUtils'
import { isMockDataEnabled } from '@/lib/tenantUtils'
import { mockQuarantinedMessages } from '@/lib/mock'

/**
 * API Route: /api/quarantine/list
 * 
 * Fetches quarantined messages from DynamoDB or returns mock data
 */
export async function GET(request: NextRequest) {
  try {
    const customerId = getCustomerIdFromHeaders(request.headers)
    const showMockData = isMockDataEnabled(customerId)

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const severity = searchParams.get('severity') || 'ALL'
    const days = parseInt(searchParams.get('days') || '30', 10)
    const searchTerm = searchParams.get('search') || undefined

    // If mock data is enabled, return mock data
    if (showMockData) {
      const mockMessages = mockQuarantinedMessages()
      
      // Apply filters to mock data
      let filtered = mockMessages
      
      if (severity !== 'ALL') {
        filtered = filtered.filter(m => m.severity === severity)
      }
      
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        filtered = filtered.filter(m => 
          m.subject.toLowerCase().includes(searchLower) ||
          m.senderEmail.toLowerCase().includes(searchLower) ||
          m.bodyPreview.toLowerCase().includes(searchLower)
        )
      }
      
      // Filter by days
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)
      filtered = filtered.filter(m => new Date(m.quarantineTimestamp) >= cutoffDate)
      
      return NextResponse.json({
        success: true,
        data: filtered,
        count: filtered.length,
        source: 'mock'
      })
    }

    // Try to fetch real data from DynamoDB
    if (!customerId) {
      return NextResponse.json({
        success: false,
        error: 'Customer ID required',
        data: []
      }, { status: 400 })
    }

    try {
      const messages = await queryQuarantinedMessages({
        customerId,
        severity: severity !== 'ALL' ? severity : undefined,
        days,
        searchTerm,
        limit: 1000
      })

      // Transform DynamoDB items to match expected format
      // Handle both old format (quarantineTimestamp) and new format (quarantineDate#messageId)
      const transformed = messages.map((item: any) => {
        // Extract messageId from sort key if needed (format: YYYY-MM-DD#messageId)
        let messageId = item.messageId || item.message_id
        if (!messageId && item['quarantineDate#messageId']) {
          const parts = item['quarantineDate#messageId'].split('#')
          messageId = parts.length > 1 ? parts[1] : parts[0]
        }
        
        // Extract timestamp from date string
        let quarantineTimestamp = item.quarantineTimestamp || item.quarantine_timestamp
        if (!quarantineTimestamp && item['quarantineDate#messageId']) {
          const dateStr = item['quarantineDate#messageId'].split('#')[0]
          quarantineTimestamp = new Date(dateStr).getTime()
        }
        if (!quarantineTimestamp) {
          quarantineTimestamp = Date.now()
        }
        
        return {
          messageId,
          subject: item.subject || '',
          sender: item.sender || '',
          senderEmail: item.senderEmail || item.sender_email || '',
          recipients: item.recipients || [],
          quarantineTimestamp,
          riskScore: item.riskScore || item.risk_score || 0,
          severity: item.severity || 'MEDIUM',
          detectionReasons: item.detectionReasons || item.detection_reasons || [],
          bodyPreview: item.bodyPreview || item.body_preview || '',
          s3Key: item.s3Key || item.s3_key,
          hasAttachments: item.hasAttachments || item.has_attachments || false,
          attachments: item.attachments || [],
          status: item.status || 'quarantined',
          mailboxType: item.mailboxType || item.mailbox_type || 'microsoft365',
        }
      })

      return NextResponse.json({
        success: true,
        data: transformed,
        count: transformed.length,
        source: 'dynamodb'
      })
    } catch (dbError: any) {
      // If table doesn't exist, return empty array
      if (dbError.name === 'ResourceNotFoundException') {
        console.log('Quarantine table does not exist yet, returning empty array')
        return NextResponse.json({
          success: true,
          data: [],
          count: 0,
          source: 'dynamodb-empty'
        })
      }
      
      // For other errors, log and return error
      console.error('Error fetching quarantine messages:', dbError)
      return NextResponse.json({
        success: false,
        error: dbError.message || 'Failed to fetch quarantine messages',
        data: []
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Quarantine list API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error',
      data: []
    }, { status: 500 })
  }
}

