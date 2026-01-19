#!/bin/bash

set -e

cd apps/api

echo "🌱 Seeding database..."
pnpm prisma db seed

echo "✅ Seed complete!"
