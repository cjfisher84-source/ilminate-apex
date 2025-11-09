# Bitdefender Threat Map Integration

## Overview

The [Bitdefender Threat Map](https://threatmap.bitdefender.com/) is an excellent live threat visualization that shows real-time cyber attacks across the globe. This guide explains how to integrate it into your investigations page.

## 🚨 Embedding Challenge

**Problem:** Bitdefender blocks iframe embedding using `X-Frame-Options: SAMEORIGIN` header for security reasons. This means direct embedding typically won't work.

**Solution:** We've created a smart component that:
1. Attempts to embed the map
2. Detects if embedding is blocked
3. Falls back to a beautiful launch button
4. Opens the map in a new window

## 📦 Component Created

### `BitdefenderThreatMap.tsx`

A React component that intelligently handles the embedding:

```tsx
import BitdefenderThreatMap from '@/components/BitdefenderThreatMap'

<BitdefenderThreatMap height={600} showFallback={true} />
```

**Features:**
- ✅ Attempts iframe embedding
- ✅ Detects embedding failures
- ✅ Beautiful fallback UI
- ✅ Loading state indicator
- ✅ Click to open in new window
- ✅ Responsive design

## 🔧 Integration Options

### Option 1: Add to Investigations Page (Recommended)

Add the Bitdefender map alongside your existing threat visualizations:

```tsx
// src/app/investigations/page.tsx
import BitdefenderThreatMap from '@/components/BitdefenderThreatMap'
import { GeoThreatMap } from '@/components/Charts.client'

export default function InvestigationsPage() {
  return (
    <Box>
      {/* Your existing content */}
      
      {/* Add Bitdefender Live Threat Map Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#007070' }}>
          🌐 Live Global Threat Activity
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
          Real-time visualization of cyber attacks, infections, and spam detected by Bitdefender globally.
        </Typography>
        <BitdefenderThreatMap height={600} />
      </Box>

      {/* Your existing threat map */}
      <GeoThreatMap />
    </Box>
  )
}
```

### Option 2: Side-by-Side Comparison

Show both maps for comprehensive threat intelligence:

```tsx
<Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
  {/* Live Bitdefender Map */}
  <Box>
    <Typography variant="h6">Live Threats (Bitdefender)</Typography>
    <BitdefenderThreatMap height={500} />
  </Box>

  {/* Your Custom Heatmap */}
  <Box>
    <Typography variant="h6">Your Threat Intelligence</Typography>
    <GeoThreatMap />
  </Box>
</Box>
```

### Option 3: Tabbed Interface

Let users switch between different threat views:

```tsx
import { Tabs, Tab } from '@mui/material'

const [tab, setTab] = useState(0)

<Tabs value={tab} onChange={(e, v) => setTab(v)}>
  <Tab label="Live Global Threats" />
  <Tab label="Your Threat Data" />
  <Tab label="Campaign Analysis" />
</Tabs>

{tab === 0 && <BitdefenderThreatMap height={700} />}
{tab === 1 && <GeoThreatMap />}
{tab === 2 && <CrossChannelTimelineChart />}
```

### Option 4: Modal/Popup View

Open the threat map in a modal for focused analysis:

```tsx
import { Dialog, DialogTitle, DialogContent } from '@mui/material'

const [open, setOpen] = useState(false)

<Button onClick={() => setOpen(true)}>
  View Live Threat Map
</Button>

<Dialog open={open} onClose={() => setOpen(false)} maxWidth="xl" fullWidth>
  <DialogTitle>Bitdefender Live Threat Map</DialogTitle>
  <DialogContent>
    <BitdefenderThreatMap height={700} />
  </DialogContent>
</Dialog>
```

## 🎯 What Makes Bitdefender's Map Special

The Bitdefender threat map shows features that could inspire enhancements to your custom map:

### Current Features:
- **Live Attack Animations** - Arrows showing attack paths between countries
- **Real-time Feed** - Table of attacks as they happen
- **Attack Types** - Color-coded by attacks, infections, spam
- **Attack Flow** - Shows source → target country relationships
- **Continuous Updates** - WebSocket-based live updates

### Comparison with Your Custom Map:

| Feature | Your Heatmap | Bitdefender |
|---------|--------------|-------------|
| Color Intensity | ✅ Yellow-Red gradient | ✅ Multiple categories |
| Static Threat Data | ✅ Historical counts | ❌ |
| Live Updates | ❌ | ✅ Real-time |
| Attack Paths | ❌ | ✅ Animated arrows |
| Attack Feed | ❌ | ✅ Live table |
| Tooltips | ✅ Detailed stats | ✅ Basic info |
| Toggle Controls | ✅ Labels/borders | ✅ Attack types |
| Your Data | ✅ Custom pipeline | ❌ |

## 💡 Recommendations

### Best Approach: Hybrid Solution

Use **both** maps for comprehensive threat intelligence:

1. **Bitdefender Map** (Top of page)
   - Shows live, global threat activity
   - Provides context and situational awareness
   - Demonstrates broad attack patterns

2. **Your Custom Heatmap** (Below Bitdefender)
   - Shows **your** organization's specific threats
   - Historical data from your pipeline
   - Customizable to your threat intelligence

3. **Campaign Analysis** (Bottom)
   - Detailed investigation of specific campaigns
   - Cross-channel analysis
   - Attack path tracking

### Example Layout:

```tsx
<Box sx={{ maxWidth: '1400px', mx: 'auto', p: 4 }}>
  {/* Header */}
  <Typography variant="h3">Threat Intelligence Dashboard</Typography>

  {/* Section 1: Live Global Threats */}
  <Paper sx={{ p: 3, mb: 4 }}>
    <Typography variant="h5">🌐 Live Global Threat Activity</Typography>
    <Typography variant="body2" sx={{ mb: 2 }}>
      Real-time cyber attack visualization powered by Bitdefender
    </Typography>
    <BitdefenderThreatMap height={600} />
  </Paper>

  {/* Section 2: Your Threat Intelligence */}
  <Paper sx={{ p: 3, mb: 4 }}>
    <Typography variant="h5">🎯 Your Organization's Threat Map</Typography>
    <Typography variant="body2" sx={{ mb: 2 }}>
      Threat distribution from your security pipeline (last 30 days)
    </Typography>
    <GeoThreatMap />
  </Paper>

  {/* Section 3: Active Campaigns */}
  <Paper sx={{ p: 3 }}>
    <Typography variant="h5">🔍 Active Campaign Investigations</Typography>
    {/* Your existing campaign analysis */}
  </Paper>
</Box>
```

## 🚀 Alternative: Build Your Own Live Map

If you want live attack animations like Bitdefender, you could enhance your custom map:

### Features to Add:

1. **WebSocket Integration**
   ```typescript
   // Connect to your threat intelligence stream
   const ws = new WebSocket('wss://your-api.com/threats/live')
   ws.onmessage = (event) => {
     const attack = JSON.parse(event.data)
     animateAttack(attack.source, attack.target)
   }
   ```

2. **Attack Path Animations**
   ```typescript
   // D3.js arc between countries
   function animateAttack(sourceCountry, targetCountry) {
     const source = projection(getCountryCoords(sourceCountry))
     const target = projection(getCountryCoords(targetCountry))
     
     svg.append('path')
       .attr('d', createArc(source, target))
       .attr('stroke', '#ef4444')
       .attr('stroke-width', 2)
       .transition()
       .duration(2000)
       .attrTween('stroke-dashoffset', function() {
         // Animate along path
       })
       .remove()
   }
   ```

3. **Live Attack Feed**
   ```tsx
   <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
     <Typography variant="h6">Live Attacks</Typography>
     <Table>
       <TableHead>
         <TableRow>
           <TableCell>Time</TableCell>
           <TableCell>Attack Type</TableCell>
           <TableCell>Source</TableCell>
           <TableCell>Target</TableCell>
         </TableRow>
       </TableHead>
       <TableBody>
         {liveAttacks.map(attack => (
           <TableRow key={attack.id}>
             <TableCell>{attack.timestamp}</TableCell>
             <TableCell>{attack.type}</TableCell>
             <TableCell>{attack.source}</TableCell>
             <TableCell>{attack.target}</TableCell>
           </TableRow>
         ))}
       </TableBody>
     </Table>
   </Box>
   ```

## 🔗 External Integration Options

### Option A: New Window (Current Solution)
- ✅ Always works
- ✅ No CORS issues
- ✅ Users get full Bitdefender experience
- ❌ Leaves your app

### Option B: Browser Extension
- Create a browser extension that captures Bitdefender data
- ❌ Complex, requires user installation

### Option C: Bitdefender API (if available)
- Check if Bitdefender offers a public API
- Fetch threat data and visualize in your map
- ❌ May not be publicly available

### Option D: Similar Services with APIs
Consider these alternatives that may offer APIs:

- **Kaspersky Cyberthreat Map** - https://cybermap.kaspersky.com/
- **FireEye Cyber Threat Map** - Similar visualization
- **Check Point ThreatCloud Map** - Real-time threat intelligence
- **Fortinet Threat Map** - Global attack visualization

## 📝 Implementation Checklist

- [x] Create `BitdefenderThreatMap.tsx` component
- [ ] Add to investigations page
- [ ] Test embedding (will likely fail)
- [ ] Verify fallback UI works
- [ ] Add section header and description
- [ ] Test "Open in new window" functionality
- [ ] Consider tabbed interface for multiple maps
- [ ] Add to navigation if needed
- [ ] Update documentation
- [ ] Deploy to production

## 🎨 Styling Tips

Match your app's theme:

```tsx
<BitdefenderThreatMap 
  height={600}
  showFallback={true}
/>

// Wrap in your styled container
<Paper sx={{
  bgcolor: 'background.paper',
  borderRadius: 3,
  p: 4,
  border: '2px solid',
  borderColor: 'divider',
  boxShadow: '0 4px 16px rgba(0, 112, 112, 0.08)'
}}>
  <BitdefenderThreatMap height={600} />
</Paper>
```

## 🔒 Security Considerations

1. **Sandbox Attribute** - The iframe uses `sandbox="allow-scripts allow-same-origin"` for security
2. **External Content** - Users should understand they're viewing Bitdefender's data
3. **New Window** - Opens in separate tab to maintain session security
4. **No Data Sharing** - Your app doesn't send data to Bitdefender

## 📊 Expected Behavior

### If Embedding Works:
1. Component loads
2. Shows loading spinner
3. Bitdefender map appears in iframe
4. Users can interact with map directly

### If Embedding Blocked (Most Likely):
1. Component detects failure
2. Shows warning message
3. Displays beautiful fallback UI
4. Button opens map in new window

## 🎯 Summary

**Recommendation:** Use the `BitdefenderThreatMap` component we created. It will:
- Attempt to embed (in case Bitdefender allows it in future)
- Gracefully fall back to a launch button
- Provide excellent UX either way
- Complement your custom threat heatmap

The combination of Bitdefender's live global view + your custom threat intelligence creates a powerful investigation dashboard!

---

**Next Steps:**
1. Import the component into investigations page
2. Test the integration
3. Deploy and see the fallback UI
4. Consider building live attack animations for your own map

