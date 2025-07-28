"use client";
import Link from "next/link";
import { 
  FiCode, 
  FiArrowLeft, 
  FiExternalLink,
  FiBook,
  FiPlayCircle,
  FiKey,
  FiServer,
  FiGitBranch
} from "react-icons/fi";

export default function APIPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center space-x-4 mb-4">
            <Link 
              href="/"
              className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>Back to AI Tools</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <FiCode className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-normal text-gray-900">API Reference</h1>
              <p className="text-gray-600">REST API documentation and examples</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <FiServer className="w-10 h-10 text-gray-400" />
          </div>
          
          <h2 className="text-2xl font-normal text-gray-900 mb-4">
            API Documentation Coming Soon
          </h2>
          
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
            We're building comprehensive API documentation to help you integrate our AI tools into your applications. 
            For now, you can try our Code Playground which uses our internal APIs.
          </p>
        </div>

        {/* API Overview */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FiKey className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900">Authentication</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Secure API access with API keys and OAuth 2.0 support for enterprise applications.
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <code className="text-sm text-gray-800">
                Authorization: Bearer your_api_key_here
              </code>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FiGitBranch className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-medium text-gray-900">Endpoints</h3>
            </div>
            <p className="text-gray-600 mb-4">
              RESTful API endpoints for code generation, analysis, and all AI tool functionalities.
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <code className="text-sm text-gray-800">
                POST /api/v1/code/generate
              </code>
            </div>
          </div>
        </div>

        {/* Available Services */}
        <div className="mb-12">
          <h3 className="text-xl font-medium text-gray-900 mb-6">Available Services</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: "Code Generation", status: "Active", color: "green" },
              { name: "Text Analysis", status: "Coming Soon", color: "yellow" },
              { name: "Image Processing", status: "Coming Soon", color: "yellow" },
              { name: "Audio Transcription", status: "Coming Soon", color: "yellow" },
              { name: "Trading Analysis", status: "Coming Soon", color: "yellow" },
              { name: "Document Processing", status: "Coming Soon", color: "yellow" }
            ].map((service, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{service.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    service.color === 'green' 
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  }`}>
                    {service.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {service.status === 'Active' 
                    ? 'Ready for integration and testing'
                    : 'In development - coming soon'
                  }
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link 
            href="/playground"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-3 mb-3">
              <FiPlayCircle className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">Try API Live</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Test our code generation API directly in the playground environment.
            </p>
            <div className="flex items-center space-x-1 text-sm text-blue-600 group-hover:text-blue-700">
              <span>Open playground</span>
              <FiExternalLink className="w-4 h-4" />
            </div>
          </Link>

          <Link 
            href="/docs"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-3 mb-3">
              <FiBook className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-gray-900">Documentation</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Complete guides, tutorials, and examples for all our APIs.
            </p>
            <div className="flex items-center space-x-1 text-sm text-green-600 group-hover:text-green-700">
              <span>View docs</span>
              <FiExternalLink className="w-4 h-4" />
            </div>
          </Link>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 opacity-75">
            <div className="flex items-center space-x-3 mb-3">
              <FiKey className="w-5 h-5 text-gray-400" />
              <h3 className="font-medium text-gray-600">API Keys</h3>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Manage your API keys and access tokens for secure integration.
            </p>
            <div className="flex items-center space-x-1 text-sm text-gray-400">
              <span>Coming soon</span>
            </div>
          </div>
        </div>

        {/* Sample Code */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sample Code</h3>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-300">
{`// Example: Generate code with AI
const response = await fetch('/api/v1/code/generate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your_api_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: 'Create a React component for a login form',
    language: 'typescript',
    framework: 'react'
  })
});

const { code, explanation } = await response.json();
console.log(code);`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}