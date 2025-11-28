import { NextRequest, NextResponse } from 'next/server';
import { getIntelClient } from '@/lib/intelClient';
import { getCustomerIdFromHeaders } from '@/lib/tenantUtils';

/**
 * API Route: POST /api/intel/enrich
 * 
 * Batch IOC enrichment endpoint that proxies to Intel API
 * Used for real-time threat intelligence lookups during detection
 */

export async function POST(req: NextRequest) {
  try {
    const intelClient = getIntelClient();

    if (!intelClient.isEnabled()) {
      return NextResponse.json(
        { error: 'Intel API not enabled or configured' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { indicators } = body;

    if (!indicators || !Array.isArray(indicators) || indicators.length === 0) {
      return NextResponse.json(
        { error: 'Missing or empty indicators array' },
        { status: 400 }
      );
    }

    // Get tenant ID from headers or body
    const tenantId = body.tenant_id || getCustomerIdFromHeaders(req.headers);

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing tenant_id' },
        { status: 400 }
      );
    }

    // Enrich indicators via Intel API
    const result = await intelClient.enrich(tenantId, indicators);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Intel API] Enrich error:', error);
    return NextResponse.json(
      {
        error: 'Failed to enrich indicators',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

