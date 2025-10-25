#!/bin/bash

echo "🚀 Starting APEX Super Fast Message Search System..."

cd "$(dirname "$0")/../api"

# Start the API server
echo "🌐 Starting API server on http://localhost:5000"
python3 app.py
