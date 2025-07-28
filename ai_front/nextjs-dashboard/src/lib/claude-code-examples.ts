import { generateCodeWithClaude, quickGenerate, generateInLanguage } from './claude-code-generator';

/**
 * Example usage of Claude Code SDK integration
 */

// Example 1: Simple code generation
export async function example1() {
  try {
    const code = await quickGenerate("Create a TypeScript function that validates email addresses");
    console.log('Generated code:', code);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example 2: Complex project generation
export async function example2() {
  try {
    const result = await generateCodeWithClaude(
      "Create a REST API for a todo application with CRUD operations, using Express.js and TypeScript",
      {
        language: 'typescript',
        maxTurns: 3,
        allowFileWrite: true,
        workspaceDir: './generated-projects'
      }
    );
    
    if (result.success) {
      console.log('Generated files:', result.files);
      console.log('Explanation:', result.explanation);
    } else {
      console.error('Generation failed:', result.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example 3: React component generation
export async function example3() {
  try {
    const result = await generateInLanguage(
      "Create a React component for a user profile card with avatar, name, email, and edit functionality",
      'tsx'
    );
    
    console.log('React component generated:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example 4: Python script generation
export async function example4() {
  try {
    const result = await generateCodeWithClaude(
      "Create a Python script that scrapes weather data from an API and saves it to a CSV file",
      {
        language: 'python',
        maxTurns: 2
      }
    );
    
    console.log('Python script:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Environment setup for Claude Code SDK
export function setupClaudeCodeEnvironment() {
  // Ensure API key is set
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('ANTHROPIC_API_KEY not found in environment variables');
    console.log('Please set your API key: export ANTHROPIC_API_KEY=your_key_here');
  }
  
  // Check workspace permissions
  try {
    // Note: This would require fs module in Node.js environment
    console.log('✅ Workspace permissions check skipped in browser environment');
  } catch (error) {
    console.error('❌ Workspace write permission error:', error);
  }
}

// Run examples
export async function runAllExamples() {
  console.log('🚀 Starting Claude Code SDK examples...\n');
  
  setupClaudeCodeEnvironment();
  
  console.log('Example 1: Simple code generation');
  await example1();
  
  console.log('\nExample 2: Complex project generation');
  await example2();
  
  console.log('\nExample 3: React component generation');
  await example3();
  
  console.log('\nExample 4: Python script generation');
  await example4();
  
  console.log('\n✅ All examples completed!');
}