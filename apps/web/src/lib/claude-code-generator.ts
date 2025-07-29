// This file is for server-side use only - the frontend calls the microservice API instead

interface CodeGenerationResult {
  success: boolean;
  code?: string;
  files?: { path: string; content: string }[];
  error?: string;
  explanation?: string;
}

/**
 * Generate code using Claude Code SDK with automatic file permissions
 * Note: This is a placeholder for frontend builds. Use the microservice API instead.
 */
export async function generateCodeWithClaude(
  prompt: string,
  options?: {
    workspaceDir?: string;
    maxTurns?: number;
    allowFileWrite?: boolean;
    language?: string;
  }
): Promise<CodeGenerationResult> {
  // This function is for demonstration purposes only in the frontend
  // The actual implementation is in the Node.js microservice
  
  console.warn('Claude Code SDK should not be used directly in the frontend. Use the microservice API instead.');
  
  return {
    success: false,
    error: 'Claude Code SDK is not available in the frontend. Use the microservice API.'
  };
}

/**
 * Quick code generation function - placeholder for frontend
 */
export async function quickGenerate(prompt: string): Promise<string> {
  console.warn('Use the microservice API for code generation in production');
  return `// Generated code placeholder for: ${prompt}`;
}

/**
 * Generate code in specific language - placeholder for frontend
 */
export async function generateInLanguage(prompt: string, language: string): Promise<string> {
  console.warn('Use the microservice API for code generation in production');
  return `// ${language} code placeholder for: ${prompt}`;
}

/**
 * Extract code blocks from text
 */
export function extractCodeBlocks(text: string): { path: string; content: string }[] {
  const files: { path: string; content: string }[] = [];
  
  // Regex to match code blocks with optional file paths
  const fileBlockRegex = /```(\w+)?\s*(?:\/\/\s*(.+?\.[\w]+))?\n([\s\S]*?)```/g;
  
  let match;
  let fileIndex = 0;
  
  while ((match = fileBlockRegex.exec(text)) !== null) {
    const language = match[1] || 'text';
    const suggestedPath = match[2];
    const code = match[3]?.trim();
    
    if (!code) continue;
    
    // Generate file path if not provided
    let filePath = suggestedPath;
    if (!filePath) {
      const extension = getFileExtension(language);
      filePath = `generated-${fileIndex}${extension}`;
      fileIndex++;
    }
    
    files.push({
      path: filePath,
      content: code
    });
  }
  
  return files;
}

/**
 * Get file extension for programming language
 */
function getFileExtension(language: string): string {
  const extensions: Record<string, string> = {
    typescript: '.ts',
    javascript: '.js',
    python: '.py',
    rust: '.rs',
    go: '.go',
    java: '.java',
    csharp: '.cs',
    cpp: '.cpp',
    html: '.html',
    css: '.css',
    sql: '.sql',
    yaml: '.yaml',
    json: '.json',
    markdown: '.md',
    tsx: '.tsx',
    jsx: '.jsx',
    bash: '.sh',
    shell: '.sh',
  };
  
  return extensions[language.toLowerCase()] || '.txt';
}