"use client";
import Link from "next/link";
import { 
  FiUsers, 
  FiMessageSquare, 
  FiDollarSign, 
  FiTrendingUp,
  FiArrowUp,
  FiArrowDown,
  FiActivity,
  FiCreditCard,
  FiAlertCircle,
  FiCheckCircle
} from "react-icons/fi";
import { mockCRMStats } from "@/data/mockCRMData";

export default function AdminDashboard() {
  const stats = mockCRMStats;

  const StatCard = ({ 
    title, 
    value, 
    change, 
    changeType, 
    icon, 
    href 
  }: {
    title: string;
    value: string | number;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
    icon: React.ReactNode;
    href?: string;
  }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-gray-50 rounded-lg">
          {icon}
        </div>
        {changeType === 'positive' && <FiArrowUp className="w-4 h-4 text-green-500" />}
        {changeType === 'negative' && <FiArrowDown className="w-4 h-4 text-red-500" />}
      </div>
      
      <div className="mb-2">
        <h3 className="text-2xl font-semibold text-gray-900">{value}</h3>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
      
      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-1 rounded-full ${
          changeType === 'positive' ? 'bg-green-50 text-green-700' :
          changeType === 'negative' ? 'bg-red-50 text-red-700' :
          'bg-gray-50 text-gray-700'
        }`}>
          {change}
        </span>
        
        {href && (
          <Link href={href} className="text-xs text-blue-600 hover:text-blue-700 transition-colors">
            View details →
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-normal text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Monitor your AI platform performance and customer metrics</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link 
                href="/admin/customers"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                Manage Customers
              </Link>
              <Link 
                href="/admin/support"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Support Queue
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Customers"
            value={stats.totalCustomers.toLocaleString()}
            change="+12% from last month"
            changeType="positive"
            icon={<FiUsers className="w-6 h-6 text-blue-600" />}
            href="/admin/customers"
          />
          
          <StatCard
            title="Active Users"
            value={stats.activeCustomers.toLocaleString()}
            change="+8% from last month"
            changeType="positive"
            icon={<FiActivity className="w-6 h-6 text-green-600" />}
            href="/admin/analytics"
          />
          
          <StatCard
            title="Open Tickets"
            value={stats.openTickets}
            change={stats.openTickets < 30 ? "Under control" : "Needs attention"}
            changeType={stats.openTickets < 30 ? "positive" : "negative"}
            icon={<FiMessageSquare className="w-6 h-6 text-orange-600" />}
            href="/admin/support"
          />
          
          <StatCard
            title="Revenue (Month)"
            value={`$${stats.revenueThisMonth.toLocaleString()}`}
            change="+15% from last month"
            changeType="positive"
            icon={<FiDollarSign className="w-6 h-6 text-purple-600" />}
            href="/admin/billing"
          />
        </div>

        {/* Charts and Details */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Top AI Tools */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">Top AI Tools</h2>
              <Link href="/admin/analytics" className="text-sm text-blue-600 hover:text-blue-700">
                View all →
              </Link>
            </div>
            
            <div className="space-y-4">
              {stats.topAITools.map((tool, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">{tool.name}</h3>
                    <p className="text-xs text-gray-600">{tool.usage.toLocaleString()} uses</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">${tool.revenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Growth */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">Customer Growth</h2>
              <Link href="/admin/analytics" className="text-sm text-blue-600 hover:text-blue-700">
                View details →
              </Link>
            </div>
            
            <div className="space-y-3">
              {stats.customerGrowth.map((data, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">{data.month}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium">{data.customers} customers</span>
                    <span className="text-sm text-green-600">${data.revenue.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link 
            href="/admin/customers"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-3 mb-3">
              <FiUsers className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">Customer Management</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              View and manage customer accounts, usage, and billing information.
            </p>
            <div className="flex items-center space-x-1 text-sm text-blue-600 group-hover:text-blue-700">
              <span>Manage customers</span>
              <FiArrowUp className="w-4 h-4 rotate-45" />
            </div>
          </Link>

          <Link 
            href="/admin/support"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-3 mb-3">
              <FiMessageSquare className="w-5 h-5 text-orange-600" />
              <h3 className="font-medium text-gray-900">Support Queue</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Handle customer support tickets and track resolution times.
            </p>
            <div className="flex items-center space-x-1 text-sm text-orange-600 group-hover:text-orange-700">
              <span>View tickets</span>
              <FiArrowUp className="w-4 h-4 rotate-45" />
            </div>
          </Link>

          <Link 
            href="/admin/analytics"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-3 mb-3">
              <FiTrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-gray-900">Analytics & Reports</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Deep dive into usage analytics and generate custom reports.
            </p>
            <div className="flex items-center space-x-1 text-sm text-green-600 group-hover:text-green-700">
              <span>View analytics</span>
              <FiArrowUp className="w-4 h-4 rotate-45" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}