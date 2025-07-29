"use client";
import { useState } from "react";
import Link from "next/link";
import { 
  FiArrowLeft,
  FiSearch, 
  FiFilter,
  FiClock,
  FiUser,
  FiTag,
  FiMessageSquare,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiPlayCircle
} from "react-icons/fi";
import { mockSupportTickets } from "@/data/mockCRMData";
import { SupportTicket } from "@/types/crm";

type TicketFilter = "all" | "open" | "in-progress" | "resolved" | "closed";
type TicketSort = "priority" | "status" | "created" | "updated";

export default function SupportPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TicketFilter>("all");
  const [sort, setSort] = useState<TicketSort>("created");
  const [tickets] = useState<SupportTicket[]>(mockSupportTickets);

  // Filter and sort tickets
  const filteredTickets = tickets
    .filter(ticket => {
      const matchesSearch = search === "" || 
        ticket.title.toLowerCase().includes(search.toLowerCase()) ||
        ticket.customerName.toLowerCase().includes(search.toLowerCase()) ||
        ticket.customerEmail.toLowerCase().includes(search.toLowerCase());
      
      const matchesFilter = filter === "all" || ticket.status === filter;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sort) {
        case "priority":
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case "status":
          return a.status.localeCompare(b.status);
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "updated":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return 0;
      }
    });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open": return <FiAlertCircle className="w-4 h-4" />;
      case "in-progress": return <FiPlayCircle className="w-4 h-4" />;
      case "resolved": return <FiCheckCircle className="w-4 h-4" />;
      case "closed": return <FiXCircle className="w-4 h-4" />;
      default: return <FiMessageSquare className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-red-50 text-red-700 border-red-200";
      case "in-progress": return "bg-blue-50 text-blue-700 border-blue-200";
      case "resolved": return "bg-green-50 text-green-700 border-green-200";
      case "closed": return "bg-gray-50 text-gray-700 border-gray-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "technical": return "bg-blue-100 text-blue-800";
      case "billing": return "bg-purple-100 text-purple-800";
      case "feature-request": return "bg-green-100 text-green-800";
      case "bug-report": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
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
              <h1 className="text-3xl font-normal text-gray-900">Support Queue</h1>
              <p className="text-gray-600 mt-1">
                {filteredTickets.length} tickets {filter !== "all" && `(${filter})`}
              </p>
            </div>
            
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
              Create Ticket
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
              placeholder="Search tickets, customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <FiFilter className="w-4 h-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as TicketFilter)}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as TicketSort)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            >
              <option value="priority">Sort by Priority</option>
              <option value="status">Sort by Status</option>
              <option value="created">Sort by Created</option>
              <option value="updated">Sort by Updated</option>
            </select>
          </div>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <div key={ticket.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium text-gray-900 text-lg">{ticket.title}</h3>
                    <span className="text-sm text-gray-500">#{ticket.id}</span>
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <FiUser className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{ticket.customerName}</span>
                      <span className="text-sm text-gray-400">({ticket.customerEmail})</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <FiClock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Created {formatDate(ticket.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">
                    {ticket.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                    {getStatusIcon(ticket.status)}
                    <span className="capitalize">{ticket.status.replace('-', ' ')}</span>
                  </span>
                  
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                  
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getCategoryColor(ticket.category)}`}>
                    {ticket.category.replace('-', ' ')}
                  </span>
                  
                  {ticket.aiToolRelated && (
                    <span className="inline-flex items-center space-x-1 px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                      <FiTag className="w-3 h-3" />
                      <span>{ticket.aiToolRelated}</span>
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {ticket.responses.length > 0 && (
                    <span className="flex items-center space-x-1 text-xs text-gray-500">
                      <FiMessageSquare className="w-3 h-3" />
                      <span>{ticket.responses.length} replies</span>
                    </span>
                  )}
                  
                  <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTickets.length === 0 && (
          <div className="text-center py-12">
            <FiMessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}