'use client'
import { Box, Typography, Paper, Button, useTheme, Chip } from '@mui/material'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Shield, 
  Activity, 
  Target, 
  Zap, 
  CheckCircle2, 
  TrendingUp,
  Lock,
  Server,
  Mail,
  Eye
} from 'lucide-react'
import { useIsMobile, getResponsivePadding, getResponsiveImageSize } from '@/lib/mobileUtils'

export default function Home() {
  const theme = useTheme()
  const isMobile = useIsMobile()
  
  const containerPadding = getResponsivePadding(isMobile)
  const logoSize = getResponsiveImageSize(isMobile, 80)

  const FeatureCard = ({ icon: Icon, title, description, items }: any) => (
    <Paper sx={{ 
      p: 2.5, 
      height: '100%',
      bgcolor: 'background.paper',
      border: 1,
      borderColor: 'divider',
      transition: 'all 0.2s ease',
      '&:hover': {
        borderColor: 'primary.main',
        transform: 'translateY(-2px)',
        boxShadow: 3
      }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
        <Box sx={{ 
          p: 1, 
          bgcolor: 'primary.main', 
          borderRadius: 2,
          display: 'flex',
          color: 'primary.contrastText'
        }}>
          <Icon size={20} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, fontSize: '1.1rem' }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem', lineHeight: 1.5 }}>
            {description}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mt: 2 }}>
        {items.map((item: string, i: number) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle2 size={14} style={{ color: theme.palette.primary.main, flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: 'text.primary', fontSize: '0.8rem' }}>
              {item}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  )

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', p: containerPadding }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        {/* Compact Header */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center', 
          mb: 3,
          pb: 2,
          borderBottom: 2,
          borderColor: 'primary.main',
          gap: isMobile ? 1.5 : 0
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Image 
              src="/ilminate-logo.png" 
              alt="Ilminate Logo" 
              width={logoSize} 
              height={logoSize}
              priority
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 168, 168, 0.3))' }}
            />
            <Box>
              <Typography 
                variant={isMobile ? 'h4' : 'h3'}
                sx={{ 
                  fontWeight: 700, 
                  mb: 0,
                  color: 'text.primary',
                  lineHeight: 1.2
                }}
              >
                Ilminate <span style={{ color: theme.palette.primary.main }}>APEX</span>
              </Typography>
              <Typography 
                variant="body2"
                sx={{ 
                  color: 'text.secondary', 
                  fontWeight: 500,
                  fontSize: isMobile ? '0.8rem' : '0.9rem'
                }}
              >
                Advanced Protection & Exposure Intelligence
              </Typography>
            </Box>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            gap: 1.5,
            width: isMobile ? '100%' : 'auto',
            flexWrap: 'wrap'
          }}>
            <Link href="/triage" passHref legacyBehavior>
              <Button 
                variant="contained" 
                component="a" 
                size="medium"
                color="primary"
                sx={{ 
                  px: 3,
                  fontWeight: 600
                }}
              >
                Triage
              </Button>
            </Link>
            <Link href="/investigations" passHref legacyBehavior>
              <Button 
                variant="outlined" 
                component="a" 
                size="medium"
                color="primary"
                sx={{ fontWeight: 600 }}
              >
                Investigations
              </Button>
            </Link>
            <Link href="/reports/attack" passHref legacyBehavior>
              <Button 
                variant="outlined" 
                component="a" 
                size="medium"
                sx={{ 
                  fontWeight: 600,
                  borderColor: 'primary.main',
                  color: 'primary.main'
                }}
              >
                🎯 ATT&CK
              </Button>
            </Link>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Hero Section */}
          <Paper sx={{ 
            p: isMobile ? 3 : 4, 
            background: theme.palette.mode === 'dark' 
              ? `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}05 100%)`
              : `linear-gradient(135deg, ${theme.palette.primary.main}10 0%, ${theme.palette.primary.main}03 100%)`,
            border: 2,
            borderColor: 'primary.main',
            borderRadius: 3,
            textAlign: 'center'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 2 }}>
              <Activity size={32} color={theme.palette.primary.main} />
              <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 700 }}>
                Advanced Protection & Exposure Intelligence
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, fontSize: isMobile ? '0.95rem' : '1.1rem', maxWidth: '800px', mx: 'auto' }}>
              APEX delivers intelligent threat detection and analysis with real-time risk scoring, 
              executive impersonation alerts, and MITRE ATT&CK framework mapping.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Chip label="Real-Time Detection" size="small" sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 600 }} />
              <Chip label="Risk Scoring (0-100)" size="small" variant="outlined" color="primary" />
              <Chip label="MITRE ATT&CK Mapping" size="small" variant="outlined" color="primary" />
              <Chip label="99.9% Uptime" size="small" variant="outlined" color="primary" />
            </Box>
          </Paper>

          {/* Core Capabilities */}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Core Capabilities
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
              gap: 2 
            }}>
              <FeatureCard
                icon={Shield}
                title="Real-Time Detection"
                description="Advanced threat analysis with intelligent pattern recognition"
                items={[
                  'BEC and phishing detection',
                  'Risk scoring (0-100)',
                  'Executive impersonation alerts',
                  'Financial request identification'
                ]}
              />
              <FeatureCard
                icon={Activity}
                title="Investigation & Response"
                description="Structured threat analysis with actionable recommendations"
                items={[
                  'Email triage API',
                  'Severity-based indicators',
                  'Immediate action guidance',
                  'Security posture insights'
                ]}
              />
              <FeatureCard
                icon={Target}
                title="MITRE ATT&CK Mapping"
                description="Framework-aligned threat technique detection"
                items={[
                  'Real-time technique mapping',
                  'Interactive matrix visualization',
                  '12+ detection rules',
                  'Top technique tracking'
                ]}
              />
              <FeatureCard
                icon={Zap}
                title="Performance"
                description="Enterprise-grade infrastructure for reliable protection"
                items={[
                  'Sub-second API responses',
                  'Live dashboard updates',
                  '99.9% uptime SLA',
                  'Automatic scaling'
                ]}
              />
              <FeatureCard
                icon={Lock}
                title="Security & Compliance"
                description="SOC 2 Type II compliant hosting infrastructure"
                items={[
                  'OAuth 2.0 authentication',
                  'TLS 1.3 encryption',
                  'Role-based access control',
                  'Secure cloud infrastructure'
                ]}
              />
              <FeatureCard
                icon={Server}
                title="Integration Architecture"
                description="RESTful APIs for custom development and automation"
                items={[
                  'JSON-based endpoints',
                  'Structured responses',
                  'Developer-friendly',
                  'SIEM integration ready'
                ]}
              />
            </Box>
          </Box>

          {/* Use Cases */}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Threat Detection Categories
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 2 
            }}>
              <Paper sx={{ p: 2.5, border: 1, borderColor: 'divider', height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Mail size={24} color={theme.palette.primary.main} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Email Security
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.6 }}>
                  Comprehensive email threat detection including phishing, malware, spam, business email 
                  compromise (BEC), and account takeover (ATO) attempts.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label="Phishing" size="small" variant="outlined" />
                  <Chip label="Malware" size="small" variant="outlined" />
                  <Chip label="BEC" size="small" variant="outlined" />
                  <Chip label="Spam" size="small" variant="outlined" />
                  <Chip label="ATO" size="small" variant="outlined" />
                </Box>
              </Paper>
              <Paper sx={{ p: 2.5, border: 1, borderColor: 'divider', height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Eye size={24} color={theme.palette.primary.main} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Advanced Threat Intelligence
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.6 }}>
                  MITRE ATT&CK framework integration provides real-time technique mapping, adversary 
                  tactic visualization, and comprehensive threat analysis.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label="ATT&CK Mapping" size="small" variant="outlined" />
                  <Chip label="Technique Detection" size="small" variant="outlined" />
                  <Chip label="Tactic Analysis" size="small" variant="outlined" />
                </Box>
              </Paper>
            </Box>
          </Box>

          {/* Key Features Summary */}
          <Paper sx={{ 
            p: 3, 
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            borderRadius: 3
          }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>
              Why Choose APEX?
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 3 
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <Shield size={40} style={{ marginBottom: '12px' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Intelligent Protection
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.95 }}>
                  Advanced BEC and phishing detection with risk-based prioritization and executive impersonation alerts
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Zap size={40} style={{ marginBottom: '12px' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Real-Time Response
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.95 }}>
                  Sub-second threat analysis with actionable recommendations and immediate triage capabilities
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Lock size={40} style={{ marginBottom: '12px' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Enterprise Security
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.95 }}>
                  SOC 2 Type II compliant infrastructure with OAuth 2.0 authentication and TLS 1.3 encryption
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Footer CTA */}
          <Paper sx={{ 
            p: 3, 
            bgcolor: 'background.paper',
            border: 2,
            borderColor: 'primary.main',
            borderRadius: 3,
            textAlign: 'center'
          }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Ready to Get Started?
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
              Access the APEX platform to start analyzing threats and enhancing your security posture
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/triage" passHref legacyBehavior>
                <Button 
                  variant="contained" 
                  component="a"
                  size="large"
                  color="primary"
                  sx={{ 
                    fontWeight: 700,
                    px: 4
                  }}
                >
                  Email Triage
                </Button>
              </Link>
              <Link href="/reports/attack" passHref legacyBehavior>
                <Button 
                  variant="outlined" 
                  component="a"
                  size="large"
                  color="primary"
                  sx={{ 
                    fontWeight: 700,
                    px: 4
                  }}
                >
                  ATT&CK Matrix
                </Button>
              </Link>
              <Link href="/investigations" passHref legacyBehavior>
                <Button 
                  variant="outlined" 
                  component="a"
                  size="large"
                  color="primary"
                  sx={{ 
                    fontWeight: 700,
                    px: 4
                  }}
                >
                  Investigations
                </Button>
              </Link>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}
