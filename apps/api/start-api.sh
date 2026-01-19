#!/bin/bash

echo "🚀 Starting iTeck ERP API..."
echo ""

# Navigate to API directory
cd "$(dirname "$0")"

# Run the API
NODE_ENV=development node dist/apps/api/src/main.js

# If it fails, show helpful message
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Failed to start. Run 'npm run build' first!"
fi
