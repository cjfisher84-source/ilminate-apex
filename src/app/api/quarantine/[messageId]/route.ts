import { NextRequest, NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb'

// Initialize DynamoDB client
const dynamoClient = new DynamoDBClient({ 
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  } : undefined
})

const docClient = DynamoDBDocumentClient.from(dynamoClient)

const TABLE_NAME = 'ilminate-apex-quarantine'
const CUSTOMER_ID = '7159b266-2289-499e-807a-2cdd316f5122' // TODO: Get from auth context

export async function GET(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const { messageId } = params
    
    // Query DynamoDB for specific message
    // We need to scan since we don't have the sort key
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'customerId = :customerId',
      FilterExpression: 'messageId = :messageId',
      ExpressionAttributeValues: {
        ':customerId': CUSTOMER_ID,
        ':messageId': messageId
      },
      Limit: 1
    })
    
    const result = await docClient.send(command)
    
    if (!result.Items || result.Items.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Message not found'
      }, { status: 404 })
    }
    
    // Parse DynamoDB item
    const item = result.Items[0]
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
    
    const message = {
      id: parsed.messageId || '',
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
      mailboxType: parsed.mailboxType || 'microsoft365',
      receivedDateTime: parsed.receivedDateTime || ''
    }
    
    return NextResponse.json({
      success: true,
      data: message
    })
    
  } catch (error: any) {
    console.error('Error fetching quarantine message:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

