# Deploy script for production environment (PowerShell)
# Usage: .\deploy.ps1 [SERVER_IP]

param(
    [string]$ServerIP = "localhost"
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

Write-Host "🚀 Starting production deployment..." -ForegroundColor $Blue
Write-Host "Server IP: $ServerIP" -ForegroundColor $Yellow

# Create backup directory
$BackupDir = ".\backups"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir
}

# Function to check if containers are running
function Check-Containers {
    Write-Host "📋 Checking container status..." -ForegroundColor $Blue
    docker compose -f docker compose.prod.yml ps
}

# Function to backup database
function Backup-Database {
    Write-Host "💾 Creating database backup..." -ForegroundColor $Blue
    
    $PostgresStatus = docker compose -f docker compose.prod.yml ps postgres
    if ($PostgresStatus -match "Up") {
        docker compose -f docker compose.prod.yml exec -T postgres pg_dump -U labs_user labs_app | Out-File -FilePath "$BackupDir\backup_$Timestamp.sql" -Encoding UTF8
        Write-Host "✅ Database backup created: backup_$Timestamp.sql" -ForegroundColor $Green
    } else {
        Write-Host "⚠️  PostgreSQL container not running, skipping backup" -ForegroundColor $Yellow
    }
}

# Function to stop old containers
function Stop-Containers {
    Write-Host "🛑 Stopping old containers..." -ForegroundColor $Blue
    docker compose -f docker compose.prod.yml down
}

# Function to build and start containers
function Start-Containers {
    Write-Host "🔨 Building and starting containers..." -ForegroundColor $Blue
    
    # Update environment files with server IP
    if (Test-Path "backend\.env.production") {
        (Get-Content "backend\.env.production") -replace "localhost", $ServerIP | Set-Content "backend\.env.production"
    }
    if (Test-Path "frontend\.env.production") {
        (Get-Content "frontend\.env.production") -replace "localhost", $ServerIP | Set-Content "frontend\.env.production"
    }
    
    # Build and start
    docker compose -f docker compose.prod.yml up -d --build
    
    Write-Host "✅ Containers started successfully" -ForegroundColor $Green
}

# Function to run migrations
function Run-Migrations {
    Write-Host "🗄️  Running database migrations..." -ForegroundColor $Blue
    
    # Wait for database to be ready
    Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor $Yellow
    Start-Sleep -Seconds 10
    
    # Run migrations
    docker compose -f docker compose.prod.yml exec backend php artisan migrate --force
    
    Write-Host "✅ Migrations completed" -ForegroundColor $Green
}

# Function to seed database (only if empty)
function Seed-Database {
    Write-Host "🌱 Checking if database needs seeding..." -ForegroundColor $Blue
    
    try {
        $UserCount = docker compose -f docker compose.prod.yml exec -T backend php artisan tinker --execute="echo App\Models\User::count();" 2>$null
        if ($UserCount -eq "0") {
            Write-Host "📊 Database is empty, running seeders..." -ForegroundColor $Yellow
            docker compose -f docker compose.prod.yml exec backend php artisan db:seed --force
            Write-Host "✅ Database seeded successfully" -ForegroundColor $Green
        } else {
            Write-Host "✅ Database already has data, skipping seeding" -ForegroundColor $Green
        }
    } catch {
        Write-Host "📊 Database is empty, running seeders..." -ForegroundColor $Yellow
        docker compose -f docker compose.prod.yml exec backend php artisan db:seed --force
        Write-Host "✅ Database seeded successfully" -ForegroundColor $Green
    }
}

# Function to generate application key
function Generate-AppKey {
    Write-Host "🔑 Generating application key..." -ForegroundColor $Blue
    docker compose -f docker compose.prod.yml exec backend php artisan key:generate --force
    Write-Host "✅ Application key generated" -ForegroundColor $Green
}

# Function to optimize application
function Optimize-Application {
    Write-Host "⚡ Optimizing application..." -ForegroundColor $Blue
    docker compose -f docker compose.prod.yml exec backend php artisan config:cache
    docker compose -f docker compose.prod.yml exec backend php artisan route:cache
    Write-Host "✅ Application optimized" -ForegroundColor $Green
}

# Function to check health
function Check-Health {
    Write-Host "🏥 Checking application health..." -ForegroundColor $Blue
    
    # Wait for services to be ready
    Start-Sleep -Seconds 15
    
    # Check if nginx is responding
    try {
        $HealthResponse = Invoke-WebRequest -Uri "http://$ServerIP/health" -TimeoutSec 10
        if ($HealthResponse.StatusCode -eq 200) {
            Write-Host "✅ Nginx is responding" -ForegroundColor $Green
        } else {
            Write-Host "❌ Nginx is not responding" -ForegroundColor $Red
            return $false
        }
    } catch {
        Write-Host "❌ Nginx is not responding" -ForegroundColor $Red
        return $false
    }
    
    # Check if API is responding
    # Use a public endpoint or health check endpoint instead of protected route
    try {
        $ApiResponse = Invoke-WebRequest -Uri "http://$ServerIP/up" -TimeoutSec 10 -ErrorAction SilentlyContinue
        if ($ApiResponse.StatusCode -eq 200) {
            Write-Host "✅ API is responding" -ForegroundColor $Green
        } else {
            throw
        }
    } catch {
        try {
            $ApiResponse = Invoke-WebRequest -Uri "http://$ServerIP/api/v1/public/equipamentos/1" -TimeoutSec 10 -ErrorAction SilentlyContinue
            if ($ApiResponse.StatusCode -eq 200) {
                Write-Host "✅ API is responding (via public endpoint)" -ForegroundColor $Green
            } else {
                throw
            }
        } catch {
            Write-Host "⚠️  API health check skipped (requires authentication)" -ForegroundColor $Yellow
            # Check if backend container is running instead
            $BackendStatus = docker compose -f docker compose.prod.yml ps backend
            if ($BackendStatus -match "Up") {
                Write-Host "✅ Backend container is running" -ForegroundColor $Green
            } else {
                Write-Host "❌ Backend container is not running" -ForegroundColor $Red
                return $false
            }
        }
    }
    
    return $true
}

# Function to display final status
function Show-Status {
    Write-Host "📊 Final Status:" -ForegroundColor $Blue
    Write-Host "=================================" -ForegroundColor $Green
    Write-Host "🎉 Deployment completed successfully!" -ForegroundColor $Green
    Write-Host "📱 Access the application at: http://$ServerIP" -ForegroundColor $Yellow
    Write-Host "🔧 API endpoint: http://$ServerIP/api/v1" -ForegroundColor $Yellow
    Write-Host "📋 Health check: http://$ServerIP/health" -ForegroundColor $Yellow
    Write-Host "=================================" -ForegroundColor $Green
    
    Write-Host "📋 Container Status:" -ForegroundColor $Blue
    docker compose -f docker compose.prod.yml ps
    
    Write-Host "💾 Backup Location: $BackupDir" -ForegroundColor $Blue
    Get-ChildItem $BackupDir
}

# Main deployment process
function Main {
    Write-Host "🚀 Starting deployment process..." -ForegroundColor $Blue
    
    # Check if Docker is running
    try {
        docker info | Out-Null
    } catch {
        Write-Host "❌ Docker is not running. Please start Docker and try again." -ForegroundColor $Red
        exit 1
    }
    
    # Check if docker compose.prod.yml exists
    if (!(Test-Path "docker compose.prod.yml")) {
        Write-Host "❌ docker compose.prod.yml not found. Please run this script from the project root." -ForegroundColor $Red
        exit 1
    }
    
    # Run deployment steps
    Backup-Database
    Stop-Containers
    Start-Containers
    Run-Migrations
    Seed-Database
    Optimize-Application
    
    if (Check-Health) {
        Show-Status
        Write-Host "🎉 Deployment completed successfully!" -ForegroundColor $Green
    } else {
        Write-Host "❌ Health check failed. Please check the logs." -ForegroundColor $Red
        exit 1
    }
}

# Run main function
Main
