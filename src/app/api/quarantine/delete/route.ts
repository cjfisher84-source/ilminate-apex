import { NextRequest, NextResponse } from 'next/server'
import { deleteQuarantineMessage, getQuarantineMessage } from '@/lib/dynamodb'
import { getCustomerIdFromHeaders } from '@/lib/tenantUtils'

/**
 * API Route: POST /api/quarantine/delete
 * 
 * Deletes a quarantined message (removes from DynamoDB)
 * 
 * Request body:
 * {
 *   messageId: string
 *   messageIds?: string[] (for bulk delete)
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

    // Support both single and bulk delete
    const idsToDelete = messageIds || (messageId ? [messageId] : [])

    if (idsToDelete.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'At least one messageId is required',
      }, { status: 400 })
    }

    // Process messages concurrently for better performance
    // Limit batch size to prevent overwhelming DynamoDB (max 50 concurrent operations)
    const BATCH_SIZE = 50
    const batches: string[][] = []
    for (let i = 0; i < idsToDelete.length; i += BATCH_SIZE) {
      batches.push(idsToDelete.slice(i, i + BATCH_SIZE))
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

          // Delete from DynamoDB
          await deleteQuarantineMessage({
            customerId,
            messageId: id,
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
          console.error(`Error deleting message ${id}:`, result.reason)
          errors.push({
            messageId: id,
            error: result.reason?.message || 'Failed to delete message'
          })
        }
      })
    }

    // TODO: Optionally delete from S3 if s3Key exists
    // This would involve:
    // 1. Getting the s3Key from the message
    // 2. Deleting the object from S3 bucket

    return NextResponse.json({
      success: errors.length === 0,
      deleted: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error('Quarantine delete API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error',
    }, { status: 500 })
  }
}

