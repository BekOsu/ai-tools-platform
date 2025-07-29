import { NextRequest, NextResponse } from 'next/server';
import { claudeService } from '@/lib/integrations/claude';

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

    // Route to appropriate Claude service method
    let result;
    switch (action) {
      case 'generateText':
        result = await claudeService.generateText(params);
        break;
      case 'analyzeText':
        result = await claudeService.analyzeText(params.text, params.analysisType, params.userId);
        break;
      case 'reviewCode':
        result = await claudeService.reviewCode(params.code, params.language, params.userId);
        break;
      case 'analyzeDocument':
        result = await claudeService.analyzeDocument(params.document, params.analysisType, params.userId);
        break;
      case 'generateCreativeContent':
        result = await claudeService.generateCreativeContent(
          params.type,
          params.topic,
          params.tone,
          params.length,
          params.userId
        );
        break;
      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Claude API Error:', error);
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
    status: 'Claude API endpoint is running',
    timestamp: new Date().toISOString()
  });
}