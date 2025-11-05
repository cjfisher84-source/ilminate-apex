import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getCustomerIdFromHeaders } from '@/lib/tenantUtils'
import { isMockDataEnabled } from '@/lib/tenantUtils'

/**
 * API Route: /api/image-scan
 * 
 * Fetches QR code and image scanning results from ilminate-agent
 * 
 * Data Structure from ilminate-agent:
 * - QR Code detections (quishing attacks)
 * - Image with malicious/offensive content
 * - Logo impersonation detection
 * - Hidden clickable links in images
 */

export interface QRCodeThreat {
  messageId: string
  timestamp: string
  sender: string
  subject: string
  qr_url: string
  threat_score: number
  indicators: string[]
  detection_method: 'pyzbar' | 'qreader_ai' | 'hybrid'
}

export interface ImageThreat {
  messageId: string
  timestamp: string
  sender: string
  subject: string
  threat_type: 'offensive_content' | 'logo_impersonation' | 'hidden_link' | 'screenshot_phishing'
  threat_score: number
  brand?: string // For logo impersonation
  indicators: string[]
  has_text: boolean
  extracted_text?: string
}

export interface ImageScanStats {
  total_scans_24h: number
  qr_codes_detected: number
  malicious_qr_codes: number
  offensive_images: number
  logo_impersonations: number
  hidden_links: number
  screenshot_phishing: number
  recent_threats: {
    qr_threats: QRCodeThreat[]
    image_threats: ImageThreat[]
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get customer ID from headers
    const customerId = getCustomerIdFromHeaders(request.headers)
    
    console.log('Image Scan API - Customer ID:', customerId)
    
    // Check if mock data should be shown for this customer
    const showMockData = isMockDataEnabled(customerId)
    
    console.log('Image Scan API - Show Mock Data:', showMockData, 'for customer:', customerId)
    
    // TODO: Replace with actual DynamoDB/API call to ilminate-agent
    // const data = await fetchFromDynamoDB('ilminate-agent-scans', customerId)
    
    // For customers with mock data disabled, return zeros
    if (!showMockData) {
      console.log('Returning zero data for customer:', customerId)
      const emptyData: ImageScanStats = {
        total_scans_24h: 0,
        qr_codes_detected: 0,
        malicious_qr_codes: 0,
        offensive_images: 0,
        logo_impersonations: 0,
        hidden_links: 0,
        screenshot_phishing: 0,
        recent_threats: {
          qr_threats: [],
          image_threats: []
        }
      }
      return NextResponse.json(emptyData)
    }
    
    console.log('Returning mock data for customer:', customerId)
    
    // For now, return mock data structure that matches ilminate-agent's output
    const mockData: ImageScanStats = {
      total_scans_24h: 1247,
      qr_codes_detected: 89,
      malicious_qr_codes: 23,
      offensive_images: 7,
      logo_impersonations: 15,
      hidden_links: 12,
      screenshot_phishing: 8,
      recent_threats: {
        qr_threats: [
          {
            messageId: 'msg_001',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            sender: 'security@micros0ft-verify.tk',
            subject: 'Urgent: Verify Your Account',
            qr_url: 'http://microsoft-login.tk/verify?token=abc123',
            threat_score: 0.92,
            indicators: [
              'Suspicious TLD (.tk)',
              'URL length: 45 chars',
              'Not from legitimate Microsoft domain'
            ],
            detection_method: 'qreader_ai'
          },
          {
            messageId: 'msg_002',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            sender: 'noreply@secure-banking.ml',
            subject: 'Account Suspended - Immediate Action Required',
            qr_url: 'http://192.168.1.100/login',
            threat_score: 0.95,
            indicators: [
              'Uses IP address instead of domain',
              'Suspicious TLD (.ml)',
              'URL shortener pattern detected'
            ],
            detection_method: 'pyzbar'
          },
          {
            messageId: 'msg_003',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            sender: 'updates@paypal-secure.info',
            subject: 'Payment Confirmation Required',
            qr_url: 'http://bit.ly/paypal-verify-urgent',
            threat_score: 0.88,
            indicators: [
              'URL shortener detected',
              'Suspicious domain',
              'Urgency keywords in subject'
            ],
            detection_method: 'hybrid'
          }
        ],
        image_threats: [
          {
            messageId: 'msg_004',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            sender: 'noreply@paypa1-secure.com',
            subject: 'Invoice #84729',
            threat_type: 'logo_impersonation',
            threat_score: 0.95,
            brand: 'PayPal',
            indicators: [
              'PayPal logo detected',
              'Sender domain doesn\'t match legitimate PayPal',
              'Homoglyph attack (1 instead of l)'
            ],
            has_text: true,
            extracted_text: 'You have received a payment. Click to view details.'
          },
          {
            messageId: 'msg_005',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            sender: 'admin@company-internal.com',
            subject: 'HR: Update Your Information',
            threat_type: 'screenshot_phishing',
            threat_score: 0.93,
            brand: 'Microsoft',
            indicators: [
              'Screenshot of fake login page',
              'Microsoft logo but sender is gmail.com',
              'Credential harvesting attempt',
              'Contains UI keywords: Login, Submit, Password'
            ],
            has_text: true,
            extracted_text: 'Microsoft Account\nSign in\nEmail: ___________\nPassword: ___________'
          },
          {
            messageId: 'msg_006',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            sender: 'marketing@promo-offers.biz',
            subject: 'Exclusive Offer - Click Now!',
            threat_type: 'hidden_link',
            threat_score: 0.78,
            indicators: [
              'Hidden clickable area detected',
              'Redirects to malicious page',
              'Image contains embedded link'
            ],
            has_text: false
          },
          {
            messageId: 'msg_007',
            timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
            sender: 'unknown@suspicious-sender.ru',
            subject: 'RE: Your recent activity',
            threat_type: 'offensive_content',
            threat_score: 0.85,
            indicators: [
              'Offensive image content detected',
              'Potential sextortion attempt',
              'Suspicious sender domain (.ru)'
            ],
            has_text: false
          }
        ]
      }
    }

    return NextResponse.json(mockData)
  } catch (error) {
    console.error('Error fetching image scan data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch image scan data' },
      { status: 500 }
    )
  }
}

/**
 * Integration Notes for Production:
 * 
 * 1. DynamoDB Table Structure (ilminate-agent should write to):
 *    Table: ilminate-image-scans
 *    Primary Key: messageId (String)
 *    Sort Key: timestamp (Number)
 *    
 *    Attributes:
 *    - scan_type: 'qr_code' | 'image_threat'
 *    - threat_detected: boolean
 *    - threat_score: number
 *    - detection_details: JSON
 *    
 * 2. API Gateway Endpoint (alternative):
 *    ilminate-agent can expose: GET /api/scans/recent
 *    
 * 3. Real-time Updates:
 *    Consider adding WebSocket support for real-time threat notifications
 *    
 * 4. Filtering:
 *    Add query parameters for date range, threat type, severity level
 */

