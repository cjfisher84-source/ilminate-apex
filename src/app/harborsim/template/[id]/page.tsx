'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Box, Typography, Paper, Button, CircularProgress, Alert, Chip, Divider } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import SendIcon from '@mui/icons-material/Send'
import SecurityIcon from '@mui/icons-material/Security'
import WarningIcon from '@mui/icons-material/Warning'
import LinkOffIcon from '@mui/icons-material/LinkOff'

interface Template {
  id: string
  name: string
  sender_name: string
  sender_email: string
  subject: string
  html_content: string
  text_content: string
  preview: string
  status: string
  created_at: string
  approved: boolean
  threats_detected?: string[]
  deweaponized_items?: string[]
}

export default function HarborSimDetail() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (id) fetchTemplate()
  }, [id])

  const getMockTemplate = (templateId: string): Template | null => {
    const mockTemplates: Record<string, Template> = {
      '1': {
        id: '1',
        name: 'Account Verification Phishing Attack',
        sender_name: 'Microsoft Security',
        sender_email: 'security@microsoft-verify.com',
        subject: 'URGENT: Suspicious Activity Detected - Verify Your Account Now',
        html_content: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #e5e7eb;">
            <p style="color: #e5e7eb;">Dear Microsoft User,</p>
            <p style="color: #e5e7eb;">We have detected unusual sign-in activity on your Microsoft account from a new device in <strong style="color: #f3f4f6;">Moscow, Russia</strong> on November 19, 2025 at 3:47 AM.</p>
            <p style="color: #e5e7eb;">If this was you, no action is needed. However, if you did not authorize this activity, please verify your account immediately to prevent unauthorized access.</p>
            <p style="background-color: #78350f; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; color: #fef3c7;">
              <strong>⚠️ ACTION REQUIRED:</strong> Your account will be suspended within 24 hours if you do not verify your identity.
            </p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="#" style="background-color: #0078d4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">VERIFY YOUR ACCOUNT NOW</a>
            </p>
            <p style="color: #e5e7eb;">This is an automated security message. Do not reply to this email.</p>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
              Microsoft Corporation | One Microsoft Way | Redmond, WA 98052
            </p>
          </div>
        `,
        text_content: `Dear Microsoft User,

We have detected unusual sign-in activity on your Microsoft account from a new device in Moscow, Russia on November 19, 2025 at 3:47 AM.

If this was you, no action is needed. However, if you did not authorize this activity, please verify your account immediately to prevent unauthorized access.

⚠️ ACTION REQUIRED: Your account will be suspended within 24 hours if you do not verify your identity.

VERIFY YOUR ACCOUNT NOW: http://microsoft-verify-security.com/login

This is an automated security message. Do not reply to this email.

Microsoft Corporation | One Microsoft Way | Redmond, WA 98052`,
        preview: 'Phishing email impersonating Microsoft security with urgent account verification request.',
        status: 'draft',
        created_at: new Date().toISOString(),
        approved: false,
        threats_detected: [
          'Malicious link to phishing site (microsoft-verify-security.com)',
          'Spoofed sender domain (microsoft-verify.com instead of microsoft.com)',
          'Urgent language designed to create panic',
          'False sense of urgency with 24-hour deadline',
          'Geographic location spoofing (Moscow, Russia)'
        ],
        deweaponized_items: [
          'All clickable links have been removed and replaced with safe placeholders',
          'Malicious URL replaced with training-safe redirect endpoint',
          'Personal information and account details have been redacted',
          'Email addresses have been sanitized',
          'All tracking pixels and external resources have been removed'
        ]
      },
      '2': {
        id: '2',
        name: 'CEO Impersonation Wire Transfer Scam',
        sender_name: 'Sarah Johnson',
        sender_email: 'sarah.johnson@company-exec.com',
        subject: 'URGENT: Confidential Wire Transfer Request',
        html_content: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #e5e7eb;">
            <p style="color: #e5e7eb;">Hi,</p>
            <p style="color: #e5e7eb;">I need you to process a wire transfer immediately. This is confidential and time-sensitive.</p>
            <p style="color: #e5e7eb;">I'm currently in a meeting and cannot take calls, but I need this completed today before 5 PM EST.</p>
            <p style="color: #e5e7eb;"><strong style="color: #f3f4f6;">Transfer Details:</strong></p>
            <ul style="color: #e5e7eb;">
              <li style="color: #e5e7eb;">Amount: $87,500.00 USD</li>
              <li style="color: #e5e7eb;">Recipient: Global Services LLC</li>
              <li style="color: #e5e7eb;">Account Number: 9876543210</li>
              <li style="color: #e5e7eb;">Routing Number: 021000021</li>
              <li style="color: #e5e7eb;">Bank: First National Bank</li>
              <li style="color: #e5e7eb;">SWIFT Code: FNBNUS33</li>
            </ul>
            <p style="color: #e5e7eb;">This is for an acquisition we're finalizing. Please process this ASAP and reply with confirmation.</p>
            <p style="color: #e5e7eb;">Thanks,<br>Sarah</p>
            <p style="color: #9ca3af; font-size: 11px; margin-top: 20px;">
              Sent from my iPhone
            </p>
          </div>
        `,
        text_content: `Hi,

I need you to process a wire transfer immediately. This is confidential and time-sensitive.

I'm currently in a meeting and cannot take calls, but I need this completed today before 5 PM EST.

Transfer Details:
- Amount: $87,500.00 USD
- Recipient: Global Services LLC
- Account Number: 9876543210
- Routing Number: 021000021
- Bank: First National Bank
- SWIFT Code: FNBNUS33

This is for an acquisition we're finalizing. Please process this ASAP and reply with confirmation.

Thanks,
Sarah

Sent from my iPhone`,
        preview: 'CEO impersonation attack requesting urgent wire transfer with fake bank details.',
        status: 'approved',
        created_at: new Date().toISOString(),
        approved: true,
        threats_detected: [
          'Spoofed CEO email address (company-exec.com instead of company.com)',
          'Urgent request to bypass normal approval processes',
          'Request for large wire transfer to unknown recipient',
          'Attempt to create false urgency with meeting excuse',
          'Banking information designed to look legitimate'
        ],
        deweaponized_items: [
          'All bank account numbers have been redacted',
          'Wire transfer amounts have been sanitized',
          'Recipient information has been removed',
          'Email addresses have been de-identified',
          'All financial details are now safe for training purposes'
        ]
      },
      '3': {
        id: '3',
        name: 'Invoice Payment Phishing Scam',
        sender_name: 'Accounts Payable',
        sender_email: 'invoices@payments-processing.net',
        subject: 'Invoice #INV-2025-8472 - Payment Overdue',
        html_content: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #e5e7eb;">
            <p style="color: #e5e7eb;">Dear Valued Customer,</p>
            <p style="color: #e5e7eb;">We hope this email finds you well. We are writing to inform you that invoice <strong style="color: #f3f4f6;">#INV-2025-8472</strong> in the amount of <strong style="color: #f3f4f6;">$3,247.89</strong> is now overdue.</p>
            <p style="color: #e5e7eb;">According to our records, this invoice was due on November 15, 2025. To avoid service interruption, please remit payment immediately.</p>
            <p style="background-color: #7f1d1d; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0; color: #fecaca;">
              <strong>⚠️ WARNING:</strong> Failure to pay within 48 hours will result in immediate service suspension.
            </p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="#" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">PAY INVOICE NOW</a>
            </p>
            <p style="color: #e5e7eb;">If you have already made this payment, please disregard this notice. For questions, contact us at billing@payments-processing.net</p>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
              Payments Processing Services | 123 Business Park Drive | Suite 400
            </p>
          </div>
        `,
        text_content: `Dear Valued Customer,

We hope this email finds you well. We are writing to inform you that invoice #INV-2025-8472 in the amount of $3,247.89 is now overdue.

According to our records, this invoice was due on November 15, 2025. To avoid service interruption, please remit payment immediately.

⚠️ WARNING: Failure to pay within 48 hours will result in immediate service suspension.

PAY INVOICE NOW: http://payments-processing.net/invoice/INV-2025-8472

If you have already made this payment, please disregard this notice. For questions, contact us at billing@payments-processing.net

Payments Processing Services | 123 Business Park Drive | Suite 400`,
        preview: 'Fake invoice scam with urgent payment request and malicious payment link.',
        status: 'draft',
        created_at: new Date().toISOString(),
        approved: false,
        threats_detected: [
          'Fake invoice with fabricated invoice number',
          'Malicious payment link to phishing site',
          'False urgency with service suspension threat',
          'Spoofed sender domain (payments-processing.net)',
          'Fake company address and contact information'
        ],
        deweaponized_items: [
          'Payment links have been disabled and replaced with safe placeholders',
          'Invoice numbers and amounts have been sanitized',
          'All financial information has been redacted',
          'Company addresses and contact details have been removed',
          'Tracking and analytics code has been eliminated'
        ]
      }
    }
    return mockTemplates[templateId] || null
  }

  const fetchTemplate = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Always use mock data for now since API doesn't return full template content
      // In production, API will return full templates with all fields
      const mockTemplate = getMockTemplate(id)
      if (mockTemplate) {
        // Try to fetch API data to merge status/approval info
        try {
          const response = await fetch(`/api/harborsim/v1/templates/${id}`)
          if (response.ok) {
            const apiData = await response.json()
            // Merge API status with mock template data
            if (apiData.Status) {
              mockTemplate.status = apiData.Status.toLowerCase()
              mockTemplate.approved = apiData.Status === 'Approved'
            }
            if (apiData.ApprovedAt) {
              mockTemplate.approved = true
            }
          }
        } catch (apiErr) {
          // Ignore API errors, just use mock data
          console.log('Using mock data only')
        }
        
        setTemplate(mockTemplate)
        return
      }
      
      throw new Error('Template not found')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load template')
      console.error('Error fetching template:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!id) return
    try {
      setActionLoading(true)
      const response = await fetch(`/api/harborsim/v1/templates/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      if (!response.ok) throw new Error('Failed to approve template')
      setTemplate(prev => prev ? { ...prev, approved: true, status: 'approved' } : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve template')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSend = async () => {
    if (!id) return
    try {
      setActionLoading(true)
      const response = await fetch(`/api/harborsim/v1/templates/${id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      if (!response.ok) throw new Error('Failed to send campaign')
      alert('Campaign scheduled successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send campaign')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#030712', color: '#f3f4f6', p: 4 }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 3 }}>
          <Link href="/harborsim" style={{ textDecoration: 'none' }}>
            <Image src="/logo.png" alt="Logo" width={60} height={60} />
          </Link>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#f3f4f6', mb: 0.5 }}>
              {template?.name || 'Template Details'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              Template Viewer & Manager
            </Typography>
          </Box>
          <Link href="/harborsim" passHref legacyBehavior>
            <Button
              variant="outlined"
              component="a"
              sx={{ color: '#14b8a6', borderColor: '#14b8a6', '&:hover': { borderColor: '#0d9488', bgcolor: 'rgba(20, 184, 166, 0.1)' } }}
            >
              ← Back to List
            </Button>
          </Link>
        </Box>

        {/* Content */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress sx={{ color: '#14b8a6' }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ bgcolor: '#1f2937', color: '#fca5a5' }}>
            {error}
          </Alert>
        ) : template ? (
          <>
            <Paper sx={{ bgcolor: '#111827', border: '1px solid #374151', p: 4, mb: 3 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ color: '#9ca3af', mb: 1 }}>
                  From
                </Typography>
                <Typography variant="body1" sx={{ color: '#f3f4f6' }}>
                  {template.sender_name} &lt;{template.sender_email}&gt;
                </Typography>
              </Box>
              <Divider sx={{ bgcolor: '#374151', my: 3 }} />
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ color: '#9ca3af', mb: 1 }}>
                  Subject
                </Typography>
                <Typography variant="body1" sx={{ color: '#f3f4f6' }}>
                  {template.subject}
                </Typography>
              </Box>
              <Divider sx={{ bgcolor: '#374151', my: 3 }} />
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ color: '#9ca3af', mb: 1 }}>
                  Status
                </Typography>
                <Chip
                  label={template.status}
                  color={template.approved ? 'success' : 'default'}
                  sx={{ bgcolor: template.approved ? '#10b981' : '#6b7280', color: '#fff' }}
                />
              </Box>
              <Divider sx={{ bgcolor: '#374151', my: 3 }} />
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ color: '#9ca3af', mb: 2 }}>
                  Content
                </Typography>
                {template.html_content ? (
                  <Box
                    sx={{
                      bgcolor: '#1f2937',
                      p: 3,
                      borderRadius: 2,
                      border: '1px solid #374151'
                    }}
                    dangerouslySetInnerHTML={{ __html: template.html_content }}
                  />
                ) : (
                  <Typography variant="body2" sx={{ color: '#d1d5db', whiteSpace: 'pre-wrap' }}>
                    {template.text_content || template.preview}
                  </Typography>
                )}
              </Box>
            </Paper>

            {/* Security Analysis Section */}
            {(template.threats_detected || template.deweaponized_items) && (
              <Paper sx={{ bgcolor: '#111827', border: '1px solid #374151', p: 4, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
                  <SecurityIcon sx={{ color: '#14b8a6', fontSize: 28 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#f3f4f6' }}>
                    Security Analysis
                  </Typography>
                </Box>

                {template.threats_detected && template.threats_detected.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                      <WarningIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#f3f4f6' }}>
                        Threats Detected in Original Email
                      </Typography>
                    </Box>
                    <Box sx={{ bgcolor: '#1f2937', p: 2, borderRadius: 2, border: '1px solid #7c2d12' }}>
                      <Box component="ul" sx={{ color: '#fca5a5', pl: 3, mb: 0, '& li': { mb: 1 } }}>
                        {template.threats_detected.map((threat, index) => (
                          <li key={index}>{threat}</li>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                )}

                {template.deweaponized_items && template.deweaponized_items.length > 0 && (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                      <LinkOffIcon sx={{ color: '#10b981', fontSize: 20 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#f3f4f6' }}>
                        How This Email Was Made Safe
                      </Typography>
                    </Box>
                    <Box sx={{ bgcolor: '#1f2937', p: 2, borderRadius: 2, border: '1px solid #065f46' }}>
                      <Box component="ul" sx={{ color: '#86efac', pl: 3, mb: 0, '& li': { mb: 1 } }}>
                        {template.deweaponized_items.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                )}

                <Alert 
                  severity="info" 
                  sx={{ 
                    mt: 3, 
                    bgcolor: '#1e3a5f', 
                    color: '#93c5fd', 
                    border: '1px solid #1e40af',
                    '& .MuiAlert-icon': { color: '#60a5fa' }
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Training Safe
                  </Typography>
                  <Typography variant="body2">
                    This template has been processed by HarborSim to remove all dangerous elements. 
                    It maintains the appearance and structure of the original phishing email so employees 
                    can learn to recognize threats, but all malicious content has been neutralized.
                  </Typography>
                </Alert>
              </Paper>
            )}

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<CheckCircleIcon />}
                onClick={handleApprove}
                disabled={actionLoading || template.approved}
                sx={{
                  bgcolor: '#10b981',
                  color: '#ffffff',
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#059669' },
                  '&:disabled': { bgcolor: '#6b7280' }
                }}
              >
                {template.approved ? 'Approved' : 'Approve Template'}
              </Button>
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={handleSend}
                disabled={actionLoading || !template.approved}
                sx={{
                  bgcolor: '#0d9488',
                  color: '#ffffff',
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#0f766e' },
                  '&:disabled': { bgcolor: '#6b7280' }
                }}
              >
                Schedule Campaign
              </Button>
            </Box>
          </>
        ) : null}
      </Box>
    </Box>
  )
}

