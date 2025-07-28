"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft, FiStar, FiClock, FiDollarSign, FiCheck, FiX,
  FiCode, FiPlay, FiBookOpen, FiExternalLink, FiCopy, FiZap
} from "react-icons/fi";
import { edenAITools, EdenAITool } from "@/data/edenAITools";
import { getIcon } from "@/utils/iconMapping";

export default function ToolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [tool, setTool] = useState<EdenAITool | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const toolId = params.id as string;
    const foundTool = edenAITools.find(t => t.id === toolId);
    if (foundTool) {
      setTool(foundTool);
    } else {
      router.push("/catalog");
    }
  }, [params.id, router]);

  if (!tool) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tool details...</p>
        </div>
      </div>
    );
  }

  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case "free": return "bg-green-100 text-green-800";
      case "paid": return "bg-blue-100 text-blue-800";
      case "freemium": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case "fast": return "text-green-600 bg-green-50";
      case "medium": return "text-yellow-600 bg-yellow-50";
      case "slow": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeExample = `// Example usage of ${tool.name}
import { ${tool.name.replace(/\\s+/g, '')}API } from '@edenai/api';

const api = new ${tool.name.replace(/\\s+/g, '')}API({
  apiKey: 'your-api-key'
});

async function process${tool.name.replace(/\\s+/g, '')}() {
  try {
    const result = await api.process({
      input: '${tool.inputTypes[0] === 'Text' ? 'Your text here' : 'path/to/file'}',
      options: {
        provider: '${tool.provider.split(',')[0].trim()}',
        accuracy: ${tool.accuracy}
      }
    });
    
    console.log('Result:', result);
    return result;
  } catch (error) {
    console.error('Error:', error);
  }
}

process${tool.name.replace(/\\s+/g, '')}();`;

  const tabs = [
    { id: "overview", label: "Overview", icon: <FiBookOpen className="w-4 h-4" /> },
    { id: "examples", label: "Code Examples", icon: <FiCode className="w-4 h-4" /> },
    { id: "pricing", label: "Pricing", icon: <FiDollarSign className="w-4 h-4" /> },
    { id: "docs", label: "Documentation", icon: <FiExternalLink className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
            <Link href="/catalog" className="hover:text-gray-700 transition-colors">
              AI Tools Catalog
            </Link>
            <span>/</span>
            <span className="text-gray-900">{tool.name}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start space-x-6 mb-6 lg:mb-0">
              {/* Tool Icon */}
              <div className="p-4 bg-gray-50 rounded-xl">
                {getIcon(tool.icon, tool.iconColor)}
              </div>

              {/* Tool Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{tool.name}</h1>
                  {tool.isPopular && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                      <FiStar className="w-4 h-4 mr-1" />
                      Popular
                    </span>
                  )}
                  {tool.isNew && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <FiZap className="w-4 h-4 mr-1" />
                      New
                    </span>
                  )}
                </div>
                <p className="text-lg text-gray-600 mb-4 max-w-3xl">{tool.description}</p>
                
                {/* Quick Stats */}
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">Category:</span>
                    <span className="font-medium text-gray-900">{tool.category} • {tool.subcategory}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">Accuracy:</span>
                    <span className="font-medium text-gray-900">{tool.accuracy}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">Speed:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getSpeedColor(tool.speed)}`}>
                      {tool.speed}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">Provider:</span>
                    <span className="font-medium text-gray-900">{tool.provider}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3 lg:ml-6">
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getPricingColor(tool.pricing)}`}>
                  {tool.pricing}
                </span>
              </div>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2">
                <FiPlay className="w-4 h-4" />
                <span>Try Now</span>
              </button>
              <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                View in Playground
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Features */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {tool.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                        <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Use Cases */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Use Cases</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {tool.useCases.map((useCase, index) => (
                      <div key={index} className="p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="font-medium text-gray-900">{useCase}</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Perfect for {useCase.toLowerCase()} workflows and automation.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Supported Formats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Input Types</h3>
                    <div className="flex flex-wrap gap-2">
                      {tool.inputTypes.map((type, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Output Types</h3>
                    <div className="flex flex-wrap gap-2">
                      {tool.outputTypes.map((type, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Languages (if available) */}
                {tool.languages && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Supported Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {tool.languages.map((language, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "examples" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Code Example</h3>
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm">
                      <code>{codeExample}</code>
                    </pre>
                    <button
                      onClick={() => handleCopyCode(codeExample)}
                      className="absolute top-4 right-4 p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                    >
                      {copied ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-900 mb-2">Try it in our Playground</h4>
                  <p className="text-blue-700 mb-4">
                    Test this tool with your own data in our interactive code playground.
                  </p>
                  <Link
                    href="/playground"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FiPlay className="w-4 h-4" />
                    <span>Open Playground</span>
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "pricing" && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Pricing Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Pricing Model</h4>
                        <p className="text-gray-600 capitalize">{tool.pricing}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getPricingColor(tool.pricing)}`}>
                        {tool.pricing}
                      </span>
                    </div>
                    
                    {tool.pricing === "free" && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800">
                          This tool is completely free to use with no usage limits.
                        </p>
                      </div>
                    )}
                    
                    {tool.pricing === "freemium" && (
                      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <p className="text-purple-800">
                          Free tier available with usage limits. Upgrade for unlimited access.
                        </p>
                      </div>
                    )}
                    
                    {tool.pricing === "paid" && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-800">
                          Pay-per-use pricing based on your actual consumption.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "docs" && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Documentation & Resources</h3>
                  <div className="space-y-4">
                    <Link
                      href="#"
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <FiBookOpen className="w-5 h-5 text-gray-400" />
                        <div>
                          <h4 className="font-medium text-gray-900">API Documentation</h4>
                          <p className="text-sm text-gray-600">Complete API reference and examples</p>
                        </div>
                      </div>
                      <FiExternalLink className="w-4 h-4 text-gray-400" />
                    </Link>
                    
                    <Link
                      href="#"
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <FiCode className="w-5 h-5 text-gray-400" />
                        <div>
                          <h4 className="font-medium text-gray-900">SDK & Libraries</h4>
                          <p className="text-sm text-gray-600">Client libraries for popular languages</p>
                        </div>
                      </div>
                      <FiExternalLink className="w-4 h-4 text-gray-400" />
                    </Link>
                    
                    <Link
                      href="#"
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <FiPlay className="w-5 h-5 text-gray-400" />
                        <div>
                          <h4 className="font-medium text-gray-900">Video Tutorials</h4>
                          <p className="text-sm text-gray-600">Step-by-step implementation guides</p>
                        </div>
                      </div>
                      <FiExternalLink className="w-4 h-4 text-gray-400" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Quick Info Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Info</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Accuracy</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${tool.accuracy}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{tool.accuracy}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Speed</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getSpeedColor(tool.speed)}`}>
                      {tool.speed}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Provider</span>
                    <span className="font-medium text-sm">{tool.provider.split(',')[0].trim()}</span>
                  </div>
                </div>
              </div>

              {/* Related Tools */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Related Tools</h3>
                <div className="space-y-3">
                  {edenAITools
                    .filter(t => t.category === tool.category && t.id !== tool.id)
                    .slice(0, 3)
                    .map((relatedTool) => (
                      <Link
                        key={relatedTool.id}
                        href={`/catalog/${relatedTool.id}`}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getIcon(relatedTool.icon, relatedTool.iconColor)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{relatedTool.name}</h4>
                          <p className="text-sm text-gray-600 truncate">{relatedTool.subcategory}</p>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}