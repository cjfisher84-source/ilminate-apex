import { NextRequest, NextResponse } from 'next/server'
import { updateQuarantineMessageStatus, getQuarantineMessage } from '@/lib/dynamodb'
import { getCustomerIdFromHeaders } from '@/lib/tenantUtils'

/**
 * API Route: POST /api/quarantine/release
 * 
 * Releases a quarantined message (updates status to 'released')
 * 
 * Request body:
 * {
 *   messageId: string
 *   messageIds?: string[] (for bulk release)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const customerId = getCustomerIdFromHeaders(request.headers)
    
    if (!customerId) {
      return NextResponse.json({
        success: false,
        error: 'Customer ID required',
      }, { status: 400 })
    }

    const body = await request.json()
    const { messageId, messageIds } = body

    // Support both single and bulk release
    const idsToRelease = messageIds || (messageId ? [messageId] : [])

    if (idsToRelease.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'At least one messageId is required',
      }, { status: 400 })
    }

    const results = []
    const errors = []

    // Process each message
    for (const id of idsToRelease) {
      try {
        // Verify message exists and belongs to customer
        const message = await getQuarantineMessage({ customerId, messageId: id })
        
        if (!message) {
          errors.push({ messageId: id, error: 'Message not found' })
          continue
        }

        // Update status to released
        await updateQuarantineMessageStatus({
          customerId,
          messageId: id,
          status: 'released',
          releasedAt: Date.now(),
          // TODO: Get user ID from session/auth
          releasedBy: 'user', // Placeholder - should come from auth context
        })

        results.push({ messageId: id, success: true })
      } catch (error: any) {
        console.error(`Error releasing message ${id}:`, error)
        errors.push({ messageId: id, error: error.message || 'Failed to release message' })
      }
    }

    // TODO: Integrate with Microsoft Graph API to actually release the email
    // This would involve:
    // 1. Getting the message from Microsoft 365
    // 2. Moving it from quarantine folder back to inbox
    // 3. Optionally adding a warning banner

    return NextResponse.json({
      success: errors.length === 0,
      released: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error('Quarantine release API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error',
    }, { status: 500 })
  }
}

