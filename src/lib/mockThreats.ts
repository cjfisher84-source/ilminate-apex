// Mock country counts (ISO3 -> count)
export const MOCK_COUNTRY_COUNTS: { iso3: string; count: number }[] = [
  { iso3: "RUS", count: 1250 }, // Increased for more RED
  { iso3: "CHN", count: 850 },  // Increased for more RED
  { iso3: "IRN", count: 750 },  // Increased for more RED
  { iso3: "PRK", count: 650 },  // North Korea - more RED
  { iso3: "USA", count: 121 },
  { iso3: "GBR", count: 64 },
  { iso3: "DEU", count: 52 },
  { iso3: "CAN", count: 49 },
  { iso3: "NGA", count: 450 },  // Nigeria
  { iso3: "IND", count: 350 },  // India
  { iso3: "BRA", count: 120 },
  { iso3: "AUS", count: 33 },
  { iso3: "VNM", count: 21 },
  { iso3: "TUR", count: 18 },
  { iso3: "ZAF", count: 12 },
  { iso3: "MEX", count: 9 },
]

// Mock threats by country (iso3)
export const MOCK_THREATS_BY_COUNTRY: Record<string, Array<{
  id: string
  subject: string
  family?: string
  severity: "low" | "medium" | "high" | "critical"
  vector: "phish" | "malware" | "bec" | "credential" | "c2" | "exploit"
  ts: string
}>> = {
  RUS: [
    { id: "rus-001", subject: "ClickFix lure to reset mailbox", family: "ClickFix", severity: "high", vector: "phish", ts: "2025-11-06T12:10:00Z" },
    { id: "rus-002", subject: "ZIP attachment delivering loader", family: "AZORult", severity: "critical", vector: "malware", ts: "2025-11-05T04:20:00Z" },
    { id: "rus-003", subject: "BEC: CFO payment request", severity: "medium", vector: "bec", ts: "2025-11-03T21:55:00Z" },
  ],
  CHN: [
    { id: "chn-001", subject: "O365 password expiry notification", severity: "high", vector: "credential", ts: "2025-11-06T08:43:00Z" },
    { id: "chn-002", subject: "Malicious doc with macro payload", family: "AgentTesla", severity: "high", vector: "malware", ts: "2025-11-04T15:33:00Z" },
  ],
  USA: [
    { id: "usa-001", subject: "Payroll direct-deposit update", severity: "medium", vector: "bec", ts: "2025-11-05T19:22:00Z" },
    { id: "usa-002", subject: "Fake MFA prompt", severity: "high", vector: "credential", ts: "2025-11-05T10:02:00Z" },
  ],
  IRN: [
    { id: "irn-001", subject: "LinkedIn job lure to malware site", severity: "high", vector: "phish", ts: "2025-11-02T09:11:00Z" },
  ],
  PRK: [
    { id: "prk-001", subject: "Dev tooling update (trojanized)", severity: "critical", vector: "malware", ts: "2025-11-01T23:01:00Z" },
  ],
  GBR: [
    { id: "gbr-001", subject: "SharePoint file share (spoofed)", severity: "medium", vector: "phish", ts: "2025-11-06T06:41:00Z" },
  ],
  DEU: [
    { id: "deu-001", subject: "Invoice PDF w/ embedded link", severity: "medium", vector: "phish", ts: "2025-11-06T03:12:00Z" },
  ],
  CAN: [
    { id: "can-001", subject: "IT ticket follow-up (credential steal)", severity: "high", vector: "credential", ts: "2025-11-03T18:09:00Z" },
  ],
  AUS: [
    { id: "aus-001", subject: "Delivery failure notice (spoof)", severity: "low", vector: "phish", ts: "2025-11-02T12:55:00Z" },
  ],
  BRA: [
    { id: "bra-001", subject: "Bank account validation required", severity: "medium", vector: "phish", ts: "2025-11-05T02:44:00Z" },
  ],
  IND: [
    { id: "ind-001", subject: "Compliance policy update (fake)", severity: "medium", vector: "phish", ts: "2025-11-04T07:20:00Z" },
  ],
  VNM: [
    { id: "vnm-001", subject: "Invoice overdue (link to credential page)", severity: "high", vector: "credential", ts: "2025-11-01T06:01:00Z" },
  ],
  TUR: [
    { id: "tur-001", subject: "Mailbox storage full (spoof)", severity: "low", vector: "phish", ts: "2025-11-03T14:54:00Z" },
  ],
  ZAF: [
    { id: "zaf-001", subject: "WinRAR CVE exploit link", severity: "high", vector: "exploit", ts: "2025-10-31T21:05:00Z" },
  ],
  MEX: [
    { id: "mex-001", subject: "DocuSign notice (fake)", severity: "medium", vector: "phish", ts: "2025-11-06T16:40:00Z" },
  ],
  NGA: [
    { id: "nga-001", subject: "BEC: Urgent wire transfer request", severity: "critical", vector: "bec", ts: "2025-11-06T14:22:00Z" },
    { id: "nga-002", subject: "Gift card purchase request from CEO", severity: "high", vector: "bec", ts: "2025-11-05T09:15:00Z" },
  ],
}

