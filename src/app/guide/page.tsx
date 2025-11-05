'use client'

import { useState } from 'react'
import { Box, Typography, Paper, Accordion, AccordionSummary, AccordionDetails, Chip, Divider, List, ListItem, ListItemIcon, ListItemText, Button } from '@mui/material'
import { ExpandMore, Security, Search, Psychology, Gavel, Shield, Email, School, Computer, Event, BarChart, Warning, AccountCircle, Notifications, ChevronRight, Home } from '@mui/icons-material'
import Image from 'next/image'
import Link from 'next/link'
import UserProfile from '@/components/UserProfile'
import { useIsMobile, getResponsivePadding, getResponsiveFontSize, getResponsiveSpacing, getResponsiveImageSize } from '@/lib/mobileUtils'
import { useTheme } from '@mui/material/styles'

const UNCW_TEAL = '#007070'

interface GuideSection {
  id: string
  icon: JSX.Element
  title: string
  subtitle: string
  path: string
  content: {
    overview: string
    keyFeatures: string[]
    howTo: string[]
    tips?: string[]
  }
}

const guideSections: GuideSection[] = [
  {
    id: 'dashboard',
    icon: <Home sx={{ color: UNCW_TEAL }} />,
    title: 'APEX Dashboard',
    subtitle: 'Your security command center',
    path: '/',
    content: {
      overview: 'The APEX Dashboard provides a comprehensive overview of your organization\'s security posture. It displays real-time metrics, threat intelligence, and quick access to all security tools.',
      keyFeatures: [
        'Real-time security metrics and KPIs',
        'DMARC compliance monitoring for all protected domains',
        'Recent threat activity and blocked attacks',
        'Security posture score and recommendations',
        'Quick navigation to all APEX modules',
        'Domain abuse monitoring with IP geolocation'
      ],
      howTo: [
        'View the dashboard upon login to get an immediate security overview',
        'Click on any metric card to drill down into detailed views',
        'Use the navigation bar to access specific security modules',
        'Monitor DMARC status for each protected domain',
        'Review threat categories and take action on suspicious activity'
      ],
      tips: [
        'Check the dashboard daily for anomalies in your security metrics',
        'Set up notifications for critical security events',
        'Use the quick action buttons for immediate access to common tasks'
      ]
    }
  },
  {
    id: 'apex-trace',
    icon: <Search sx={{ color: UNCW_TEAL }} />,
    title: 'APEX Trace',
    subtitle: 'Super-fast message search & investigation',
    path: '/apex-trace',
    content: {
      overview: 'APEX Trace is a powerful search engine for email messages across your organization. It provides lightning-fast search capabilities with advanced filtering options to quickly locate and investigate suspicious messages.',
      keyFeatures: [
        'Ultra-fast message search across all email traffic',
        'Advanced filtering (sender, recipient, subject, date range)',
        'Message header analysis and forensics',
        'Threat indicator extraction and analysis',
        'Bulk message operations',
        'Export search results for further investigation'
      ],
      howTo: [
        'Enter search terms in the main search bar',
        'Use advanced filters to narrow results by sender, recipient, date, or threat indicators',
        'Click on any message to view full details including headers',
        'Review threat scores and indicators for each message',
        'Use bulk actions to quarantine or release multiple messages',
        'Export results to CSV for reporting or compliance'
      ],
      tips: [
        'Use wildcards (*) for partial matches in search queries',
        'Combine multiple filters for precise results',
        'Save frequently used search queries for quick access',
        'Review message headers to identify spoofing attempts'
      ]
    }
  },
  {
    id: 'triage',
    icon: <Psychology sx={{ color: UNCW_TEAL }} />,
    title: 'AI Triage',
    subtitle: 'Intelligent threat analysis & classification',
    path: '/triage',
    content: {
      overview: 'The AI Triage system leverages advanced machine learning to automatically analyze and classify suspicious emails. It provides detailed threat assessments, risk scores, and actionable recommendations.',
      keyFeatures: [
        'AI-powered threat classification (phishing, malware, spam, BEC)',
        'Automated risk scoring (0-100 scale)',
        'MITRE ATT&CK technique mapping',
        'Detailed threat indicator analysis',
        'SPF, DKIM, and DMARC authentication checks',
        'URL and attachment analysis',
        'Sender reputation scoring',
        'Actionable remediation recommendations'
      ],
      howTo: [
        'Paste email headers or message details into the triage form',
        'Select the incident type (phishing, malware, spam, etc.)',
        'Click "Run Triage" to analyze the threat',
        'Review the AI-generated risk score and classification',
        'Examine detected threat indicators and their severity levels',
        'Follow the recommended actions (quarantine, block sender, etc.)',
        'Use security check cards for detailed authentication analysis'
      ],
      tips: [
        'Higher risk scores (70+) require immediate action',
        'Review MITRE ATT&CK techniques to understand attacker tactics',
        'Use the "Draft Email" feature to escalate complex threats',
        'Cross-reference findings with APEX Trace for campaign analysis'
      ]
    }
  },
  {
    id: 'investigations',
    icon: <Gavel sx={{ color: UNCW_TEAL }} />,
    title: 'Campaign Investigations',
    subtitle: 'Cross-channel threat analysis',
    path: '/investigations',
    content: {
      overview: 'The Investigations module enables security teams to track and analyze coordinated attack campaigns. It correlates threats across multiple channels and provides case management capabilities.',
      keyFeatures: [
        'Multi-channel threat correlation (email, endpoint, network)',
        'Campaign timeline visualization',
        'Affected user and asset tracking',
        'Investigation status management',
        'Collaborative case notes and comments',
        'Attack pattern analysis',
        'Incident response workflow integration'
      ],
      howTo: [
        'Create a new investigation for suspected attack campaigns',
        'Add related messages, IOCs, and affected users',
        'Track investigation status (Open, In Progress, Closed)',
        'Assign investigators and set priority levels',
        'Document findings and remediation actions',
        'Generate investigation reports for compliance',
        'Link to MITRE ATT&CK techniques for context'
      ],
      tips: [
        'Group related threats into campaigns for better visibility',
        'Update investigation status regularly to track progress',
        'Use tags and labels for easy organization',
        'Export investigation data for executive reporting'
      ]
    }
  },
  {
    id: 'quarantine',
    icon: <Shield sx={{ color: UNCW_TEAL }} />,
    title: 'Quarantine Management',
    subtitle: 'Review and manage held messages',
    path: '/quarantine',
    content: {
      overview: 'The Quarantine system holds suspicious messages for security review before they reach user inboxes. Administrators can review, release, or permanently delete quarantined items.',
      keyFeatures: [
        'Centralized quarantine for all suspicious messages',
        'Detailed threat analysis for each quarantined item',
        'Bulk release or delete operations',
        'User self-service quarantine digest',
        'Automatic retention policies',
        'Whitelist/blacklist management',
        'Quarantine notifications and alerts'
      ],
      howTo: [
        'Review the quarantine queue regularly',
        'Click on messages to view full details and threat scores',
        'Release legitimate messages (false positives) to recipient inboxes',
        'Delete confirmed threats permanently',
        'Add safe senders to the whitelist to prevent future quarantines',
        'Set up automatic digest emails for end users',
        'Configure retention policies for auto-deletion'
      ],
      tips: [
        'Review quarantine daily to minimize delays in legitimate email',
        'Train users to recognize phishing so they can use self-service',
        'Monitor false positive rates and adjust filters accordingly',
        'Use bulk actions for efficiency when processing similar messages'
      ]
    }
  },
  {
    id: 'dmarc',
    icon: <Email sx={{ color: UNCW_TEAL }} />,
    title: 'DMARC Monitoring',
    subtitle: 'Email authentication & domain protection',
    path: '/dmarc',
    content: {
      overview: 'DMARC (Domain-based Message Authentication, Reporting and Conformance) monitoring ensures your domains are protected against spoofing and impersonation attacks. APEX provides detailed DMARC analytics and compliance reporting.',
      keyFeatures: [
        'Real-time DMARC report processing and analysis',
        'SPF and DKIM authentication validation',
        'Domain spoofing detection and alerts',
        'Sending source identification and mapping',
        'Policy enforcement monitoring (quarantine/reject)',
        'Compliance reporting for all protected domains',
        'Forensic failure analysis'
      ],
      howTo: [
        'Navigate to DMARC section to view protected domains',
        'Click on a domain to see detailed authentication statistics',
        'Review pass/fail rates for SPF, DKIM, and DMARC',
        'Identify unauthorized sending sources',
        'Monitor policy enforcement actions',
        'Generate compliance reports for audits',
        'Configure DMARC policies (monitor, quarantine, reject)'
      ],
      tips: [
        'Start with "p=none" (monitor mode) before enforcing',
        'Review DMARC reports weekly to identify sending sources',
        'Work with IT teams to ensure all legitimate sources pass SPF/DKIM',
        'Move to "p=quarantine" then "p=reject" for maximum protection'
      ]
    }
  },
  {
    id: 'harborsim',
    icon: <School sx={{ color: UNCW_TEAL }} />,
    title: 'HarborSim',
    subtitle: 'Phishing simulation & security awareness',
    path: '/harborsim',
    content: {
      overview: 'HarborSim is a comprehensive phishing simulation platform that helps train employees to recognize and report phishing attempts. It includes customizable templates and detailed reporting.',
      keyFeatures: [
        'Pre-built phishing simulation templates',
        'Custom template creation and editing',
        'Targeted campaign management',
        'Employee training and education modules',
        'Click-through and credential entry tracking',
        'Automated remedial training for failures',
        'Detailed analytics and reporting',
        'Industry benchmark comparisons'
      ],
      howTo: [
        'Select or create a phishing simulation template',
        'Choose target employees or groups',
        'Schedule and launch the simulation campaign',
        'Monitor real-time results (opens, clicks, reports)',
        'Review which users clicked or entered credentials',
        'Assign remedial training to users who failed',
        'Generate compliance reports for management',
        'Use the AI coach for personalized training content'
      ],
      tips: [
        'Run simulations quarterly to maintain awareness',
        'Vary template difficulty to challenge users',
        'Recognize and reward employees who report simulations',
        'Use realistic scenarios based on current threat trends',
        'Track improvement over time to measure training effectiveness'
      ]
    }
  },
  {
    id: 'edr',
    icon: <Computer sx={{ color: UNCW_TEAL }} />,
    title: 'Endpoint Detection & Response',
    subtitle: 'Endpoint security monitoring',
    path: '/edr/endpoints',
    content: {
      overview: 'The EDR module provides comprehensive endpoint security monitoring across Windows, macOS, and Linux devices. It detects threats, analyzes endpoint behavior, and enables rapid response to incidents.',
      keyFeatures: [
        'Real-time endpoint status monitoring',
        'Threat detection and alerting',
        'Process and file analysis',
        'Network connection monitoring',
        'Image and QR code scanning',
        'Automated threat response',
        'Endpoint compliance reporting',
        'Integration with MITRE ATT&CK framework'
      ],
      howTo: [
        'View endpoint status dashboard for all monitored devices',
        'Review active threats and alerts by severity',
        'Click on endpoints to see detailed threat information',
        'Investigate process trees and network connections',
        'Use image scanning to detect embedded threats',
        'Take response actions (isolate, quarantine, remediate)',
        'Generate compliance reports for endpoint security'
      ],
      tips: [
        'Ensure all endpoints have agents installed and reporting',
        'Set up alerts for critical threats to enable rapid response',
        'Review endpoint metrics regularly to identify trends',
        'Use QR code scanning to detect malicious links in physical media'
      ]
    }
  },
  {
    id: 'events',
    icon: <Event sx={{ color: UNCW_TEAL }} />,
    title: 'Security Events',
    subtitle: 'Real-time security event monitoring',
    path: '/events',
    content: {
      overview: 'The Events module provides a centralized view of all security events across your organization. It aggregates data from email, endpoints, network, and cloud sources for comprehensive threat visibility.',
      keyFeatures: [
        'Unified event stream across all security tools',
        'Real-time event correlation and analysis',
        'Event filtering and search capabilities',
        'Severity-based prioritization',
        'Event timeline visualization',
        'Automated event enrichment with threat intelligence',
        'Integration with SIEM platforms'
      ],
      howTo: [
        'View the real-time event stream on the Events page',
        'Filter events by type, severity, or source',
        'Click on events to see full details and context',
        'Create alerts for specific event patterns',
        'Export events for SIEM ingestion or compliance',
        'Use event correlation to identify attack patterns'
      ]
    }
  },
  {
    id: 'metrics',
    icon: <BarChart sx={{ color: UNCW_TEAL }} />,
    title: 'Security Metrics & Reporting',
    subtitle: 'Track performance and compliance',
    path: '/page',
    content: {
      overview: 'Security metrics provide quantifiable measurements of your security program\'s effectiveness. APEX tracks key performance indicators and generates compliance reports.',
      keyFeatures: [
        'Protection Rate - Percentage of threats successfully blocked',
        'Threats Blocked - Total count of prevented attacks',
        'Response Time - Average time to detect and respond to threats',
        'False Positive Rate - Accuracy of threat detection',
        'Coverage - Percentage of assets protected',
        'Last Incident - Time since last security incident',
        'Active Monitoring - Real-time monitoring status'
      ],
      howTo: [
        'Click on any metric card from the dashboard',
        'Review detailed explanations and calculation methods',
        'Track metric trends over time (daily, weekly, monthly)',
        'Generate reports for executive leadership',
        'Set metric goals and track progress',
        'Use metrics to justify security investments'
      ],
      tips: [
        'Focus on improvement trends rather than absolute numbers',
        'Benchmark against industry standards',
        'Use metrics to identify gaps in security coverage',
        'Share metrics with stakeholders to demonstrate value'
      ]
    }
  },
  {
    id: 'attack-reports',
    icon: <Warning sx={{ color: UNCW_TEAL }} />,
    title: 'MITRE ATT&CK Reports',
    subtitle: 'Adversary tactics & techniques',
    path: '/reports/attack',
    content: {
      overview: 'APEX integrates with the MITRE ATT&CK framework to map detected threats to known adversary tactics and techniques. This provides context for security incidents and helps prioritize defenses.',
      keyFeatures: [
        'Visual ATT&CK matrix with highlighted techniques',
        'Technique frequency and trend analysis',
        'Tactic-based grouping and filtering',
        'Detailed technique descriptions and mitigations',
        'Real-world examples and case studies',
        'Integration with threat intelligence feeds',
        'Custom reporting and exports'
      ],
      howTo: [
        'Navigate to Reports > MITRE ATT&CK',
        'View the ATT&CK matrix with detected techniques highlighted',
        'Click on tactics to filter techniques by category',
        'Select individual techniques to see detailed information',
        'Review affected messages and endpoints for each technique',
        'Export reports for threat briefings',
        'Use technique data to prioritize security controls'
      ],
      tips: [
        'Focus defenses on most frequently observed techniques',
        'Share ATT&CK reports with SOC teams for context',
        'Use technique mitigations to guide security improvements',
        'Track technique trends to identify emerging threats'
      ]
    }
  },
  {
    id: 'account',
    icon: <AccountCircle sx={{ color: UNCW_TEAL }} />,
    title: 'Account Management',
    subtitle: 'User profile & settings',
    path: '/account',
    content: {
      overview: 'The Account section allows users to manage their profile, preferences, and security settings. Administrators can configure multi-factor authentication and access controls.',
      keyFeatures: [
        'User profile management',
        'Password and authentication settings',
        'Multi-factor authentication (MFA) configuration',
        'Session management and activity logs',
        'Notification preferences',
        'API key management for integrations',
        'Role-based access control (RBAC)'
      ],
      howTo: [
        'Access Account settings from the user menu',
        'Update your profile information and contact details',
        'Enable MFA for enhanced security',
        'Review active sessions and sign out remote devices',
        'Configure notification preferences',
        'Generate API keys for third-party integrations',
        'Request role changes from administrators'
      ],
      tips: [
        'Enable MFA immediately for all admin accounts',
        'Review session activity regularly for suspicious logins',
        'Rotate API keys periodically',
        'Keep contact information up to date for security alerts'
      ]
    }
  },
  {
    id: 'notifications',
    icon: <Notifications sx={{ color: UNCW_TEAL }} />,
    title: 'Notification Center',
    subtitle: 'Alerts & communication hub',
    path: '/notifications',
    content: {
      overview: 'The Notification Center aggregates all security alerts, system updates, and important communications. Users can configure notification preferences and manage alert delivery.',
      keyFeatures: [
        'Real-time security alerts',
        'System maintenance notifications',
        'Investigation updates and assignments',
        'Compliance reminders',
        'Customizable notification rules',
        'Email, SMS, and webhook delivery options',
        'Notification history and audit trail'
      ],
      howTo: [
        'Click the bell icon or access from the user menu',
        'Review unread notifications',
        'Click on notifications to view full details and take action',
        'Configure notification preferences (email, in-app, SMS)',
        'Set up custom alert rules for specific events',
        'Manage notification frequency (real-time, digest)',
        'Archive or dismiss processed notifications'
      ],
      tips: [
        'Set up critical alerts to deliver via SMS for 24/7 monitoring',
        'Use digest mode for non-critical notifications to reduce noise',
        'Create custom rules for events specific to your organization',
        'Review notification history to track security incidents'
      ]
    }
  }
]

export default function GuidePage() {
  const theme = useTheme()
  const isMobile = useIsMobile()
  const [expanded, setExpanded] = useState<string | false>('dashboard')
  
  const containerPadding = getResponsivePadding(isMobile)
  const headerGap = getResponsiveSpacing(isMobile, 2, 3)
  const logoSize = getResponsiveImageSize(isMobile, 100)

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false)
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default', 
      color: 'text.primary', 
      p: containerPadding 
    }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center', 
          mb: isMobile ? 3 : 4,
          pb: isMobile ? 2 : 3,
          borderBottom: 2,
          borderColor: 'primary.main',
          gap: isMobile ? 2 : 0
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: headerGap }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Image 
                src="/ilminate-logo.png" 
                alt="Ilminate Logo" 
                width={logoSize} 
                height={logoSize}
                priority
                style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 112, 112, 0.3))' }}
              />
            </Link>
            <Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 0.5, 
                  color: 'text.primary',
                  fontSize: getResponsiveFontSize(isMobile, 'h3')
                }}
              >
                APEX <span style={{ color: theme.palette.primary.main }}>Command Guide</span>
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: 'text.secondary', 
                  fontWeight: 500,
                  fontSize: getResponsiveFontSize(isMobile, 'subtitle1')
                }}
              >
                {isMobile ? 'Complete Admin Guide' : 'Complete Administrator Guide for apex.ilminate.com'}
              </Typography>
            </Box>
          </Box>
          <UserProfile />
        </Box>

        {/* Introduction */}
        <Paper sx={{ 
          p: isMobile ? 2 : 4, 
          mb: 4, 
          bgcolor: 'background.paper',
          borderLeft: 4,
          borderColor: 'primary.main'
        }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
            Welcome to APEX
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.7 }}>
            Ilminate APEX (Advanced Protection & Exposure Intelligence) is your organization's comprehensive security 
            platform. This guide provides detailed documentation for all APEX features, tools, and best practices.
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
            Use the expandable sections below to learn about each module. Each section includes an overview, 
            key features, step-by-step instructions, and expert tips.
          </Typography>
        </Paper>

        {/* Quick Navigation */}
        <Paper sx={{ p: isMobile ? 2 : 3, mb: 4, bgcolor: 'background.paper' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
            📑 Quick Navigation
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', 
            gap: 1.5 
          }}>
            {guideSections.map((section) => (
              <Button
                key={section.id}
                onClick={() => setExpanded(section.id)}
                sx={{
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  color: expanded === section.id ? 'primary.main' : 'text.secondary',
                  bgcolor: expanded === section.id ? 'rgba(0, 112, 112, 0.08)' : 'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(0, 112, 112, 0.12)',
                    color: 'primary.main'
                  },
                  p: 1.5,
                  borderRadius: 1,
                  fontSize: '0.9rem'
                }}
                startIcon={section.icon}
              >
                {section.title}
              </Button>
            ))}
          </Box>
        </Paper>

        {/* Guide Sections */}
        <Box sx={{ mb: 4 }}>
          {guideSections.map((section) => (
            <Accordion
              key={section.id}
              expanded={expanded === section.id}
              onChange={handleChange(section.id)}
              sx={{
                mb: 2,
                bgcolor: 'background.paper',
                '&:before': { display: 'none' },
                borderRadius: '8px !important',
                overflow: 'hidden',
                border: '1px solid',
                borderColor: expanded === section.id ? 'primary.main' : 'divider'
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore sx={{ color: 'primary.main' }} />}
                sx={{
                  bgcolor: expanded === section.id ? 'rgba(0, 112, 112, 0.05)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(0, 112, 112, 0.08)' },
                  py: 2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Box sx={{ fontSize: '1.5rem' }}>{section.icon}</Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {section.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {section.subtitle}
                    </Typography>
                  </Box>
                  <Link href={section.path} passHref style={{ textDecoration: 'none' }}>
                    <Chip
                      label="Open Module"
                      size="small"
                      clickable
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        fontWeight: 600,
                        '&:hover': { bgcolor: '#005555' }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Link>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: isMobile ? 2 : 4 }}>
                {/* Overview */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                    📋 Overview
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                    {section.content.overview}
                  </Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Key Features */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                    ⭐ Key Features
                  </Typography>
                  <List sx={{ pl: 0 }}>
                    {section.content.keyFeatures.map((feature, idx) => (
                      <ListItem key={idx} sx={{ py: 0.5, pl: 0 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <ChevronRight sx={{ color: UNCW_TEAL }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={feature}
                          primaryTypographyProps={{
                            variant: 'body2',
                            color: 'text.secondary'
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* How To Use */}
                <Box sx={{ mb: section.content.tips ? 4 : 0 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                    🎯 How to Use
                  </Typography>
                  <List sx={{ pl: 0 }}>
                    {section.content.howTo.map((step, idx) => (
                      <ListItem key={idx} sx={{ py: 0.5, pl: 0, alignItems: 'flex-start' }}>
                        <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                          <Box sx={{ 
                            width: 24, 
                            height: 24, 
                            borderRadius: '50%', 
                            bgcolor: UNCW_TEAL, 
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}>
                            {idx + 1}
                          </Box>
                        </ListItemIcon>
                        <ListItemText 
                          primary={step}
                          primaryTypographyProps={{
                            variant: 'body2',
                            color: 'text.secondary'
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>

                {/* Tips (if available) */}
                {section.content.tips && (
                  <>
                    <Divider sx={{ my: 3 }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                        💡 Pro Tips
                      </Typography>
                      <Paper sx={{ p: 2, bgcolor: 'rgba(0, 112, 112, 0.05)', border: '1px solid', borderColor: 'primary.main' }}>
                        <List sx={{ pl: 0 }}>
                          {section.content.tips.map((tip, idx) => (
                            <ListItem key={idx} sx={{ py: 0.5, pl: 0 }}>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <Box sx={{ fontSize: '1.2rem' }}>💡</Box>
                              </ListItemIcon>
                              <ListItemText 
                                primary={tip}
                                primaryTypographyProps={{
                                  variant: 'body2',
                                  color: 'text.primary',
                                  fontWeight: 500
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    </Box>
                  </>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {/* Support Section */}
        <Paper sx={{ 
          p: isMobile ? 3 : 4, 
          bgcolor: 'background.paper',
          borderTop: 4,
          borderColor: 'primary.main'
        }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
            Need Additional Help?
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                📧 Email Support
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                For technical support and urgent issues:
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                support@ilminate.com
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                🚨 Triage Assistance
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                For threat analysis and investigation help:
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                triage@ilminate.com
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              APEX version 2.0 | Updated November 2024
            </Typography>
            <Link href="/" passHref style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#005555' }
                }}
              >
                Return to Dashboard
              </Button>
            </Link>
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}

