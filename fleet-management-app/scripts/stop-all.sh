#!/bin/bash

# Fleet Management System - Stop All Services

echo "⏹️  Stopping all Fleet Management services..."
docker-compose down

echo ""
echo "✅ All services stopped."
echo ""
echo "Options:"
echo "  Remove all data (fresh start): docker-compose down -v"
echo "  View stopped containers:       docker-compose ps -a"
