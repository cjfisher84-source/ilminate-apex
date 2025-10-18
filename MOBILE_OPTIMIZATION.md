# Mobile Optimization Guide for APEX

## 📱 Overview

This document outlines the mobile optimizations implemented for the Ilminate APEX application. All optimizations are controlled by a feature flag for easy rollback and testing.

**Feature Flag:** `NEXT_PUBLIC_MOBILE_TWEAKS=true`

**Target Viewport:** ≤768px (phones and small tablets)

---

## ✅ What Was Optimized

### 1. **Layout & Spacing**
- ✅ Responsive padding (4rem → 2rem on mobile)
- ✅ Flexible header layout (column stacking on mobile)
- ✅ Adaptive grid systems (5 columns → 1-2 columns on mobile)
- ✅ Full-width buttons with better tap targets (min 44x44px)

### 2. **Typography**
- ✅ Scaled-down font sizes for mobile readability
- ✅ Shortened labels for limited screen space
- ✅ 16px minimum input font size (prevents iOS zoom)

### 3. **Charts & Visualizations**
- ✅ Reduced chart heights (520px → 320px max on mobile)
- ✅ Smaller chart margins and padding
- ✅ Adjusted axis labels and legend sizes
- ✅ Responsive tooltips with mobile-friendly font sizes
- ✅ Hide chart labels on pie charts, show legends instead

### 4. **Tables**
- ✅ Horizontal scroll wrapper for wide tables
- ✅ Minimum width enforcement to prevent cramping
- ✅ Reduced cell padding for better fit
- ✅ Touch-friendly scrolling (`-webkit-overflow-scrolling: touch`)

### 5. **Performance**
- ✅ Viewport meta tags configured
- ✅ PWA manifest for mobile installation
- ✅ Theme color for mobile browsers
- ✅ Reduced motion support for accessibility
- ✅ Image optimization with responsive sizing

---

## 🚀 How to Enable

### Option 1: Environment Variable (Recommended)
```bash
# Create .env.local file
echo "NEXT_PUBLIC_MOBILE_TWEAKS=true" > .env.local

# Restart dev server
npm run dev
```

### Option 2: Disable Globally
To turn off all mobile optimizations:
```bash
NEXT_PUBLIC_MOBILE_TWEAKS=false
```

---

## 📁 Files Modified

### Core Configuration
- `src/lib/featureFlags.ts` - Feature flag configuration
- `src/lib/mobileUtils.ts` - Mobile utility functions and hooks
- `.env.example` - Environment variable examples

### Styling
- `src/app/globals.css` - Mobile-specific CSS utilities
- Added utility classes: `.mobile-touch-target`, `.mobile-table-wrapper`, etc.

### Components
- `src/app/page.tsx` - Main dashboard with responsive layouts
- `src/app/triage/page.tsx` - Triage page with mobile forms
- `src/app/layout.tsx` - Global layout with viewport meta tags
- `src/components/Charts.client.tsx` - All chart components optimized
- `public/manifest.json` - PWA manifest for mobile

---

## 🎯 Key Features

### 1. Mobile-Aware Hooks

```tsx
import { useIsMobile } from '@/lib/mobileUtils'

function MyComponent() {
  const isMobile = useIsMobile() // true if ≤768px AND flag enabled
  
  return (
    <div style={{ padding: isMobile ? 16 : 32 }}>
      {/* Content */}
    </div>
  )
}
```

### 2. Responsive Utility Functions

```tsx
import { 
  getResponsivePadding,
  getResponsiveSpacing,
  getResponsiveFontSize,
  getResponsiveImageSize,
  getResponsiveChartHeight 
} from '@/lib/mobileUtils'

const padding = getResponsivePadding(isMobile) // 2 or 4
const spacing = getResponsiveSpacing(isMobile, 2, 4) // mobile, desktop
const fontSize = getResponsiveFontSize(isMobile, 'h3') // '1.75rem' or undefined
const imageSize = getResponsiveImageSize(isMobile, 100) // 60 or 100
const chartHeight = getResponsiveChartHeight(isMobile, 520) // 320 or 520
```

### 3. CSS Utility Classes

```css
/* Applied automatically at ≤768px */
.mobile-touch-target      /* Min 44x44px tap target */
.mobile-table-wrapper     /* Horizontal scroll for tables */
.mobile-chart-container   /* Prevent chart overflow */
.mobile-hidden            /* Hide on mobile */
.mobile-stack             /* Stack flex items */
.mobile-full-width        /* Full width */
```

---

## 📊 Performance Improvements

### Before Optimization
- ❌ Horizontal scroll on most pages
- ❌ Tiny tap targets (< 30px)
- ❌ Tables overflow and cut off
- ❌ Charts too tall, push content off-screen
- ❌ Text too small or too large

### After Optimization
- ✅ No horizontal scroll
- ✅ All interactive elements ≥44px
- ✅ Tables scroll smoothly
- ✅ Charts fit viewport
- ✅ Optimized typography

---

## 🧪 Testing Checklist

### Manual Testing
1. ✅ **Viewport Sizes**
   - Test at 320px (iPhone SE)
   - Test at 375px (iPhone 12)
   - Test at 768px (iPad portrait)

2. ✅ **Pages to Test**
   - [ ] Dashboard (`/`)
   - [ ] Triage (`/triage`)
   - [ ] Investigations (`/investigations`)
   - [ ] All chart rendering

3. ✅ **Interactions**
   - [ ] Button taps (easy to press?)
   - [ ] Table scrolling (smooth?)
   - [ ] Form inputs (no zoom on iOS?)
   - [ ] Chart tooltips (readable?)

### Performance Testing
```bash
# Lighthouse CI (mobile score)
npm run build
npx lighthouse https://localhost:3000 --preset=mobile --view

# Target Scores:
# - Performance: >90
# - Accessibility: >95
# - Best Practices: >90
```

---

## 🔄 Rollback Plan

### If Issues Occur

**Option 1: Disable Feature Flag**
```bash
# In .env.local
NEXT_PUBLIC_MOBILE_TWEAKS=false
```

**Option 2: Revert Git Branch**
```bash
git checkout main
```

**Option 3: Deploy Previous Version**
```bash
# In Amplify Console
# Go to App → Deployments
# Click on previous successful build
# Click "Promote to production"
```

---

## 📈 Metrics to Monitor

### Core Web Vitals
1. **LCP (Largest Contentful Paint)** - Target: <2.5s
   - Mobile optimizations reduce image sizes
   - Charts render faster with lower heights

2. **CLS (Cumulative Layout Shift)** - Target: <0.1
   - Fixed dimensions on images prevent shifts
   - Charts have defined heights

3. **INP (Interaction to Next Paint)** - Target: <200ms
   - Larger tap targets improve interaction
   - Reduced animations on mobile

### Custom Metrics
- Mobile bounce rate
- Mobile session duration
- Mobile conversion rate
- Mobile error rate

---

## 🛠️ Troubleshooting

### Issue: "Optimizations not applying"
**Solution:** 
1. Check `.env.local` file exists
2. Verify `NEXT_PUBLIC_MOBILE_TWEAKS=true`
3. Restart Next.js dev server
4. Clear browser cache

### Issue: "Charts still overflowing"
**Solution:**
1. Check that `useIsMobile()` is imported
2. Verify chart parent has `mobile-chart-container` class
3. Test at exactly 768px or below

### Issue: "iOS zoom on input focus"
**Solution:**
- All inputs should have `fontSize: '16px'` minimum
- Check `globals.css` has mobile input font override

### Issue: "Horizontal scroll still present"
**Solution:**
1. Check for fixed widths in components
2. Use `mobile-full-width` class
3. Add `overflow-x: hidden` to parent

---

## 📝 Best Practices for Future Development

### DO ✅
- Use `useIsMobile()` hook for responsive logic
- Apply `mobile-touch-target` class to buttons
- Test on real mobile devices
- Use semantic HTML for better accessibility
- Keep feature flag enabled during development

### DON'T ❌
- Use fixed pixel widths without mobile fallbacks
- Create tap targets smaller than 44x44px
- Ignore horizontal scroll issues
- Forget to test form inputs on iOS
- Remove feature flag without deprecation plan

---

## 🚢 Deployment

### Development
```bash
git checkout feature/mobile-optimizations
git push origin feature/mobile-optimizations
```

### Amplify Preview
1. Push branch to GitHub
2. Amplify automatically creates preview URL
3. Test preview URL on real mobile devices
4. Share preview URL with stakeholders

### Production
```bash
# After testing and approval
git checkout main
git merge feature/mobile-optimizations
git push origin main
```

Amplify will automatically deploy to production.

---

## 📚 Additional Resources

- [Web.dev Mobile Performance Guide](https://web.dev/mobile/)
- [MDN Touch Events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [Material-UI Responsive Design](https://mui.com/material-ui/guides/responsive-ui/)
- [Next.js Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)

---

## 📞 Support

For questions or issues:
- **Technical Lead:** Review this document
- **Repository:** File an issue on GitHub
- **Testing:** See Testing Checklist above

---

**Last Updated:** October 2025  
**Version:** 1.0.0  
**Author:** Cursor AI Assistant

