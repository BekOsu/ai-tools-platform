#!/bin/bash

# AI Platform Microservices Startup Script
# This script starts all microservices for the AI platform

set -e

echo "🚀 Starting AI Platform Microservices..."
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose > /dev/null 2>&1; then
    print_error "docker-compose is not installed. Please install it and try again."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env file..."
    cat > .env << EOF
# AI API Keys
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Database passwords
POSTGRES_PASSWORD=ai_platform_db_password_123
MONGO_PASSWORD=ai_platform_mongo_password_123

# Monitoring
GRAFANA_PASSWORD=admin123

# Environment
NODE_ENV=development
PYTHON_ENV=development
GO_ENV=development
EOF
    print_warning "Created .env file with default values. Please update with your actual API keys."
fi

# Function to check service health
check_service_health() {
    local service_name=$1
    local port=$2
    local max_attempts=30
    local attempt=1

    print_status "Waiting for $service_name to be healthy..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f http://localhost:$port/health > /dev/null 2>&1; then
            print_success "$service_name is healthy!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_warning "$service_name is not responding after $((max_attempts * 2)) seconds"
    return 1
}

# Start all services
print_status "Starting all services with docker-compose..."
docker-compose up -d

print_status "Waiting for services to start..."
sleep 10

# Check each service
echo ""
print_status "Checking service health..."

# Trading Service (Go)
check_service_health "Trading Service" 8001

# Code Generation Service (Node.js)
check_service_health "Code Generation Service" 8002

# Image Processing Service (Python)
check_service_health "Image Processing Service" 8003

# Text Analysis Service (Python)
check_service_health "Text Analysis Service" 8004

# Audio Synthesis Service (Python)
check_service_health "Audio Synthesis Service" 8005

# Resume Builder Service (Node.js)
check_service_health "Resume Builder Service" 8006

# API Gateway (Nginx)
if curl -s -f http://localhost:8000/health > /dev/null 2>&1; then
    print_success "API Gateway is healthy!"
else
    print_warning "API Gateway is not responding"
fi

echo ""
print_success "All services started!"
echo ""

# Display service information
echo "📋 Service Information:"
echo "======================"
echo "🔄 API Gateway:         http://localhost:8000"
echo "📈 Trading Service:     http://localhost:8001"
echo "💻 Code Generation:     http://localhost:8002"
echo "🖼️  Image Processing:    http://localhost:8003"
echo "📝 Text Analysis:       http://localhost:8004"
echo "🎵 Audio Synthesis:     http://localhost:8005"
echo "📄 Resume Builder:      http://localhost:8006"
echo ""
echo "🗄️  Database Services:"
echo "🔴 Redis:              http://localhost:6379"
echo "🐘 PostgreSQL:         http://localhost:5432"
echo "🍃 MongoDB:            http://localhost:27017"
echo ""
echo "📊 Monitoring (Optional):"
echo "📈 Prometheus:         http://localhost:9090"
echo "📊 Grafana:            http://localhost:3001"
echo ""

# Display API endpoints
echo "🔗 Quick API Test Commands:"
echo "=========================="
echo "# Trading Analysis"
echo "curl http://localhost:8000/api/trading/prices/AAPL"
echo ""
echo "# Code Generation"
echo "curl -X POST http://localhost:8000/api/code/generate \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"prompt\": \"Create a hello world function in Python\", \"language\": \"python\"}'"
echo ""
echo "# Text Analysis"
echo "curl -X POST http://localhost:8000/api/text/sentiment \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"texts\": [\"I love this product!\"], \"return_confidence\": true}'"
echo ""

print_status "To stop all services, run: docker-compose down"
print_status "To view logs, run: docker-compose logs -f [service-name]"
print_status "To restart a service, run: docker-compose restart [service-name]"

echo ""
print_success "🎉 AI Platform is ready to use!"