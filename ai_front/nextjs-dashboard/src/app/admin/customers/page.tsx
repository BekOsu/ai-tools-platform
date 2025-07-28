"use client";
import { useState } from "react";
import Link from "next/link";
import { 
  FiArrowLeft,
  FiSearch, 
  FiFilter,
  FiMoreVertical,
  FiEdit,
  FiMail,
  FiPhone,
  FiCreditCard,
  FiActivity,
  FiCalendar,
  FiUser,
  FiHome
} from "react-icons/fi";
import { mockCustomers } from "@/data/mockCRMData";
import { Customer } from "@/types/crm";

type CustomerFilter = "all" | "active" | "inactive" | "trial" | "suspended";
type CustomerSort = "name" | "company" | "joinDate" | "credits" | "lastActive";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CustomerFilter>("all");
  const [sort, setSort] = useState<CustomerSort>("name");
  const [customers] = useState<Customer[]>(mockCustomers);

  // Filter and sort customers
  const filteredCustomers = customers
    .filter(customer => {
      const matchesSearch = search === "" || 
        customer.name.toLowerCase().includes(search.toLowerCase()) ||
        customer.email.toLowerCase().includes(search.toLowerCase()) ||
        customer.company?.toLowerCase().includes(search.toLowerCase());
      
      const matchesFilter = filter === "all" || customer.status === filter;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sort) {
        case "name":
          return a.name.localeCompare(b.name);
        case "company":
          return (a.company || "").localeCompare(b.company || "");
        case "joinDate":
          return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
        case "credits":
          return b.credits - a.credits;
        case "lastActive":
          return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
        default:
          return 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-50 text-green-700 border-green-200";
      case "inactive": return "bg-gray-50 text-gray-700 border-gray-200";
      case "trial": return "bg-blue-50 text-blue-700 border-blue-200";
      case "suspended": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "free": return "bg-gray-100 text-gray-700";
      case "pro": return "bg-blue-100 text-blue-700";
      case "enterprise": return "bg-purple-100 text-purple-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

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
              <h1 className="text-3xl font-normal text-gray-900">Customer Management</h1>
              <p className="text-gray-600 mt-1">
                {filteredCustomers.length} customers {filter !== "all" && `(${filter})`}
              </p>
            </div>
            
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search customers, emails, companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <FiFilter className="w-4 h-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as CustomerFilter)}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="trial">Trial</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as CustomerSort)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            >
              <option value="name">Sort by Name</option>
              <option value="company">Sort by Company</option>
              <option value="joinDate">Sort by Join Date</option>
              <option value="credits">Sort by Credits</option>
              <option value="lastActive">Sort by Last Active</option>
            </select>
          </div>
        </div>

        {/* Customer List */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status & Plan
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credits
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          {customer.avatar ? (
                            <img 
                              src={customer.avatar} 
                              alt={customer.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <FiUser className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{customer.name}</h3>
                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <FiMail className="w-3 h-3" />
                              <span>{customer.email}</span>
                            </span>
                            {customer.company && (
                              <span className="flex items-center space-x-1">
                                <FiHome className="w-3 h-3" />
                                <span>{customer.company}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(customer.status)}`}>
                          {customer.status}
                        </span>
                        <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getPlanColor(customer.plan)}`}>
                          {customer.plan}
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">${customer.credits.toFixed(2)}</div>
                        <div className="text-gray-500">Used: ${customer.creditsUsed.toFixed(2)}</div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <div className="flex items-center space-x-1 text-gray-900">
                          <FiActivity className="w-3 h-3" />
                          <span>{customer.totalSessions} sessions</span>
                        </div>
                        <div className="text-gray-500">
                          Last: {new Date(customer.lastActive).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900">
                        {new Date(customer.joinDate).toLocaleDateString()}
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                          <FiMail className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                          <FiMoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <FiUser className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}