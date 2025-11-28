import { NextRequest, NextResponse } from 'next/server';
import { getIntelClient } from '@/lib/intelClient';

/**
 * API Route: GET /api/intel/trends
 * 
 * Get global threat trends (anonymized, aggregated)
 * Used for threat trend visualizations and global threat intelligence
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
    const period = (searchParams.get('period') as '7d' | '30d' | '90d') || '30d';
    const category = searchParams.get('category') || undefined;
    const campaignId = searchParams.get('campaign_id') || undefined;

    // Get trends via Intel API
    const result = await intelClient.getTrends(period, category, campaignId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Intel API] Trends error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get threat trends',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

