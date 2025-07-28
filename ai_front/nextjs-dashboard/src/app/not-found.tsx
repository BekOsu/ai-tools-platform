"use client";
import Link from "next/link";
import { 
  FiHome, 
  FiCode, 
  FiArrowLeft, 
  FiSearch,
  FiGrid,
  FiBook,
  FiSettings,
  FiHelpCircle
} from "react-icons/fi";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-lg mx-auto text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <FiSearch className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-6xl font-light text-gray-300 mb-2">404</h1>
          <h2 className="text-2xl font-normal text-gray-900 mb-4">Page not found</h2>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved. 
          Let's help you find what you're looking for.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4 mb-8">
          <Link 
            href="/"
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <FiHome className="w-5 h-5" />
            <span>Go to Homepage</span>
          </Link>
          
          <Link 
            href="/playground"
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <FiCode className="w-5 h-5" />
            <span>Try Code Playground</span>
          </Link>
        </div>

        {/* Popular Pages */}
        <div className="text-left">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Popular pages</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link 
              href="/"
              className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
            >
              <FiGrid className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">AI Tools</span>
            </Link>
            
            <Link 
              href="/playground"
              className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
            >
              <FiCode className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">Playground</span>
            </Link>
            
            <Link 
              href="/dashboard"
              className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
            >
              <FiSettings className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">Dashboard</span>
            </Link>
            
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm opacity-60">
              <FiBook className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">Docs (Soon)</span>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 transition-colors mx-auto"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Go back to previous page</span>
          </button>
        </div>

        {/* Help Link */}
        <div className="mt-6">
          <p className="text-xs text-gray-500">
            Still having trouble? 
            <Link href="/" className="text-blue-600 hover:text-blue-700 ml-1 inline-flex items-center">
              Contact support
              <FiHelpCircle className="w-3 h-3 ml-1" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}