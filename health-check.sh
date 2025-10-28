#!/bin/bash

# Health check script for production environment
# Usage: ./health-check.sh [SERVER_IP]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_IP=${1:-"localhost"}
HEALTH_STATUS="HEALTHY"
ISSUES=()

echo -e "${BLUE}🏥 Starting health check...${NC}"
echo -e "${YELLOW}Server IP: ${SERVER_IP}${NC}"

# Function to check Docker status
check_docker() {
    echo -e "${BLUE}🐳 Checking Docker status...${NC}"
    
    if docker info > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Docker is running${NC}"
    else
        echo -e "${RED}❌ Docker is not running${NC}"
        HEALTH_STATUS="UNHEALTHY"
        ISSUES+=("Docker not running")
    fi
}

# Function to check container status
check_containers() {
    echo -e "${BLUE}📋 Checking container status...${NC}"
    
    if [ ! -f "docker compose.prod.yml" ]; then
        echo -e "${RED}❌ docker compose.prod.yml not found${NC}"
        HEALTH_STATUS="UNHEALTHY"
        ISSUES+=("docker compose.prod.yml not found")
        return
    fi
    
    # Get container status
    CONTAINERS=$(docker compose -f docker compose.prod.yml ps --format "table {{.Name}}\t{{.State}}")
    
    echo -e "${YELLOW}Container Status:${NC}"
    echo "$CONTAINERS"
    
    # Check if all containers are running
    STOPPED_CONTAINERS=$(docker compose -f docker compose.prod.yml ps --format "{{.Name}}\t{{.State}}" | grep -v "Up" | wc -l)
    
    if [ "$STOPPED_CONTAINERS" -gt 0 ]; then
        echo -e "${RED}❌ Some containers are not running${NC}"
        HEALTH_STATUS="UNHEALTHY"
        ISSUES+=("Some containers are not running")
    else
        echo -e "${GREEN}✅ All containers are running${NC}"
    fi
}

# Function to check database connectivity
check_database() {
    echo -e "${BLUE}🗄️  Checking database connectivity...${NC}"
    
    if docker compose -f docker compose.prod.yml ps postgres | grep -q "Up"; then
        # Test database connection
        if docker compose -f docker compose.prod.yml exec -T postgres pg_isready -U labs_user -d labs_app > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Database is accessible${NC}"
            
            # Check database size
            DB_SIZE=$(docker compose -f docker compose.prod.yml exec -T postgres psql -U labs_user -d labs_app -t -c "SELECT pg_size_pretty(pg_database_size('labs_app'));" 2>/dev/null | xargs)
            echo -e "${YELLOW}📊 Database size: ${DB_SIZE}${NC}"
        else
            echo -e "${RED}❌ Database is not accessible${NC}"
            HEALTH_STATUS="UNHEALTHY"
            ISSUES+=("Database not accessible")
        fi
    else
        echo -e "${RED}❌ PostgreSQL container is not running${NC}"
        HEALTH_STATUS="UNHEALTHY"
        ISSUES+=("PostgreSQL container not running")
    fi
}

# Function to check API endpoints
check_api() {
    echo -e "${BLUE}🔌 Checking API endpoints...${NC}"
    
    # Check health endpoint
    if curl -f -s "http://${SERVER_IP}/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Health endpoint is responding${NC}"
    else
        echo -e "${RED}❌ Health endpoint is not responding${NC}"
        HEALTH_STATUS="UNHEALTHY"
        ISSUES+=("Health endpoint not responding")
    fi
    
    # Check API dashboard endpoint
    if curl -f -s "http://${SERVER_IP}/api/v1/dashboard" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ API dashboard endpoint is responding${NC}"
    else
        echo -e "${RED}❌ API dashboard endpoint is not responding${NC}"
        HEALTH_STATUS="UNHEALTHY"
        ISSUES+=("API dashboard endpoint not responding")
    fi
    
    # Check frontend
    if curl -f -s "http://${SERVER_IP}/" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is responding${NC}"
    else
        echo -e "${RED}❌ Frontend is not responding${NC}"
        HEALTH_STATUS="UNHEALTHY"
        ISSUES+=("Frontend not responding")
    fi
}

# Function to check disk space
check_disk_space() {
    echo -e "${BLUE}💾 Checking disk space...${NC}"
    
    DISK_USAGE=$(df -h . | tail -1 | awk '{print $5}' | sed 's/%//')
    DISK_AVAILABLE=$(df -h . | tail -1 | awk '{print $4}')
    
    echo -e "${YELLOW}📊 Disk usage: ${DISK_USAGE}%${NC}"
    echo -e "${YELLOW}💽 Available space: ${DISK_AVAILABLE}${NC}"
    
    if [ "$DISK_USAGE" -gt 90 ]; then
        echo -e "${RED}❌ Disk usage is critical (>90%)${NC}"
        HEALTH_STATUS="UNHEALTHY"
        ISSUES+=("Disk usage critical")
    elif [ "$DISK_USAGE" -gt 80 ]; then
        echo -e "${YELLOW}⚠️  Disk usage is high (>80%)${NC}"
    else
        echo -e "${GREEN}✅ Disk space is adequate${NC}"
    fi
}

# Function to check memory usage
check_memory() {
    echo -e "${BLUE}🧠 Checking memory usage...${NC}"
    
    if command -v free > /dev/null 2>&1; then
        MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
        MEMORY_AVAILABLE=$(free -h | grep Mem | awk '{print $7}')
        
        echo -e "${YELLOW}📊 Memory usage: ${MEMORY_USAGE}%${NC}"
        echo -e "${YELLOW}🧠 Available memory: ${MEMORY_AVAILABLE}${NC}"
        
        if [ "$MEMORY_USAGE" -gt 90 ]; then
            echo -e "${RED}❌ Memory usage is critical (>90%)${NC}"
            HEALTH_STATUS="UNHEALTHY"
            ISSUES+=("Memory usage critical")
        elif [ "$MEMORY_USAGE" -gt 80 ]; then
            echo -e "${YELLOW}⚠️  Memory usage is high (>80%)${NC}"
        else
            echo -e "${GREEN}✅ Memory usage is adequate${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Memory check not available on this system${NC}"
    fi
}

# Function to check logs for errors
check_logs() {
    echo -e "${BLUE}📝 Checking recent logs for errors...${NC}"
    
    # Check for errors in the last 100 lines of each container log
    for container in $(docker compose -f docker compose.prod.yml ps --format "{{.Name}}"); do
        echo -e "${YELLOW}🔍 Checking ${container} logs...${NC}"
        
        ERROR_COUNT=$(docker logs --tail 100 "${container}" 2>&1 | grep -i "error\|exception\|fatal" | wc -l)
        
        if [ "$ERROR_COUNT" -gt 0 ]; then
            echo -e "${YELLOW}⚠️  Found ${ERROR_COUNT} potential errors in ${container}${NC}"
        else
            echo -e "${GREEN}✅ No recent errors in ${container}${NC}"
        fi
    done
}

# Function to show final health report
show_health_report() {
    echo -e "${BLUE}📊 Health Check Report${NC}"
    echo -e "${GREEN}================================${NC}"
    
    if [ "$HEALTH_STATUS" = "HEALTHY" ]; then
        echo -e "${GREEN}🎉 System Status: HEALTHY${NC}"
    else
        echo -e "${RED}❌ System Status: UNHEALTHY${NC}"
        echo -e "${RED}Issues found:${NC}"
        for issue in "${ISSUES[@]}"; do
            echo -e "${RED}  - ${issue}${NC}"
        done
    fi
    
    echo -e "${GREEN}================================${NC}"
    echo -e "${YELLOW}📱 Application URL: http://${SERVER_IP}${NC}"
    echo -e "${YELLOW}🔧 API URL: http://${SERVER_IP}/api/v1${NC}"
    echo -e "${YELLOW}📋 Health Check: http://${SERVER_IP}/health${NC}"
    echo -e "${GREEN}================================${NC}"
}

# Main health check process
main() {
    echo -e "${BLUE}🚀 Starting health check process...${NC}"
    
    check_docker
    check_containers
    check_database
    check_api
    check_disk_space
    check_memory
    check_logs
    show_health_report
    
    if [ "$HEALTH_STATUS" = "HEALTHY" ]; then
        echo -e "${GREEN}🎉 All health checks passed!${NC}"
        exit 0
    else
        echo -e "${RED}❌ Health check failed!${NC}"
        exit 1
    fi
}

# Run main function
main "$@"
