import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { generateCodeWithClaude } from '../services/claudeService';
import { logger } from '../utils/logger';

export const codeGenerationRouter = Router();

// Validation middleware
const validateCodeRequest = [
  body('prompt')
    .isString()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Prompt must be between 10 and 5000 characters'),
  body('language')
    .optional()
    .isString()
    .isIn(['typescript', 'javascript', 'python', 'rust', 'go', 'java', 'cpp', 'html', 'css'])
    .withMessage('Invalid language specified'),
  body('framework')
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage('Framework name too long'),
  body('context')
    .optional()
    .isString()
    .isLength({ max: 200 })
    .withMessage('Context too long'),
];

// POST /api/generate/code
codeGenerationRouter.post('/code', validateCodeRequest, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        error: 'Validation Error',
        details: errors.array(),
      });
      return;
    }

    const { prompt, language = 'typescript', framework, context } = req.body;
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    logger.info('Code generation request started', {
      requestId,
      language,
      framework,
      promptLength: prompt.length,
    });

    // Generate code using Claude SDK
    const result = await generateCodeWithClaude(prompt, {
      language,
      framework,
      context,
      requestId,
    });

    if (!result.success) {
      logger.error('Code generation failed', {
        requestId,
        error: result.error,
      });
      res.status(500).json({
        error: 'Code Generation Failed',
        message: result.error,
        requestId,
      });
      return;
    }

    logger.info('Code generation completed successfully', {
      requestId,
      codeLength: result.code?.length || 0,
      filesCount: result.files?.length || 0,
    });

    res.json({
      id: requestId,
      code: result.code,
      language,
      explanation: result.explanation,
      files: result.files,
      timestamp: Date.now(),
    });

  } catch (error) {
    logger.error('Unexpected error in code generation', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    next(error);
  }
});

// POST /api/generate/improve
codeGenerationRouter.post('/improve', [
  body('code')
    .isString()
    .isLength({ min: 10, max: 50000 })
    .withMessage('Code must be between 10 and 50000 characters'),
  body('instructions')
    .isString()
    .isLength({ min: 5, max: 1000 })
    .withMessage('Instructions must be between 5 and 1000 characters'),
  body('language')
    .optional()
    .isString(),
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        error: 'Validation Error',
        details: errors.array(),
      });
      return;
    }

    const { code, instructions, language } = req.body;
    const requestId = `improve_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    logger.info('Code improvement request started', {
      requestId,
      language,
      codeLength: code.length,
    });

    const improvedPrompt = `Improve the following ${language || 'code'} based on these instructions: ${instructions}\n\nOriginal Code:\n${code}`;

    const result = await generateCodeWithClaude(improvedPrompt, {
      language,
      context: 'code_improvement',
      requestId,
    });

    if (!result.success) {
      res.status(500).json({
        error: 'Code Improvement Failed',
        message: result.error,
        requestId,
      });
      return;
    }

    res.json({
      id: requestId,
      originalCode: code,
      improvedCode: result.code,
      language,
      explanation: result.explanation,
      timestamp: Date.now(),
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/generate/explain
codeGenerationRouter.post('/explain', [
  body('code')
    .isString()
    .isLength({ min: 5, max: 20000 })
    .withMessage('Code must be between 5 and 20000 characters'),
  body('language')
    .optional()
    .isString(),
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        error: 'Validation Error',
        details: errors.array(),
      });
      return;
    }

    const { code, language } = req.body;
    const requestId = `explain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const explainPrompt = `Analyze and explain the following ${language || 'code'} in detail. Provide a clear explanation of what it does, how it works, and any potential improvements:\n\n${code}`;

    const result = await generateCodeWithClaude(explainPrompt, {
      language,
      context: 'code_explanation',
      requestId,
    });

    if (!result.success) {
      res.status(500).json({
        error: 'Code Explanation Failed',
        message: result.error,
        requestId,
      });
      return;
    }

    res.json({
      id: requestId,
      code,
      explanation: result.explanation || result.code,
      language,
      timestamp: Date.now(),
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/generate/templates
codeGenerationRouter.get('/templates', (req, res) => {
  const templates = {
    react_component: {
      name: "React Component",
      description: "Generate a React functional component",
      variables: ["componentName", "description"],
      language: "typescript",
    },
    api_endpoint: {
      name: "API Endpoint",
      description: "Generate an API endpoint",
      variables: ["method", "resource", "description"],
      language: "typescript",
    },
    database_model: {
      name: "Database Model",
      description: "Generate a database model",
      variables: ["modelName", "fields"],
      language: "typescript",
    },
    utility_function: {
      name: "Utility Function",
      description: "Generate a utility function",
      variables: ["description"],
      language: "typescript",
    },
  };

  res.json({ templates });
});

// GET /api/generate/languages
codeGenerationRouter.get('/languages', (req, res) => {
  const languages = {
    typescript: { name: "TypeScript", extension: ".ts" },
    javascript: { name: "JavaScript", extension: ".js" },
    python: { name: "Python", extension: ".py" },
    rust: { name: "Rust", extension: ".rs" },
    go: { name: "Go", extension: ".go" },
    java: { name: "Java", extension: ".java" },
    cpp: { name: "C++", extension: ".cpp" },
    html: { name: "HTML", extension: ".html" },
    css: { name: "CSS", extension: ".css" },
  };

  res.json({ languages });
});