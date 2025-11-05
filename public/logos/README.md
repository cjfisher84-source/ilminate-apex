# Customer Logos

This directory contains customer-specific logos for the APEX multi-tenant platform.

## Instructions

### Land Sea Air Logo

**Required:** `landseaair-logo.png`

**Specifications:**
- Image: Land Sea Air compass rose logo with "LSA" text
- Format: PNG with transparent background (or white background)
- Recommended size: 500x500px minimum
- File location: `public/logos/landseaair-logo.png`

**Logo Description:**
- Compass rose design in circle
- Colors: Dark green (#2D5016) and lime green (#8FBE00)
- "LSA" text with tagline "BEST SHIPPING SINCE NOAH"

**To Add:**
1. Save the Land Sea Air logo as `landseaair-logo.png` in this directory
2. Verify it displays correctly by logging in with a @landseaair-nc.com account
3. Logo will appear in the top-right of the dashboard next to the user profile

## Adding New Customer Logos

To add logos for additional customers:

1. Save logo as `[customer-domain]-logo.png` (e.g., `acme-com-logo.png`)
2. Update `src/lib/tenantUtils.ts` with customer branding configuration:

```typescript
export const CUSTOMER_BRANDING: Record<string, CustomerBranding> = {
  'acme.com': {
    customerId: 'acme.com',
    companyName: 'ACME Corporation',
    shortName: 'ACME',
    logo: {
      primary: '/logos/acme-com-logo.png',
      width: 60,
      height: 60,
      alt: 'ACME Logo'
    }
  }
}
```

3. Test by logging in with the customer's email domain

