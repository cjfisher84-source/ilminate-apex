import { NextRequest, NextResponse } from 'next/server'
import { mockQuarantinedMessages } from '@/lib/mock'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    
    // Get query parameters
    const severity = searchParams.get('severity') // CRITICAL, HIGH, MEDIUM, LOW, or null for all
    const search = searchParams.get('search') // Search term for subject/sender
    const days = parseInt(searchParams.get('days') || '30') // Default 30 days
    const status = searchParams.get('status') || 'quarantined' // quarantined, released, deleted
    
    // Get all messages
    let messages = mockQuarantinedMessages()
    
    // Filter by status
    if (status) {
      messages = messages.filter(m => m.status === status)
    }
    
    // Filter by severity
    if (severity && severity !== 'ALL') {
      messages = messages.filter(m => m.severity === severity)
    }
    
    // Filter by date range
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    messages = messages.filter(m => m.quarantineDate >= cutoffDate)
    
    // Filter by search term
    if (search && search.trim()) {
      const searchLower = search.toLowerCase()
      messages = messages.filter(m => 
        m.subject.toLowerCase().includes(searchLower) ||
        m.sender.toLowerCase().includes(searchLower) ||
        m.senderEmail.toLowerCase().includes(searchLower)
      )
    }
    
    // Return paginated results (for future pagination)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    
    const paginatedMessages = messages.slice(startIndex, endIndex)
    
    return NextResponse.json({
      success: true,
      data: paginatedMessages,
      pagination: {
        total: messages.length,
        page,
        limit,
        totalPages: Math.ceil(messages.length / limit)
      },
      filters: {
        severity,
        search,
        days,
        status
      }
    })
  } catch (error: any) {
    console.error('[QUARANTINE LIST ERROR]', error)
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to fetch quarantined messages'
    }, { status: 500 })
  }
}

