import { NextRequest, NextResponse } from 'next/server';
import { CodeGenerationRequest, CodeGenerationResponse } from '@/lib/claude-code';

const CODEGEN_SERVICE_URL = process.env.CODEGEN_SERVICE_URL || 'http://localhost:8002';

export async function POST(request: NextRequest) {
  try {
    const body: CodeGenerationRequest = await request.json();
    const { prompt, language = 'typescript', framework, context } = body;

    // Validate input
    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required', code: 'INVALID_PROMPT' },
        { status: 400 }
      );
    }

    // Call the code generation microservice
    const response = await fetch(`${CODEGEN_SERVICE_URL}/api/generate/code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        language,
        framework,
        context: context || 'playground'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Service responded with ${response.status}`);
    }

    const result = await response.json();
    
    // Transform the microservice response to match frontend interface
    const codeResponse: CodeGenerationResponse = {
      id: result.id,
      code: result.code || '',
      language: result.language,
      explanation: result.explanation || '',
      suggestions: [], // Will be populated later
      timestamp: result.timestamp
    };

    return NextResponse.json(codeResponse);
  } catch (error) {
    console.error('Code generation error:', error);
    
    // Fallback to mock response if service is unavailable
    if (error instanceof Error && error.message.includes('fetch')) {
      console.warn('Code generation service unavailable, using fallback');
      return NextResponse.json(await generateFallbackResponse(request));
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Fallback response when microservice is unavailable
async function generateFallbackResponse(request: NextRequest): Promise<CodeGenerationResponse> {
  const body: CodeGenerationRequest = await request.json();
  const { prompt, language = 'typescript' } = body;
  
  return {
    id: `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    code: `// Code generation service temporarily unavailable\n// Requested: ${prompt}\n// Language: ${language}\n\n// This is a placeholder response\nconsole.log('Generated code will appear here when service is available');`,
    language,
    explanation: `This is a fallback response. The code generation service is temporarily unavailable. Please try again later.`,
    suggestions: [
      'Check that the code generation service is running',
      'Verify the CODEGEN_SERVICE_URL environment variable',
      'Try again in a few moments'
    ],
    timestamp: Date.now()
  };
}