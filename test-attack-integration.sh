#!/usr/bin/env bash
#
# MITRE ATT&CK Integration - Quick Test Script
# Run this after starting the dev server (npm run dev)
#

set -e

echo "🧪 Testing MITRE ATT&CK Integration..."
echo ""

BASE_URL="${BASE_URL:-http://localhost:3000}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

test_passed=0
test_failed=0

# Test function
test_api() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expect_status="${5:-200}"
    
    echo -n "Testing: $name ... "
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}${endpoint}" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" "${BASE_URL}${endpoint}")
    fi
    
    body=$(echo "$response" | head -n -1)
    status=$(echo "$response" | tail -n 1)
    
    if [ "$status" = "$expect_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $status)"
        test_passed=$((test_passed + 1))
        if [ "$method" = "POST" ] && [ -n "$body" ]; then
            echo "   Response: $(echo "$body" | jq -c '.' 2>/dev/null || echo "$body" | head -c 100)"
        fi
    else
        echo -e "${RED}✗ FAIL${NC} (Expected $expect_status, got $status)"
        test_failed=$((test_failed + 1))
        echo "   Response: $(echo "$body" | head -c 200)"
    fi
    echo ""
}

# Test 1: Layer API (should work without Lambda)
test_api "Layer API - Default" "GET" "/api/attack/layer"

# Test 2: Layer API with params
test_api "Layer API - With Params" "GET" "/api/attack/layer?tenant=demo&days=30"

# Test 3: Mapper API - Will fail if ATTACK_MAPPER_URL not configured (expected)
echo -n "Testing: Mapper API (may fail if Lambda not deployed) ... "
response=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/api/attack/map" \
    -H "Content-Type: application/json" \
    -d '{"text": "Phishing test"}')
body=$(echo "$response" | head -n -1)
status=$(echo "$response" | tail -n 1)

if [ "$status" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} - Lambda is configured and working!"
    test_passed=$((test_passed + 1))
    echo "   Detected techniques: $(echo "$body" | jq -r '.techniques[].id' 2>/dev/null | tr '\n' ' ')"
elif echo "$body" | grep -q "ATTACK_MAPPER_URL not configured"; then
    echo -e "${YELLOW}⚠ SKIP${NC} - Lambda not deployed yet (expected for local testing)"
else
    echo -e "${RED}✗ FAIL${NC} - Unexpected error"
    test_failed=$((test_failed + 1))
    echo "   Response: $(echo "$body" | head -c 200)"
fi
echo ""

# Test 4-7: Detection Rules (only if Lambda is configured)
if [ "$status" = "200" ]; then
    echo "🔍 Testing Detection Rules..."
    echo ""
    
    test_api "Rule: Phishing Detection" "POST" "/api/attack/map" \
        '{"text": "Fake login credential harvest"}'
    
    test_api "Rule: PowerShell Execution" "POST" "/api/attack/map" \
        '{"text": "powershell -EncodedCommand ABC123"}'
    
    test_api "Rule: Credential Dumping" "POST" "/api/attack/map" \
        '{"text": "mimikatz sekurlsa lsass.dmp"}'
    
    test_api "Rule: Multiple Techniques" "POST" "/api/attack/map" \
        '{"text": "Phishing email with .docm attachment running powershell -enc"}'
fi

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "✅ Passed: ${GREEN}${test_passed}${NC}"
echo -e "❌ Failed: ${RED}${test_failed}${NC}"
echo ""

if [ $test_failed -eq 0 ]; then
    echo -e "${GREEN}✨ All tests passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Visit ${BASE_URL}/reports/attack to see the UI"
    echo "2. If Lambda not deployed, follow ATTACK_QUICKSTART.md"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed${NC}"
    echo "Check the errors above and ensure:"
    echo "1. Dev server is running (npm run dev)"
    echo "2. BASE_URL is correct (default: http://localhost:3000)"
    exit 1
fi

