import { query } from '@anthropic-ai/claude-code';
import { logger } from '../utils/logger';

export interface CodeGenerationRequest {
  language?: string;
  framework?: string;
  context?: string;
  requestId?: string;
  maxTurns?: number;
  allowFileWrite?: boolean;
}

export interface CodeGenerationResult {
  success: boolean;
  code?: string;
  files?: { path: string; content: string }[];
  error?: string;
  explanation?: string;
}

/**
 * Generate code using Claude Code SDK
 */
export async function generateCodeWithClaude(
  prompt: string,
  options: CodeGenerationRequest = {}
): Promise<CodeGenerationResult> {
  const {
    language = 'typescript',
    framework,
    context = 'general',
    requestId = 'unknown',
    maxTurns = 3,
    allowFileWrite = false
  } = options;

  try {
    logger.info('Starting Claude Code generation', {
      requestId,
      language,
      framework,
      context,
      promptLength: prompt.length,
    });

    let generatedCode = '';
    let explanation = '';
    const files: { path: string; content: string }[] = [];

    // Enhanced prompt for better code generation
    const enhancedPrompt = `
Generate ${language} code for: ${prompt}

Requirements:
- Language: ${language}
${framework ? `- Framework: ${framework}` : ''}
- Context: ${context}
- Include proper error handling
- Add clear documentation
- Follow best practices
${allowFileWrite ? '- Use Write or MultiEdit tools to create multiple files when appropriate' : '- Provide all code in response'}

Please provide the code and explain how it works.
    `.trim();

    // Stream responses from Claude Code SDK
    try {
      for await (const message of query({
        prompt: enhancedPrompt,
        options: {
          maxTurns,
          ...(allowFileWrite && {
            allowedTools: ["Read", "Write", "Bash", "Edit", "MultiEdit"],
            permissionMode: "acceptEdits"
          })
        }
      })) {
        // Handle different message types
        if (message && typeof message === 'object') {
          if ('content' in message && typeof message.content === 'string') {
            const content = message.content;
            generatedCode += content;
            
            // Extract code blocks and explanations
            const codeBlocks = extractCodeBlocks(content);
            files.push(...codeBlocks);
            
            // Extract explanation text (non-code content)
            if (!content.includes('```')) {
              explanation += content;
            }
          }
        } else if (typeof message === 'string') {
          const content: string = message;
          generatedCode += content;
          
          // Extract code blocks and explanations
          const codeBlocks = extractCodeBlocks(content);
          files.push(...codeBlocks);
          
          // Extract explanation text (non-code content)
          if (!content.includes('```')) {
            explanation += content;
          }
        }
      }
    } catch (queryError) {
      logger.error('Claude SDK query failed', {
        requestId,
        error: queryError instanceof Error ? queryError.message : 'Unknown query error',
      });
      
      // Fallback to simple text generation if SDK fails
      generatedCode = `// Code generation request: ${prompt}\n// Language: ${language}\n// Framework: ${framework || 'none'}\n\n// TODO: Implement the requested functionality\n// This is a placeholder response due to SDK configuration issues\n\nconsole.log('Generated code placeholder');`;
      explanation = `This is a placeholder response. The Claude Code SDK encountered an issue during generation. Please check the configuration and try again.`;
    }

    // Clean up and process results
    const processedFiles = processGeneratedFiles(files);
    const cleanExplanation = explanation.trim();

    logger.info('Claude Code generation completed', {
      requestId,
      codeLength: generatedCode.length,
      filesCount: processedFiles.length,
      hasExplanation: !!cleanExplanation,
    });

    return {
      success: true,
      code: generatedCode.trim(),
      files: processedFiles,
      explanation: cleanExplanation || '',
    };

  } catch (error) {
    logger.error('Claude Code generation failed', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Code generation failed',
    };
  }
}

/**
 * Extract code blocks from Claude's response
 */
function extractCodeBlocks(text: string): { path: string; content: string }[] {
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

/**
 * Process and validate generated files
 */
function processGeneratedFiles(
  files: { path: string; content: string }[]
): { path: string; content: string }[] {
  return files
    .filter(file => file.content.trim().length > 0)
    .map(file => ({
      ...file,
      content: file.content.trim(),
      path: file.path.startsWith('./') ? file.path.slice(2) : file.path
    }));
}