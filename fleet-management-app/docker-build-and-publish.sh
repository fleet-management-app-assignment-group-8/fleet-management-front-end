#!/bin/bash

# ===============================
# Docker Build & Publish Script
# ===============================
# Convenience script that builds and publishes in one go

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Build & Publish Pipeline${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Step 1: Build
echo -e "${YELLOW}Step 1: Building Docker image...${NC}"
./docker-build.sh

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed. Aborting.${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 2: Publishing to Docker Hub...${NC}"
./docker-publish.sh

if [ $? -ne 0 ]; then
    echo -e "${RED}Publish failed.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Pipeline Complete!${NC}"
echo -e "${GREEN}================================${NC}"

