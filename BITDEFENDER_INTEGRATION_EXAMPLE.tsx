// Example: How to add Bitdefender Threat Map to investigations/page.tsx
//
// Simply add this import at the top:
import BitdefenderThreatMap from '@/components/BitdefenderThreatMap'

// Then add this section BEFORE your GeoThreatMap component (around line 305):

{/* Live Global Threat Activity - Bitdefender */}
<Paper sx={{
  bgcolor: 'background.paper',
  borderRadius: 3,
  p: 4,
  mb: 4,
  border: '2px solid',
  borderColor: 'divider',
  boxShadow: '0 4px 16px rgba(0, 112, 112, 0.08)'
}}>
  <Box sx={{ mb: 3 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
      <Box sx={{ 
        width: 4, 
        height: 28, 
        backgroundColor: UNCW_TEAL, 
        borderRadius: 2 
      }} />
      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: 700, 
          color: 'text.primary',
          fontSize: isMobile ? '1.25rem' : '1.5rem'
        }}
      >
        🌐 Live Global Threat Activity
      </Typography>
    </Box>
    <Typography 
      variant="body2" 
      sx={{ 
        color: 'text.secondary',
        lineHeight: 1.6,
        fontSize: isMobile ? '0.9rem' : '1rem'
      }}
    >
      Real-time visualization of cyber attacks, infections, and spam detected worldwide by Bitdefender. 
      Watch as threats emerge and spread across the globe in real-time.
    </Typography>
  </Box>
  
  <BitdefenderThreatMap height={isMobile ? 500 : 600} />
  
  <Box sx={{ 
    mt: 2, 
    p: 2, 
    bgcolor: 'rgba(0, 112, 112, 0.05)', 
    borderRadius: 2,
    border: '1px solid rgba(0, 112, 112, 0.1)'
  }}>
    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
      💡 <strong>Note:</strong> This map shows global threat activity from Bitdefender's threat intelligence network. 
      For threats specific to your organization, see the threat map below.
    </Typography>
  </Box>
</Paper>

{/* Your existing GeoThreatMap */}
<GeoThreatMap />


/* ============================================
   FULL EXAMPLE - Complete Section
   ============================================ */

// Here's the complete section with both maps:

export default function InvestigationsPage() {
  const isMobile = useIsMobile()
  const campaigns = mockCampaigns()
  const activeCampaign = campaigns.find(c => c.status === 'active') || campaigns[0]
  const pathData = mockPathAnalysis(activeCampaign.id)
  
  // ... your existing code ...

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: containerPadding }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        
        {/* ... your existing header and campaign cards ... */}

        {/* SECTION 1: Live Global Threats (Bitdefender) */}
        <Paper sx={{
          bgcolor: 'background.paper',
          borderRadius: 3,
          p: 4,
          mb: 4,
          border: '2px solid',
          borderColor: 'divider',
          boxShadow: '0 4px 16px rgba(0, 112, 112, 0.08)'
        }}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ width: 4, height: 28, backgroundColor: UNCW_TEAL, borderRadius: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                🌐 Live Global Threat Activity
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
              Real-time visualization of cyber attacks, infections, and spam detected worldwide by Bitdefender.
            </Typography>
          </Box>
          
          <BitdefenderThreatMap height={600} />
          
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            bgcolor: 'rgba(0, 112, 112, 0.05)', 
            borderRadius: 2,
            border: '1px solid rgba(0, 112, 112, 0.1)'
          }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              💡 <strong>Note:</strong> This map shows global threat activity from Bitdefender's network.
            </Typography>
          </Box>
        </Paper>

        {/* SECTION 2: Your Threat Origins Map */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ width: 4, height: 28, backgroundColor: UNCW_TEAL, borderRadius: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                🎯 Your Organization's Threat Origins
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
              Threats detected and blocked by your security infrastructure (last 30 days)
            </Typography>
          </Box>
          <GeoThreatMap />
        </Box>

        {/* SECTION 3: Cross-Channel Timeline */}
        <CrossChannelTimelineChart campaignId={activeCampaign.id} />

        {/* ... rest of your existing content ... */}

      </Box>
    </Box>
  )
}


/* ============================================
   ALTERNATIVE: Tabbed View
   ============================================ */

import { Tabs, Tab } from '@mui/material'

export default function InvestigationsPage() {
  const [threatView, setThreatView] = useState(0)

  return (
    <>
      {/* Tabbed Threat Views */}
      <Paper sx={{ mb: 4, p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          🌍 Global Threat Intelligence
        </Typography>
        
        <Tabs 
          value={threatView} 
          onChange={(e, v) => setThreatView(v)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        >
          <Tab label="Live Worldwide Threats" />
          <Tab label="Your Threat Origins" />
          <Tab label="Campaign Timeline" />
        </Tabs>

        {/* Tab 1: Bitdefender Live Map */}
        {threatView === 0 && (
          <Box>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              Real-time cyber attack activity from Bitdefender's global threat intelligence network
            </Typography>
            <BitdefenderThreatMap height={700} />
          </Box>
        )}

        {/* Tab 2: Your Custom Heatmap */}
        {threatView === 1 && (
          <Box>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              Historical threat data from your organization's security infrastructure
            </Typography>
            <GeoThreatMap />
          </Box>
        )}

        {/* Tab 3: Timeline */}
        {threatView === 2 && (
          <Box>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              Cross-channel threat activity timeline for active campaigns
            </Typography>
            <CrossChannelTimelineChart campaignId={activeCampaign.id} />
          </Box>
        )}
      </Paper>
    </>
  )
}


/* ============================================
   ALTERNATIVE: Side-by-Side Comparison
   ============================================ */

<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 4, mb: 4 }}>
  {/* Live Threats */}
  <Paper sx={{ p: 3 }}>
    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
      🌐 Live Global Threats
    </Typography>
    <Typography variant="caption" sx={{ display: 'block', mb: 2, color: 'text.secondary' }}>
      Bitdefender worldwide
    </Typography>
    <BitdefenderThreatMap height={500} />
  </Paper>

  {/* Your Threats */}
  <Paper sx={{ p: 3 }}>
    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
      🎯 Your Threat Intelligence
    </Typography>
    <Typography variant="caption" sx={{ display: 'block', mb: 2, color: 'text.secondary' }}>
      Organization-specific threats
    </Typography>
    <GeoThreatMap />
  </Paper>
</Box>


/* ============================================
   WHAT WILL HAPPEN
   ============================================ */

/*
When you add this code, one of two things will happen:

SCENARIO 1: Embedding Blocked (Most Likely)
------------------------------------------
✅ Component attempts to load Bitdefender map
⚠️ Detects X-Frame-Options blocking
✅ Shows beautiful fallback UI with:
   - Warning message explaining why
   - Elegant call-to-action card
   - "Open Live Threat Map" button
   - Decorative background and features list
✅ Click opens Bitdefender map in new window

SCENARIO 2: Embedding Works (Unlikely but possible)
-------------------------------------------------
✅ Shows loading spinner
✅ Bitdefender map loads in iframe
✅ Users can interact with it directly
✅ No fallback needed

Either way, you get a great UX!
*/


/* ============================================
   DEPLOYMENT STEPS
   ============================================ */

/*
1. Add import:
   import BitdefenderThreatMap from '@/components/BitdefenderThreatMap'

2. Add section before GeoThreatMap (line ~305)

3. Test locally:
   npm run dev
   Visit http://localhost:3000/investigations

4. Commit and push:
   git add .
   git commit -m "feat: Add Bitdefender live threat map to investigations"
   git push origin main

5. Wait for Amplify deployment (~5-10 min)

6. Test in production:
   https://apex.ilminate.com/investigations
*/


/* ============================================
   COMPLETE IMPORTS FOR REFERENCE
   ============================================ */

import { Box, Typography, Card, CardContent, Button, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tabs, Tab } from '@mui/material'
import Link from 'next/link'
import Image from 'next/image'
import UserProfile from '@/components/UserProfile'
import { GeoThreatMap, CrossChannelTimelineChart } from '@/components/Charts.client'
import BitdefenderThreatMap from '@/components/BitdefenderThreatMap' // ADD THIS LINE
import { mockCampaigns, mockPathAnalysis, type Campaign } from '@/lib/mock'
import { useIsMobile, getResponsivePadding, getResponsiveSpacing, getResponsiveFontSize, getResponsiveImageSize } from '@/lib/mobileUtils'
import { useState } from 'react' // ADD THIS if using tabs


