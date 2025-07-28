// Claude Code SDK integration for AI platform

export interface CodeGenerationRequest {
  prompt: string;
  language?: string;
  framework?: string;
  context?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface CodeGenerationResponse {
  id: string;
  code: string;
  language: string;
  explanation?: string;
  suggestions?: string[];
  timestamp: number;
}

export interface CodeGenerationErrorInterface {
  message: string;
  code: string;
  details?: any;
}

// Supported languages with Monaco editor configurations
export const SUPPORTED_LANGUAGES = [
  { id: "typescript", name: "TypeScript", extension: "ts", monacoId: "typescript" },
  { id: "javascript", name: "JavaScript", extension: "js", monacoId: "javascript" },
  { id: "python", name: "Python", extension: "py", monacoId: "python" },
  { id: "react", name: "React (TSX)", extension: "tsx", monacoId: "typescript" },
  { id: "vue", name: "Vue.js", extension: "vue", monacoId: "html" },
  { id: "angular", name: "Angular", extension: "ts", monacoId: "typescript" },
  { id: "nodejs", name: "Node.js", extension: "js", monacoId: "javascript" },
  { id: "html", name: "HTML", extension: "html", monacoId: "html" },
  { id: "css", name: "CSS", extension: "css", monacoId: "css" },
  { id: "json", name: "JSON", extension: "json", monacoId: "json" },
  { id: "yaml", name: "YAML", extension: "yaml", monacoId: "yaml" },
  { id: "sql", name: "SQL", extension: "sql", monacoId: "sql" },
  { id: "bash", name: "Bash/Shell", extension: "sh", monacoId: "shell" },
  { id: "docker", name: "Dockerfile", extension: "dockerfile", monacoId: "dockerfile" },
  { id: "go", name: "Go", extension: "go", monacoId: "go" },
  { id: "rust", name: "Rust", extension: "rs", monacoId: "rust" },
  { id: "java", name: "Java", extension: "java", monacoId: "java" },
  { id: "csharp", name: "C#", extension: "cs", monacoId: "csharp" },
  { id: "php", name: "PHP", extension: "php", monacoId: "php" },
  { id: "ruby", name: "Ruby", extension: "rb", monacoId: "ruby" },
  { id: "kotlin", name: "Kotlin", extension: "kt", monacoId: "kotlin" },
  { id: "swift", name: "Swift", extension: "swift", monacoId: "swift" },
  { id: "markdown", name: "Markdown", extension: "md", monacoId: "markdown" }
];

// Code generation templates for common scenarios
export const CODE_TEMPLATES = {
  react_component: {
    name: "React Component",
    description: "Generate a React functional component",
    prompt: "Create a React functional component named {componentName} that {description}. Use TypeScript and modern React patterns.",
    language: "typescript",
    framework: "react"
  },
  api_endpoint: {
    name: "API Endpoint",
    description: "Generate an API endpoint",
    prompt: "Create a {method} API endpoint for {resource} that {description}. Include proper error handling and validation.",
    language: "typescript",
    framework: "nodejs"
  },
  database_model: {
    name: "Database Model",
    description: "Generate a database model",
    prompt: "Create a database model for {modelName} with the following fields: {fields}. Include validation and relationships.",
    language: "typescript",
    framework: "prisma"
  },
  utility_function: {
    name: "Utility Function",
    description: "Generate a utility function",
    prompt: "Create a utility function that {description}. Make it type-safe and include error handling.",
    language: "typescript",
    framework: "none"
  },
  test_suite: {
    name: "Test Suite",
    description: "Generate test cases",
    prompt: "Create comprehensive tests for {target} that cover {testCases}. Use modern testing practices.",
    language: "typescript",
    framework: "jest"
  }
};

// Language configurations object (for backward compatibility)
export const LANGUAGE_CONFIG = {
  typescript: { name: "TypeScript", extension: ".ts", monaco: "typescript" },
  javascript: { name: "JavaScript", extension: ".js", monaco: "javascript" },
  python: { name: "Python", extension: ".py", monaco: "python" },
  rust: { name: "Rust", extension: ".rs", monaco: "rust" },
  go: { name: "Go", extension: ".go", monaco: "go" },
  java: { name: "Java", extension: ".java", monaco: "java" },
  csharp: { name: "C#", extension: ".cs", monaco: "csharp" },
  cpp: { name: "C++", extension: ".cpp", monaco: "cpp" },
  html: { name: "HTML", extension: ".html", monaco: "html" },
  css: { name: "CSS", extension: ".css", monaco: "css" },
  sql: { name: "SQL", extension: ".sql", monaco: "sql" },
  yaml: { name: "YAML", extension: ".yaml", monaco: "yaml" },
  json: { name: "JSON", extension: ".json", monaco: "json" },
  markdown: { name: "Markdown", extension: ".md", monaco: "markdown" }
};

// Code generation client class
export class ClaudeCodeClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY || '';
    this.baseUrl = baseUrl || '/api/code-generation';
  }

  async generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new CodeGenerationError(
          error.message || 'Code generation failed',
          error.code || 'GENERATION_ERROR',
          error
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof CodeGenerationError) {
        throw error;
      }
      throw new CodeGenerationError(
        'Network error occurred',
        'NETWORK_ERROR',
        error
      );
    }
  }

  async improveCode(code: string, instructions: string, language?: string): Promise<CodeGenerationResponse> {
    return this.generateCode({
      prompt: `Improve the following ${language || 'code'} based on these instructions: ${instructions}\n\nCode:\n${code}`,
      language,
      context: 'code_improvement'
    });
  }

  async explainCode(code: string, language?: string): Promise<{ explanation: string; suggestions: string[] }> {
    const response = await this.generateCode({
      prompt: `Explain the following ${language || 'code'} in detail. Provide a clear explanation and suggest potential improvements:\n\nCode:\n${code}`,
      language,
      context: 'code_explanation'
    });

    return {
      explanation: response.explanation || '',
      suggestions: response.suggestions || []
    };
  }

  async generateTests(code: string, language?: string, framework?: string): Promise<CodeGenerationResponse> {
    return this.generateCode({
      prompt: `Generate comprehensive tests for the following ${language || 'code'}. Use ${framework || 'appropriate testing framework'}:\n\nCode:\n${code}`,
      language,
      framework,
      context: 'test_generation'
    });
  }

  async refactorCode(code: string, refactorType: string, language?: string): Promise<CodeGenerationResponse> {
    return this.generateCode({
      prompt: `Refactor the following ${language || 'code'} to ${refactorType}. Maintain functionality while improving code quality:\n\nCode:\n${code}`,
      language,
      context: 'code_refactoring'
    });
  }

  async generateFromTemplate(
    templateKey: keyof typeof CODE_TEMPLATES,
    variables: Record<string, string>
  ): Promise<CodeGenerationResponse> {
    const template = CODE_TEMPLATES[templateKey];
    if (!template) {
      throw new CodeGenerationError(
        `Template '${templateKey}' not found`,
        'TEMPLATE_NOT_FOUND'
      );
    }

    let prompt = template.prompt;
    Object.entries(variables).forEach(([key, value]) => {
      prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), value);
    });

    return this.generateCode({
      prompt,
      language: template.language,
      framework: template.framework
    });
  }
}

// Singleton instance
export const claudeCodeClient = new ClaudeCodeClient();

// Utility functions
export function detectLanguage(code: string): string {
  // Simple language detection based on patterns
  if (code.includes('import React') || code.includes('export default')) return 'typescript';
  if (code.includes('def ') || code.includes('import ')) return 'python';
  if (code.includes('func ') || code.includes('package ')) return 'go';
  if (code.includes('fn ') || code.includes('use ')) return 'rust';
  if (code.includes('public class') || code.includes('import java')) return 'java';
  if (code.includes('SELECT') || code.includes('INSERT')) return 'sql';
  if (code.includes('<html') || code.includes('<!DOCTYPE')) return 'html';
  if (code.includes('{') && code.includes('}')) return 'json';
  
  return 'typescript'; // Default
}

export function formatCode(code: string, language: string): string {
  // Basic code formatting - in production, use a proper formatter
  return code.trim();
}

export function extractCodeBlocks(text: string): { code: string; language: string }[] {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const blocks: { code: string; language: string }[] = [];
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    blocks.push({
      language: match[1] || 'text',
      code: match[2].trim()
    });
  }

  return blocks;
}

export class CodeGenerationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'CodeGenerationError';
  }
}