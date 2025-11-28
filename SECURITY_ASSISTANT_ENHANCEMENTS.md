# Security Assistant - Enhanced with AI Models & Threat Intelligence

**Date:** November 10, 2025  
**Status:** ✅ READY TO DEPLOY

---

## 🎯 What Was Enhanced

### 1. **Improved Scroll Behavior** ✅

**Problem:** After asking a question, page stayed scrolled to bottom

**Solution:**
- Scroll card to top of viewport when answer arrives
- Then scroll messages box to show full response
- Improved timing (100ms delay for viewport, 400ms for messages)
- Added `messagesBoxRef` for precise control

**Result:** Users now see the start of responses automatically!

### 2. **Campaign-Specific Queries** ✅

Now you can ask about specific campaigns:

```
"Is the ClickFix campaign still happening?"
"Are we seeing ClickFix in our environment?"
"Tell me about active campaigns"
"Show me phishing campaigns"
```

**Features:**
- Detects campaign names in queries
- Shows campaign status (active/resolved/contained)
- Displays impact metrics (targets, compromised, clicked)
- Provides immediate action recommendations
- Searches across all campaigns in your environment

### 3. **Multi-Model AI Integration** ✅

Connected to multiple AI models for natural language queries:

**Primary:** Claude 3.5 Sonnet (Anthropic)
- Latest model (claude-3-5-sonnet-20241022)
- Best for security analysis
- 1024 token responses

**Fallback:** GPT-4 Turbo (OpenAI)
- Used if Claude unavailable or fails
- Handles complex queries
- 1024 token responses

**Smart Fallback Chain:**
1. Try pattern matching (fast, deterministic)
2. Try Claude API (sophisticated AI)
3. Try OpenAI API (fallback)
4. Use contextual help (always works)

### 4. **Enhanced Threat Intelligence** ✅

Now queries real threat data:

- ✅ Active campaigns (status, targets, impact)
- ✅ Campaign metrics (click rates, compromises)
- ✅ Geographic threats (country-level data)
- ✅ Timeline data (30-day trends)
- ✅ AI threat categories
- ✅ Threat families
- ✅ Security scores and posture

---

## 🔧 Technical Implementation

### API Route Enhanced

**File:** `src/app/api/assistant/route.ts`

**New Features:**
- `queryAIModel()` function for Claude/OpenAI integration
- Campaign querying logic
- Phishing campaign analysis
- General campaign overview
- Context building for AI models
- Multi-model fallback system

### Component Enhanced

**File:** `src/components/SecurityAssistant.tsx`

**New Features:**
- `messagesBoxRef` for precise scroll control
- Improved scroll timing
- Card scrolls to top first
- Messages box scrolls to show full response

---

## 💡 Example Queries

### Campaign Queries:

```
"Is the ClickFix campaign still happening?"
→ Shows ClickFix status, impact, and actions

"What campaigns are active?"
→ Lists all active campaigns with metrics

"Tell me about phishing campaigns"
→ Phishing-specific analysis and stats

"Show me the executive wire transfer scam"
→ BEC campaign details and status
```

### Threat Intelligence:

```
"What threats are we seeing from Russia?"
→ Geo-specific threat data

"Investigate today's top threat"
→ Top threat analysis with recommendations

"Show me AI-generated threats"
→ AI threat category breakdown
```

### Security Posture:

```
"How can I improve our security?"
→ Prioritized recommendations

"What's our security score?"
→ Current score and health metrics

"Summarize 30-day risk trends"
→ Timeline analysis and insights
```

---

## 🔑 API Keys Required

To enable AI models, add these environment variables to AWS Amplify:

### Anthropic (Claude) - Recommended

```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
```

Get your API key: https://console.anthropic.com/

### OpenAI (GPT-4) - Optional Fallback

```bash
OPENAI_API_KEY=sk-proj-...
```

Get your API key: https://platform.openai.com/api-keys

### Without API Keys:

The assistant still works with:
- ✅ Pattern-based responses
- ✅ All campaign queries
- ✅ Threat intelligence lookups
- ✅ Security metrics
- ❌ No natural language AI (just templates)

---

## 🧪 Testing the Enhancements

### Test Campaign Queries:

1. Start dev server: `npm run dev`
2. Visit: http://localhost:3001/
3. In Security Assistant, ask:
   - "Is the ClickFix campaign happening?"
   - "What campaigns are active?"
   - "Show me phishing campaigns"

### Test Scroll Fix:

1. Ask a question with a long answer
2. Watch card scroll to top automatically
3. See full response from the beginning

### Test AI Models (if API keys set):

1. Add API keys to `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   OPENAI_API_KEY=sk-proj-...
   ```
2. Restart dev server
3. Ask complex questions:
   - "Analyze our security posture and prioritize improvements"
   - "What's the relationship between our active campaigns?"
   - "Should I be worried about the current threat landscape?"

---

## 📊 How It Works

### Query Flow:

```
User Query
    ↓
1. Check for "no data" scenario → Return onboarding help
    ↓
2. Check for campaign patterns (ClickFix, active, phishing)
    ↓
3. Check for investigation patterns
    ↓
4. Check for posture improvement patterns
    ↓
5. Check for trend/summary patterns
    ↓
6. Try AI models (Claude → OpenAI)
    ↓
7. Return contextual help menu
```

### AI Model Integration:

```
queryAIModel(prompt, context)
    ↓
Build system prompt with:
  - Current security metrics
  - Active campaigns
  - Threat data
  - Recent activity
    ↓
Try Claude API
  ✅ Success → Return AI response
  ❌ Fail → Try OpenAI
    ↓
Try OpenAI API
  ✅ Success → Return AI response
  ❌ Fail → Throw error
    ↓
Fallback to template response
```

---

## 🚀 Deployment

### Files Changed:

1. `src/components/SecurityAssistant.tsx`
   - Fixed scroll behavior
   - Added messagesBoxRef

2. `src/app/api/assistant/route.ts`
   - Added AI model integration
   - Enhanced campaign queries
   - Added phishing analysis
   - Added context building

### To Deploy:

```bash
git add src/components/SecurityAssistant.tsx src/app/api/assistant/route.ts
git commit -m "feat: Enhance Security Assistant with AI models and campaign queries"
cd .git && git --git-dir=. --work-tree=.. push origin main
```

### Add API Keys in Amplify:

1. Go to: https://console.aws.amazon.com/amplify/home?region=us-east-1#/d15dkeaak9f84h
2. Click **Environment variables**
3. Add:
   - `ANTHROPIC_API_KEY` = your Anthropic key
   - `OPENAI_API_KEY` = your OpenAI key (optional)
4. Redeploy

---

## 📈 Benefits

### Before:
- ❌ Scroll stayed at bottom
- ❌ Only template responses
- ❌ Limited campaign awareness
- ❌ No natural language understanding

### After:
- ✅ Auto-scrolls to top of responses
- ✅ AI-powered natural language
- ✅ Campaign-specific queries
- ✅ Claude + OpenAI integration
- ✅ Real threat intelligence
- ✅ Context-aware responses
- ✅ Actionable recommendations

---

## 💰 Cost Estimates

### Claude API:
- $3 per million input tokens
- $15 per million output tokens
- ~1024 tokens per query = $0.02 per query
- **Estimated:** $5-20/month for typical usage

### OpenAI API:
- $10 per million input tokens  
- $30 per million output tokens
- ~1024 tokens per query = $0.04 per query
- **Estimated:** $10-40/month for typical usage

**Total:** ~$10-50/month depending on usage

---

## 🎉 Summary

**Enhancements Complete:**

1. ✅ Fixed scroll behavior (card to top after response)
2. ✅ Added campaign-specific queries (ClickFix, etc.)
3. ✅ Integrated Claude AI (primary model)
4. ✅ Integrated OpenAI GPT-4 (fallback)
5. ✅ Enhanced threat intelligence queries
6. ✅ Added phishing campaign analysis
7. ✅ Context-aware AI responses
8. ✅ Zero linter errors

**Ready to deploy!**

Ask things like:
- "Is the ClickFix campaign still happening?"
- "What campaigns are active in our environment?"
- "Analyze our current security posture"

---

*Built for ilminate-apex Security Platform*  
*AI Models: Claude 3.5 Sonnet + GPT-4 Turbo*











