import re
STARTER_RULES = [
    (re.compile(r"(spoofed|phish|credential\s*harvest|fake\s*login|invoice\s*scam)", re.I),
     "T1566", "Initial Access", 0.9, "Rule: email/phish keywords"),
    (re.compile(r"(html\s*smuggl|onclick=.*download|data:text/html|blob:)", re.I),
     "T1027", "Defense Evasion", 0.7, "Rule: HTML smuggling indicators"),
    (re.compile(r"\.(docm|xlsm|pptm)\b", re.I),
     "T1204.002", "Execution", 0.85, "Rule: macro-enabled attachment"),
    (re.compile(r"powershell.*-enc(oded)?command", re.I),
     "T1059.001", "Execution", 0.9, "Rule: PS encoded command"),
    (re.compile(r"\bschtasks(\.exe)?\b", re.I),
     "T1053", "Persistence", 0.8, "Rule: schtasks usage"),
    (re.compile(r"\\Software\\(Microsoft\\Windows\\CurrentVersion\\Run|RunOnce)", re.I),
     "T1547.001", "Persistence", 0.8, "Rule: Run keys modified"),
    (re.compile(r"\b(sc\.exe|New-Service)\b", re.I),
     "T1543.003", "Persistence", 0.7, "Rule: Service install"),
    (re.compile(r"\b(mshta|rundll32|regsvr32|bitsadmin)\b", re.I),
     "T1218", "Defense Evasion", 0.7, "Rule: LOLBins found"),
    (re.compile(r"(winword|excel|powerpnt).*(wscript|cscript)", re.I),
     "T1204", "Execution", 0.75, "Rule: Office spawning script host"),
    (re.compile(r"(lsass\.dmp|mimikatz|sekurlsa|procdump.*lsass)", re.I),
     "T1003", "Credential Access", 0.9, "Rule: Cred dumping indicators"),
    (re.compile(r"\.(zip|rar|7z).*\.(exe|scr|js)\b", re.I),
     "T1036", "Defense Evasion", 0.7, "Rule: Archive with dual extension"),
    (re.compile(r"(undeliver(ed|able)|docusign|o365|mfa reset|shared document)", re.I),
     "T1566.002", "Initial Access", 0.8, "Rule: common brand lure"),
]
def map_event(event_text: str):
    mapped=[]
    for rx, tech, tactic, conf, why in STARTER_RULES:
        if rx.search(event_text or ""):
            mapped.append({"id": tech, "tactic": tactic, "confidence": conf, "reason": why})
    return mapped

