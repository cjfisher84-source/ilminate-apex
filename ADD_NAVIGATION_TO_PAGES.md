# Adding NavigationBar to All Pages

## Pages to Update

Adding the persistent navigation bar to:
- [x] Home page (/)
- [x] Investigations (/investigations)
- [ ] APEX Trace (/apex-trace)
- [ ] Triage (/triage)
- [ ] Quarantine (/quarantine)
- [ ] HarborSim (/harborsim)
- [ ] MITRE ATT&CK (/reports/attack)

## Changes Required for Each Page

### 1. Add import:
```tsx
import NavigationBar from '@/components/NavigationBar'
```

### 2. Add component after header:
```tsx
{/* Navigation Bar */}
<NavigationBar />
```

## Implementation

Updating each page systematically...

