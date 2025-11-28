import { NextRequest, NextResponse } from 'next/server';
import { getIntelClient } from '@/lib/intelClient';
import { getCustomerIdFromHeaders } from '@/lib/tenantUtils';

/**
 * API Route: GET /api/intel/tenant-summary
 * 
 * Get aggregated intelligence summary for a tenant
 * Used for tenant dashboards and threat overviews
 */

export async function GET(req: NextRequest) {
  try {
    const intelClient = getIntelClient();

    if (!intelClient.isEnabled()) {
      return NextResponse.json(
        { error: 'Intel API not enabled or configured' },
        { status: 503 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const tenantId = searchParams.get('tenant_id') || getCustomerIdFromHeaders(req.headers);
    const period = (searchParams.get('period') as '7d' | '30d' | '90d') || '30d';

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing required parameter: tenant_id' },
        { status: 400 }
      );
    }

    // Get tenant summary via Intel API
    const result = await intelClient.getTenantSummary(tenantId, period);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Intel API] Tenant summary error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get tenant summary',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

