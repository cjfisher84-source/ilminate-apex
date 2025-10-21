export type TechniqueMeta = { id: string; name: string; tactics: string[] };

export async function getTechniqueMeta(): Promise<TechniqueMeta[]> {
  // MVP: Static metadata for starter rules
  // TODO: Replace with S3-backed meta loader (server route, 6–12h in-memory cache)
  return [
    { id: 'T1566', name: 'Phishing', tactics: ['Initial Access'] },
    { id: 'T1059.001', name: 'PowerShell', tactics: ['Execution'] },
    { id: 'T1053', name: 'Scheduled Task/Job', tactics: ['Persistence', 'Privilege Escalation', 'Execution'] },
    { id: 'T1547.001', name: 'Registry Run Keys/Startup Folder', tactics: ['Persistence', 'Privilege Escalation'] },
    { id: 'T1218', name: 'Signed Binary Proxy Execution', tactics: ['Defense Evasion'] },
    { id: 'T1204', name: 'User Execution', tactics: ['Execution'] },
    { id: 'T1204.002', name: 'User Execution: Malicious File', tactics: ['Execution'] },
    { id: 'T1003', name: 'OS Credential Dumping', tactics: ['Credential Access'] },
    { id: 'T1027', name: 'Obfuscated Files or Information', tactics: ['Defense Evasion'] },
    { id: 'T1036', name: 'Masquerading', tactics: ['Defense Evasion'] },
    { id: 'T1566.002', name: 'Phishing: Spearphishing Link', tactics: ['Initial Access'] },
    { id: 'T1543.003', name: 'Create or Modify System Process: Windows Service', tactics: ['Persistence', 'Privilege Escalation'] }
  ];
}

