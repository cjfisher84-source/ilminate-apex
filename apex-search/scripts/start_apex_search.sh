#!/bin/bash

echo "🚀 Starting APEX Super Fast Message Search System..."

cd "$(dirname "$0")/.."

# Start services
docker-compose -f docker/docker-compose.yml up -d

echo "⏳ Waiting for services to start..."
sleep 30

# Check if Elasticsearch is ready
echo "🔍 Checking Elasticsearch..."
until curl -s http://localhost:9200/_cluster/health > /dev/null; do
    echo "Waiting for Elasticsearch..."
    sleep 5
done

echo "✅ Elasticsearch is ready!"

# Setup index
echo "📊 Setting up APEX search index..."
curl -X POST http://localhost:5000/index/setup

# Add sample data
echo "📝 Adding sample data..."
curl -X POST http://localhost:5000/index/sample-data

echo ""
echo "🎉 APEX Search System is ready!"
echo ""
echo "📊 Services:"
echo "  • Elasticsearch: http://localhost:9200"
echo "  • Kibana: http://localhost:5601"
echo "  • Search API: http://localhost:5000"
echo ""
echo "🔍 Test search:"
echo "curl -X POST http://localhost:5000/search -H 'Content-Type: application/json' -d '{\"sender\": \"phisher\"}'"
echo ""
