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

    // Process messages concurrently for better performance
    // Limit batch size to prevent overwhelming DynamoDB (max 50 concurrent operations)
    const BATCH_SIZE = 50
    const batches: string[][] = []
    for (let i = 0; i < idsToRelease.length; i += BATCH_SIZE) {
      batches.push(idsToRelease.slice(i, i + BATCH_SIZE))
    }

    const results: Array<{ messageId: string; success: boolean }> = []
    const errors: Array<{ messageId: string; error: string }> = []

    // Process each batch concurrently
    for (const batch of batches) {
      const batchResults = await Promise.allSettled(
        batch.map(async (id) => {
          // Verify message exists and belongs to customer
          const message = await getQuarantineMessage({ customerId, messageId: id })
          
          if (!message) {
            throw new Error('Message not found')
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

          return { messageId: id, success: true }
        })
      )

      // Process batch results
      batchResults.forEach((result, index) => {
        const id = batch[index]
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          console.error(`Error releasing message ${id}:`, result.reason)
          errors.push({
            messageId: id,
            error: result.reason?.message || 'Failed to release message'
          })
        }
      })
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

