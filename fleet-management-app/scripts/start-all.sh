#!/bin/bash

# Fleet Management System - Full Stack Startup Script
# Starts Keycloak + Frontend in Docker

set -e

echo "🚀 Fleet Management System - Full Stack Startup"
echo "================================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env.docker exists
if [ ! -f .env.docker ]; then
    echo "⚠️  .env.docker not found. Creating from example..."
    cp .env.docker.example .env.docker
    
    echo ""
    echo "📝 Please edit .env.docker and configure:"
    echo "   - KEYCLOAK_DB_PASSWORD (secure password)"
    echo "   - KEYCLOAK_ADMIN_PASSWORD (secure password)"
    echo "   - KEYCLOAK_SECRET (get from Keycloak admin after first start)"
    echo "   - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
    echo ""
    echo "⚠️  For first-time setup:"
    echo "   1. Start with KEYCLOAK_SECRET=temporary"
    echo "   2. After Keycloak starts, get real secret from admin console"
    echo "   3. Update .env.docker and restart"
    echo ""
    read -p "Press Enter after editing .env.docker to continue..."
fi

# Load environment variables
export $(grep -v '^#' .env.docker | xargs)

echo "🏗️  Building frontend Docker image..."
docker-compose build frontend

echo ""
echo "🚀 Starting all services..."
docker-compose --env-file .env.docker up -d

echo ""
echo "⏳ Waiting for services to start..."
echo ""

# Wait for Keycloak
echo "Waiting for Keycloak..."
RETRY_COUNT=0
MAX_RETRIES=60

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:${KEYCLOAK_PORT:-8080}/health/ready > /dev/null 2>&1; then
        echo "✅ Keycloak is ready!"
        break
    fi
    echo -n "."
    sleep 2
    RETRY_COUNT=$((RETRY_COUNT + 1))
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo ""
    echo "⚠️  Keycloak is taking longer than expected."
    echo "    Check logs with: docker-compose logs -f keycloak"
fi

# Wait for Frontend
echo ""
echo "Waiting for Frontend..."
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:${FRONTEND_PORT:-3000} > /dev/null 2>&1; then
        echo "✅ Frontend is ready!"
        break
    fi
    echo -n "."
    sleep 2
    RETRY_COUNT=$((RETRY_COUNT + 1))
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo ""
    echo "⚠️  Frontend is taking longer than expected."
    echo "    Check logs with: docker-compose logs -f frontend"
fi

echo ""
echo "================================================"
echo "✅ Fleet Management System is running!"
echo "================================================"
echo ""
echo "🌐 Services:"
echo "   Frontend:        http://localhost:${FRONTEND_PORT:-3000}"
echo "   Keycloak Admin:  http://localhost:${KEYCLOAK_PORT:-8080}"
echo ""
echo "🔐 Keycloak Admin Console:"
echo "   URL:      http://localhost:${KEYCLOAK_PORT:-8080}"
echo "   Username: ${KEYCLOAK_ADMIN_USER:-admin}"
echo "   Password: (from .env.docker)"
echo ""
echo "👤 Test Users:"
echo "   - admin / admin123 (fleet-admin role)"
echo "   - employee / employee123 (fleet-employee role)"
echo ""
echo "🔑 First-Time Setup:"
echo "   If you haven't configured KEYCLOAK_SECRET yet:"
echo "   1. Go to: http://localhost:${KEYCLOAK_PORT:-8080}"
echo "   2. Login with admin credentials"
echo "   3. Navigate to: Clients → fleet-management-frontend → Credentials"
echo "   4. Copy the Client Secret"
echo "   5. Update KEYCLOAK_SECRET in .env.docker"
echo "   6. Restart: docker-compose restart frontend"
echo ""
echo "📊 View logs:"
echo "   All services:  docker-compose logs -f"
echo "   Frontend only: docker-compose logs -f frontend"
echo "   Keycloak only: docker-compose logs -f keycloak"
echo ""
echo "⏹️  Stop all: docker-compose down"
echo ""
