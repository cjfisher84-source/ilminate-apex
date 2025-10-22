import { NextRequest, NextResponse } from 'next/server'
import { mockQuarantinedMessages } from '@/lib/mock'

export async function GET(
  req: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const { messageId } = params
    
    if (!messageId) {
      return NextResponse.json({
        success: false,
        error: 'Message ID is required'
      }, { status: 400 })
    }
    
    // Find the message
    const messages = mockQuarantinedMessages()
    const message = messages.find(m => m.id === messageId)
    
    if (!message) {
      return NextResponse.json({
        success: false,
        error: 'Message not found'
      }, { status: 404 })
    }
    
    // Return full message details
    return NextResponse.json({
      success: true,
      data: message
    })
  } catch (error: any) {
    console.error('[QUARANTINE DETAIL ERROR]', error)
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to fetch message details'
    }, { status: 500 })
  }
}

