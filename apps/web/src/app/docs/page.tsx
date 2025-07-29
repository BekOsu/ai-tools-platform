"use client";
import Link from "next/link";
import { 
  FiBook, 
  FiCode, 
  FiArrowLeft, 
  FiExternalLink,
  FiPlayCircle,
  FiGrid,
  FiSettings
} from "react-icons/fi";

export default function DocsPage() {
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
            <div className="p-2 bg-blue-50 rounded-lg">
              <FiBook className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-normal text-gray-900">Documentation</h1>
              <p className="text-gray-600">Coming Soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <FiBook className="w-10 h-10 text-gray-400" />
          </div>
          
          <h2 className="text-2xl font-normal text-gray-900 mb-4">
            Documentation is Coming Soon
          </h2>
          
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
            We're working on comprehensive documentation to help you get the most out of our AI tools platform. 
            In the meantime, explore our existing tools and features.
          </p>

          {/* What will be included */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="text-lg font-medium text-gray-900 mb-4">What will be included:</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Getting started guide and tutorials</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>API documentation and examples</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Code playground usage guide</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Best practices and optimization tips</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Integration examples and use cases</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Troubleshooting and FAQ</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link 
            href="/playground"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-3 mb-3">
              <FiCode className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">Try Code Playground</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Start coding with AI assistance right away. No setup required.
            </p>
            <div className="flex items-center space-x-1 text-sm text-blue-600 group-hover:text-blue-700">
              <span>Get started</span>
              <FiPlayCircle className="w-4 h-4" />
            </div>
          </Link>

          <Link 
            href="/"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-3 mb-3">
              <FiGrid className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-gray-900">Browse AI Tools</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Explore our collection of 15+ AI-powered tools and features.
            </p>
            <div className="flex items-center space-x-1 text-sm text-green-600 group-hover:text-green-700">
              <span>Explore tools</span>
              <FiExternalLink className="w-4 h-4" />
            </div>
          </Link>

          <Link 
            href="/dashboard"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-3 mb-3">
              <FiSettings className="w-5 h-5 text-purple-600" />
              <h3 className="font-medium text-gray-900">Dashboard</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Access your projects, settings, and personalized features.
            </p>
            <div className="flex items-center space-x-1 text-sm text-purple-600 group-hover:text-purple-700">
              <span>Go to dashboard</span>
              <FiExternalLink className="w-4 h-4" />
            </div>
          </Link>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-blue-50 rounded-lg p-8 text-center border border-blue-200">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Get notified when docs are ready
          </h3>
          <p className="text-gray-600 mb-6">
            Be the first to know when our comprehensive documentation goes live.
          </p>
          <div className="max-w-md mx-auto flex space-x-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Notify Me
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}