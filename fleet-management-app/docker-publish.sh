#!/bin/bash

# ===============================
# Docker Publish Script
# ===============================
# Publishes Docker images to Docker Hub
# Pushes: latest, git commit hash, git tag (if exists)

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="fleet-frontend"
DOCKER_HUB_USERNAME="${DOCKER_HUB_USERNAME:-harinejan}"  # Set via environment or replace

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Fleet Management Frontend Publish${NC}"
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

echo -e "${YELLOW}Publishing images for:${NC}"
echo "  Commit: $GIT_COMMIT"
echo "  Branch: $GIT_BRANCH"
echo "  Tag: ${GIT_TAG:-none}"
echo ""

# Check if Docker is logged in
if ! docker info | grep -q "Username"; then
    echo -e "${YELLOW}Not logged in to Docker Hub. Attempting login...${NC}"
    docker login
    if [ $? -ne 0 ]; then
        echo -e "${RED}Docker login failed. Please run 'docker login' manually.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}Logged in to Docker Hub${NC}"
echo ""

# Check if images exist
if ! docker image inspect ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:${GIT_COMMIT} > /dev/null 2>&1; then
    echo -e "${RED}Error: Image ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:${GIT_COMMIT} not found${NC}"
    echo -e "${YELLOW}Please run ./docker-build.sh first${NC}"
    exit 1
fi

# Confirmation prompt
echo -e "${YELLOW}About to push the following images to Docker Hub:${NC}"
echo "  ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:latest"
echo "  ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:${GIT_COMMIT}"
if [ -n "$GIT_TAG" ]; then
    echo "  ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:${GIT_TAG}"
fi

BRANCH_TAG=$(echo "$GIT_BRANCH" | sed 's/[^a-zA-Z0-9._-]/-/g')
if [ "$BRANCH_TAG" != "main" ] && [ "$BRANCH_TAG" != "master" ]; then
    echo "  ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:${BRANCH_TAG}"
fi

echo ""
read -p "Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Publish cancelled${NC}"
    exit 0
fi

# Push images
echo ""
echo -e "${GREEN}Pushing images to Docker Hub...${NC}"
echo ""

# Push commit hash
echo -e "${BLUE}Pushing ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:${GIT_COMMIT}${NC}"
docker push ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:${GIT_COMMIT}

# Push latest
echo -e "${BLUE}Pushing ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:latest${NC}"
docker push ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:latest

# Push git tag if exists
if [ -n "$GIT_TAG" ]; then
    echo -e "${BLUE}Pushing ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:${GIT_TAG}${NC}"
    docker push ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:${GIT_TAG}
fi

# Push branch tag
if [ "$BRANCH_TAG" != "main" ] && [ "$BRANCH_TAG" != "master" ]; then
    echo -e "${BLUE}Pushing ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:${BRANCH_TAG}${NC}"
    docker push ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:${BRANCH_TAG}
fi

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Publish Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Published images:"
echo "  ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:latest"
echo "  ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:${GIT_COMMIT}"
if [ -n "$GIT_TAG" ]; then
    echo "  ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:${GIT_TAG}"
fi
if [ "$BRANCH_TAG" != "main" ] && [ "$BRANCH_TAG" != "master" ]; then
    echo "  ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:${BRANCH_TAG}"
fi
echo ""
echo -e "${YELLOW}Docker Hub URL:${NC}"
echo "  https://hub.docker.com/r/${DOCKER_HUB_USERNAME}/${IMAGE_NAME}"
echo ""
echo -e "${YELLOW}To use in Kubernetes:${NC}"
echo "  Update k8s/kustomization.yaml or k8s/deployment.yaml with:"
echo "  image: ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:${GIT_COMMIT}"
echo ""
echo -e "${YELLOW}To pull the image:${NC}"
echo "  docker pull ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:latest"
echo "  docker pull ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:${GIT_COMMIT}"
if [ -n "$GIT_TAG" ]; then
    echo "  docker pull ${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:${GIT_TAG}"
fi
echo ""

