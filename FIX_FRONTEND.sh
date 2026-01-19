#!/bin/bash
# Quick fix for broken frontend CSS

echo "🔧 Fixing frontend..."

# Go to web directory
cd /home/iteck/Dev_Projects/fin_teck/apps/web

# Stop any running next processes
pkill -f "next dev" 2>/dev/null

# Clear corrupted cache
echo "🗑️ Clearing Next.js cache..."
rm -rf .next

# Restart
echo "🚀 Starting frontend..."
npm run dev
