#!/bin/bash

echo "🔧 Restarting iTeck ERP API..."

# Stop any running processes
echo "⏹️  Stopping any running instances..."
pkill -f "node.*dist.*main"

sleep 1

echo "🔨 Rebuilding..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "🚀 Starting backend..."
    npm run dev
else
    echo ""
    echo "❌ Build failed!"
    exit 1
fi
