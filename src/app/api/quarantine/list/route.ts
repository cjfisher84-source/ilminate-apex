import { NextRequest, NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb'

// Initialize DynamoDB client
const dynamoClient = new DynamoDBClient({ 
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  } : undefined
})

const docClient = DynamoDBDocumentClient.from(dynamoClient)

const TABLE_NAME = 'ilminate-apex-quarantine'
const CUSTOMER_ID = '7159b266-2289-499e-807a-2cdd316f5122' // TODO: Get from auth context

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const severity = searchParams.get('severity') || 'ALL'
    const search = searchParams.get('search') || ''
    const days = parseInt(searchParams.get('days') || '30')
    
    // Calculate date threshold
    const daysAgo = new Date()
    daysAgo.setDate(daysAgo.getDate() - days)
    const timestampThreshold = Math.floor(daysAgo.getTime() / 1000)
    
    // Query DynamoDB
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'customerId = :customerId',
      ExpressionAttributeValues: {
        ':customerId': CUSTOMER_ID,
      },
      ScanIndexForward: false, // Sort descending by date
      Limit: 500
    })
    
    const result = await docClient.send(command)
    
    // Transform DynamoDB items to frontend format
    let messages = (result.Items || []).map((item: any) => {
      // Parse DynamoDB format
      const parseValue = (val: any): any => {
        if (val.S) return val.S
        if (val.N) return parseFloat(val.N)
        if (val.BOOL !== undefined) return val.BOOL
        if (val.L) return val.L.map((v: any) => parseValue(v))
        if (val.M) {
          const obj: any = {}
          for (const [k, v] of Object.entries(val.M)) {
            obj[k] = parseValue(v)
          }
          return obj
        }
        return val
      }
      
      const parseItem = (item: any) => {
        const parsed: any = {}
        for (const [key, value] of Object.entries(item)) {
          parsed[key] = parseValue(value)
        }
        return parsed
      }
      
      const parsed = parseItem(item)
      
      return {
        id: parsed.messageId || parsed['quarantineDate#messageId']?.split('#')[1] || '',
        messageId: parsed.messageId || '',
        subject: parsed.subject || 'No Subject',
        sender: parsed.sender || '',
        recipients: Array.isArray(parsed.recipients) ? parsed.recipients : [parsed.recipients].filter(Boolean),
        quarantineDate: parsed.quarantineDate ? new Date(parsed.quarantineDate * 1000) : new Date(),
        riskScore: parsed.riskScore || 0,
        severity: parsed.severity || 'LOW',
        detectionReasons: Array.isArray(parsed.detectionReasons) ? parsed.detectionReasons : [],
        bodyPreview: parsed.bodyPreview || '',
        hasAttachments: parsed.hasAttachments || false,
        status: parsed.status || 'quarantined',
        mailboxType: parsed.mailboxType || 'microsoft365'
      }
    })
    
    // Filter by date
    messages = messages.filter(msg => {
      const msgTimestamp = Math.floor(msg.quarantineDate.getTime() / 1000)
      return msgTimestamp >= timestampThreshold
    })
    
    // Filter by severity
    if (severity !== 'ALL') {
      messages = messages.filter(msg => msg.severity === severity)
    }
    
    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase()
      messages = messages.filter(msg => 
        msg.subject.toLowerCase().includes(searchLower) ||
        msg.sender.toLowerCase().includes(searchLower) ||
        msg.bodyPreview.toLowerCase().includes(searchLower)
      )
    }
    
    // Sort by date (newest first)
    messages.sort((a, b) => b.quarantineDate.getTime() - a.quarantineDate.getTime())
    
    return NextResponse.json({
      success: true,
      data: messages,
      count: messages.length
    })
    
  } catch (error: any) {
    console.error('Error fetching quarantine messages:', error)
    
    // Fallback to empty array if DynamoDB fails
    return NextResponse.json({
      success: true,
      data: [],
      count: 0,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

