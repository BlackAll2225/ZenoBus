#!/bin/bash

# ZentroBus Backup Script
BACKUP_DIR="/opt/backups/zentrobus"
DATE=$(date +%Y%m%d_%H%M%S)
DB_PASSWORD="YourStrongPassword123!"

echo "💾 Starting ZentroBus backup..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
echo "📊 Backing up database..."
docker exec zentrobus-db /opt/mssql-tools/bin/sqlcmd \
    -S localhost -U sa -P $DB_PASSWORD \
    -Q "BACKUP DATABASE [ZentroBus] TO DISK = N'/tmp/zentrobus_${DATE}.bak' WITH NOFORMAT, NOINIT, NAME = 'ZentroBus-Full Database Backup', SKIP, NOREWIND, NOUNLOAD, STATS = 10"

# Copy backup file from container
docker cp zentrobus-db:/tmp/zentrobus_${DATE}.bak $BACKUP_DIR/

# Remove backup file from container
docker exec zentrobus-db rm /tmp/zentrobus_${DATE}.bak

# Backup docker volumes
echo "📁 Backing up volumes..."
docker run --rm -v zentrobus_db_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/volumes_${DATE}.tar.gz -C /data .

# Backup configuration files
echo "⚙️ Backing up configuration..."
tar czf $BACKUP_DIR/config_${DATE}.tar.gz docker-compose.yml nginx/ BE/.env* FE/.env*

# Clean old backups (keep last 7 days)
echo "🧹 Cleaning old backups..."
find $BACKUP_DIR -type f -mtime +7 -delete

# Show backup info
echo "✅ Backup completed!"
echo "📁 Backup location: $BACKUP_DIR"
echo "📊 Backup files:"
ls -lh $BACKUP_DIR/zentrobus_${DATE}.bak
ls -lh $BACKUP_DIR/volumes_${DATE}.tar.gz
ls -lh $BACKUP_DIR/config_${DATE}.tar.gz

echo ""
echo "💡 To restore database:"
echo "docker exec -i zentrobus-db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P $DB_PASSWORD -Q \"RESTORE DATABASE [ZentroBus] FROM DISK = N'/tmp/backup.bak' WITH REPLACE\"" 