import { NextRequest, NextResponse } from 'next/server';
import { getIntelClient } from '@/lib/intelClient';
import { getCustomerIdFromHeaders } from '@/lib/tenantUtils';

/**
 * API Route: GET /api/intel/indicator
 * 
 * Get detailed information about a single indicator
 * Used for threat intelligence drill-downs in the UI
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
    const value = searchParams.get('value');
    const type = searchParams.get('type') as 'url' | 'domain' | 'ip' | 'hash' | 'email' | undefined;
    const tenantId = searchParams.get('tenant_id') || getCustomerIdFromHeaders(req.headers) || undefined;

    if (!value) {
      return NextResponse.json(
        { error: 'Missing required parameter: value' },
        { status: 400 }
      );
    }

    // Get indicator details via Intel API
    const result = await intelClient.getIndicator(value, type, tenantId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Intel API] Indicator lookup error:', error);
    
    // Return 404 if indicator not found (expected case)
    if (error.message?.includes('404') || error.message?.includes('Not found')) {
      return NextResponse.json(
        { error: 'Indicator not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to lookup indicator',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

