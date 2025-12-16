#!/bin/bash

# Keycloak Startup Script
# This script helps you quickly start Keycloak with proper configuration

set -e

echo "🔐 Fleet Management - Keycloak Startup Script"
echo "=============================================="
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

# Check if .env.keycloak exists
if [ ! -f .env.keycloak ]; then
    echo "⚠️  .env.keycloak not found. Creating from example..."
    cp .env.keycloak.example .env.keycloak
    
    echo ""
    echo "📝 Please edit .env.keycloak and set secure passwords:"
    echo "   - KEYCLOAK_DB_PASSWORD"
    echo "   - KEYCLOAK_ADMIN_PASSWORD"
    echo ""
    echo "Generate secure passwords with: openssl rand -base64 32"
    echo ""
    read -p "Press Enter after editing .env.keycloak to continue..."
fi

# Load environment variables
export $(grep -v '^#' .env.keycloak | xargs)

echo "🚀 Starting Keycloak services..."
docker-compose -f docker-compose.keycloak.yml --env-file .env.keycloak up -d

echo ""
echo "⏳ Waiting for Keycloak to start (this may take 60-90 seconds)..."
echo ""

# Wait for Keycloak to be ready
RETRY_COUNT=0
MAX_RETRIES=60

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:${KEYCLOAK_PORT:-8080}/health/ready > /dev/null 2>&1; then
        echo ""
        echo "✅ Keycloak is ready!"
        break
    fi
    
    echo -n "."
    sleep 2
    RETRY_COUNT=$((RETRY_COUNT + 1))
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo ""
    echo "⚠️  Keycloak is taking longer than expected to start."
    echo "    Check logs with: docker-compose -f docker-compose.keycloak.yml logs -f"
    exit 1
fi

echo ""
echo "=============================================="
echo "✅ Keycloak is running!"
echo "=============================================="
echo ""
echo "📍 Admin Console: http://localhost:${KEYCLOAK_PORT:-8080}"
echo "   Username: ${KEYCLOAK_ADMIN_USER:-admin}"
echo "   Password: (from .env.keycloak)"
echo ""
echo "📍 Realm: fleet-management-app"
echo "   URL: http://localhost:${KEYCLOAK_PORT:-8080}/realms/fleet-management-app"
echo ""
echo "👤 Test Users:"
echo "   - admin / admin123 (fleet-admin role)"
echo "   - employee / employee123 (fleet-employee role)"
echo ""
echo "🔑 Next Steps:"
echo "   1. Login to Admin Console"
echo "   2. Go to: Clients → fleet-management-frontend → Credentials"
echo "   3. Copy the Client Secret"
echo "   4. Add to your frontend .env.local:"
echo ""
echo "      KEYCLOAK_ID=fleet-management-frontend"
echo "      KEYCLOAK_SECRET=<paste-secret-here>"
echo "      KEYCLOAK_ISSUER=http://localhost:${KEYCLOAK_PORT:-8080}/realms/fleet-management-app"
echo ""
echo "📊 View logs: docker-compose -f docker-compose.keycloak.yml logs -f"
echo "⏹️  Stop: docker-compose -f docker-compose.keycloak.yml down"
echo ""
