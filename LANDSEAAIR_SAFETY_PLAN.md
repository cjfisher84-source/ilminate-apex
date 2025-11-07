# 🛡️ Land Sea Air - Safe Onboarding Plan

**Customer**: Land Sea Air (First Free Customer)  
**Risk Level**: HIGH (Production email system)  
**Approach**: Phased, Read-Only, Zero-Impact  

---

## ⚠️ PRIMARY CONCERN: DO NOT IMPACT PRODUCTION MAIL

### 🚨 Critical Rules

1. **NEVER modify, delete, or quarantine production emails** without explicit approval
2. **Start with READ-ONLY access** - monitoring only
3. **No automatic actions** until extensively tested
4. **Rollback plan ready** at every phase
5. **Land Sea Air retains full control** of their email

---

## 📋 Phased Approach (Safe Onboarding)

### **Phase 0: Pre-Integration Checklist** (DO THIS FIRST)

#### ✅ Detection Engine Status Check

**Action Items:**

1. **Verify ilminate-email Service**
   ```bash
   cd /Users/cfisher/Library/Mobile\ Documents/com~apple~CloudDocs/ilminate-email
   
   # Check service status
   git status
   git log -5 --oneline
   
   # Verify all detection engines present
   ls -la parsers/
   ls -la detectors/
   ```

   **Should have:**
   - ✅ DMARC parser (deployed)
   - ✅ SPF/DKIM validator
   - ✅ Threat detection engine
   - ✅ URL analyzer
   - ✅ Attachment scanner
   - ✅ BEC detector (for logistics fraud)

2. **Test Detection Engines Locally**
   ```bash
   # Run test suite
   npm test
   # or
   python -m pytest tests/
   
   # Verify all tests pass
   ```

3. **Check Lambda Functions**
   ```bash
   cd /Users/cfisher/Library/Mobile\ Documents/com~apple~CloudDocs/ilminate-infrastructure
   
   # List deployed functions
   aws lambda list-functions --region us-east-1 --profile ilminate-prod | grep email
   
   # Check function status
   aws lambda get-function --function-name ilminate-email-processor --region us-east-1
   ```

4. **Verify DynamoDB Tables**
   ```bash
   # Check tables exist
   aws dynamodb list-tables --region us-east-1 --profile ilminate-prod
   
   # Should include:
   # - ilminate-apex-events
   # - QuarantinedMessages
   # - DMARCReports (if exists)
   ```

5. **Test DMARC Parser**
   ```bash
   # Test with sample DMARC report
   cd ilminate-email
   # Run DMARC parser test
   # Verify: SPF pass/fail, DKIM pass/fail, alignment checks
   ```

---

### **Phase 1: Read-Only Monitoring (Week 1)**

**Goal**: Monitor emails, NO modifications  
**Risk**: ZERO - No impact on production  

#### Gmail API Permissions (Read-Only)

```json
{
  "scopes": [
    "https://www.googleapis.com/auth/gmail.readonly"  // READ ONLY
    // DO NOT add gmail.modify yet
  ]
}
```

**What Happens:**
- ✅ ilminate-email reads emails
- ✅ Analyzes for threats
- ✅ Writes to DynamoDB
- ✅ APEX dashboard shows results
- ❌ **NO email modifications**
- ❌ **NO quarantine actions**
- ❌ **NO labels applied**

**Success Criteria:**
- Dashboard shows email flow
- Threat detection working
- DMARC reports appearing
- No errors or failures
- **Land Sea Air email untouched**

---

### **Phase 2: Testing Environment (Week 2)**

**Goal**: Test with dedicated test mailbox  
**Risk**: LOW - Isolated test account  

#### Create Test Mailbox

**Land Sea Air Action:**
```
Create test@landseaair-nc.com mailbox
Send various test emails:
- Legitimate business emails
- Phishing simulations (HarborSim)
- Known malware samples (in sandbox)
- BEC attempts (freight fraud scenarios)
```

**Ilminate Action:**
```bash
# Enable gmail.modify ONLY for test@landseaair-nc.com
# Configure quarantine rules
# Test automatic actions

# Verify:
- Legitimate emails not touched
- Threats properly quarantined
- False positive rate acceptable
- Quarantine digest works
```

**Success Criteria:**
- 95%+ accurate threat detection
- <1% false positive rate
- Quarantine works correctly
- Release/delete functions work
- No legitimate email blocked

---

### **Phase 3: Production Monitoring Only (Week 3)**

**Goal**: Monitor production, manual quarantine only  
**Risk**: LOW - Manual review required  

#### Upgrade Permissions

```json
{
  "scopes": [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify"  // NOW ADDED
  ]
}
```

**Configuration:**
```json
{
  "automatic_quarantine": false,  // MANUAL ONLY
  "notify_on_threat": true,
  "review_required": true,
  "admin_approval": true
}
```

**What Happens:**
- ✅ Threats detected and flagged
- ✅ Admin notification sent
- ✅ Manual review in APEX quarantine dashboard
- ✅ Chris approves quarantine action
- ❌ **NO automatic quarantine**

**Success Criteria:**
- All threats reviewed manually
- Admin comfortable with detection accuracy
- Land Sea Air confident in system
- No false positives reaching users

---

### **Phase 4: Automatic Quarantine (Week 4+)**

**Goal**: Full automation with safeguards  
**Risk**: MEDIUM - Requires confidence  

#### Enable Automation (with limits)

```json
{
  "automatic_quarantine": true,
  "confidence_threshold": 0.85,  // Only quarantine high-confidence threats
  "auto_quarantine_categories": [
    "malware",      // Safe to auto-quarantine
    "phishing"      // Safe to auto-quarantine
  ],
  "manual_review_categories": [
    "bec",          // Requires review (business context)
    "spam"          // Higher false positive risk
  ],
  "max_auto_quarantine_per_day": 50,  // Safety limit
  "whitelist_enabled": true,
  "send_digest": true  // Daily quarantine digest to users
}
```

**Safeguards:**
- ✅ Confidence threshold (85%+)
- ✅ Category restrictions
- ✅ Daily limits
- ✅ Whitelist respected
- ✅ User self-service digest
- ✅ Admin oversight

---

## 🔍 Detection Engine Pre-Flight Check

### **Checklist Before Onboarding LSA:**

#### **1. Email Security Service (ilminate-email)**

```bash
cd ilminate-email

# Status check
git status
git log --oneline -10

# Test detection engines
npm test  # or python -m pytest

# Verify modules:
ls -la parsers/      # DMARC, SPF, DKIM
ls -la detectors/    # Threat, URL, Attachment
ls -la analyzers/    # BEC, Phishing, Malware
```

**Required Tests:**
- [ ] DMARC parser: ✅ Pass/Fail detection
- [ ] SPF validator: ✅ Alignment checks
- [ ] DKIM validator: ✅ Signature verification
- [ ] URL analyzer: ✅ Malicious domain detection
- [ ] Attachment scanner: ✅ Macro/executable detection
- [ ] BEC detector: ✅ Executive impersonation (critical for LSA)
- [ ] Phishing classifier: ✅ Content analysis
- [ ] AI Triage: ✅ LLM-based threat assessment

---

#### **2. Infrastructure Services**

```bash
cd ilminate-infrastructure

# Check Lambda functions
aws lambda list-functions --region us-east-1 | grep ilminate

# Expected functions:
# - ilminate-email-processor
# - ilminate-dmarc-parser
# - ilminate-threat-analyzer
```

**Verify:**
- [ ] Lambda functions deployed
- [ ] CloudWatch logs enabled
- [ ] Error alerts configured
- [ ] DynamoDB tables ready
- [ ] S3 buckets configured
- [ ] IAM roles correct

---

#### **3. Agent Services (EDR - Not used by LSA initially)**

**Skip for LSA** - No EDR requirement

---

#### **4. SIEM Integration (ilminate-siem)**

```bash
cd ilminate-siem

# Check Wazuh status (if applicable)
# LSA may not need SIEM initially
```

**Optional for LSA** - Consider for Phase 4

---

## 🧪 Testing Strategy

### **Pre-Production Testing**

#### **Test 1: DMARC Reporting Only**

**Safest first step:**
```
1. Configure DMARC DNS with rua= reporting
2. Collect DMARC reports for 7 days
3. NO email scanning yet
4. Review SPF/DKIM alignment
5. Identify legitimate sending sources

Result: DMARC dashboard populates, ZERO impact on email
```

**Timeline**: 7 days  
**Risk**: ZERO  

---

#### **Test 2: Read-Only Email Analysis**

**After DMARC successful:**
```
1. Enable Gmail API (readonly scope)
2. Scan last 30 days of email (historical)
3. Generate threat reports
4. Review with Land Sea Air
5. Tune detection thresholds

Result: Threat dashboard populates, ZERO impact on email
```

**Timeline**: 3-5 days  
**Risk**: ZERO  

---

#### **Test 3: Manual Quarantine (Test Account)**

**After read-only successful:**
```
1. Create test@landseaair-nc.com
2. Enable gmail.modify for test account only
3. Send phishing tests to test account
4. Manually quarantine via APEX
5. Verify release/delete works

Result: Validate quarantine workflow, ZERO production impact
```

**Timeline**: 2-3 days  
**Risk**: ZERO (isolated test account)  

---

#### **Test 4: Manual Quarantine (Production)**

**After test account successful:**
```
1. Enable gmail.modify for all accounts
2. Set automatic_quarantine: FALSE
3. Detect threats, notify Chris
4. Chris reviews and manually approves quarantine
5. Build confidence over 1-2 weeks

Result: Manual oversight, LOW risk
```

**Timeline**: 1-2 weeks  
**Risk**: LOW (manual approval)  

---

#### **Test 5: Automatic Quarantine (Limited)**

**After manual quarantine successful:**
```
1. Enable automatic_quarantine: TRUE
2. High confidence only (>85%)
3. Malware/Phishing only (not BEC/Spam)
4. Daily limit: 50 emails max
5. Monitor closely for 2 weeks

Result: Partial automation, MEDIUM risk
```

**Timeline**: 2 weeks  
**Risk**: MEDIUM (automated actions)  

---

## 🛠️ Detection Engine Update Checklist

### **Before LSA Goes Live:**

#### **1. Update ilminate-email Service**

```bash
cd ilminate-email

# Pull latest updates
git pull origin main

# Review recent changes
git log --since="2024-10-01" --oneline

# Check for security updates
npm audit
# or
pip list --outdated

# Update dependencies
npm update
# or
pip install -r requirements.txt --upgrade

# Run full test suite
npm test
# or
pytest tests/ -v

# Deploy if updates available
# (document deployment process)
```

---

#### **2. Verify Detection Accuracy**

**Test Dataset** (create if not exists):
```
/ilminate-email/tests/samples/
├── legitimate/          # 100 real business emails
├── phishing/           # 50 phishing samples
├── malware/            # 25 malware samples
├── bec/                # 25 BEC/fraud samples (important for LSA)
└── spam/               # 50 spam samples
```

**Run Tests:**
```bash
python test_detection_accuracy.py

# Expected Results:
# - True Positive Rate: >95%
# - False Positive Rate: <1%
# - BEC Detection: >90% (critical for logistics)
```

---

#### **3. Update Threat Intelligence Feeds**

```bash
# Check last update
ls -lh threat-intel/

# Update feeds
./update_threat_intel.sh

# Sources to update:
# - Malicious domain lists
# - IP reputation databases
# - Known malware signatures
# - BEC indicators (CEO fraud, invoice scams)
# - Logistics fraud patterns (for LSA specifically)
```

---

#### **4. Test DMARC Parser**

```bash
cd ilminate-email

# Test with real DMARC reports
python test_dmarc_parser.py

# Verify:
# - XML parsing works
# - SPF results extracted
# - DKIM results extracted
# - Alignment calculated correctly
# - Report summary generated
```

---

## 📊 Current Service Status (Need to Verify)

| Service | Status | Last Deployed | Notes |
|---------|--------|---------------|-------|
| ilminate-apex | ✅ Just Updated | 2024-11-05 | LSA multi-tenant ready |
| ilminate-email | ❓ **VERIFY** | Unknown | DMARC parser recently added |
| ilminate-infrastructure | ❓ **VERIFY** | Unknown | Lambda functions |
| ilminate-agent | ✅ Active | Recent | QR/image scanning deployed |
| ilminate-siem | ❓ Optional | Unknown | Not needed for LSA initially |

**Action Required:** Check status of ilminate-email and ilminate-infrastructure before LSA integration

---

## 🎯 Recommended Approach for Land Sea Air

### **Option 1: ULTRA SAFE (Recommended for First Customer)**

**Phase 1: DMARC Only (Week 1)**
- Configure DMARC DNS reporting
- Collect reports for 7 days
- NO email scanning
- ZERO risk
- Builds trust

**Phase 2: Read-Only Historical Analysis (Week 2)**
- Scan LAST 30 days of email (historical)
- Generate threat report
- Review with LSA
- NO real-time monitoring yet
- ZERO impact

**Phase 3: Read-Only Real-Time (Week 3)**
- Enable real-time email scanning (readonly)
- Dashboard shows live threats
- NO actions taken
- Manual investigation only
- ZERO impact

**Phase 4: Manual Actions (Week 4+)**
- Enable quarantine (manual approval)
- Chris reviews every action
- LSA sees results
- Builds confidence

**Timeline**: 4+ weeks  
**Risk**: Minimal  
**Confidence**: High  

---

### **Option 2: MODERATE SAFE (Faster)**

**Phase 1: Test Account Only (Week 1)**
- Create test@landseaair-nc.com
- Full features enabled
- Extensive testing
- ZERO production impact

**Phase 2: Production Read-Only (Week 2)**
- Monitor production (readonly)
- Dashboard shows threats
- Manual investigation
- ZERO impact

**Phase 3: Manual Quarantine (Week 3)**
- Enable quarantine (manual)
- Build confidence
- LOW risk

**Timeline**: 3 weeks  
**Risk**: Low  
**Confidence**: Medium  

---

### **Option 3: AGGRESSIVE (NOT RECOMMENDED for First Customer)**

❌ **Do NOT use this approach**
- Immediate full automation
- High false positive risk
- Could damage customer relationship
- Could impact their business
- Too risky for first customer

---

## 🔒 Safety Features to Implement

### **1. Read-Only Mode Flag**

Update `ilminate-email` config:

```json
{
  "customers": {
    "landseaair-nc.com": {
      "readonly_mode": true,  // ← START WITH THIS
      "monitoring_only": true,
      "no_modifications": true,
      "log_everything": true
    }
  }
}
```

### **2. Approval Queue**

All actions require approval:

```typescript
// In quarantine API
if (customer === 'landseaair-nc.com') {
  if (!adminApproved) {
    return { 
      status: 'pending_approval',
      message: 'Action requires admin approval for this customer'
    }
  }
}
```

### **3. Whitelist**

Protect critical senders:

```json
{
  "whitelist": {
    "landseaair-nc.com": {
      "domains": [
        "landseaair-nc.com",  // Their own domain
        // Add their known partners/vendors
      ],
      "emails": [
        // Add specific trusted senders
      ]
    }
  }
}
```

### **4. Emergency Disable**

Quick kill switch:

```json
{
  "emergency_disable": {
    "landseaair-nc.com": false  // Set to TRUE to immediately disable
  }
}
```

---

## 📞 Communication Plan

### **Before Integration:**

**Email to Land Sea Air IT:**
```
Subject: Ilminate APEX - Safe Onboarding Plan

Hi [LSA IT Contact],

Before integrating with your production email, we want to ensure
a completely safe onboarding process.

Our Approach:
1. Start with DMARC reporting only (zero impact on email)
2. Add read-only monitoring (zero impact)
3. Test with dedicated test account
4. Manual review of all actions
5. Gradual automation with your approval

Your Email is Safe:
- We start with READ-ONLY access
- NO automatic actions initially
- You retain full control
- Emergency disable available
- Manual approval for everything

Timeline: 2-4 weeks for full integration
First milestone: DMARC reports in 7 days

Questions? Concerns? We're here to help.

Thanks,
Chris Fisher
Ilminate Security
```

---

## ⚠️ Risk Assessment

### **Potential Issues:**

| Risk | Impact | Mitigation |
|------|--------|------------|
| False positives | HIGH | Manual review, whitelist, testing |
| Email delays | MEDIUM | Read-only mode initially |
| Detection failures | LOW | Extensive testing first |
| API rate limits | LOW | Monitor usage, implement backoff |
| Data privacy | LOW | Encryption, compliance, tenant isolation |
| Service outage | MEDIUM | Readonly mode = email still flows |

---

## 🎯 My Recommendation

### **FOR LAND SEA AIR (First Free Customer):**

**Use Option 1: ULTRA SAFE**

**Week 1: DMARC Only**
- Add DNS records
- Collect reports
- Zero risk
- Builds relationship

**Week 2: Read-Only**
- Historical analysis
- Show value
- No impact

**Week 3: Test Account**
- Validate detection
- Tune thresholds
- Build confidence

**Week 4+: Manual Actions**
- Careful rollout
- Oversight
- Trust building

---

## ✅ Pre-Integration Action Items

### **Chris (You) Must Do:**

- [ ] **Check ilminate-email service status**
  - Pull latest code
  - Run tests
  - Verify all detection engines working
  - Update dependencies

- [ ] **Verify Lambda functions deployed**
  - List functions in AWS
  - Check CloudWatch logs
  - Test function invocation

- [ ] **Test DMARC parser**
  - Send test DMARC report
  - Verify parsing works
  - Check dashboard displays correctly

- [ ] **Create safety configuration**
  - Add LSA to customer config
  - Set readonly_mode: true
  - Configure whitelist
  - Add emergency disable

- [ ] **Document rollback procedure**
  - How to disable quickly
  - How to restore emails
  - Emergency contacts

- [ ] **Prepare test dataset**
  - Legitimate emails
  - Threat samples
  - BEC scenarios (logistics fraud)

---

## 📋 Go/No-Go Checklist

**DO NOT integrate Land Sea Air until:**

- [ ] ✅ All detection engines tested and passing
- [ ] ✅ ilminate-email service up to date
- [ ] ✅ Lambda functions verified working
- [ ] ✅ DynamoDB tables ready
- [ ] ✅ DMARC parser tested
- [ ] ✅ Test dataset prepared
- [ ] ✅ Safety configuration created
- [ ] ✅ Rollback plan documented
- [ ] ✅ LSA IT team briefed on phased approach
- [ ] ✅ Emergency disable tested
- [ ] ✅ Manual approval workflow tested

**Only proceed when ALL items checked**

---

## 🚨 Emergency Procedures

### **If Something Goes Wrong:**

#### **Immediate Actions:**

1. **Disable Integration**
   ```bash
   # Update config
   {
     "landseaair-nc.com": {
       "emergency_disable": true  // IMMEDIATELY STOPS ALL ACTIONS
     }
   }
   
   # Deploy
   cd ilminate-email
   git add config/
   git commit -m "EMERGENCY: Disable LSA integration"
   git push origin main
   ```

2. **Revoke Gmail API Access**
   ```
   Google Cloud Console → LSA Project
   → IAM → Service Account
   → Disable or Delete
   
   Result: No more email access
   ```

3. **Contact Land Sea Air**
   ```
   Subject: Ilminate APEX - Service Temporarily Disabled

   We've temporarily disabled the integration to investigate [issue].
   Your email service is unaffected.
   We'll update you within [timeframe].
   ```

4. **Investigate**
   - Check CloudWatch logs
   - Review DynamoDB records
   - Identify root cause
   - Fix before re-enabling

---

## 📞 Contacts & Escalation

**Ilminate:**
- Technical Lead: Chris Fisher
- Support: support@ilminate.com
- Emergency: TBD

**Land Sea Air:**
- IT Contact: TBD (NEED THIS)
- Decision Maker: TBD (NEED THIS)
- Emergency Contact: TBD (NEED THIS)

---

## 💡 Key Takeaways

1. **Start Read-Only** - Zero risk, builds trust
2. **Test Extensively** - Use test account first
3. **Manual Oversight** - Review everything initially
4. **Gradual Automation** - Earn confidence first
5. **Emergency Plan** - Be ready to disable quickly
6. **Open Communication** - Keep LSA informed

---

## ✅ Next Steps (Immediate)

### **Before Contacting LSA IT:**

1. **Verify detection engines** (ilminate-email)
2. **Check Lambda functions** (ilminate-infrastructure)
3. **Test DMARC parser** (end-to-end)
4. **Create safety config** (readonly mode)
5. **Prepare test plan** (share with LSA)

### **With LSA IT:**

6. **Share phased approach**
7. **Get approval for DMARC-only start**
8. **Coordinate test account creation**
9. **Schedule check-ins**
10. **Establish emergency contacts**

---

**Status**: 🟡 HOLD on Gmail integration until detection engines verified  
**Priority**: Check ilminate-email service status FIRST  
**Timeline**: 4+ weeks for safe, confidence-building rollout  
**Outcome**: Successful first customer, strong foundation for growth


