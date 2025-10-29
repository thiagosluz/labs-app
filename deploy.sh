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
    sed -i "s|APP_URL=http://localhost|APP_URL=http://${SERVER_IP}|g" backend/.env.production
    sed -i "s|NEXT_PUBLIC_API_URL=http://localhost|NEXT_PUBLIC_API_URL=http://${SERVER_IP}|g" frontend/.env.production
    sed -i "s|NEXT_PUBLIC_APP_URL=http://localhost|NEXT_PUBLIC_APP_URL=http://${SERVER_IP}|g" frontend/.env.production
    
    # Update Sanctum domains (add server IP if not already present)
    if ! grep -q "${SERVER_IP}" backend/.env.production 2>/dev/null; then
        sed -i "s|SANCTUM_STATEFUL_DOMAINS=.*|SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1,${SERVER_IP}|g" backend/.env.production
    fi
    
    # Remove SESSION_DOMAIN or set to empty for IP-based access
    sed -i "s|^SESSION_DOMAIN=.*|# SESSION_DOMAIN removed for IP-based access|g" backend/.env.production
    
    # Add session configuration for IPs
    if ! grep -q "SESSION_SECURE_COOKIE" backend/.env.production 2>/dev/null; then
        echo "" >> backend/.env.production
        echo "# Session configuration for IP-based access" >> backend/.env.production
        echo "SESSION_SECURE_COOKIE=false" >> backend/.env.production
        echo "SESSION_SAME_SITE=lax" >> backend/.env.production
    fi
    
    # Add FRONTEND_URL if not exists (for QR codes and public URLs)
    if ! grep -q "FRONTEND_URL" backend/.env.production 2>/dev/null; then
        echo "" >> backend/.env.production
        echo "# Frontend URL (for public links and QR codes)" >> backend/.env.production
        echo "FRONTEND_URL=http://${SERVER_IP}" >> backend/.env.production
    else
        # Update existing FRONTEND_URL
        sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=http://${SERVER_IP}|g" backend/.env.production
    fi
    
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
    
    # Create storage symlink
    echo -e "${BLUE}🔗 Creating storage symlink...${NC}"
    docker compose -f docker-compose.prod.yml exec backend php artisan storage:link || echo -e "${YELLOW}⚠️  Storage link may already exist${NC}"
    
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
    # Use a public endpoint or health check endpoint instead of protected route
    if curl -f http://${SERVER_IP}/up > /dev/null 2>&1; then
        echo -e "${GREEN}✅ API is responding${NC}"
    elif curl -f http://${SERVER_IP}/api/v1/public/equipamentos/1 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ API is responding (via public endpoint)${NC}"
    else
        echo -e "${YELLOW}⚠️  API health check skipped (requires authentication)${NC}"
        # Check if backend container is running instead
        if docker compose -f docker-compose.prod.yml ps backend | grep -q "Up"; then
            echo -e "${GREEN}✅ Backend container is running${NC}"
        else
            echo -e "${RED}❌ Backend container is not running${NC}"
            return 1
        fi
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
    run_migrations
    seed_database
    optimize_application
    check_health
    show_status
    
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
}

# Run main function
main "$@"
