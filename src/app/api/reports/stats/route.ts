import { NextRequest, NextResponse } from 'next/server'
import { getDashboardStats, queryApexEvents } from '@/lib/dynamodb'
import { getCustomerIdFromHeaders } from '@/lib/tenantUtils'
import { isMockDataEnabled } from '@/lib/tenantUtils'
import { mockCategoryCounts, mockTimeline30d } from '@/lib/mock'

/**
 * API Route: /api/reports/stats
 * 
 * Fetches dashboard statistics from DynamoDB or returns mock data
 */
export async function GET(request: NextRequest) {
  try {
    const customerId = getCustomerIdFromHeaders(request.headers)
    const showMockData = isMockDataEnabled(customerId)

    // If mock data is enabled, return mock data
    if (showMockData) {
      const categoryCounts = mockCategoryCounts(customerId)
      const timeline = mockTimeline30d(customerId)
      
      return NextResponse.json({
        success: true,
        data: {
          categoryCounts,
          timeline,
          source: 'mock'
        }
      })
    }

    // Try to fetch real data from DynamoDB
    try {
      const stats = await getDashboardStats({
        customerId: customerId || undefined,
        days: 30
      })

      // Get events for timeline
      const events = await queryApexEvents({
        customerId: customerId || undefined,
        days: 30,
        limit: 10000
      })

      // Build category counts
      const categoryCounts = Object.entries(stats.byCategory).map(([category, count]) => ({
        category,
        count: count as number,
        description: getCategoryDescription(category)
      }))

      // Build timeline data (last 30 days)
      const timeline = buildTimelineData(events)

      return NextResponse.json({
        success: true,
        data: {
          categoryCounts,
          timeline,
          stats: {
            totalEvents: stats.totalEvents,
            quarantined: stats.quarantined,
            blocked: stats.blocked,
            allowed: stats.allowed,
          },
          source: 'dynamodb'
        }
      })
    } catch (dbError: any) {
      // If table doesn't exist, return empty data
      if (dbError.name === 'ResourceNotFoundException') {
        console.log('Events table does not exist yet, returning empty data')
        return NextResponse.json({
          success: true,
          data: {
            categoryCounts: [],
            timeline: [],
            stats: {
              totalEvents: 0,
              quarantined: 0,
              blocked: 0,
              allowed: 0,
            },
            source: 'dynamodb-empty'
          }
        })
      }
      
      console.error('Error fetching dashboard stats:', dbError)
      return NextResponse.json({
        success: false,
        error: dbError.message || 'Failed to fetch statistics',
        data: null
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Reports stats API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error',
      data: null
    }, { status: 500 })
  }
}

/**
 * Get category description
 */
function getCategoryDescription(category: string): string {
  const descriptions: Record<string, string> = {
    'Phishing': 'Phishing emails attempting to steal credentials',
    'BEC': 'Business Email Compromise attacks',
    'Malware': 'Malware attachments or links',
    'Spam': 'Unsolicited bulk emails',
    'AI-Generated': 'AI-generated suspicious content',
    'Quishing': 'QR code phishing attacks',
    'Logo Impersonation': 'Brand logo impersonation',
    'Screenshot Phishing': 'Screenshot-based phishing',
  }
  return descriptions[category] || `Security events in ${category} category`
}

/**
 * Build timeline data from events
 */
function buildTimelineData(events: any[]): Array<{ date: string; quarantined: number; delivered: number }> {
  const timelineMap = new Map<string, { quarantined: number; delivered: number }>()
  
  // Initialize last 30 days
  const today = new Date()
  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    timelineMap.set(dateStr, { quarantined: 0, delivered: 0 })
  }

  // Count events by date
  events.forEach((event: any) => {
    const timestamp = event.timestamp || event.quarantineTimestamp || event.createdAt
    if (!timestamp) return

    const date = new Date(typeof timestamp === 'number' ? timestamp * 1000 : timestamp)
    const dateStr = date.toISOString().split('T')[0]
    
    if (timelineMap.has(dateStr)) {
      const dayData = timelineMap.get(dateStr)!
      const action = event.apex_action || event.action || 'ALLOW'
      
      if (action === 'QUARANTINE' || action === 'BLOCK') {
        dayData.quarantined++
      } else {
        dayData.delivered++
      }
    }
  })

  // Convert to array and sort by date
  return Array.from(timelineMap.entries())
    .map(([date, data]) => ({
      date,
      quarantined: data.quarantined,
      delivered: data.delivered
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

