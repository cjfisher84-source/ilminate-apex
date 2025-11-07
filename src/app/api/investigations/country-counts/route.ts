import { NextResponse } from "next/server"
import { MOCK_COUNTRY_COUNTS } from "@/lib/mockThreats"
import { getCustomerIdFromHeaders, isMockDataEnabled } from "@/lib/tenantUtils"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  // Get customer ID for multi-tenant support
  const customerId = getCustomerIdFromHeaders(request.headers)
  
  // Check if mock data should be shown
  if (!isMockDataEnabled(customerId)) {
    // Return empty for customers without mock data
    return NextResponse.json({ counts: [] })
  }
  
  // In real code: SELECT iso3, COUNT(*) FROM threats WHERE customerId = ? GROUP BY iso3
  return NextResponse.json({ counts: MOCK_COUNTRY_COUNTS })
}

