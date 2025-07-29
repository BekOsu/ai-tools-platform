# 🤖 AI Tools Platform - Comprehensive AI-Powered Development Suite

A production-ready AI platform featuring code generation, trading analysis, image processing, and more, powered by Claude Code SDK and modern microservices architecture.

## 🎯 **Project Status: Phase 1 Complete ✅**

### **🚀 Currently Implemented (Phase 1)**
- ✅ **Frontend**: Complete Next.js 15 + React 19 + TypeScript application
- ✅ **AI Code Playground**: Monaco Editor with Claude Code SDK integration  
- ✅ **Backend Microservice**: Production-ready Node.js + Express + TypeScript API
- ✅ **Claude SDK Integration**: Full file write permissions and code generation
- ✅ **Docker Setup**: Complete containerization with health checks
- ✅ **Authentication**: JWT-based auth system with login/signup
- ✅ **Production Architecture**: Security, logging, monitoring, error handling

### **📡 Live Services**
- **Frontend Dashboard**: http://localhost:3000
- **AI Code Playground**: http://localhost:3000/playground  
- **Code Generation API**: http://localhost:8002
- **Health Monitoring**: http://localhost:8002/health

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │  Code Gen       │    │  Claude Code    │
│   (Next.js)     │────│  Service        │────│  SDK            │
│   Port 3000     │    │  (Node.js)      │    │  (File Write)   │
└─────────────────┘    │  Port 8002      │    └─────────────────┘
                       └─────────────────┘
```

### **🔧 Tech Stack Implemented**
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Monaco Editor
- **Backend**: Node.js, Express, TypeScript, Winston (logging)
- **AI Integration**: Claude Code SDK with file write permissions
- **Security**: Helmet, CORS, rate limiting, input validation
- **Deployment**: Docker, health checks, graceful shutdown
- **Database**: Ready for PostgreSQL/Redis integration

## 📁 **Project Structure**

```
ai-project/
├── ai_front/nextjs-dashboard/           # 🎨 Frontend Application
│   ├── src/app/playground/              # 🚀 AI Code Playground
│   ├── src/components/                  # 🧩 React Components
│   ├── src/lib/                         # 📚 Utilities & APIs
│   ├── services/codegen-service/        # 🤖 Node.js Microservice
│   │   ├── src/                         # 📝 TypeScript Source
│   │   ├── dist/                        # 🔨 Compiled JavaScript
│   │   ├── node_modules/                # 📦 Dependencies (Claude SDK)
│   │   ├── Dockerfile                   # 🐳 Container Config
│   │   └── README.md                    # 📖 Service Documentation
│   ├── IMPROVEMENTS.md                  # 📈 Progress Log
│   └── MICROSERVICES_ARCHITECTURE.md   # 🏗️ Architecture Docs
├── BACKEND_ARCHITECTURE_PLAN.md         # 📋 Development Roadmap
└── README.md                            # 📘 This File
```

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 20+
- npm or pnpm
- Docker (optional)

### **🏃‍♂️ Running the Platform**

1. **Clone and Setup**
   ```bash
   cd ai-project/ai_front/nextjs-dashboard
   npm install
   ```

2. **Start Code Generation Service**
   ```bash
   cd services/codegen-service
   npm install
   npm run dev  # Development mode
   # or
   npm run build && npm start  # Production mode
   ```

3. **Start Frontend Dashboard**
   ```bash
   cd ai-project/ai_front/nextjs-dashboard
   npm run dev
   ```

4. **Access Applications**
   - 🌐 **Dashboard**: http://localhost:3000
   - 💻 **Code Playground**: http://localhost:3000/playground
   - 🔍 **API Health**: http://localhost:8002/health
   - 🧪 **AI Services Demo**: http://localhost:3000/demo

### **Authentication with OAuth Providers**

1. Create OAuth credentials for Google, Microsoft (Azure AD), and Apple
2. Copy `.env.example` to `.env` and fill in `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `APPLE_CLIENT_ID`, `APPLE_CLIENT_SECRET`, and `NEXTAUTH_SECRET`
3. Start the app and sign in with your provider of choice or with email credentials
4. For email sign up, create an account on the signup page. Sessions are managed by NextAuth
5. The dashboard automatically loads your current credit balance and product list from the backend API

### **🐳 Docker Deployment**
```bash
cd services/codegen-service
docker build -t ai-codegen-service .
docker run -p 8002:8002 -e ANTHROPIC_API_KEY=your_key ai-codegen-service
```

## 🎯 **Key Features Implemented**

### **🤖 AI Code Playground**
- **Multi-language Support**: TypeScript, JavaScript, Python, Go, Rust, Java, C++
- **Real-time Generation**: Powered by Claude Code SDK
- **File Creation**: Multi-file project generation with proper permissions
- **Monaco Editor**: Full IDE experience with syntax highlighting
- **Templates**: Pre-built patterns for React components, APIs, database models
- **Export Options**: Download generated code with proper file extensions

### **🔒 Production Security**
- **Helmet.js**: Security headers protection
- **CORS**: Cross-origin request handling
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Express-validator for request sanitization
- **Error Handling**: Comprehensive error boundaries and logging

### **📊 Monitoring & Observability**
- **Health Checks**: `/health`, `/health/ready`, `/health/live`
- **Structured Logging**: Winston with JSON format
- **Performance Metrics**: Request timing and error tracking
- **Docker Health Checks**: Container monitoring ready

## 📡 **API Endpoints**

### **Code Generation Service (Port 8002)**
```http
POST /api/generate/code
POST /api/generate/improve
POST /api/generate/explain
GET  /api/generate/templates
GET  /api/generate/languages
GET  /health
GET  /health/ready
GET  /health/live
```

### **Frontend API (Port 3000)**
```http
POST /api/code-generation/generate  # Proxies to microservice
GET  /playground                    # Code playground UI
GET  /dashboard                     # Main dashboard
GET  /login                         # Authentication
```

## 🔑 **Claude Code SDK Integration**

### **File Write Permissions Configured**
```typescript
// ✅ Implemented: Full file write permissions
allowedTools: ["Read", "Write", "Bash", "Edit", "MultiEdit"]
permissionMode: "acceptEdits"

// ✅ Features Available:
// - Multi-file project generation
// - Directory structure creation
// - File modification and editing
// - Code execution capabilities
```

## 📈 **What's Next: Phase 2 Roadmap**

### **🎯 Immediate Next Steps**
1. **Add API Key Configuration** - Environment setup for Claude SDK
2. **Enhanced Code Templates** - More programming patterns and frameworks
3. **Real-time Collaboration** - WebSocket integration for live coding
4. **Code Execution** - Safe sandbox environment for running generated code
5. **Version Control** - Git integration for code history

### **🚀 Phase 2: Additional AI Services**
1. **Trading Analysis Service** (Go/Python)
2. **Image Processing Service** (Python + OpenCV)
3. **Text Analysis Service** (Python + NLP)
4. **Audio Synthesis Service** (Python + PyTorch)
5. **Resume Builder Service** (Node.js + PDF generation)

### **🏗️ Phase 3: Production Scaling**
1. **Database Integration** (PostgreSQL + Redis)
2. **Message Queue System** (RabbitMQ/Redis)
3. **Load Balancing** (Nginx + Docker Swarm)
4. **Monitoring Stack** (Prometheus + Grafana)
5. **CI/CD Pipeline** (GitHub Actions + Docker)

## 🛠️ **Development Guidelines**

### **Adding New AI Services**
1. Create service in `services/` directory
2. Follow existing patterns for logging, validation, health checks
3. Add Docker configuration
4. Update API gateway routing
5. Add frontend integration

### **Code Quality Standards**
- ✅ TypeScript strict mode
- ✅ ESLint + Prettier formatting
- ✅ Comprehensive error handling
- ✅ Unit tests (Jest framework ready)
- ✅ Docker health checks
- ✅ API documentation

## 📚 **Documentation**

- **[Backend Architecture Plan](BACKEND_ARCHITECTURE_PLAN.md)** - Detailed development roadmap
- **[Service Documentation](ai_front/nextjs-dashboard/services/codegen-service/README.md)** - Code generation API docs
- **[Frontend Architecture](ai_front/nextjs-dashboard/MICROSERVICES_ARCHITECTURE.md)** - UI and component structure
- **[Improvements Log](ai_front/nextjs-dashboard/IMPROVEMENTS.md)** - Change history and optimizations

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow existing code patterns and standards
4. Add tests for new functionality
5. Update documentation
6. Submit pull request

## 📄 **License**

MIT License - see LICENSE file for details

## 🎊 **Achievements**

- 🚀 **Complete AI Code Playground** with Claude Code SDK
- 🏗️ **Production-ready microservices** architecture
- 🔒 **Enterprise-grade security** and monitoring
- 🐳 **Full Docker containerization** with health checks
- 📱 **Modern responsive frontend** with Next.js 15
- ⚡ **High-performance APIs** with proper validation
- 📚 **Comprehensive documentation** and guides
- 📊 **Usage analytics and billing endpoints** available at `/api/analytics/usage` and `/api/billing/summary`

---

**Built with ❤️ using Claude Code SDK, Next.js, Node.js, and TypeScript**

🤖 *Generated and enhanced with [Claude Code](https://claude.ai/code)*
