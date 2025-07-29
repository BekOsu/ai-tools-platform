# 🚀 AI Tools Platform - Monorepo

A comprehensive AI-powered tools platform featuring microservices architecture, built with Next.js, Python, Go, and TypeScript.

## 🎯 **Project Status: Monorepo Architecture Complete ✅**

### **🚀 Currently Implemented (Phase 1)**
- ✅ **Monorepo Structure**: Unified repository with apps, services, and packages
- ✅ **Frontend**: Complete Next.js 15 + React 19 + TypeScript application
- ✅ **Backend API**: Django-based API with comprehensive features
- ✅ **Trading Analysis Service**: Go-based high-performance trading platform
- ✅ **Resume Builder Service**: TypeScript service with AI-powered features
- ✅ **Code Generation Service**: Multi-language code generation with LLM integration
- ✅ **Image/Text/Audio Services**: Python-based AI processing services
- ✅ **Docker Compose**: Complete containerization with orchestration
- ✅ **Shared Types**: TypeScript types package for consistency
- ✅ **CI/CD Pipeline**: GitHub Actions workflow for automated testing and deployment

### **📡 Live Services**
- **Frontend Web App**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Trading Service**: http://localhost:8001
- **Resume Service**: http://localhost:8002
- **Code Generation**: http://localhost:8003
- **Image Processing**: http://localhost:8004
- **Text Analysis**: http://localhost:8005
- **Audio Synthesis**: http://localhost:8006

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │  Backend API    │    │  Microservices  │
│   (Next.js)     │────│  (Django)       │────│  (Go/TS/Python) │
│   Port 3000     │    │  Port 8000      │    │  Ports 8001-8006│
└─────────────────┘    └─────────────────┘    └─────────────────┘
                               │
                    ┌─────────────────┐
                    │   Infrastructure │
                    │ PostgreSQL+Redis │
                    │   Nginx Proxy   │
                    └─────────────────┘
```

## 📁 Repository Structure

```
ai-tools-platform/
├── apps/                    # Applications
│   ├── web/                # Next.js frontend (Port: 3000)
│   └── api/                # Django backend API (Port: 8000)
├── services/               # Microservices
│   ├── trading/            # Go trading analysis service (Port: 8001)
│   ├── resume-builder/     # TypeScript resume service (Port: 8002)
│   ├── code-generation/    # TypeScript code gen service (Port: 8003)
│   ├── image-processing/   # Python image service (Port: 8004)
│   ├── text-analysis/      # Python NLP service (Port: 8005)
│   └── audio-synthesis/    # Python audio service (Port: 8006)
├── packages/               # Shared libraries
│   ├── shared-types/       # Shared TypeScript types
│   ├── ui-components/      # Shared React components
│   └── api-client/         # API client library
├── tools/                  # Development tools
│   ├── docker/             # Docker configurations
│   ├── scripts/            # Build and deployment scripts
│   └── configs/            # Shared configurations
├── docs/                   # Documentation
│   ├── api/                # API documentation
│   ├── services/           # Service-specific docs
│   └── deployment/         # Deployment guides
├── docker-compose.yml      # Local development setup
├── package.json           # Root package.json
└── README.md              # This file
```

### **🔧 Tech Stack**
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend API**: Django, Python, PostgreSQL, Redis
- **Trading Service**: Go, WebSocket, Technical Analysis
- **Node.js Services**: TypeScript, Express, AI/LLM integration
- **Python Services**: FastAPI, Computer Vision, NLP, Audio Processing
- **Infrastructure**: Docker, Nginx, PostgreSQL, Redis
- **CI/CD**: GitHub Actions, Automated Testing, Security Scanning

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Go 1.21+
- Docker & Docker Compose
- PostgreSQL
- Redis

### 1. Clone the Repository
```bash
git clone https://github.com/BekOsu/ai-tools-platform.git
cd ai-tools-platform
```

### 2. Environment Setup
```bash
# Copy environment variables
cp .env.example .env

# Install root dependencies
npm install

# Setup all applications and services
npm run setup
```

### 3. Start with Docker Compose (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### 4. Development Mode (Individual Services)
```bash
# Start frontend
npm run dev:web

# Start backend API
npm run dev:api

# Start all services
npm run dev:services

# Or start individual services
npm run service:trading
npm run service:resume
npm run service:codegen
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Individual Test Suites
```bash
# Frontend tests
npm run test:web

# Backend tests
npm run test:api

# Go service tests
cd services/trading && go test -v ./...

# Python service tests
cd services/image-processing && python -m pytest
```

## 🔧 Development Workflow

### Adding a New Service
1. Create service directory in `services/`
2. Add service configuration to `docker-compose.yml`
3. Update `package.json` scripts
4. Add service routes to Nginx configuration
5. Update shared types if needed

### Working with Shared Packages
```bash
# Build shared types
cd packages/shared-types
npm run build

# Use in other services
npm install @ai-tools/shared-types
```

## 📊 Monitoring & Health Checks

### Service Health Endpoints
- Web App: http://localhost:3000/health
- API: http://localhost:8000/health
- Trading: http://localhost:8001/health
- Resume: http://localhost:8002/health
- Codegen: http://localhost:8003/health
- Image: http://localhost:8004/health
- Text: http://localhost:8005/health
- Audio: http://localhost:8006/health

### Database Monitoring
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## 🚢 Deployment

### Production Deployment
```bash
# Build all services
npm run build

# Deploy with Docker
docker-compose -f docker-compose.prod.yml up -d
```

### CI/CD Pipeline
The repository includes GitHub Actions workflows for:
- Automated testing
- Security scanning
- Docker image building
- Staging deployment
- Production deployment

## 📚 API Documentation

### Core API Endpoints
- **Authentication**: `/api/auth/`
- **User Management**: `/api/user/`
- **Trading**: `/services/trading/`
- **Resume Builder**: `/services/resume/`
- **Code Generation**: `/services/codegen/`
- **Image Processing**: `/services/image/`
- **Text Analysis**: `/services/text/`
- **Audio Synthesis**: `/services/audio/`

### WebSocket Endpoints
- **Trading Data**: `ws://localhost:8001/ws/trading`
- **Real-time Notifications**: `ws://localhost:3000/ws/notifications`

## 🔐 Security

### Environment Variables
Sensitive configuration is managed through environment variables:
- API keys for external services
- Database credentials
- JWT secrets
- Service endpoints

### Security Features
- JWT-based authentication
- Rate limiting
- CORS protection
- Input validation
- SQL injection prevention
- XSS protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Use TypeScript for new Node.js services
- Follow existing code style and patterns
- Add tests for new functionality
- Update documentation
- Ensure Docker builds succeed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation in `/docs`
- Review existing issues and discussions

## 🔄 Recent Updates

### v1.0.0 - Monorepo Consolidation
- ✅ Consolidated 3 separate repositories into unified monorepo
- ✅ Implemented comprehensive microservices architecture
- ✅ Added Docker Compose development environment
- ✅ Created shared TypeScript types package
- ✅ Established unified CI/CD pipeline
- ✅ Enhanced trading analysis service with Go implementation
- ✅ Added WebSocket support for real-time data streaming
- ✅ Implemented advanced technical indicators and trading algorithms

---

**Built with ❤️ by Abu Baker**
