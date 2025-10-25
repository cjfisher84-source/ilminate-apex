#!/bin/bash

echo "🧪 Testing APEX Search System..."

# Wait for API to start
sleep 3

# Test health endpoint
echo "🔍 Testing health endpoint..."
curl -s http://localhost:5000/health | python3 -m json.tool

echo ""
echo "📝 Adding sample data..."
curl -s -X POST http://localhost:5000/sample-data | python3 -m json.tool

echo ""
echo "🔍 Testing search by sender..."
curl -s -X POST http://localhost:5000/search \
  -H "Content-Type: application/json" \
  -d '{"sender_email": "phisher"}' | python3 -m json.tool

echo ""
echo "🔍 Testing search by threat category..."
curl -s -X POST http://localhost:5000/search \
  -H "Content-Type: application/json" \
  -d '{"threat_category": "phishing"}' | python3 -m json.tool

echo ""
echo "📊 Getting statistics..."
curl -s http://localhost:5000/stats | python3 -m json.tool
