# Ilminate TIP Integration Guide

This document describes how the Ilminate Threat Intelligence Platform (TIP) is integrated into ilminate-apex.

## Overview

The TIP integration provides threat intelligence enrichment capabilities to ilminate-apex, allowing the portal to:
- Enrich IOCs (URLs, domains, IPs, hashes, emails) with threat intelligence
- Display threat risk scores and source attribution
- Show tenant-specific threat summaries
- Display global threat trends

## Architecture

```
ilminate-apex (Frontend)
    ↓
/api/intel/* (Next.js API Routes)
    ↓
Intel API Client (src/lib/intelClient.ts)
    ↓
Intel API (ilminate-tip/intel-api)
    ↓
OpenCTI (Threat Intelligence Backend)
```

## Environment Variables

Add these environment variables to your `.env.local` or deployment environment:

```bash
# Intel API Configuration
INTEL_API_URL=https://your-intel-api-url.com
INTEL_API_KEY=your-api-key-here
INTEL_ENABLED=true

# Optional: Public URL for client-side calls (if needed)
NEXT_PUBLIC_INTEL_API_URL=https://your-intel-api-url.com
```

### AWS SSM Parameter Store (Production)

For production deployments, the Intel API client can be configured to read from AWS SSM Parameter Store:

```
/ilminate/tip/intel-api/url
/ilminate/tip/intel-api/api_key
```

## API Routes

### POST /api/intel/enrich

Batch IOC enrichment endpoint.

**Request:**
```json
{
  "tenant_id": "tenant-123",
  "indicators": [
    {"type": "url", "value": "https://evil.com"},
    {"type": "domain", "value": "phishing.com"}
  ]
}
```

**Response:**
```json
{
  "results": [
    {
      "type": "url",
      "value": "https://evil.com",
      "risk_score": 95,
      "confidence": 0.9,
      "sources": ["urlhaus", "ilminate-email"],
      "first_seen": "2025-11-10T12:00:00Z",
      "last_seen": "2025-11-21T08:00:00Z",
      "tenants_seen": 4,
      "categories": ["phishing", "malware"],
      "campaigns": [],
      "malware_families": []
    }
  ],
  "enrichment_time_ms": 45
}
```

### GET /api/intel/indicator

Get detailed information about a single indicator.

**Query Parameters:**
- `value` (required): Indicator value
- `type` (optional): Indicator type (url, domain, ip, hash, email)
- `tenant_id` (optional): Tenant ID for tenant-specific context

**Example:**
```
GET /api/intel/indicator?value=evil.com&type=domain&tenant_id=tenant-123
```

### GET /api/intel/tenant-summary

Get aggregated intelligence summary for a tenant.

**Query Parameters:**
- `tenant_id` (required): Tenant ID
- `period` (optional): Time period (7d, 30d, 90d). Default: 30d

**Example:**
```
GET /api/intel/tenant-summary?tenant_id=tenant-123&period=30d
```

### GET /api/intel/trends

Get global threat trends (anonymized, aggregated).

**Query Parameters:**
- `period` (optional): Time period (7d, 30d, 90d). Default: 30d
- `category` (optional): Filter by category
- `campaign_id` (optional): Filter by campaign

**Example:**
```
GET /api/intel/trends?period=7d&category=phishing
```

## Usage in Components

### ThreatIntelligence Component

Use the `ThreatIntelligence` component to display threat intelligence for IOCs:

```tsx
import ThreatIntelligence from '@/components/ThreatIntelligence';

function MyComponent() {
  const indicators = [
    { type: 'url', value: 'https://example.com' },
    { type: 'domain', value: 'evil.com' }
  ];

  return (
    <ThreatIntelligence
      indicators={indicators}
      tenantId="tenant-123"
      onEnrichmentComplete={(results) => {
        console.log('Enrichment complete:', results);
      }}
    />
  );
}
```

### Direct API Client Usage

You can also use the Intel API client directly:

```typescript
import { getIntelClient } from '@/lib/intelClient';

const intelClient = getIntelClient();

if (intelClient.isEnabled()) {
  // Enrich IOCs
  const result = await intelClient.enrich('tenant-123', [
    { type: 'url', value: 'https://evil.com' }
  ]);

  // Get indicator details
  const indicator = await intelClient.getIndicator('evil.com', 'domain', 'tenant-123');

  // Get tenant summary
  const summary = await intelClient.getTenantSummary('tenant-123', '30d');

  // Get trends
  const trends = await intelClient.getTrends('30d', 'phishing');
}
```

## Integration Points

### 1. Triage Results

Enhance triage results with threat intelligence:

```typescript
// In src/app/api/triage/route.ts
import { getIntelClient } from '@/lib/intelClient';

// Extract IOCs from email
const iocs = extractIOCs(subject, sender, details);

// Enrich with threat intelligence
if (iocs.length > 0) {
  const intelClient = getIntelClient();
  if (intelClient.isEnabled()) {
    const enrichment = await intelClient.enrich(tenantId, iocs);
    // Add enrichment data to triage results
  }
}
```

### 2. Message Details

Display threat intelligence badges on message details pages:

```tsx
import ThreatIntelligence from '@/components/ThreatIntelligence';

function MessageDetails({ message }) {
  const iocs = extractIOCsFromMessage(message);
  
  return (
    <div>
      <MessageContent message={message} />
      {iocs.length > 0 && (
        <ThreatIntelligence indicators={iocs} tenantId={message.tenantId} />
      )}
    </div>
  );
}
```

### 3. Dashboard Widgets

Create dashboard widgets for threat intelligence:

```tsx
import { useSWR } from 'swr';

function ThreatSummaryWidget({ tenantId }) {
  const { data, error } = useSWR(
    `/api/intel/tenant-summary?tenant_id=${tenantId}&period=30d`,
    fetcher
  );

  if (error) return <div>Error loading threat summary</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Threat Summary (30d)</Typography>
        <Typography>Total Threats: {data.summary.total_threats}</Typography>
        <Typography>Unique Indicators: {data.summary.unique_indicators}</Typography>
        {/* ... */}
      </CardContent>
    </Card>
  );
}
```

## Error Handling

The Intel API client gracefully handles errors:

- **Service Unavailable**: Returns 503 if Intel API is not enabled
- **Not Found**: Returns 404 if indicator is not found (expected case)
- **Rate Limiting**: Returns 429 if rate limit exceeded
- **Server Errors**: Returns 500 with error details

All errors are logged to the console for debugging.

## Testing

### Local Development

1. Set up Intel API locally (see ilminate-tip/QUICKSTART.md)
2. Set environment variables in `.env.local`:
   ```bash
   INTEL_API_URL=http://localhost:3003
   INTEL_API_KEY=your-test-key
   INTEL_ENABLED=true
   ```
3. Start ilminate-apex: `npm run dev`
4. Test enrichment via API routes or components

### Mock Mode

If Intel API is not available, components will show appropriate fallback messages. The API routes will return 503 errors.

## Security Considerations

1. **API Keys**: Store API keys securely (environment variables or AWS SSM)
2. **Tenant Isolation**: Always pass tenant_id to ensure proper data isolation
3. **Rate Limiting**: Intel API has built-in rate limiting (1000 req/min default)
4. **CORS**: Intel API should be configured to allow requests from ilminate-apex domain
5. **HTTPS**: Always use HTTPS in production

## Troubleshooting

### Intel API Not Responding

1. Check environment variables are set correctly
2. Verify Intel API is running and accessible
3. Check network connectivity and firewall rules
4. Review Intel API logs for errors

### Enrichment Returns Empty Results

This is expected if indicators are not in the threat intelligence database. The component will display "No threat intelligence data available."

### CORS Errors

Ensure Intel API CORS configuration includes your ilminate-apex domain:
```typescript
// In Intel API config
allowedOrigins: ['https://apex.ilminate.com', 'http://localhost:3000']
```

## Next Steps

1. **Enhanced UI Components**: Create more specialized threat intelligence components
2. **Dashboard Integration**: Add threat intelligence widgets to main dashboard
3. **Real-time Updates**: Implement WebSocket or polling for real-time threat updates
4. **Historical Analysis**: Add time-series charts for threat trends
5. **Campaign Tracking**: Display campaign information and relationships

## Related Documentation

- [Ilminate TIP README](../ilminate-tip/README.md)
- [Intel API Specification](../ilminate-tip/docs/api-spec.md)
- [TIP Architecture](../ilminate-tip/ARCHITECTURE.md)
- [Integration Summary](../ilminate-tip/INTEGRATION-SUMMARY.md)

