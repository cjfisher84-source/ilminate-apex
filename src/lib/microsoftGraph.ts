import { ClientSecretCredential } from '@azure/identity'
import { Client } from '@microsoft/microsoft-graph-client'
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials'
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'

interface AzureADConfig {
  clientId: string
  clientSecret: string
  tenantId: string
}

let graphClient: Client | null = null

/**
 * Get Microsoft Graph API client
 */
export async function getMicrosoftGraphClient(): Promise<Client> {
  if (graphClient) {
    return graphClient
  }

  // Get credentials from AWS Secrets Manager or environment variables
  const config = await getAzureADConfig()
  
  const credential = new ClientSecretCredential(
    config.tenantId,
    config.clientId,
    config.clientSecret
  )

  const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes: ['https://graph.microsoft.com/.default']
  })

  graphClient = Client.initWithMiddleware({ authProvider })
  return graphClient
}

/**
 * Get Azure AD configuration from Secrets Manager or env vars
 */
async function getAzureADConfig(): Promise<AzureADConfig> {
  // Try environment variables first (for local dev)
  if (process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET && process.env.AZURE_TENANT_ID) {
    return {
      clientId: process.env.AZURE_CLIENT_ID,
      clientSecret: process.env.AZURE_CLIENT_SECRET,
      tenantId: process.env.AZURE_TENANT_ID
    }
  }

  // Otherwise, fetch from AWS Secrets Manager
  const secretsClient = new SecretsManagerClient({ region: process.env.AWS_REGION || 'us-east-1' })
  
  try {
    const response = await secretsClient.send(
      new GetSecretValueCommand({ SecretId: 'apex-mailvault-azure-ad' })
    )
    
    return JSON.parse(response.SecretString || '{}')
  } catch (error: any) {
    console.error('Failed to fetch Azure AD config from Secrets Manager:', error)
    throw new Error('Azure AD configuration not found. Please set environment variables or configure Secrets Manager.')
  }
}

/**
 * Search messages in a user's mailbox
 */
export async function searchMicrosoft365Messages(params: {
  userEmail: string
  subject?: string
  senderEmail?: string
  recipientEmail?: string
  keywords?: string
  dateFrom?: string
  dateTo?: string
  limit?: number
}): Promise<any[]> {
  const client = await getMicrosoftGraphClient()
  
  // Build OData filter query
  const filters: string[] = []
  
  if (params.subject) {
    filters.push(`contains(subject, '${params.subject.replace(/'/g, "''")}')`)
  }
  
  if (params.senderEmail) {
    filters.push(`from/emailAddress/address eq '${params.senderEmail.replace(/'/g, "''")}'`)
  }
  
  if (params.keywords) {
    filters.push(`contains(body/content, '${params.keywords.replace(/'/g, "''")}')`)
  }
  
  if (params.dateFrom) {
    filters.push(`receivedDateTime ge ${params.dateFrom}T00:00:00Z`)
  }
  
  if (params.dateTo) {
    filters.push(`receivedDateTime le ${params.dateTo}T23:59:59Z`)
  }
  
  const filterQuery = filters.length > 0 ? `$filter=${filters.join(' and ')}` : ''
  const limitQuery = params.limit ? `$top=${params.limit}` : '$top=100'
  const selectQuery = '$select=id,subject,sender,toRecipients,receivedDateTime,hasAttachments,bodyPreview,isRead'
  
  const queryParts = [selectQuery, limitQuery]
  if (filterQuery) queryParts.push(filterQuery)
  queryParts.push('$orderby=receivedDateTime desc')
  
  const query = `users/${encodeURIComponent(params.userEmail)}/messages?${queryParts.join('&')}`
  
  try {
    const response = await client.api(query).get()
    return response.value || []
  } catch (error: any) {
    console.error('Microsoft Graph API error:', error)
    throw new Error(`Failed to search messages: ${error.message}`)
  }
}

/**
 * Get a specific message by ID
 */
export async function getMicrosoft365Message(userEmail: string, messageId: string): Promise<any> {
  const client = await getMicrosoftGraphClient()
  
  try {
    const message = await client
      .api(`users/${encodeURIComponent(userEmail)}/messages/${messageId}`)
      .get()
    
    return message
  } catch (error: any) {
    console.error('Microsoft Graph API error:', error)
    throw new Error(`Failed to get message: ${error.message}`)
  }
}

/**
 * Get message in .eml format
 */
export async function getMicrosoft365MessageEml(userEmail: string, messageId: string): Promise<string> {
  const client = await getMicrosoftGraphClient()
  
  try {
    const eml = await client
      .api(`users/${encodeURIComponent(userEmail)}/messages/${messageId}/$value`)
      .get()
    
    return eml
  } catch (error: any) {
    console.error('Microsoft Graph API error:', error)
    throw new Error(`Failed to get message EML: ${error.message}`)
  }
}

/**
 * List all users in the organization
 */
export async function listMicrosoft365Users(): Promise<any[]> {
  const client = await getMicrosoftGraphClient()
  
  try {
    const response = await client
      .api('/users')
      .select('id,mail,userPrincipalName,displayName')
      .get()
    
    return response.value || []
  } catch (error: any) {
    console.error('Microsoft Graph API error:', error)
    throw new Error(`Failed to list users: ${error.message}`)
  }
}

