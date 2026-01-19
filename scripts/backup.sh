#!/bin/bash

set -e

BACKUP_DIR="./docker/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/iteck_erp_$TIMESTAMP.sql"

mkdir -p $BACKUP_DIR

echo "📦 Creating database backup..."

docker exec iteck-erp-postgres-dev pg_dump -U postgres iteck_erp > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Backup created: $BACKUP_FILE"
    
    # Keep only last 10 backups
    cd $BACKUP_DIR
    ls -t iteck_erp_*.sql | tail -n +11 | xargs -r rm
    
    echo "🧹 Old backups cleaned up"
else
    echo "❌ Backup failed!"
    exit 1
fi
