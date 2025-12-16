#!/bin/bash

# Keycloak Stop Script

echo "🔐 Stopping Keycloak services..."
docker-compose -f docker-compose.keycloak.yml down

echo "✅ Keycloak services stopped."
echo ""
echo "To remove all data (fresh start): docker-compose -f docker-compose.keycloak.yml down -v"
