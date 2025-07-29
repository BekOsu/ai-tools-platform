'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface CodeGenJob {
  job_id: string;
  status: 'processing' | 'completed' | 'failed';
  result?: any;
  metadata: any;
}

interface CodeRequest {
  prompt: string;
  language: string;
  framework?: string;
  style?: string;
  complexity?: string;
}

export default function CodeDemoPage() {
  const [activeTab, setActiveTab] = useState('generate');
  const [loading, setLoading] = useState(false);
  const [codeJob, setCodeJob] = useState<CodeGenJob | null>(null);
  
  // Code Generation
  const [codeRequest, setCodeRequest] = useState<CodeRequest>({
    prompt: 'Create a React component that displays a user profile card with avatar, name, email, and a follow button. Include hover effects and responsive design.',
    language: 'javascript',
    framework: 'react',
    style: 'functional',
    complexity: 'intermediate'
  });

  // Code Review
  const [reviewCode, setReviewCode] = useState(`function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    if (items[i].price && items[i].quantity) {
      total = total + items[i].price * items[i].quantity;
    }
  }
  return total;
}`);

  // Code Optimization
  const [optimizeCode, setOptimizeCode] = useState(`function processUserData(users) {
  let result = [];
  for (let i = 0; i < users.length; i++) {
    let user = users[i];
    if (user.active == true) {
      let processedUser = {
        id: user.id,
        name: user.firstName + ' ' + user.lastName,
        email: user.email.toLowerCase(),
        age: new Date().getFullYear() - new Date(user.birthDate).getFullYear()
      };
      result.push(processedUser);
    }
  }
  return result;
}`);

  // Code Explanation
  const [explainCode, setExplainCode] = useState(`const fibonacci = (n) => {
  const memo = {};
  
  const fib = (num) => {
    if (num in memo) return memo[num];
    if (num <= 2) return 1;
    memo[num] = fib(num - 1) + fib(num - 2);
    return memo[num];
  };
  
  return fib(n);
};`);

  // Generate code
  const generateCode = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/code/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: codeRequest.prompt,
          language: codeRequest.language,
          framework: codeRequest.framework,
          style: codeRequest.style,
          complexity: codeRequest.complexity,
          options: {
            include_comments: true,
            include_tests: false,
            max_lines: 100
          }
        })
      });
      
      const data = await response.json();
      setCodeJob(data);
      
      if (data.job_id) {
        pollJobStatus(data.job_id);
      }
    } catch (error) {
      console.error('Code generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Review code
  const reviewCodeFunction = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/code/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: reviewCode,
          language: 'javascript',
          review_type: 'comprehensive',
          focus_areas: ['performance', 'security', 'maintainability', 'best_practices']
        })
      });
      
      const data = await response.json();
      setCodeJob(data);
      
      if (data.job_id) {
        pollJobStatus(data.job_id);
      }
    } catch (error) {
      console.error('Code review failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Optimize code
  const optimizeCodeFunction = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/code/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: optimizeCode,
          language: 'javascript',
          optimization_goals: ['performance', 'readability', 'memory_usage'],
          preserve_functionality: true
        })
      });
      
      const data = await response.json();
      setCodeJob(data);
      
      if (data.job_id) {
        pollJobStatus(data.job_id);
      }
    } catch (error) {
      console.error('Code optimization failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Explain code
  const explainCodeFunction = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/code/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: explainCode,
          language: 'javascript',
          explanation_level: 'intermediate',
          include_examples: true
        })
      });
      
      const data = await response.json();
      setCodeJob(data);
      
      if (data.job_id) {
        pollJobStatus(data.job_id);
      }
    } catch (error) {
      console.error('Code explanation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Convert code between languages
  const convertCode = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/code/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: reviewCode,
          from_language: 'javascript',
          to_language: 'python',
          preserve_structure: true,
          add_comments: true
        })
      });
      
      const data = await response.json();
      setCodeJob(data);
      
      if (data.job_id) {
        pollJobStatus(data.job_id);
      }
    } catch (error) {
      console.error('Code conversion failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Poll job status
  const pollJobStatus = async (jobId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/code/job/${jobId}`);
        const jobData = await response.json();
        setCodeJob(jobData);
        
        if (jobData.status === 'processing') {
          setTimeout(poll, 2000);
        }
      } catch (error) {
        console.error('Status check failed:', error);
      }
    };
    poll();
  };

  // Copy code to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const tabs = [
    { id: 'generate', label: 'Code Generation', icon: '⚡' },
    { id: 'review', label: 'Code Review', icon: '🔍' },
    { id: 'optimize', label: 'Optimization', icon: '🚀' },
    { id: 'explain', label: 'Code Explanation', icon: '📚' },
    { id: 'convert', label: 'Language Conversion', icon: '🔄' }
  ];

  // Sample prompts for quick testing
  const samplePrompts = [
    "Create a React component that displays a user profile card with avatar, name, email, and a follow button. Include hover effects and responsive design.",
    "Write a Python function that implements binary search with proper error handling and documentation.",
    "Create a REST API endpoint in Node.js with Express that handles user authentication using JWT tokens.",
    "Build a responsive CSS grid layout for a photo gallery with hover effects and modal popup functionality.",
    "Implement a recursive function in JavaScript that flattens a nested array of any depth."
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Code Generation Demo
        </h1>
        <p className="text-gray-600">
          Advanced code generation, review, optimization, and explanation powered by Claude AI
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Code Generation */}
      {activeTab === 'generate' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Code Generation</h2>
            
            {/* Sample prompts */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Quick samples:</p>
              <div className="space-y-2">
                {samplePrompts.map((sample, index) => (
                  <button
                    key={index}
                    onClick={() => setCodeRequest({...codeRequest, prompt: sample})}
                    className="block w-full text-left px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code Description
                </label>
                <textarea
                  value={codeRequest.prompt}
                  onChange={(e) => setCodeRequest({...codeRequest, prompt: e.target.value})}
                  placeholder="Describe what you want the code to do..."
                  className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={codeRequest.language}
                    onChange={(e) => setCodeRequest({...codeRequest, language: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="typescript">TypeScript</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Framework
                  </label>
                  <select
                    value={codeRequest.framework || ''}
                    onChange={(e) => setCodeRequest({...codeRequest, framework: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">None</option>
                    <option value="react">React</option>
                    <option value="vue">Vue.js</option>
                    <option value="angular">Angular</option>
                    <option value="express">Express.js</option>
                    <option value="django">Django</option>
                    <option value="flask">Flask</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Style
                  </label>
                  <select
                    value={codeRequest.style || ''}
                    onChange={(e) => setCodeRequest({...codeRequest, style: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="functional">Functional</option>
                    <option value="object-oriented">Object-Oriented</option>
                    <option value="procedural">Procedural</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complexity
                  </label>
                  <select
                    value={codeRequest.complexity || ''}
                    onChange={(e) => setCodeRequest({...codeRequest, complexity: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              
              <Button onClick={generateCode} disabled={loading || !codeRequest.prompt}>
                {loading ? 'Generating...' : 'Generate Code'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Code Review */}
      {activeTab === 'review' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Code Review</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code to Review
              </label>
              <textarea
                value={reviewCode}
                onChange={(e) => setReviewCode(e.target.value)}
                className="w-full h-40 p-3 font-mono text-sm border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Paste your code here for review..."
              />
            </div>
            
            <Button onClick={reviewCodeFunction} disabled={loading || !reviewCode}>
              {loading ? 'Reviewing...' : 'Review Code'}
            </Button>
          </div>
        </Card>
      )}

      {/* Code Optimization */}
      {activeTab === 'optimize' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Code Optimization</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code to Optimize
              </label>
              <textarea
                value={optimizeCode}
                onChange={(e) => setOptimizeCode(e.target.value)}
                className="w-full h-40 p-3 font-mono text-sm border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Paste your code here for optimization..."
              />
            </div>
            
            <Button onClick={optimizeCodeFunction} disabled={loading || !optimizeCode}>
              {loading ? 'Optimizing...' : 'Optimize Code'}
            </Button>
          </div>
        </Card>
      )}

      {/* Code Explanation */}
      {activeTab === 'explain' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Code Explanation</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code to Explain
              </label>
              <textarea
                value={explainCode}
                onChange={(e) => setExplainCode(e.target.value)}
                className="w-full h-40 p-3 font-mono text-sm border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Paste your code here for explanation..."
              />
            </div>
            
            <Button onClick={explainCodeFunction} disabled={loading || !explainCode}>
              {loading ? 'Explaining...' : 'Explain Code'}
            </Button>
          </div>
        </Card>
      )}

      {/* Language Conversion */}
      {activeTab === 'convert' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Language Conversion</h2>
          <p className="text-gray-600 mb-4">
            Convert code from JavaScript to Python (using the code from Review tab).
          </p>
          
          <Button onClick={convertCode} disabled={loading}>
            {loading ? 'Converting...' : 'Convert JS to Python'}
          </Button>
        </Card>
      )}

      {/* Results */}
      {codeJob && (
        <Card className="mt-6 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Results</h2>
            <div className="flex items-center gap-4">
              <div className={`w-4 h-4 rounded-full ${
                codeJob.status === 'completed' ? 'bg-green-500' :
                codeJob.status === 'processing' ? 'bg-yellow-500 animate-pulse' :
                'bg-red-500'
              }`} />
              <span className="capitalize font-medium">{codeJob.status}</span>
              <span className="text-sm text-gray-600">Job ID: {codeJob.job_id}</span>
            </div>
          </div>
          
          {codeJob.status === 'completed' && codeJob.result && (
            <div className="space-y-4">
              {/* Generated Code */}
              {codeJob.result.code && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Generated Code</h3>
                    <Button
                      onClick={() => copyToClipboard(codeJob.result.code)}
                      variant="secondary"
                      size="sm"
                    >
                      Copy Code
                    </Button>
                  </div>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{codeJob.result.code}</code>
                  </pre>
                </div>
              )}
              
              {/* Review Results */}
              {codeJob.result.review && (
                <div>
                  <h3 className="font-semibold mb-2">Code Review</h3>
                  <div className="space-y-4">
                    {codeJob.result.review.issues && (
                      <div className="bg-red-50 p-4 rounded-lg">
                        <h4 className="font-medium text-red-800 mb-2">Issues Found</h4>
                        <ul className="list-disc list-inside space-y-1 text-red-700 text-sm">
                          {codeJob.result.review.issues.map((issue: string, index: number) => (
                            <li key={index}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {codeJob.result.review.suggestions && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">Suggestions</h4>
                        <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm">
                          {codeJob.result.review.suggestions.map((suggestion: string, index: number) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {codeJob.result.review.score && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-medium text-green-800 mb-2">Overall Score</h4>
                        <div className="text-2xl font-bold text-green-600">
                          {codeJob.result.review.score}/10
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Explanation */}
              {codeJob.result.explanation && (
                <div>
                  <h3 className="font-semibold mb-2">Code Explanation</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="prose text-sm text-gray-700 whitespace-pre-wrap">
                      {codeJob.result.explanation}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Optimized Code */}
              {codeJob.result.optimized_code && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Optimized Code</h3>
                    <Button
                      onClick={() => copyToClipboard(codeJob.result.optimized_code)}
                      variant="secondary"
                      size="sm"
                    >
                      Copy Code
                    </Button>
                  </div>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{codeJob.result.optimized_code}</code>
                  </pre>
                  
                  {codeJob.result.optimizations && (
                    <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Optimizations Applied</h4>
                      <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm">
                        {codeJob.result.optimizations.map((opt: string, index: number) => (
                          <li key={index}>{opt}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {/* Converted Code */}
              {codeJob.result.converted_code && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Converted Code</h3>
                    <Button
                      onClick={() => copyToClipboard(codeJob.result.converted_code)}
                      variant="secondary"
                      size="sm"
                    >
                      Copy Code
                    </Button>
                  </div>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{codeJob.result.converted_code}</code>
                  </pre>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Service Features */}
      <Card className="mt-6 p-6">
        <h2 className="text-xl font-semibold mb-4">Service Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-purple-600 text-2xl mb-2">⚡</div>
            <h3 className="font-semibold">Code Generation</h3>
            <p className="text-sm text-gray-600">AI-powered code creation</p>
          </div>
          <div className="text-center">
            <div className="text-blue-600 text-2xl mb-2">🔍</div>
            <h3 className="font-semibold">Code Review</h3>
            <p className="text-sm text-gray-600">Automated quality analysis</p>
          </div>
          <div className="text-center">
            <div className="text-green-600 text-2xl mb-2">🚀</div>
            <h3 className="font-semibold">Optimization</h3>
            <p className="text-sm text-gray-600">Performance improvements</p>
          </div>
          <div className="text-center">
            <div className="text-orange-600 text-2xl mb-2">🔄</div>
            <h3 className="font-semibold">Multi-Language</h3>
            <p className="text-sm text-gray-600">Support for 10+ languages</p>
          </div>
        </div>
      </Card>
    </div>
  );
}