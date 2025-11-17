/**
 * DynamoDB Client Utilities
 * 
 * Provides DynamoDB client and helper functions for querying data
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand, ScanCommand, UpdateCommand, DeleteCommand, GetCommand } from '@aws-sdk/lib-dynamodb'

// AWS Configuration
// Use DYNAMODB_REGION if set (for Amplify), otherwise fall back to standard AWS env vars
const REGION = process.env.DYNAMODB_REGION || process.env.AWS_REGION || process.env.REGION || 'us-east-2'

// DynamoDB Table Names
export const TABLES = {
  // Use DYNAMODB_TABLE_NAME if set (for Amplify), otherwise fall back to DYNAMODB_QUARANTINE_TABLE or default
  QUARANTINED_MESSAGES: process.env.DYNAMODB_TABLE_NAME || process.env.DYNAMODB_QUARANTINE_TABLE || 'ilminate-apex-quarantine',
  APEX_EVENTS: process.env.DYNAMODB_EVENTS_TABLE || 'ilminate-apex-events',
  IMAGE_SCANS: process.env.DYNAMODB_IMAGE_SCANS_TABLE || 'ilminate-image-scans',
  APEX_MESSAGES: process.env.DYNAMODB_MESSAGES_TABLE || 'apex_messages',
} as const

// Create DynamoDB client
// Use DYNAMODB_ACCESS_KEY_ID and DYNAMODB_SECRET_ACCESS_KEY if set (for Amplify)
const dynamoClient = new DynamoDBClient({ 
  region: REGION,
  credentials: process.env.DYNAMODB_ACCESS_KEY_ID && process.env.DYNAMODB_SECRET_ACCESS_KEY
    ? {
        accessKeyId: process.env.DYNAMODB_ACCESS_KEY_ID,
        secretAccessKey: process.env.DYNAMODB_SECRET_ACCESS_KEY,
      }
    : undefined,
  // Credentials will be automatically picked up from:
  // 1. DYNAMODB_ACCESS_KEY_ID / DYNAMODB_SECRET_ACCESS_KEY (for Amplify)
  // 2. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
  // 3. IAM role (if running on EC2/Lambda)
  // 4. AWS credentials file (~/.aws/credentials)
  // 5. AWS SSO (if configured)
})

// Create Document Client for easier data handling
export const docClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
})

/**
 * Query quarantine messages for a customer
 */
export async function queryQuarantinedMessages(params: {
  customerId: string
  severity?: string
  days?: number
  searchTerm?: string
  limit?: number
}) {
  const { customerId, severity, days = 30, searchTerm, limit = 1000 } = params
  
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  // Format date as YYYY-MM-DD for the sort key (quarantineDate#messageId)
  const cutoffDateStr = cutoffDate.toISOString().split('T')[0] // YYYY-MM-DD

  try {
    // Table structure: customerId (PK), quarantineDate#messageId (SK)
    // Format: YYYY-MM-DD#messageId
    // Use Query with customerId, then filter by date range
    
    const todayStr = new Date().toISOString().split('T')[0]
    
    // Build expression values for KeyCondition and FilterExpression
    const expressionValues: any = {
      ':customerId': customerId,
      ':cutoffDatePrefix': cutoffDateStr + '#', // Format: YYYY-MM-DD#
      ':todayDateMax': todayStr + '#~', // Format: YYYY-MM-DD#~ (~ is highest ASCII char)
    }
    
    // Build filter parts for FilterExpression (optional filters like severity, search)
    let filterParts: string[] = []
    
    // Use ExpressionAttributeNames for attribute names with special characters
    const attributeNames: Record<string, string> = {
      '#sortKey': 'quarantineDate#messageId',
      '#severity': 'severity',
      '#subject': 'subject',
      '#senderEmail': 'senderEmail',
      '#bodyPreview': 'bodyPreview',
    }
    
    // Add severity filter if specified
    if (severity && severity !== 'ALL') {
      filterParts.push('#severity = :severity')
      expressionValues[':severity'] = severity
    }
    
    // Add search term filter if specified
    if (searchTerm) {
      filterParts.push('(contains(#subject, :search) OR contains(#senderEmail, :search) OR contains(#bodyPreview, :search))')
      expressionValues[':search'] = searchTerm.toLowerCase()
    }
    
    // Use Query (more efficient than Scan) with customerId as partition key
    // Build FilterExpression from optional filters (severity, search)
    const filterExpression = filterParts.length > 0 
      ? filterParts.join(' AND ')
      : undefined
    
    const queryParams: any = {
      TableName: TABLES.QUARANTINED_MESSAGES,
      KeyConditionExpression: 'customerId = :customerId AND #sortKey BETWEEN :cutoffDatePrefix AND :todayDateMax',
      FilterExpression: filterExpression,
      ExpressionAttributeNames: attributeNames,
      ExpressionAttributeValues: expressionValues,
      ScanIndexForward: false, // Newest first (descending)
      Limit: limit,
    }
    
    const result = await docClient.send(new QueryCommand(queryParams))
    
    console.log(`Quarantine query: Found ${result.Items?.length || 0} items for customer ${customerId} in table ${TABLES.QUARANTINED_MESSAGES} (region: ${REGION})`)
    
    return result.Items || []
  } catch (error: any) {
    console.error('Error querying quarantined messages:', {
      error: error.message,
      name: error.name,
      table: TABLES.QUARANTINED_MESSAGES,
      region: REGION,
      customerId,
    })
    throw error
  }
}

/**
 * Query APEX events for ATT&CK mapping
 */
export async function queryApexEvents(params: {
  customerId?: string
  days?: number
  techniqueId?: string
  limit?: number
}) {
  const { customerId, days = 30, techniqueId, limit = 1000 } = params
  
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  const cutoffTimestamp = Math.floor(cutoffDate.getTime() / 1000)

  try {
    // Build scan parameters (events table may not have customerId as partition key)
    const scanParams: any = {
      TableName: TABLES.APEX_EVENTS,
      FilterExpression: 'timestamp >= :cutoffTimestamp',
      ExpressionAttributeValues: {
        ':cutoffTimestamp': cutoffTimestamp,
      },
      Limit: limit,
    }

    // Add customer filter if specified
    if (customerId) {
      scanParams.FilterExpression += ' AND customerId = :customerId'
      scanParams.ExpressionAttributeValues[':customerId'] = customerId
    }

    // Add technique filter if specified
    if (techniqueId) {
      scanParams.FilterExpression += ' AND contains(techniques, :techniqueId)'
      scanParams.ExpressionAttributeValues[':techniqueId'] = techniqueId
    }

    const result = await docClient.send(new ScanCommand(scanParams))
    return result.Items || []
  } catch (error) {
    console.error('Error querying APEX events:', error)
    // Return empty array if table doesn't exist yet
    if ((error as any).name === 'ResourceNotFoundException') {
      return []
    }
    throw error
  }
}

/**
 * Query image scan results
 */
export async function queryImageScans(params: {
  customerId?: string
  days?: number
  limit?: number
}) {
  const { customerId, days = 1, limit = 1000 } = params
  
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  const cutoffTimestamp = Math.floor(cutoffDate.getTime() / 1000)

  try {
    const scanParams: any = {
      TableName: TABLES.IMAGE_SCANS,
      FilterExpression: 'timestamp >= :cutoffTimestamp',
      ExpressionAttributeValues: {
        ':cutoffTimestamp': cutoffTimestamp,
      },
      Limit: limit,
    }

    if (customerId) {
      scanParams.FilterExpression += ' AND customerId = :customerId'
      scanParams.ExpressionAttributeValues[':customerId'] = customerId
    }

    const result = await docClient.send(new ScanCommand(scanParams))
    return result.Items || []
  } catch (error) {
    console.error('Error querying image scans:', error)
    // Return empty array if table doesn't exist yet
    if ((error as any).name === 'ResourceNotFoundException') {
      return []
    }
    throw error
  }
}

/**
 * Get dashboard statistics from events
 */
export async function getDashboardStats(params: {
  customerId?: string
  days?: number
}) {
  const { customerId, days = 30 } = params
  
  try {
    const events = await queryApexEvents({ customerId, days, limit: 10000 })
    
    // Calculate statistics
    const stats = {
      totalEvents: events.length,
      quarantined: events.filter((e: any) => e.apex_action === 'QUARANTINE' || e.action === 'QUARANTINE').length,
      blocked: events.filter((e: any) => e.apex_action === 'BLOCK' || e.action === 'BLOCK').length,
      allowed: events.filter((e: any) => e.apex_action === 'ALLOW' || e.action === 'ALLOW').length,
      byCategory: {} as Record<string, number>,
      byThreatLevel: {} as Record<string, number>,
    }

    // Count by category
    events.forEach((event: any) => {
      const category = event.threat_category || event.category || 'unknown'
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1
      
      const threatLevel = event.threat_level || event.severity || 'unknown'
      stats.byThreatLevel[threatLevel] = (stats.byThreatLevel[threatLevel] || 0) + 1
    })

    return stats
  } catch (error) {
    console.error('Error getting dashboard stats:', error)
    return {
      totalEvents: 0,
      quarantined: 0,
      blocked: 0,
      allowed: 0,
      byCategory: {},
      byThreatLevel: {},
    }
  }
}

/**
 * Get a single quarantine message by customerId and messageId
 * Note: We need to find the message first since we only have messageId, not the sort key
 */
export async function getQuarantineMessage(params: {
  customerId: string
  messageId: string
}) {
  const { customerId, messageId } = params

  try {
    // Query all messages for this customer and find the one with matching messageId
    // This is not ideal but necessary since we don't have the date part of the sort key
    const messages = await queryQuarantinedMessages({
      customerId,
      days: 365, // Search last year
      limit: 1000,
    })

    const message = messages.find((m: any) => m.messageId === messageId)
    return message || null
  } catch (error: any) {
    console.error('Error getting quarantine message:', {
      error: error.message,
      name: error.name,
      customerId,
      messageId,
    })
    throw error
  }
}

/**
 * Update quarantine message status (e.g., release or delete)
 */
export async function updateQuarantineMessageStatus(params: {
  customerId: string
  messageId: string
  status: 'quarantined' | 'released' | 'deleted'
  releasedBy?: string
  releasedAt?: number
}) {
  const { customerId, messageId, status, releasedBy, releasedAt } = params

  try {
    // First, get the message to find its sort key
    const message = await getQuarantineMessage({ customerId, messageId })
    
    if (!message) {
      throw new Error(`Message ${messageId} not found`)
    }

    // Extract sort key from the message
    const sortKey = message['quarantineDate#messageId']
    if (!sortKey) {
      throw new Error(`Message ${messageId} missing sort key`)
    }

    // Build update expression
    const updateExpression: string[] = ['SET #status = :status']
    const expressionAttributeNames: Record<string, string> = {
      '#status': 'status',
    }
    const expressionAttributeValues: Record<string, any> = {
      ':status': status,
    }

    // Add release metadata if releasing
    if (status === 'released') {
      updateExpression.push('releasedAt = :releasedAt')
      expressionAttributeValues[':releasedAt'] = releasedAt || Date.now()
      
      if (releasedBy) {
        updateExpression.push('releasedBy = :releasedBy')
        expressionAttributeValues[':releasedBy'] = releasedBy
      }
    }

    const updateParams = {
      TableName: TABLES.QUARANTINED_MESSAGES,
      Key: {
        customerId,
        'quarantineDate#messageId': sortKey,
      },
      UpdateExpression: updateExpression.join(', '),
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW' as const,
    }

    const result = await docClient.send(new UpdateCommand(updateParams))
    return result.Attributes
  } catch (error: any) {
    console.error('Error updating quarantine message status:', {
      error: error.message,
      name: error.name,
      customerId,
      messageId,
      status,
    })
    throw error
  }
}

/**
 * Delete a quarantine message
 */
export async function deleteQuarantineMessage(params: {
  customerId: string
  messageId: string
}) {
  const { customerId, messageId } = params

  try {
    // First, get the message to find its sort key
    const message = await getQuarantineMessage({ customerId, messageId })
    
    if (!message) {
      throw new Error(`Message ${messageId} not found`)
    }

    // Extract sort key from the message
    const sortKey = message['quarantineDate#messageId']
    if (!sortKey) {
      throw new Error(`Message ${messageId} missing sort key`)
    }

    const deleteParams = {
      TableName: TABLES.QUARANTINED_MESSAGES,
      Key: {
        customerId,
        'quarantineDate#messageId': sortKey,
      },
    }

    await docClient.send(new DeleteCommand(deleteParams))
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting quarantine message:', {
      error: error.message,
      name: error.name,
      customerId,
      messageId,
    })
    throw error
  }
}

