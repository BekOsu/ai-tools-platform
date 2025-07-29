# AI Platform Microservices Architecture

This directory contains all the microservices that power the AI platform, providing specialized AI tools and services.

## 🏗️ Architecture Overview

Our microservices architecture consists of 6 specialized AI services, each optimized for specific performance requirements:

```
┌─────────────────┐    ┌──────────────────────────────────────┐
│   Next.js App   │────│            API Gateway              │
└─────────────────┘    │         (Nginx - Port 8000)         │
                       └──────────────────┬───────────────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
            ┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
            │ Trading Service│  │ CodeGen Service │  │ Image Service  │
            │   (Go:8001)    │  │ (Node.js:8002)  │  │(Python:8003)   │
            └────────────────┘  └─────────────────┘  └────────────────┘
                    │                    │                    │
            ┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
            │  Text Service  │  │ Audio Service   │  │ Resume Service │
            │(Python:8004)   │  │(Python:8005)    │  │(Node.js:8006)  │
            └────────────────┘  └─────────────────┘  └────────────────┘
```

## 🚀 Services Overview

### 1. Trading Analysis Service (Go) - Port 8001
**Ultra-low latency financial analysis**
- Real-time market data processing
- Technical analysis indicators (RSI, MACD, Bollinger Bands)
- Portfolio management and tracking
- WebSocket real-time price feeds
- Risk assessment and trading signals

**Endpoints:**
- `GET /api/trading/prices/{symbol}` - Real-time price data
- `POST /api/trading/analyze` - Technical analysis
- `GET /api/trading/portfolio/{userId}` - Portfolio overview
- `WS /ws/trading` - Real-time data stream

### 2. Code Generation Service (Node.js + Claude) - Port 8002
**AI-powered code generation and review**
- Multi-language code generation
- Code review and optimization
- Documentation generation
- Refactoring suggestions
- Integration with Claude AI

**Endpoints:**
- `POST /api/code/generate` - Generate code from prompt
- `POST /api/code/review` - Code review and suggestions
- `POST /api/code/refactor` - Code refactoring
- `POST /api/code/document` - Generate documentation

### 3. Image Processing Service (Python + OpenCV) - Port 8003
**Advanced computer vision and image manipulation**
- Image enhancement and filtering
- Object detection and recognition
- Face detection and analysis
- Color analysis and extraction
- Batch image processing

**Endpoints:**
- `POST /api/image/upload` - Upload image
- `POST /api/image/process/{fileId}` - Apply effects
- `POST /api/image/analyze/{fileId}` - Image analysis
- `GET /api/image/download/{jobId}` - Download result

### 4. Text Analysis Service (Python + NLP) - Port 8004
**Comprehensive natural language processing**
- Sentiment analysis
- Named entity recognition
- Keyword extraction
- Text summarization
- Language detection
- Text similarity analysis

**Endpoints:**
- `POST /api/text/analyze` - Comprehensive analysis
- `POST /api/text/sentiment` - Sentiment analysis
- `POST /api/text/keywords` - Keyword extraction
- `POST /api/text/summarize` - Text summarization

### 5. Audio Synthesis Service (Python + PyTorch) - Port 8005
**AI-powered audio processing and generation**
- Text-to-speech synthesis
- Music generation
- Voice cloning
- Audio effects processing
- Speech analysis and mood detection

**Endpoints:**
- `POST /api/audio/text-to-speech` - Convert text to speech
- `POST /api/audio/generate-music` - Generate music
- `POST /api/audio/apply-effects/{fileId}` - Audio effects
- `POST /api/audio/analyze/{fileId}` - Audio analysis

### 6. Resume Builder Service (Node.js + PDF) - Port 8006
**Professional resume generation with AI optimization**
- Multiple professional templates
- PDF generation with Puppeteer
- AI-powered resume optimization
- ATS compatibility scoring
- Batch resume generation

**Endpoints:**
- `POST /api/resume/generate` - Generate resume
- `GET /api/resume/templates` - Available templates
- `POST /api/resume/optimize` - AI optimization
- `GET /api/resume/download/{jobId}` - Download PDF

## 🐳 Docker Deployment

### Prerequisites
- Docker and Docker Compose installed
- At least 8GB RAM recommended
- 10GB free disk space

### Quick Start

1. **Clone and navigate to services directory:**
```bash
cd ai_front/nextjs-dashboard/services
```

2. **Configure environment variables:**
```bash
cp .env.example .env
# Edit .env with your API keys
```

3. **Start all services:**
```bash
./start-services.sh
```

4. **Verify all services are running:**
```bash
docker-compose ps
```

### Manual Docker Commands

```bash
# Build all services
docker-compose build

# Start services in background
docker-compose up -d

# View logs
docker-compose logs -f [service-name]

# Stop all services
docker-compose down

# Restart specific service
docker-compose restart trading-service
```

## 🔧 Development Setup

### Individual Service Development

Each service can be run independently for development:

**Trading Service (Go):**
```bash
cd trading-service
go mod download
go run main.go
```

**Code Generation Service (Node.js):**
```bash
cd codegen-service
npm install
npm run dev
```

**Python Services:**
```bash
cd [service-directory]
pip install -r requirements.txt
python main.py
```

**Resume Builder Service (Node.js):**
```bash
cd resume-builder-service
npm install
npm run dev
```

## 📊 Performance Specifications

| Service | Language | Latency | Concurrency | Use Case |
|---------|----------|---------|-------------|----------|
| Trading | Go | <10ms | Very High | Real-time trading |
| CodeGen | Node.js | <2s | Medium | AI code generation |
| Image | Python | <5s | Low | ML image processing |
| Text | Python | <1s | Medium | NLP analysis |
| Audio | Python | <10s | Low | Audio synthesis |
| Resume | Node.js | <3s | High | PDF generation |

## 🔗 Service Integration

### With Next.js Frontend

```typescript
// Example integration in Next.js
const tradingClient = {
  async getPrice(symbol: string) {
    const response = await fetch(`http://localhost:8000/api/trading/prices/${symbol}`);
    return response.json();
  },
  
  async generateCode(prompt: string, language: string) {
    const response = await fetch('http://localhost:8000/api/code/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, language })
    });
    return response.json();
  }
};
```

### Claude SDK Integration

All services are designed to integrate with Claude AI for enhanced capabilities:

```javascript
// Code Generation Service example
import { anthropic } from '@anthropic-ai/sdk';

const claude = new anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function generateCode(prompt, language) {
  const response = await claude.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 2000,
  });
  
  return response.content[0].text;
}
```

## 🔍 Health Monitoring

All services provide health check endpoints:

```bash
# Check individual service health
curl http://localhost:8001/health  # Trading
curl http://localhost:8002/health  # CodeGen
curl http://localhost:8003/health  # Image
curl http://localhost:8004/health  # Text
curl http://localhost:8005/health  # Audio
curl http://localhost:8006/health  # Resume

# Check all services via gateway
curl http://localhost:8000/health
```

### Monitoring Dashboard

Optional monitoring with Prometheus and Grafana:
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin123)

## 🔐 Security Features

- Rate limiting on all endpoints
- CORS protection
- Input validation and sanitization
- Health check endpoints
- Container isolation
- Network segmentation

## 📈 Scaling Considerations

### Horizontal Scaling
```yaml
# Scale specific services
docker-compose up -d --scale trading-service=3
docker-compose up -d --scale image-processing-service=2
```

### Load Balancing
The Nginx gateway automatically load balances between scaled instances.

### Resource Management
```yaml
# Example resource limits in docker-compose.yml
services:
  trading-service:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          memory: 256M
```

## 🐛 Troubleshooting

### Common Issues

**Port conflicts:**
```bash
# Check which ports are in use
netstat -tulpn | grep :800
```

**Service not starting:**
```bash
# Check service logs
docker-compose logs [service-name]

# Rebuild service
docker-compose build [service-name]
```

**Performance issues:**
```bash
# Monitor resource usage
docker stats

# Check service health
curl http://localhost:8000/status/[service]
```

### Debug Mode

Enable debug logging:
```bash
# Set environment variables
export DEBUG=true
export LOG_LEVEL=debug

# Restart services
docker-compose restart
```

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
# .github/workflows/microservices.yml
name: Microservices CI/CD

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build and test services
        run: |
          cd services
          docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit
```

## 📝 Contributing

1. Follow the existing code structure for each service
2. Add comprehensive error handling
3. Include health check endpoints
4. Update this README for new features
5. Add appropriate tests

## 📜 License

MIT License - see LICENSE file for details.

---

## 🆘 Support

For issues and questions:
1. Check service logs: `docker-compose logs [service-name]`
2. Review health endpoints: `curl http://localhost:800X/health`
3. Check resource usage: `docker stats`
4. Verify network connectivity between services

**Happy coding! 🚀**