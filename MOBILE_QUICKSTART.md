# 🚀 Mobile Optimization Quick Start

## Step 1: Enable the Feature
```bash
# Create .env.local file in project root
echo "NEXT_PUBLIC_MOBILE_TWEAKS=true" > .env.local

# Restart your development server
npm run dev
```

## Step 2: Test on Mobile
Open your browser DevTools:
- Chrome: `Cmd+Opt+I` (Mac) / `F12` (Windows)
- Click "Toggle Device Toolbar" or press `Cmd+Shift+M`
- Select "iPhone 12 Pro" or any mobile device
- Refresh the page

## Step 3: Verify Changes
You should see:
- ✅ Smaller header logo (60px vs 100px)
- ✅ Stacked buttons in header
- ✅ Reduced padding throughout
- ✅ Shorter chart titles
- ✅ Tables scroll horizontally
- ✅ All text readable without zooming

## Step 4: Test Real Device (Optional)
```bash
# Find your local IP
ipconfig getifaddr en0  # Mac
# or
ipconfig               # Windows

# Visit on phone
http://YOUR_IP:3000
```

## Disable Feature
```bash
# In .env.local
NEXT_PUBLIC_MOBILE_TWEAKS=false
```

---

## What's Different?

### Before (Desktop):
```tsx
<Box sx={{ p: 4 }}>               // 32px padding
  <Typography variant="h3">       // ~2rem font
    Ilminate APEX
  </Typography>
  <Image width={100} height={100} />
</Box>
```

### After (Mobile ≤768px):
```tsx
<Box sx={{ p: 2 }}>               // 16px padding  
  <Typography variant="h3" 
    sx={{ fontSize: '1.75rem' }}   // Scaled down
  >
    Ilminate APEX
  </Typography>
  <Image width={60} height={60} />  // Smaller logo
</Box>
```

---

## Files Changed
- ✅ `src/lib/featureFlags.ts` - Feature flag config
- ✅ `src/lib/mobileUtils.ts` - Mobile utility hooks
- ✅ `src/app/globals.css` - Mobile CSS utilities
- ✅ `src/app/page.tsx` - Responsive dashboard
- ✅ `src/app/triage/page.tsx` - Responsive triage
- ✅ `src/components/Charts.client.tsx` - Responsive charts
- ✅ `src/app/layout.tsx` - Viewport meta tags
- ✅ `public/manifest.json` - PWA manifest

---

## Need Help?
See full documentation: `MOBILE_OPTIMIZATION.md`

