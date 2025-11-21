#!/bin/bash
# Wrapper script to run check_quarantine.py with virtual environment

cd "$(dirname "$0")"

# Create venv if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install boto3 > /dev/null 2>&1
else
    source venv/bin/activate
fi

# Run the script
python3 check_quarantine.py "$@"
