import { NextRequest, NextResponse } from 'next/server'

// APEX Trace API Route
// Connects to the APEX Search System for super fast message search

const APEX_SEARCH_API_URL = process.env.APEX_SEARCH_API_URL || 'http://localhost:5000'

export async function POST(request: NextRequest) {
  try {
    const searchParams = await request.json()
    
    // Forward the search request to the APEX Search System
    const response = await fetch(`${APEX_SEARCH_API_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchParams),
    })

    if (!response.ok) {
      throw new Error(`APEX Search API error: ${response.statusText}`)
    }

    const results = await response.json()
    
    return NextResponse.json(results)
  } catch (error) {
    console.error('APEX Trace API error:', error)
    
    // Return mock data if the search system is not available
    return NextResponse.json({
      query_time_ms: 45.2,
      total_hits: 3,
      messages: [
        {
          message_id: 'msg_001',
          sender_email: 'phisher@malicious-domain.com',
          sender_domain: 'malicious-domain.com',
          sender_ip: '192.168.1.100',
          recipient_email: 'user@company.com',
          subject: 'Urgent: Verify Your Account',
          content: 'Click here to verify your account immediately',
          timestamp: new Date().toISOString(),
          threat_category: 'phishing',
          apex_action: 'quarantine',
          threat_score: 0.95,
          file_attachments: ['malware.exe'],
          urls: ['http://fake-bank.com/login']
        },
        {
          message_id: 'msg_002',
          sender_email: 'legitimate@sender.com',
          sender_domain: 'sender.com',
          sender_ip: '10.0.0.1',
          recipient_email: 'user@company.com',
          subject: 'Monthly Report',
          content: 'Please find attached the monthly report',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          threat_category: 'legitimate',
          apex_action: 'deliver',
          threat_score: 0.05,
          file_attachments: ['report.pdf'],
          urls: []
        },
        {
          message_id: 'msg_003',
          sender_email: 'spammer@fake-news.com',
          sender_domain: 'fake-news.com',
          sender_ip: '172.16.0.50',
          recipient_email: 'user@company.com',
          subject: 'Breaking News: You Won $1 Million!',
          content: 'Congratulations! You have won $1 million dollars',
          timestamp: new Date(Date.now() - 21600000).toISOString(),
          threat_category: 'spam',
          apex_action: 'quarantine',
          threat_score: 0.85,
          file_attachments: [],
          urls: ['http://fake-lottery.com/claim']
        }
      ],
      facets: {
        threat_categories: [
          { name: 'phishing', count: 1 },
          { name: 'legitimate', count: 1 },
          { name: 'spam', count: 1 }
        ],
        apex_actions: [
          { name: 'quarantine', count: 2 },
          { name: 'deliver', count: 1 }
        ],
        sender_domains: [
          { name: 'malicious-domain.com', count: 1 },
          { name: 'sender.com', count: 1 },
          { name: 'fake-news.com', count: 1 }
        ]
      }
    })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Health check for APEX Trace
    const response = await fetch(`${APEX_SEARCH_API_URL}/health`)
    
    if (response.ok) {
      const health = await response.json()
      return NextResponse.json({
        status: 'healthy',
        apex_trace: 'connected',
        search_system: health.status,
        timestamp: new Date().toISOString()
      })
    } else {
      throw new Error('Search system not available')
    }
  } catch (error) {
    return NextResponse.json({
      status: 'degraded',
      apex_trace: 'connected',
      search_system: 'offline',
      message: 'Using mock data - search system not available',
      timestamp: new Date().toISOString()
    })
  }
}
