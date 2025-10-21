import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenant = searchParams.get('tenant') || 'all';
  const days = searchParams.get('days') || '30';

  // Mock data for MVP - wire to DynamoDB/Athena later
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
    ]
  };

  return NextResponse.json(layerData);
}

