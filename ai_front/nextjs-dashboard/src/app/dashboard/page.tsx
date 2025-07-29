"use client";
import { useAuth } from "@/contexts/AuthContext";
// import { useAIFeatures } from "@/hooks/useApi";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useEffect, useState } from "react";
import { FiTrendingUp, FiUsers, FiStar, FiActivity, FiClock, FiHeart, FiCode, FiImage } from "react-icons/fi";
import UsageAnalytics from "@/components/UsageAnalytics";
import BillingSummary from "@/components/BillingSummary";

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  // const { data: aiFeatures, loading: featuresLoading } = useAIFeatures();

  if (authLoading) {
    return <LoadingSpinner size="lg" text="Loading dashboard..." />;
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">Please log in to access your dashboard.</p>
      </div>
    );
  }

  // Mock data for demonstration
  const stats = [
    { 
      label: "AI Tools Used", 
      value: "12", 
      change: "+23%", 
      icon: <FiActivity className="w-5 h-5" />,
      color: "bg-blue-500"
    },
    { 
      label: "Hours Saved", 
      value: "48", 
      change: "+15%", 
      icon: <FiClock className="w-5 h-5" />,
      color: "bg-green-500"
    },
    { 
      label: "Favorite Tools", 
      value: "5", 
      change: "+2", 
      icon: <FiHeart className="w-5 h-5" />,
      color: "bg-red-500"
    },
    {
      label: "Credits Left",
      value: `$${user.credits ?? 0}`,
      change: "",
      icon: <FiTrendingUp className="w-5 h-5" />,
      color: "bg-purple-500"
    },
  ];

  const recentActivity = [
    { tool: "AI Resume Booster", action: "Generated resume", time: "2 hours ago", status: "completed" },
    { tool: "Social Media Manager", action: "Created 5 posts", time: "4 hours ago", status: "completed" },
    { tool: "Study Helper", action: "Solved math problems", time: "1 day ago", status: "completed" },
    { tool: "Voice Synthesis", action: "Generated audio", time: "2 days ago", status: "failed" },
  ];

  const [featuredTools, setFeaturedTools] = useState<any[]>([
    {
      id: "code-playground",
      name: "AI Code Playground",
      description: "Generate code with Claude AI",
      badge: "Active",
      color: "bg-green-50 text-green-700 border-green-200",
      link: "/playground",
      implemented: true,
    },
  ]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        const products = Array.isArray(data) ? data : data.products
        if (products && products.length > 0) {
          const tools = products.map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            badge: 'Active',
            color: 'bg-green-50 text-green-700 border-green-200',
            link: p.url || '#',
            implemented: true,
          }))
          setFeaturedTools(tools)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="space-y-8">
      {/* Welcome Header - GCP Style */}
      <div className="bg-white border border-gray-300 rounded-md p-6">
        <h1 className="text-xl font-normal text-gray-900 mb-2">
          Welcome back, {user.name}
        </h1>
        <p className="text-gray-600 text-sm">
          Here&apos;s an overview of your AI tools usage and activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-4 rounded-md border border-gray-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">{stat.label}</p>
                <p className="text-xl font-normal text-gray-900 mt-1">{stat.value}</p>
                <p className={`text-xs mt-1 ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change} from last week
                </p>
              </div>
              <div className="p-2 rounded bg-gray-50 text-gray-600">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity - GCP Style */}
        <div className="bg-white rounded-md border border-gray-300">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-sm font-medium text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 py-2">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{activity.tool}</p>
                    <p className="text-xs text-gray-600">{activity.action}</p>
                  </div>
                  <div className="text-xs text-gray-500 whitespace-nowrap">{activity.time}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200">
              <button className="w-full text-center text-xs text-blue-600 hover:text-blue-700 font-medium">
                View All Activity
              </button>
            </div>
          </div>
        </div>

        {/* Featured Tools - GCP Style */}
        <div className="bg-white rounded-md border border-gray-300">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-sm font-medium text-gray-900">Featured Tools</h2>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {featuredTools.map((tool, index) => (
                <div key={index} className="group flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 cursor-pointer">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{tool.name}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${tool.color}`}>
                        {tool.badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{tool.description}</p>
                  </div>
                  <button 
                    onClick={() => {
                      if (tool.implemented) {
                        window.location.href = tool.link;
                      } else {
                        alert(`${tool.name} is coming soon! We're working hard to bring you this feature.`);
                      }
                    }}
                    className={`ml-4 px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                      tool.implemented 
                        ? "bg-blue-600 text-white hover:bg-blue-700" 
                        : "text-gray-500 border border-gray-300 hover:border-gray-400 bg-white"
                    }`}
                  >
                    {tool.implemented ? "Open" : "Soon"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - GCP Style */}
      <div className="bg-white rounded-md border border-gray-300">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-sm font-medium text-gray-900">Quick Actions</h2>
          <p className="text-xs text-gray-600 mt-1">Access your most-used AI tools</p>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button 
              onClick={() => window.location.href = '/playground'}
              className="group flex items-center space-x-3 p-3 border border-gray-300 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <FiCode className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700">Generate Code</p>
                <p className="text-xs text-gray-600">AI-powered coding</p>
              </div>
            </button>
            
            <button 
              onClick={() => alert('Trading Analysis coming soon!')}
              className="group flex items-center space-x-3 p-3 border border-gray-300 rounded-md hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                <FiTrendingUp className="w-4 h-4 text-gray-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Market Analysis</p>
                <p className="text-xs text-gray-600">Coming soon</p>
              </div>
            </button>
            
            <button 
              onClick={() => alert('Image Processing coming soon!')}
              className="group flex items-center space-x-3 p-3 border border-gray-300 rounded-md hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                <FiImage className="w-4 h-4 text-gray-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Process Images</p>
                <p className="text-xs text-gray-600">Coming soon</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Usage Analytics & Billing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <UsageAnalytics />
        <BillingSummary />
      </div>

      {/* Browse All Tools CTA - GCP Style */}
      <div className="bg-white border border-blue-200 rounded-md p-4 text-center">
        <h3 className="text-sm font-medium text-gray-900 mb-1">Explore All AI Tools</h3>
        <p className="text-xs text-gray-600 mb-3">Discover 15+ powerful AI tools for code, trading, content, and more</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Browse All Tools
        </button>
      </div>
    </div>
  );
}