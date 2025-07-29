import { Router } from 'express';
import { logger } from '../utils/logger';

export const healthRouter = Router();

// GET /health
healthRouter.get('/', (req, res) => {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ai-platform-codegen-service',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    checks: {
      claudeSDK: !!process.env.ANTHROPIC_API_KEY,
      nodeVersion: process.version,
    },
  };

  logger.info('Health check requested', {
    status: healthStatus.status,
    uptime: healthStatus.uptime,
  });

  res.json(healthStatus);
});

// GET /health/ready
healthRouter.get('/ready', (req, res) => {
  const isReady = {
    ready: true,
    checks: {
      anthropicAPI: !!process.env.ANTHROPIC_API_KEY,
      server: true,
    },
  };

  const allChecksPass = Object.values(isReady.checks).every(Boolean);

  if (allChecksPass) {
    res.json(isReady);
  } else {
    res.status(503).json({
      ...isReady,
      ready: false,
    });
  }
});

// GET /health/live
healthRouter.get('/live', (req, res) => {
  res.json({
    alive: true,
    timestamp: new Date().toISOString(),
  });
});