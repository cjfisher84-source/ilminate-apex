import { NextRequest, NextResponse } from 'next/server';
import { queryApexEvents } from '@/lib/dynamodb';
import { getCustomerIdFromHeaders } from '@/lib/tenantUtils';
import { isMockDataEnabled } from '@/lib/tenantUtils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenant = searchParams.get('tenant') || 'all';
    const days = parseInt(searchParams.get('days') || '30', 10);
    const customerId = getCustomerIdFromHeaders(request.headers);
    const showMockData = isMockDataEnabled(customerId);

    // If mock data is enabled, return mock data
    if (showMockData) {
      const fakeData = [
        { techniqueID: 'T1566', score: 121 },
        { techniqueID: 'T1059.001', score: 34 },
        { techniqueID: 'T1053', score: 9 },
        { techniqueID: 'T1547.001', score: 12 },
        { techniqueID: 'T1218', score: 27 },
        { techniqueID: 'T1204', score: 18 },
        { techniqueID: 'T1003', score: 6 },
        { techniqueID: 'T1027', score: 15 },
        { techniqueID: 'T1036', score: 22 },
        { techniqueID: 'T1566.002', score: 89 }
      ];

      const layerData = {
        name: `${process.env.NEXT_PUBLIC_ATTACK_LAYER_TITLE || 'Techniques Observed (30d)'} — ${tenant}`,
        description: `Auto-generated from ${days}d events`,
        domain: 'enterprise-attack',
        techniques: fakeData,
        gradient: { colors: ['#e4f1ff', '#005bbb'] },
        legendItems: [
          { label: 'Few', value: 1 },
          { label: 'Some', value: 10 },
          { label: 'Many', value: 100 }
        ],
        source: 'mock'
      };

      return NextResponse.json(layerData);
    }

    // Try to fetch real data from DynamoDB
    try {
      const events = await queryApexEvents({
        customerId: customerId || undefined,
        days,
        limit: 10000
      });

      // Extract techniques from events
      const techniqueMap = new Map<string, number>();

      events.forEach((event: any) => {
        // Try to parse techniques from various possible fields
        let techniques: any[] = [];
        
        if (event.techniques) {
          try {
            techniques = typeof event.techniques === 'string' 
              ? JSON.parse(event.techniques) 
              : event.techniques;
          } catch (e) {
            // If parsing fails, skip
          }
        }

        // Count occurrences of each technique
        if (Array.isArray(techniques)) {
          techniques.forEach((tech: any) => {
            const techId = typeof tech === 'string' ? tech : tech.id || tech.techniqueID;
            if (techId) {
              techniqueMap.set(techId, (techniqueMap.get(techId) || 0) + 1);
            }
          });
        }
      });

      // Convert to array format
      const techniques = Array.from(techniqueMap.entries())
        .map(([techniqueID, score]) => ({ techniqueID, score }))
        .sort((a, b) => b.score - a.score); // Sort by score descending

      // If no techniques found, return empty data
      if (techniques.length === 0) {
        return NextResponse.json({
          name: `${process.env.NEXT_PUBLIC_ATTACK_LAYER_TITLE || 'Techniques Observed (30d)'} — ${tenant}`,
          description: `No techniques found in ${days}d events`,
          domain: 'enterprise-attack',
          techniques: [],
          gradient: { colors: ['#e4f1ff', '#005bbb'] },
          legendItems: [
            { label: 'Few', value: 1 },
            { label: 'Some', value: 10 },
            { label: 'Many', value: 100 }
          ],
          source: 'dynamodb-empty'
        });
      }

      // Calculate max score for legend
      const maxScore = Math.max(...techniques.map(t => t.score));
      const legendMax = maxScore > 100 ? Math.ceil(maxScore / 10) * 10 : 100;

      const layerData = {
        name: `${process.env.NEXT_PUBLIC_ATTACK_LAYER_TITLE || 'Techniques Observed (30d)'} — ${tenant}`,
        description: `Auto-generated from ${days}d events (${events.length} events analyzed)`,
        domain: 'enterprise-attack',
        techniques,
        gradient: { colors: ['#e4f1ff', '#005bbb'] },
        legendItems: [
          { label: 'Few', value: 1 },
          { label: 'Some', value: Math.floor(legendMax / 3) },
          { label: 'Many', value: legendMax }
        ],
        source: 'dynamodb'
      };

      return NextResponse.json(layerData);
    } catch (dbError: any) {
      // If table doesn't exist, return empty data
      if (dbError.name === 'ResourceNotFoundException') {
        console.log('Events table does not exist yet, returning empty layer');
        return NextResponse.json({
          name: `${process.env.NEXT_PUBLIC_ATTACK_LAYER_TITLE || 'Techniques Observed (30d)'} — ${tenant}`,
          description: `No events table found`,
          domain: 'enterprise-attack',
          techniques: [],
          gradient: { colors: ['#e4f1ff', '#005bbb'] },
          legendItems: [
            { label: 'Few', value: 1 },
            { label: 'Some', value: 10 },
            { label: 'Many', value: 100 }
          ],
          source: 'dynamodb-empty'
        });
      }

      console.error('Error fetching ATT&CK layer data:', dbError);
      // Fall back to mock data on error
      const fakeData = [
        { techniqueID: 'T1566', score: 121 },
        { techniqueID: 'T1059.001', score: 34 },
        { techniqueID: 'T1053', score: 9 },
        { techniqueID: 'T1547.001', score: 12 },
        { techniqueID: 'T1218', score: 27 },
        { techniqueID: 'T1204', score: 18 },
        { techniqueID: 'T1003', score: 6 },
        { techniqueID: 'T1027', score: 15 },
        { techniqueID: 'T1036', score: 22 },
        { techniqueID: 'T1566.002', score: 89 }
      ];

      return NextResponse.json({
        name: `${process.env.NEXT_PUBLIC_ATTACK_LAYER_TITLE || 'Techniques Observed (30d)'} — ${tenant}`,
        description: `Error loading data: ${dbError.message}`,
        domain: 'enterprise-attack',
        techniques: fakeData,
        gradient: { colors: ['#e4f1ff', '#005bbb'] },
        legendItems: [
          { label: 'Few', value: 1 },
          { label: 'Some', value: 10 },
          { label: 'Many', value: 100 }
        ],
        source: 'error-fallback'
      });
    }
  } catch (error: any) {
    console.error('ATT&CK layer API error:', error);
    return NextResponse.json({
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

