#!/bin/bash

set -e

echo "================================"
echo "Portfolio Builder - Setup"
echo "================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "Error: Docker Compose is not installed"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "Error: .env file not found"
    echo "The .env file should already exist with your API key configured"
    exit 1
fi

# Verify API key is set
source .env
if [ -z "$GEMINI_API_KEY" ]; then
    echo "Error: GEMINI_API_KEY is not set in .env"
    echo "Please check your .env file"
    exit 1
fi

echo "✓ Configuration verified"
echo ""

echo "Starting Aptifolio Clone..."
echo ""

# Create necessary directories
mkdir -p uploads postgres-data

# Stop existing containers
echo "Stopping any existing containers..."
docker-compose down 2>/dev/null || true

# Build and start services
echo ""
echo "Building and starting services..."
echo "This may take a few minutes on first run..."
docker-compose up -d --build

# Wait for services to be healthy
echo ""
echo "Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "================================"
    echo "✓ Services are running"
    echo "================================"
    echo ""
    echo "Frontend:  http://localhost:3000"
    echo "Backend:   http://localhost:8000"
    echo "API Docs:  http://localhost:8000/docs"
    echo ""
    echo "Commands:"
    echo "  View logs:     docker-compose logs -f"
    echo "  Stop:          docker-compose down"
    echo "  Restart:       docker-compose restart"
    echo ""
else
    echo ""
    echo "Error: Services failed to start"
    echo "Check logs with: docker-compose logs"
    exit 1
fi
