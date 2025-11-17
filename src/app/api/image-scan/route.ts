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
    
    // Try to fetch real data from DynamoDB first
    if (!showMockData) {
      try {
        const { queryImageScans } = await import('@/lib/dynamodb')
        const scans = await queryImageScans({
          customerId: customerId || undefined,
          days: 1, // Last 24 hours
          limit: 10000
        })

        if (scans.length > 0) {
          // Process scans to build statistics
          const qrThreats: QRCodeThreat[] = []
          const imageThreats: ImageThreat[] = []
          
          let qrCodesDetected = 0
          let maliciousQRCodes = 0
          let offensiveImages = 0
          let logoImpersonations = 0
          let hiddenLinks = 0
          let screenshotPhishing = 0

          scans.forEach((scan: any) => {
            const scanType = scan.scan_type || scan.scanType
            const threatDetected = scan.threat_detected || scan.threatDetected || false
            const threatScore = scan.threat_score || scan.threatScore || 0

            if (scanType === 'qr_code' || scanType === 'QR_CODE') {
              qrCodesDetected++
              if (threatDetected && threatScore > 0.5) {
                maliciousQRCodes++
                qrThreats.push({
                  messageId: scan.messageId || scan.message_id || '',
                  timestamp: scan.timestamp || new Date().toISOString(),
                  sender: scan.sender || scan.senderEmail || '',
                  subject: scan.subject || '',
                  qr_url: scan.detection_details?.qr_url || scan.qr_url || '',
                  threat_score: threatScore,
                  indicators: scan.detection_details?.indicators || scan.indicators || [],
                  detection_method: scan.detection_details?.detection_method || scan.detection_method || 'unknown'
                })
              }
            } else if (scanType === 'image_threat' || scanType === 'IMAGE_THREAT') {
              const threatType = scan.detection_details?.threat_type || scan.threat_type || ''
              
              if (threatType === 'offensive' || threatType === 'OFFENSIVE') {
                offensiveImages++
              } else if (threatType === 'logo_impersonation' || threatType === 'LOGO_IMPERSONATION') {
                logoImpersonations++
              } else if (threatType === 'hidden_link' || threatType === 'HIDDEN_LINK') {
                hiddenLinks++
              } else if (threatType === 'screenshot_phishing' || threatType === 'SCREENSHOT_PHISHING') {
                screenshotPhishing++
              }

              if (threatDetected) {
                imageThreats.push({
                  messageId: scan.messageId || scan.message_id || '',
                  timestamp: scan.timestamp || new Date().toISOString(),
                  sender: scan.sender || scan.senderEmail || '',
                  subject: scan.subject || '',
                  threat_type: threatType,
                  threat_score: threatScore,
                  brand: scan.detection_details?.brand || scan.brand,
                  indicators: scan.detection_details?.indicators || scan.indicators || [],
                  has_text: Boolean(scan.extracted_text || scan.has_text),
                  extracted_text: scan.extracted_text
                })
              }
            }
          })

          const realData: ImageScanStats = {
            total_scans_24h: scans.length,
            qr_codes_detected: qrCodesDetected,
            malicious_qr_codes: maliciousQRCodes,
            offensive_images: offensiveImages,
            logo_impersonations: logoImpersonations,
            hidden_links: hiddenLinks,
            screenshot_phishing: screenshotPhishing,
            recent_threats: {
              qr_threats: qrThreats.slice(0, 10), // Limit to 10 most recent
              image_threats: imageThreats.slice(0, 10)
            }
          }

          return NextResponse.json(realData)
        }
      } catch (dbError: any) {
        // If table doesn't exist or error, return zeros
        if (dbError.name === 'ResourceNotFoundException') {
          console.log('Image scans table does not exist yet')
        } else {
          console.error('Error fetching image scans:', dbError)
        }
      }

      // Return zeros if no data found
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

