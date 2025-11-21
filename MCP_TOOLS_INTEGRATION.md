# MCP Tools Integration for Security Assistant & AI Triage

**Date:** January 2025  
**Status:** Available Tools Identified - Ready for Integration

---

## 🎯 Available MCP Tools for Enhancement

### 1. **AI Triage Enhancement Tools** ✅

#### `explain_detection_result`
**Purpose:** Explains WHY an email was flagged as malicious/suspicious

**Capabilities:**
- Detailed breakdown of indicators
- Detection layers that triggered
- Confidence assessment
- Recommended actions
- Human-readable explanations

**Use Case:** When AI Triage flags an email, use this to provide detailed explanation to users

**Example:**
```typescript
{
  explanation: "This email was flagged as HIGH risk (75% risk score) due to BEC indicators...",
  primary_reasons: ["Detected as: BEC", "High risk score: 75%", "3 threat indicator(s) found"],
  detection_layers_triggered: ["Deep Learning", "YARA", "OSINT"],
  threat_indicators: [
    {
      indicator: "urgent_language",
      severity: "high",
      explanation: "Contains urgent or time-sensitive language..."
    }
  ],
  confidence_assessment: "High confidence - Multiple detection methods agree",
  recommended_action: "Quarantine for review - Multiple suspicious indicators"
}
```

#### `investigate_suspicious_indicator`
**Purpose:** Lightweight, fast checks on specific suspicious indicators

**Capabilities:**
- Domain reputation checks
- URL analysis
- Attachment investigation
- Content pattern analysis
- Quick summary and recommendations

**Use Case:** When user asks "Why is this domain suspicious?" or "Check this URL"

**Example:**
```typescript
{
  indicator: "suspicious-domain.com",
  investigation_results: [
    {
      check_type: "domain_reputation",
      result: "suspicious",
      confidence: 0.85,
      details: "Domain has poor reputation score",
      source: "Mosint OSINT"
    }
  ],
  overall_assessment: "suspicious",
  quick_summary: "Domain shows multiple suspicious characteristics...",
  recommended_action: "Block domain and investigate further"
}
```

#### `get_detection_breakdown`
**Purpose:** Detailed breakdown of which detection layers triggered

**Capabilities:**
- Shows detection pipeline results
- Layer-by-layer analysis
- Detection timeline
- Transparency and understanding

**Use Case:** When user wants to understand the full detection process

**Example:**
```typescript
{
  detection_pipeline: {
    total_layers: 6,
    layers_triggered: 3,
    layers_checked: 6
  },
  layer_results: [
    {
      layer_name: "Deep Learning",
      layer_type: "deep_learning",
      triggered: true,
      confidence: 0.92,
      indicators_found: ["BEC_pattern", "urgent_language"]
    }
  ],
  threat_summary: {
    threat_level: "HIGH",
    risk_score: 75,
    threat_categories: ["BEC"],
    total_indicators: 3
  }
}
```

### 2. **Security Assistant Enhancement Tools** ✅

#### `query_security_assistant`
**Purpose:** Query ilminate-apex Security Assistant with context

**Capabilities:**
- Query Security Assistant from MCP
- Pass context for better responses
- Integration with apex API

**Use Case:** MCP can query Security Assistant (reverse integration)

**Note:** This is for MCP → Apex, not Apex → MCP

#### `analyze_email_threat`
**Purpose:** Analyze email for BEC/phishing indicators

**Capabilities:**
- Uses APEX Detection Engine
- Threat score (0-1)
- Threat type classification
- Indicators list
- Recommendation (quarantine/review/allow)

**Use Case:** Enhanced email analysis for AI Triage

**Example:**
```typescript
{
  threat_score: 0.75,
  threat_type: "BEC",
  indicators: ["urgent_language", "financial_request", "suspicious_sender"],
  recommendation: "quarantine",
  confidence: 0.85
}
```

---

## 🔧 Integration Plan

### Phase 1: AI Triage Enhancement (Immediate)

#### Update `/api/triage/route.ts`

**Add MCP tool calls:**

1. **After initial analysis, call `explain_detection_result`:**
```typescript
// In /api/triage route
if (mcpAnalysis) {
  // Get detailed explanation
  const explanation = await mcpClient.explainDetectionResult({
    subject,
    sender,
    body: details,
    verdict_data: mcpAnalysis
  });
  
  // Add to response
  analysis.explanation = explanation;
  analysis.detectionBreakdown = explanation.detection_layers_triggered;
}
```

2. **Add `investigate_suspicious_indicator` for user queries:**
```typescript
// New endpoint: /api/triage/investigate
// User asks: "Why is this domain suspicious?"
const investigation = await mcpClient.investigateSuspiciousIndicator(
  indicator,
  indicatorType
);
```

3. **Add `get_detection_breakdown` for detailed view:**
```typescript
// New endpoint: /api/triage/breakdown
const breakdown = await mcpClient.getDetectionBreakdown({
  subject,
  sender,
  body: details
});
```

### Phase 2: Security Assistant Enhancement

#### Update `/api/assistant/route.ts`

**Add MCP tool calls for enhanced responses:**

1. **When user asks about threats, use `analyze_email_threat`:**
```typescript
// In assistant route
if (lower.includes('analyze email') || lower.includes('check email')) {
  const analysis = await mcpClient.analyzeEmailThreat({
    subject: extractedSubject,
    sender: extractedSender,
    body: extractedBody
  });
  
  reply = `Email Analysis:\n\nThreat Score: ${analysis.threat_score * 100}%\n...`;
}
```

2. **When user asks "why was this detected?", use `explain_detection_result`:**
```typescript
if (lower.includes('why') && lower.includes('detected')) {
  const explanation = await mcpClient.explainDetectionResult({
    subject: extractedSubject,
    sender: extractedSender,
    body: extractedBody
  });
  
  reply = `Detection Explanation:\n\n${explanation.explanation}\n...`;
}
```

3. **When user asks about specific indicators, use `investigate_suspicious_indicator`:**
```typescript
if (lower.includes('check') || lower.includes('investigate')) {
  const investigation = await mcpClient.investigateSuspiciousIndicator(
    extractedIndicator,
    indicatorType
  );
  
  reply = `Investigation Results:\n\n${investigation.quick_summary}\n...`;
}
```

---

## 📋 Implementation Steps

### Step 1: Update MCP Client (`src/lib/mcpClient.ts`)

Add methods for new tools:

```typescript
/**
 * Explain detection result via MCP
 */
async explainDetectionResult(
  input: {
    subject: string;
    sender: string;
    body: string;
    message_id?: string;
    verdict_data?: any;
  }
): Promise<any> {
  const response = await this.callAPEXBridge('/api/mcp/tools/explain_detection_result', {
    subject: input.subject,
    sender: input.sender,
    body: input.body,
    message_id: input.message_id,
    verdict_data: input.verdict_data,
  });
  
  return response.success ? response.data : null;
}

/**
 * Investigate suspicious indicator via MCP
 */
async investigateSuspiciousIndicator(
  indicator: string,
  indicatorType: 'domain' | 'ip' | 'email' | 'hash' | 'url' | 'attachment'
): Promise<any> {
  const response = await this.callAPEXBridge('/api/mcp/tools/investigate_suspicious_indicator', {
    indicator_type: indicatorType,
    indicator_value: indicator,
  });
  
  return response.success ? response.data : null;
}

/**
 * Get detection breakdown via MCP
 */
async getDetectionBreakdown(
  input: {
    subject: string;
    sender: string;
    body: string;
    message_id?: string;
  }
): Promise<any> {
  const response = await this.callAPEXBridge('/api/mcp/tools/get_detection_breakdown', {
    subject: input.subject,
    sender: input.sender,
    body: input.body,
    message_id: input.message_id,
  });
  
  return response.success ? response.data : null;
}
```

**Note:** These tools are exposed via MCP server, not APEX Bridge directly. We need to check if there's an HTTP endpoint or if we need to add one.

### Step 2: Check MCP Server HTTP Endpoints

The MCP server uses stdio transport, but we need HTTP endpoints. Check:
- Does MCP server expose HTTP API?
- Do we need to add HTTP wrapper?
- Can we call tools via APEX Bridge?

### Step 3: Update API Routes

1. **AI Triage:** Add explanation and breakdown endpoints
2. **Security Assistant:** Add MCP tool calls for enhanced responses

---

## 🚨 Important Notes

### Current Architecture

```
apex.ilminate.com
  ↓ HTTP
APEX Bridge (http://54.237.174.195:8888)
  ↓ HTTP
ilminate-agent detection engines
```

### MCP Tools Architecture

```
MCP Server (stdio transport)
  ↓ stdio
Claude Desktop / MCP Clients
```

**Issue:** MCP tools use stdio transport, not HTTP. We need:
1. HTTP wrapper for MCP tools, OR
2. Direct calls to APEX Bridge (which MCP tools use internally)

### Solution Options

**Option 1:** Add HTTP endpoints to MCP server
- Expose MCP tools via HTTP API
- `/api/mcp/tools/{tool_name}` endpoint
- Accepts tool arguments, returns results

**Option 2:** Call APEX Bridge directly
- MCP tools call APEX Bridge internally
- We can call APEX Bridge directly too
- But we lose MCP tool enhancements (explanation, breakdown)

**Option 3:** Create HTTP wrapper service
- New service that wraps MCP tools
- Exposes HTTP endpoints
- Calls MCP tools internally

---

## ✅ Recommended Approach

**Use Option 1:** Add HTTP endpoints to MCP server

**Benefits:**
- Access to all MCP tool capabilities
- Consistent with MCP architecture
- Can be used by other services too

**Implementation:**
1. Add HTTP server to MCP (`src/server/http.ts`)
2. Expose tool endpoints (`/api/mcp/tools/{tool_name}`)
3. Update MCP client in apex to call HTTP endpoints

---

## 📊 Summary

### Available Tools:
- ✅ `explain_detection_result` - Detailed explanations
- ✅ `investigate_suspicious_indicator` - Lightweight checks
- ✅ `get_detection_breakdown` - Detection pipeline breakdown
- ✅ `analyze_email_threat` - Enhanced email analysis

### Integration Status:
- ⏳ Need HTTP endpoints for MCP tools
- ⏳ Update MCP client in apex
- ⏳ Integrate into AI Triage
- ⏳ Integrate into Security Assistant

### Next Steps:
1. Check if MCP server has HTTP endpoints
2. If not, add HTTP server to MCP
3. Update apex MCP client
4. Integrate tools into routes

---

**Status:** Tools identified, ready for integration once HTTP endpoints are available!

