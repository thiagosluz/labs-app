#!/bin/bash

# Backup script for production environment
# Usage: ./backup.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="backup_${TIMESTAMP}"

echo -e "${BLUE}💾 Starting backup process...${NC}"

# Create backup directory
mkdir -p $BACKUP_DIR

# Function to backup database
backup_database() {
    echo -e "${BLUE}🗄️  Backing up database...${NC}"
    
    if docker-compose -f docker-compose.prod.yml ps postgres | grep -q "Up"; then
        docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U labs_user labs_app > "${BACKUP_DIR}/${BACKUP_NAME}.sql"
        echo -e "${GREEN}✅ Database backup created: ${BACKUP_NAME}.sql${NC}"
    else
        echo -e "${RED}❌ PostgreSQL container not running${NC}"
        exit 1
    fi
}

# Function to backup storage files
backup_storage() {
    echo -e "${BLUE}📁 Backing up storage files...${NC}"
    
    if docker-compose -f docker-compose.prod.yml ps backend | grep -q "Up"; then
        docker cp labs-backend-prod:/var/www/storage "${BACKUP_DIR}/${BACKUP_NAME}_storage"
        echo -e "${GREEN}✅ Storage backup created: ${BACKUP_NAME}_storage${NC}"
    else
        echo -e "${RED}❌ Backend container not running${NC}"
        exit 1
    fi
}

# Function to create compressed archive
create_archive() {
    echo -e "${BLUE}📦 Creating compressed archive...${NC}"
    
    cd $BACKUP_DIR
    tar -czf "${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}.sql" "${BACKUP_NAME}_storage"
    rm -rf "${BACKUP_NAME}.sql" "${BACKUP_NAME}_storage"
    cd ..
    
    echo -e "${GREEN}✅ Compressed archive created: ${BACKUP_NAME}.tar.gz${NC}"
}

# Function to cleanup old backups
cleanup_old_backups() {
    echo -e "${BLUE}🧹 Cleaning up old backups (keeping last 7 days)...${NC}"
    
    find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete
    
    echo -e "${GREEN}✅ Old backups cleaned up${NC}"
}

# Function to show backup info
show_backup_info() {
    echo -e "${BLUE}📊 Backup Information:${NC}"
    echo -e "${GREEN}================================${NC}"
    echo -e "${GREEN}📁 Backup file: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz${NC}"
    echo -e "${YELLOW}📅 Created: $(date)${NC}"
    echo -e "${YELLOW}💾 Size: $(du -h ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz | cut -f1)${NC}"
    echo -e "${GREEN}================================${NC}"
    
    echo -e "${BLUE}📋 All backups:${NC}"
    ls -la $BACKUP_DIR/
}

# Main backup process
main() {
    echo -e "${BLUE}🚀 Starting backup process...${NC}"
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
        exit 1
    fi
    
    # Check if docker-compose.prod.yml exists
    if [ ! -f "docker-compose.prod.yml" ]; then
        echo -e "${RED}❌ docker-compose.prod.yml not found. Please run this script from the project root.${NC}"
        exit 1
    fi
    
    # Run backup steps
    backup_database
    backup_storage
    create_archive
    cleanup_old_backups
    show_backup_info
    
    echo -e "${GREEN}🎉 Backup completed successfully!${NC}"
}

# Run main function
main "$@"
