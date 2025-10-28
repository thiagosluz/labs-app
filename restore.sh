#!/bin/bash

# Restore script for production environment
# Usage: ./restore.sh [BACKUP_FILE]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
BACKUP_FILE=${1:-""}

echo -e "${BLUE}🔄 Starting restore process...${NC}"

# Function to list available backups
list_backups() {
    echo -e "${BLUE}📋 Available backups:${NC}"
    ls -la $BACKUP_DIR/*.tar.gz 2>/dev/null || echo -e "${YELLOW}No backups found${NC}"
}

# Function to select backup file
select_backup() {
    if [ -z "$BACKUP_FILE" ]; then
        echo -e "${YELLOW}No backup file specified. Available backups:${NC}"
        list_backups
        echo -e "${YELLOW}Please specify a backup file:${NC}"
        echo -e "${YELLOW}Usage: ./restore.sh backup_20241201_143022.tar.gz${NC}"
        exit 1
    fi
    
    if [ ! -f "${BACKUP_DIR}/${BACKUP_FILE}" ]; then
        echo -e "${RED}❌ Backup file not found: ${BACKUP_DIR}/${BACKUP_FILE}${NC}"
        list_backups
        exit 1
    fi
    
    echo -e "${GREEN}✅ Using backup file: ${BACKUP_FILE}${NC}"
}

# Function to stop containers
stop_containers() {
    echo -e "${BLUE}🛑 Stopping containers...${NC}"
    docker compose -f docker compose.prod.yml down
}

# Function to extract backup
extract_backup() {
    echo -e "${BLUE}📦 Extracting backup...${NC}"
    
    cd $BACKUP_DIR
    tar -xzf "${BACKUP_FILE}"
    
    # Get the base name without extension
    BACKUP_BASE=$(basename "${BACKUP_FILE}" .tar.gz)
    
    echo -e "${GREEN}✅ Backup extracted${NC}"
    echo -e "${YELLOW}📁 Extracted files:${NC}"
    ls -la "${BACKUP_BASE}"*
    
    cd ..
}

# Function to restore database
restore_database() {
    echo -e "${BLUE}🗄️  Restoring database...${NC}"
    
    # Start only postgres first
    docker compose -f docker compose.prod.yml up -d postgres
    
    # Wait for postgres to be ready
    echo -e "${YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
    sleep 10
    
    # Drop and recreate database
    docker compose -f docker compose.prod.yml exec -T postgres psql -U labs_user -c "DROP DATABASE IF EXISTS labs_app;"
    docker compose -f docker compose.prod.yml exec -T postgres psql -U labs_user -c "CREATE DATABASE labs_app;"
    
    # Restore database
    docker compose -f docker compose.prod.yml exec -T postgres psql -U labs_user -d labs_app < "${BACKUP_DIR}/${BACKUP_BASE}.sql"
    
    echo -e "${GREEN}✅ Database restored${NC}"
}

# Function to restore storage files
restore_storage() {
    echo -e "${BLUE}📁 Restoring storage files...${NC}"
    
    # Start backend container
    docker compose -f docker compose.prod.yml up -d backend
    
    # Wait for backend to be ready
    echo -e "${YELLOW}⏳ Waiting for backend to be ready...${NC}"
    sleep 10
    
    # Copy storage files
    docker cp "${BACKUP_DIR}/${BACKUP_BASE}_storage" labs-backend-prod:/var/www/storage_restored
    docker compose -f docker compose.prod.yml exec backend bash -c "rm -rf /var/www/storage && mv /var/www/storage_restored /var/www/storage"
    
    # Set proper permissions
    docker compose -f docker compose.prod.yml exec backend chown -R www-data:www-data /var/www/storage
    docker compose -f docker compose.prod.yml exec backend chmod -R 775 /var/www/storage
    
    echo -e "${GREEN}✅ Storage files restored${NC}"
}

# Function to start all containers
start_containers() {
    echo -e "${BLUE}🚀 Starting all containers...${NC}"
    docker compose -f docker compose.prod.yml up -d
    
    echo -e "${GREEN}✅ All containers started${NC}"
}

# Function to verify restore
verify_restore() {
    echo -e "${BLUE}🔍 Verifying restore...${NC}"
    
    # Wait for services to be ready
    sleep 15
    
    # Check database
    USER_COUNT=$(docker compose -f docker compose.prod.yml exec -T backend php artisan tinker --execute="echo App\Models\User::count();" 2>/dev/null || echo "0")
    echo -e "${YELLOW}👥 Users in database: ${USER_COUNT}${NC}"
    
    # Check if API is responding
    if curl -f http://localhost/api/v1/dashboard > /dev/null 2>&1; then
        echo -e "${GREEN}✅ API is responding${NC}"
    else
        echo -e "${RED}❌ API is not responding${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Restore verification completed${NC}"
}

# Function to cleanup
cleanup() {
    echo -e "${BLUE}🧹 Cleaning up extracted files...${NC}"
    
    cd $BACKUP_DIR
    rm -rf "${BACKUP_BASE}.sql" "${BACKUP_BASE}_storage"
    cd ..
    
    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Function to show restore info
show_restore_info() {
    echo -e "${BLUE}📊 Restore Information:${NC}"
    echo -e "${GREEN}================================${NC}"
    echo -e "${GREEN}📁 Restored from: ${BACKUP_FILE}${NC}"
    echo -e "${YELLOW}📅 Restored at: $(date)${NC}"
    echo -e "${GREEN}================================${NC}"
    
    echo -e "${BLUE}📋 Container Status:${NC}"
    docker compose -f docker compose.prod.yml ps
}

# Main restore process
main() {
    echo -e "${BLUE}🚀 Starting restore process...${NC}"
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
        exit 1
    fi
    
    # Check if docker compose.prod.yml exists
    if [ ! -f "docker compose.prod.yml" ]; then
        echo -e "${RED}❌ docker compose.prod.yml not found. Please run this script from the project root.${NC}"
        exit 1
    fi
    
    # Run restore steps
    select_backup
    stop_containers
    extract_backup
    restore_database
    restore_storage
    start_containers
    verify_restore
    cleanup
    show_restore_info
    
    echo -e "${GREEN}🎉 Restore completed successfully!${NC}"
}

# Run main function
main "$@"
