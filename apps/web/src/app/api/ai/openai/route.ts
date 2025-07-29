import { NextRequest, NextResponse } from 'next/server';
import { openaiService } from '@/lib/integrations/openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    // Validate required fields
    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      );
    }

    // Route to appropriate OpenAI service method
    let result;
    switch (action) {
      case 'generateText':
        result = await openaiService.generateText(params);
        break;
      case 'generateImage':
        result = await openaiService.generateImage(params);
        break;
      case 'generateCode':
        result = await openaiService.generateCode(params.prompt, params.language, params.userId);
        break;
      case 'summarizeText':
        result = await openaiService.summarizeText(params.text, params.maxLength, params.userId);
        break;
      case 'analyzeSentiment':
        result = await openaiService.analyzeSentiment(params.text, params.userId);
        break;
      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'OpenAI API endpoint is running',
    timestamp: new Date().toISOString()
  });
}