"use client";
import { useState } from "react";
import Link from "next/link";
import { 
  FiArrowLeft,
  FiTrendingUp, 
  FiUsers,
  FiActivity,
  FiClock,
  FiDollarSign,
  FiCode,
  FiCalendar,
  FiDownload,
  FiRefreshCw
} from "react-icons/fi";
import { mockCRMStats, mockAIUsageMetrics, mockCustomers } from "@/data/mockCRMData";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const [refreshing, setRefreshing] = useState(false);

  const stats = mockCRMStats;
  const usageMetrics = mockAIUsageMetrics;

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const exportData = () => {
    // Simulate data export
    const data = {
      timeRange,
      stats,
      usageMetrics,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Calculate analytics metrics
  const avgCreditsPerUser = stats.totalCreditsUsed / stats.totalCustomers;
  const revenueGrowth = stats.customerGrowth.length > 1 
    ? ((stats.customerGrowth[stats.customerGrowth.length - 1].revenue - stats.customerGrowth[stats.customerGrowth.length - 2].revenue) / stats.customerGrowth[stats.customerGrowth.length - 2].revenue * 100)
    : 0;

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon, 
    color = "blue" 
  }: {
    title: string;
    value: string;
    change: string;
    icon: React.ReactNode;
    color?: string;
  }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 bg-${color}-50 rounded-lg`}>
          {icon}
        </div>
        <div className="text-xs text-gray-500">vs last period</div>
      </div>
      
      <div className="mb-2">
        <h3 className="text-2xl font-semibold text-gray-900">{value}</h3>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
      
      <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full w-fit">
        {change}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center space-x-4 mb-4">
            <Link 
              href="/admin"
              className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-normal text-gray-900">Analytics & Insights</h1>
              <p className="text-gray-600 mt-1">Deep dive into user behavior and platform performance</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <FiCalendar className="w-4 h-4 text-gray-400" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
              </div>
              
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <FiRefreshCw className={`w-4 h-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={exportData}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                <FiDownload className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Revenue"
            value={`$${stats.revenueThisMonth.toLocaleString()}`}
            change={`+${revenueGrowth.toFixed(1)}%`}
            icon={<FiDollarSign className="w-6 h-6 text-green-600" />}
            color="green"
          />
          
          <MetricCard
            title="Active Users"
            value={stats.activeCustomers.toLocaleString()}
            change="+12.5%"
            icon={<FiUsers className="w-6 h-6 text-blue-600" />}
            color="blue"
          />
          
          <MetricCard
            title="Avg Credits/User"
            value={avgCreditsPerUser.toFixed(2)}
            change="+8.3%"
            icon={<FiActivity className="w-6 h-6 text-purple-600" />}
            color="purple"
          />
          
          <MetricCard
            title="Platform Usage"
            value={`${(stats.totalCreditsUsed / 1000).toFixed(1)}K`}
            change="+15.2%"
            icon={<FiCode className="w-6 h-6 text-orange-600" />}
            color="orange"
          />
        </div>

        {/* Charts and Detailed Analytics */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* AI Tools Usage */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">AI Tools Performance</h2>
              <div className="text-xs text-gray-500">Credits used</div>
            </div>
            
            <div className="space-y-4">
              {stats.topAITools.map((tool, index) => {
                const percentage = (tool.usage / stats.topAITools[0].usage) * 100;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{tool.name}</span>
                      <span className="text-sm text-gray-600">{tool.usage.toLocaleString()} uses</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>${tool.revenue.toLocaleString()} revenue</span>
                      <span>{percentage.toFixed(1)}% of top tool</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Engagement Metrics */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">User Engagement</h2>
              <div className="text-xs text-gray-500">Session metrics</div>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-semibold text-gray-900">
                    {mockCustomers.reduce((acc, customer) => acc + customer.totalSessions, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Sessions</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-semibold text-gray-900">
                    {(mockCustomers.reduce((acc, customer) => acc + customer.totalSessions, 0) / mockCustomers.length).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Avg Sessions/User</div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900">User Activity Distribution</h3>
                {[
                  { label: "Daily Active", value: 68, color: "bg-green-500" },
                  { label: "Weekly Active", value: 85, color: "bg-blue-500" },
                  { label: "Monthly Active", value: 94, color: "bg-purple-500" }
                ].map((metric, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-16 text-xs text-gray-600">{metric.label}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${metric.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${metric.value}%` }}
                      ></div>
                    </div>
                    <div className="w-10 text-xs text-gray-600 text-right">{metric.value}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Growth Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">Growth Trends</h2>
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Customers</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Revenue</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {stats.customerGrowth.map((data, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 text-sm font-medium text-gray-900">{data.month}</div>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">{data.customers} customers</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">${data.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  {index > 0 && (
                    <div className="text-xs text-green-600">
                      +{(((data.customers - stats.customerGrowth[index - 1].customers) / stats.customerGrowth[index - 1].customers) * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Activity Feed */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {[
              { user: "John Smith", action: "Generated code", tool: "Code Playground", time: "2 min ago", credits: 2.5 },
              { user: "Sarah Johnson", action: "Analyzed data", tool: "AI Data Analyst", time: "5 min ago", credits: 4.0 },
              { user: "Michael Chen", action: "Enhanced image", tool: "Image Enhancer", time: "8 min ago", credits: 1.2 },
              { user: "Emily Rodriguez", action: "Generated blog post", tool: "SEO Blog Generator", time: "12 min ago", credits: 3.5 },
              { user: "David Wilson", action: "Created chatbot response", tool: "Customer Support Bot", time: "15 min ago", credits: 1.8 }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <FiActivity className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {activity.user} {activity.action}
                    </div>
                    <div className="text-xs text-gray-500">
                      Used {activity.tool} • {activity.time}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">-${activity.credits}</div>
                  <div className="text-xs text-gray-500">credits</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}