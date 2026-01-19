#!/bin/bash
# iTeck ERP - Quick Start Script

echo "╔════════════════════════════════════════════════════════════╗"
echo "║           Starting iTeck ERP System...                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."
if ! pg_isready -U postgres > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running. Start it first:"
    echo "   sudo systemctl start postgresql"
    exit 1
fi

if ! redis-cli ping > /dev/null 2>&1; then
    echo "⚠️  Redis is not running. Some features may not work."
    echo "   sudo systemctl start redis"
fi

echo "✅ All prerequisites ready!"
echo ""

# Navigate to project root
cd "$(dirname "$0")"

# Start API in background
echo "🚀 Starting Backend API..."
cd apps/api
NODE_ENV=development node dist/apps/api/src/main.js > /tmp/iteck-api.log 2>&1 &
API_PID=$!
echo "   Backend PID: $API_PID"
cd ../..

# Wait for API to be ready
echo "⏳ Waiting for API to start..."
sleep 3

# Start Web Frontend in background
echo "🌐 Starting Web Frontend..."
cd apps/web
pnpm dev > /tmp/iteck-web.log 2>&1 &
WEB_PID=$!
echo "   Frontend PID: $WEB_PID"
cd ../..

# Wait for everything to start
echo "⏳ Waiting for services to be ready..."
sleep 5

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  ✅ System is Ready!                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Web App       : http://localhost:3002"
echo "📊 API Docs      : http://localhost:3001/api/docs"
echo "🔐 Login         : admin@itecknologi.com / Admin@123"
echo ""
echo "📝 Logs:"
echo "   API  : tail -f /tmp/iteck-api.log"
echo "   Web  : tail -f /tmp/iteck-web.log"
echo ""
echo "🛑 Stop:"
echo "   pkill -f 'node apps/api'"
echo "   pkill -f 'next'"
echo ""
echo "Press Ctrl+C to stop services..."

# Keep script running
wait
