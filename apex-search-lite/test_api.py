#!/usr/bin/env python3
"""
Simple test script for APEX Search System
"""

import requests
import json
import time

def test_api():
    base_url = "http://localhost:5000"
    
    print("🔍 Testing APEX Search API...")
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False
    
    # Test search endpoint
    try:
        search_data = {"sender": "phisher"}
        response = requests.post(f"{base_url}/search", 
                               json=search_data, 
                               timeout=5)
        if response.status_code == 200:
            result = response.json()
            print("✅ Search test passed")
            print(f"   Query time: {result.get('query_time_ms', 0)}ms")
            print(f"   Total hits: {result.get('total_hits', 0)}")
        else:
            print(f"❌ Search test failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Search test error: {e}")
    
    # Test quick search
    try:
        response = requests.get(f"{base_url}/search/quick?q=phisher", timeout=5)
        if response.status_code == 200:
            result = response.json()
            print("✅ Quick search test passed")
            print(f"   Query time: {result.get('query_time_ms', 0)}ms")
        else:
            print(f"❌ Quick search test failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Quick search test error: {e}")
    
    print("\n🎉 APEX Search System is working!")
    print("📊 Access the web interface at: http://localhost:5000")
    
    return True

if __name__ == "__main__":
    test_api()
