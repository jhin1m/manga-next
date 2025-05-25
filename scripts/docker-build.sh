#!/bin/bash

# Docker build script for manga-fake project
# Usage: ./scripts/docker-build.sh [tag]

set -e

# Default tag
TAG=${1:-latest}
IMAGE_NAME="manga-fake"

echo "🚀 Building Docker image: $IMAGE_NAME:$TAG"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Build the Docker image
echo "📦 Building image (this may take a few minutes)..."
docker build \
  --tag $IMAGE_NAME:$TAG \
  --build-arg NODE_ENV=production \
  --platform linux/amd64 \
  .

echo "✅ Docker image built successfully: $IMAGE_NAME:$TAG"

# Show image size
echo "📦 Image size:"
docker images $IMAGE_NAME:$TAG --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

echo ""
echo "🔧 To run the container:"
echo "docker run -p 3000:3000 --env-file .env.production $IMAGE_NAME:$TAG"
echo ""
echo "🐳 To run with docker-compose:"
echo "docker-compose up -d"
echo ""
echo "🧪 To test the build:"
echo "docker run --rm -p 3000:3000 -e DATABASE_URL=postgresql://test:test@host.docker.internal:5432/test $IMAGE_NAME:$TAG"
