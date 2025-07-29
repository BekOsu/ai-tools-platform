"use client";
import { useState } from 'react';

export default function DemoPage() {
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const runDemo = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/code-generation/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Create a hello world program',
          language: 'javascript',
          context: 'demo'
        })
      });
      const data = await res.json();
      setCode(data.code || JSON.stringify(data));
    } catch (err) {
      setCode('Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-bold">AI Services Demo</h1>
      <p className="text-gray-600">This page calls the code generation service using a sample prompt.</p>
      <button onClick={runDemo} className="px-4 py-2 bg-blue-600 text-white rounded-md">
        Run Demo
      </button>
      {loading && <p className="text-sm text-gray-500">Generating...</p>}
      {code && (
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm whitespace-pre-wrap">
{code}
        </pre>
      )}
    </div>
  );
}
