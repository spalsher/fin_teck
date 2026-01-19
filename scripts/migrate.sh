#!/bin/bash

set -e

cd apps/api

if [ "$1" == "create" ]; then
    if [ -z "$2" ]; then
        echo "Usage: ./scripts/migrate.sh create <migration-name>"
        exit 1
    fi
    echo "Creating migration: $2"
    pnpm prisma migrate dev --name $2
elif [ "$1" == "deploy" ]; then
    echo "Deploying migrations..."
    pnpm prisma migrate deploy
else
    echo "Running migrations..."
    pnpm prisma migrate dev
fi

echo "Generating Prisma Client..."
pnpm prisma generate

echo "✅ Migration complete!"
