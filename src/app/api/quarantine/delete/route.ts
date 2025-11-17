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

    const results = []
    const errors = []

    // Process each message
    for (const id of idsToDelete) {
      try {
        // Verify message exists and belongs to customer
        const message = await getQuarantineMessage({ customerId, messageId: id })
        
        if (!message) {
          errors.push({ messageId: id, error: 'Message not found' })
          continue
        }

        // Delete from DynamoDB
        await deleteQuarantineMessage({
          customerId,
          messageId: id,
        })

        results.push({ messageId: id, success: true })
      } catch (error: any) {
        console.error(`Error deleting message ${id}:`, error)
        errors.push({ messageId: id, error: error.message || 'Failed to delete message' })
      }
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

