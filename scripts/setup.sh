#!/bin/bash

set -e

echo "🚀 Setting up iTeck ERP..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install it first:"
    echo "npm install -g pnpm"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Copy environment file
if [ ! -f .env ]; then
    echo "📄 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your configuration"
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Start Docker services
echo "🐳 Starting Docker services..."
pnpm run docker:dev

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
sleep 5

# Run migrations
echo "🔄 Running database migrations..."
cd apps/api
pnpm prisma migrate dev --name init
pnpm prisma generate

# Seed database
echo "🌱 Seeding database..."
pnpm prisma db seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start development:"
echo "  Terminal 1: cd apps/api && pnpm dev"
echo "  Terminal 2: cd apps/web && pnpm dev"
echo ""
echo "Access points:"
echo "  - Web: http://localhost:3000"
echo "  - API: http://localhost:3001/api"
echo "  - Swagger: http://localhost:3001/api/docs"
echo ""
echo "Default admin credentials:"
echo "  Email: admin@iteck.pk"
echo "  Password: Admin@123!"
