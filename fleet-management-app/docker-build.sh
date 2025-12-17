#!/bin/bash

# ===============================
# Docker Build Script
# ===============================
# Builds the Docker image with git-based versioning
# Tags: latest, git commit hash, git tag (if exists)

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="fleet-frontend"
DOCKER_HUB_USERNAME="${DOCKER_HUB_USERNAME:-harinejan}"  # Set via environment or replace

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Fleet Management Frontend Build${NC}"
echo -e "${GREEN}================================${NC}"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}Error: Not in a git repository${NC}"
    exit 1
fi

# Get git information
GIT_COMMIT=$(git rev-parse --short HEAD)
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
GIT_TAG=$(git describe --tags --exact-match 2>/dev/null || echo "")
BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo -e "${YELLOW}Git Information:${NC}"
echo "  Commit: $GIT_COMMIT"
echo "  Branch: $GIT_BRANCH"
echo "  Tag: ${GIT_TAG:-none}"
echo "  Build Date: $BUILD_DATE"
echo ""

# Build arguments for Next.js
echo -e "${YELLOW}Build Arguments (set via environment or defaults):${NC}"
echo "  NEXT_PUBLIC_VEHICLE_SERVICE_URL: ${NEXT_PUBLIC_VEHICLE_SERVICE_URL:-http://vehicle-service:8080}"
echo "  NEXT_PUBLIC_MAINTENANCE_SERVICE_URL: ${NEXT_PUBLIC_MAINTENANCE_SERVICE_URL:-http://maintenance-service:5001}"
echo "  NEXT_PUBLIC_DRIVER_SERVICE_URL: ${NEXT_PUBLIC_DRIVER_SERVICE_URL:-http://driver-service:8080}"
echo "  NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-http://localhost:3000/api}"
echo ""

# Build the image
echo -e "${GREEN}Building Docker image...${NC}"
docker build \
  --build-arg NEXT_PUBLIC_VEHICLE_SERVICE_URL="${NEXT_PUBLIC_VEHICLE_SERVICE_URL:-http://vehicle-service:8080}" \
  --build-arg NEXT_PUBLIC_MAINTENANCE_SERVICE_URL="${NEXT_PUBLIC_MAINTENANCE_SERVICE_URL:-http://maintenance-service:5001}" \
  --build-arg NEXT_PUBLIC_DRIVER_SERVICE_URL="${NEXT_PUBLIC_DRIVER_SERVICE_URL:-http://driver-service:8080}" \
  --build-arg NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:3000/api}" \
  --label "git.commit=$GIT_COMMIT" \
  --label "git.branch=$GIT_BRANCH" \
  --label "git.tag=$GIT_TAG" \
  --label "build.date=$BUILD_DATE" \
  -t ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:${GIT_COMMIT} \
  -t ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:latest \
  .

# Tag with git tag if it exists
if [ -n "$GIT_TAG" ]; then
    echo -e "${GREEN}Tagging with git tag: $GIT_TAG${NC}"
    docker tag ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:${GIT_COMMIT} ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:${GIT_TAG}
fi

# Tag with branch name (sanitized)
BRANCH_TAG=$(echo "$GIT_BRANCH" | sed 's/[^a-zA-Z0-9._-]/-/g')
if [ "$BRANCH_TAG" != "main" ] && [ "$BRANCH_TAG" != "master" ]; then
    echo -e "${GREEN}Tagging with branch: $BRANCH_TAG${NC}"
    docker tag ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:${GIT_COMMIT} ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:${BRANCH_TAG}
fi

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Build Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Images created:"
echo "  ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:latest"
echo "  ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:${GIT_COMMIT}"
if [ -n "$GIT_TAG" ]; then
    echo "  ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:${GIT_TAG}"
fi
if [ "$BRANCH_TAG" != "main" ] && [ "$BRANCH_TAG" != "master" ]; then
    echo "  ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:${BRANCH_TAG}"
fi
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Test the image: docker run -p 3000:3000 ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:latest"
echo "  2. Publish to Docker Hub: ./docker-publish.sh"
echo ""

