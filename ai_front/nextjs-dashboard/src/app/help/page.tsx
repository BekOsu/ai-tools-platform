"use client";
import Link from "next/link";
import { 
  FiHelpCircle, 
  FiArrowLeft, 
  FiMessageCircle,
  FiMail,
  FiBook,
  FiPlayCircle,
  FiChevronRight,
  FiSearch
} from "react-icons/fi";

export default function HelpPage() {
  const faqs = [
    {
      question: "How do I get started with the AI Code Playground?",
      answer: "Simply visit the playground page, select your programming language, and start typing your code prompt. The AI will help generate, explain, and optimize your code in real-time."
    },
    {
      question: "What programming languages are supported?",
      answer: "We currently support JavaScript, TypeScript, Python, React, and more. We're continuously adding support for additional languages and frameworks."
    },
    {
      question: "Is there an API available for integration?",
      answer: "Yes! We're building comprehensive API access for all our AI tools. Check our API documentation page for the latest updates and examples."
    },
    {
      question: "How accurate are the AI-generated code suggestions?",
      answer: "Our AI models are trained on high-quality code repositories and provide accurate, production-ready suggestions. Always review and test generated code before using in production."
    },
    {
      question: "Can I save and share my code projects?",
      answer: "Save and share functionality is coming soon! You'll be able to create projects, save your work, and collaborate with others."
    }
  ];

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
            <div className="p-2 bg-purple-50 rounded-lg">
              <FiHelpCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-normal text-gray-900">Help Center</h1>
              <p className="text-gray-600">Find answers and get support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Search */}
        <div className="mb-12">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <FiSearch className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for help topics, features, or questions..."
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Quick Help Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link 
            href="/playground"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-3 mb-3">
              <FiPlayCircle className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">Getting Started</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              New to our platform? Start with the code playground to see AI in action.
            </p>
            <div className="flex items-center space-x-1 text-sm text-blue-600 group-hover:text-blue-700">
              <span>Try playground</span>
              <FiChevronRight className="w-4 h-4" />
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
              Comprehensive guides and tutorials for all our AI tools and features.
            </p>
            <div className="flex items-center space-x-1 text-sm text-green-600 group-hover:text-green-700">
              <span>View docs</span>
              <FiChevronRight className="w-4 h-4" />
            </div>
          </Link>

          <Link 
            href="/api"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-3 mb-3">
              <FiMessageCircle className="w-5 h-5 text-purple-600" />
              <h3 className="font-medium text-gray-900">API Reference</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Technical documentation for integrating our APIs into your applications.
            </p>
            <div className="flex items-center space-x-1 text-sm text-purple-600 group-hover:text-purple-700">
              <span>View API docs</span>
              <FiChevronRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-normal text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="bg-white border border-gray-200 rounded-lg">
                <summary className="p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">{faq.question}</h3>
                    <FiChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
                  </div>
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-blue-50 rounded-lg p-8 border border-blue-200">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <FiMail className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-3">
              Still need help?
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Can't find what you're looking for? Our support team is here to help you get the most out of our AI tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link 
                href="mailto:support@aitools.com"
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <FiMail className="w-5 h-5" />
                <span>Email Support</span>
              </Link>
              <Link 
                href="/"
                className="flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <FiMessageCircle className="w-5 h-5" />
                <span>Live Chat</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Popular Topics */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Help Topics</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "Setting up your first AI project",
              "Understanding code generation quality",
              "Best practices for prompt engineering",
              "Integrating APIs into your workflow",
              "Troubleshooting common issues",
              "Account settings and preferences"
            ].map((topic, index) => (
              <Link 
                key={index}
                href="#"
                className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
              >
                <FiChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{topic}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}