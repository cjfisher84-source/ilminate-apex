import { NextResponse } from "next/server"
import { MOCK_THREATS_BY_COUNTRY } from "@/lib/mockThreats"
import { getCustomerIdFromHeaders, isMockDataEnabled } from "@/lib/tenantUtils"
import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const iso3 = searchParams.get("iso3")
  
  if (!iso3) {
    return NextResponse.json({ error: "iso3 is required" }, { status: 400 })
  }
  
  // Get customer ID for multi-tenant support
  const customerId = getCustomerIdFromHeaders(req.headers)
  
  // Check if mock data should be shown
  if (!isMockDataEnabled(customerId)) {
    // Return empty for customers without mock data
    return NextResponse.json({ iso3, threats: [] })
  }
  
  // In real code: SELECT * FROM threats WHERE customerId = ? AND iso3 = ? ORDER BY ts DESC
  const threats = MOCK_THREATS_BY_COUNTRY[iso3] || []
  return NextResponse.json({ iso3, threats })
}

