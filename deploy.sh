#!/bin/bash

# Deploy script for production environment
# Usage: ./deploy.sh [SERVER_IP]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_IP=${1:-"localhost"}
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo -e "${BLUE}🚀 Starting production deployment...${NC}"
echo -e "${YELLOW}Server IP: ${SERVER_IP}${NC}"

# Create backup directory
mkdir -p $BACKUP_DIR

# Function to check if containers are running
check_containers() {
    echo -e "${BLUE}📋 Checking container status...${NC}"
    docker compose -f docker-compose.prod.yml ps
}

# Function to backup database
backup_database() {
    echo -e "${BLUE}💾 Creating database backup...${NC}"
    if docker compose -f docker-compose.prod.yml ps postgres | grep -q "Up"; then
        docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U labs_user labs_app > "${BACKUP_DIR}/backup_${TIMESTAMP}.sql"
        echo -e "${GREEN}✅ Database backup created: backup_${TIMESTAMP}.sql${NC}"
    else
        echo -e "${YELLOW}⚠️  PostgreSQL container not running, skipping backup${NC}"
    fi
}

# Function to stop old containers
stop_containers() {
    echo -e "${BLUE}🛑 Stopping old containers...${NC}"
    docker compose -f docker-compose.prod.yml down
}

# Function to build and start containers
start_containers() {
    echo -e "${BLUE}🔨 Building and starting containers...${NC}"
    
    # Update environment files with server IP
    sed -i "s/localhost/${SERVER_IP}/g" backend/.env.production
    sed -i "s/localhost/${SERVER_IP}/g" frontend/.env.production
    
    # Build and start
    docker compose -f docker-compose.prod.yml up -d --build
    
    echo -e "${GREEN}✅ Containers started successfully${NC}"
}

# Function to run migrations
run_migrations() {
    echo -e "${BLUE}🗄️  Running database migrations...${NC}"
    
    # Wait for database to be ready
    echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
    sleep 10
    
    # Run migrations
    docker compose -f docker-compose.prod.yml exec backend php artisan migrate --force
    
    echo -e "${GREEN}✅ Migrations completed${NC}"
}

# Function to seed database (only if empty)
seed_database() {
    echo -e "${BLUE}🌱 Checking if database needs seeding...${NC}"
    
    # Check if users table is empty
    USER_COUNT=$(docker compose -f docker-compose.prod.yml exec -T backend php artisan tinker --execute="echo App\Models\User::count();" 2>/dev/null || echo "0")
    
    if [ "$USER_COUNT" -eq "0" ]; then
        echo -e "${YELLOW}📊 Database is empty, running seeders...${NC}"
        docker compose -f docker-compose.prod.yml exec backend php artisan db:seed --force
        echo -e "${GREEN}✅ Database seeded successfully${NC}"
    else
        echo -e "${GREEN}✅ Database already has data, skipping seeding${NC}"
    fi
}

# Function to generate application key
generate_app_key() {
    echo -e "${BLUE}🔑 Generating application key...${NC}"
    docker compose -f docker-compose.prod.yml exec backend php artisan key:generate --force
    echo -e "${GREEN}✅ Application key generated${NC}"
}

# Function to optimize application
optimize_application() {
    echo -e "${BLUE}⚡ Optimizing application...${NC}"
    docker compose -f docker-compose.prod.yml exec backend php artisan config:cache
    docker compose -f docker-compose.prod.yml exec backend php artisan route:cache
    echo -e "${GREEN}✅ Application optimized${NC}"
}

# Function to check health
check_health() {
    echo -e "${BLUE}🏥 Checking application health...${NC}"
    
    # Wait for services to be ready
    sleep 15
    
    # Check if nginx is responding
    if curl -f http://${SERVER_IP}/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Nginx is responding${NC}"
    else
        echo -e "${RED}❌ Nginx is not responding${NC}"
        return 1
    fi
    
    # Check if API is responding
    if curl -f http://${SERVER_IP}/api/v1/dashboard > /dev/null 2>&1; then
        echo -e "${GREEN}✅ API is responding${NC}"
    else
        echo -e "${RED}❌ API is not responding${NC}"
        return 1
    fi
}

# Function to display final status
show_status() {
    echo -e "${BLUE}📊 Final Status:${NC}"
    echo -e "${GREEN}================================${NC}"
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${YELLOW}📱 Access the application at: http://${SERVER_IP}${NC}"
    echo -e "${YELLOW}🔧 API endpoint: http://${SERVER_IP}/api/v1${NC}"
    echo -e "${YELLOW}📋 Health check: http://${SERVER_IP}/health${NC}"
    echo -e "${GREEN}================================${NC}"
    
    echo -e "${BLUE}📋 Container Status:${NC}"
    docker compose -f docker-compose.prod.yml ps
    
    echo -e "${BLUE}💾 Backup Location: ${BACKUP_DIR}/${NC}"
    ls -la ${BACKUP_DIR}/
}

# Main deployment process
main() {
    echo -e "${BLUE}🚀 Starting deployment process...${NC}"
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
        exit 1
    fi
    
    # Check if docker compose.prod.yml exists
    if [ ! -f "docker-compose.prod.yml" ]; then
        echo -e "${RED}❌ docker-compose.prod.yml not found. Please run this script from the project root.${NC}"
        exit 1
    fi
    
    # Run deployment steps
    backup_database
    stop_containers
    start_containers
    generate_app_key
    run_migrations
    seed_database
    optimize_application
    check_health
    show_status
    
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
}

# Run main function
main "$@"
