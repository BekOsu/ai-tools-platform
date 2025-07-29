# AI Platform - Code Generation Service

A high-performance Node.js microservice for AI-powered code generation using Claude Code SDK.

## 🚀 Features

- **Claude Code SDK Integration** - Real AI code generation
- **Multi-language Support** - TypeScript, Python, Go, Rust, and more
- **Production Ready** - Logging, error handling, rate limiting
- **Docker Support** - Containerized deployment
- **Health Checks** - Monitoring and observability
- **Input Validation** - Secure request handling

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │  Code Gen       │    │  Claude Code    │
│   (Next.js)     │────│  Service        │────│  SDK            │
│                 │    │  (Node.js)      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚦 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Anthropic API key

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your Anthropic API key
   ```

3. **Development:**
   ```bash
   npm run dev
   ```

4. **Production:**
   ```bash
   npm run build
   npm start
   ```

## 📡 API Endpoints

### Code Generation
```http
POST /api/generate/code
Content-Type: application/json

{
  "prompt": "Create a React component for user authentication",
  "language": "typescript",
  "framework": "react"
}
```

### Code Improvement
```http
POST /api/generate/improve
Content-Type: application/json

{
  "code": "function add(a, b) { return a + b; }",
  "instructions": "Add TypeScript types and error handling",
  "language": "typescript"
}
```

### Code Explanation
```http
POST /api/generate/explain
Content-Type: application/json

{
  "code": "const fibonacci = n => n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2);",
  "language": "javascript"
}
```

### Templates & Languages
```http
GET /api/generate/templates
GET /api/generate/languages
```

### Health Checks
```http
GET /health
GET /health/ready
GET /health/live
```

## 🐳 Docker Deployment

1. **Build image:**
   ```bash
   docker build -t ai-codegen-service .
   ```

2. **Run container:**
   ```bash
   docker run -p 8001:8001 \
     -e ANTHROPIC_API_KEY=your-key \
     -e NODE_ENV=production \
     ai-codegen-service
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8001` |
| `NODE_ENV` | Environment | `development` |
| `ANTHROPIC_API_KEY` | Claude API key | Required |
| `ALLOWED_ORIGINS` | CORS origins | `http://localhost:3000` |
| `LOG_LEVEL` | Logging level | `info` |

### Rate Limiting
- **Window:** 15 minutes
- **Max Requests:** 100 per IP
- **Configurable** via environment variables

## 📊 Monitoring

### Health Endpoints
- `/health` - Full health status
- `/health/ready` - Readiness probe
- `/health/live` - Liveness probe

### Logs
- **Development:** Console output
- **Production:** File-based logging
- **Structured:** JSON format with metadata

## 🔒 Security

- **Helmet.js** - Security headers
- **CORS** - Cross-origin protection  
- **Rate Limiting** - DDoS protection
- **Input Validation** - Request sanitization
- **Error Handling** - No sensitive info leakage

## 🚀 Performance

- **Compression** - Gzip response compression
- **Async Operations** - Non-blocking I/O
- **Connection Pooling** - Efficient resource usage
- **Graceful Shutdown** - Clean process termination

## 📈 Scaling

### Horizontal Scaling
```bash
# Multiple instances behind load balancer
docker run -p 8001:8001 ai-codegen-service
docker run -p 8002:8001 ai-codegen-service
docker run -p 8003:8001 ai-codegen-service
```

### Load Balancing
```nginx
upstream codegen {
    server localhost:8001;
    server localhost:8002;
    server localhost:8003;
}

server {
    location /api/generate {
        proxy_pass http://codegen;
    }
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Health check
curl http://localhost:8001/health

# Code generation test
curl -X POST http://localhost:8001/api/generate/code \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello world function", "language": "typescript"}'
```

## 📚 Usage Examples

### React Component Generation
```javascript
const response = await fetch('/api/generate/code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Create a responsive navbar component with logo and menu items',
    language: 'typescript',
    framework: 'react'
  })
});

const result = await response.json();
console.log(result.code); // Generated React component
```

### API Endpoint Generation
```javascript
const response = await fetch('/api/generate/code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Create a REST API for user management with CRUD operations',
    language: 'typescript',
    framework: 'express'
  })
});
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - see LICENSE file for details