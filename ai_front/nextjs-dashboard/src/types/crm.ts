// CRM Types for AI Platform
export interface Customer {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'trial' | 'suspended';
  plan: 'free' | 'pro' | 'enterprise';
  credits: number;
  creditsUsed: number;
  aiToolsUsed: string[];
  joinDate: string;
  lastActive: string;
  totalSessions: number;
  supportTickets: SupportTicket[];
  preferences: {
    notifications: boolean;
    theme: 'light' | 'dark';
    language: string;
  };
}

export interface SupportTicket {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'feature-request' | 'bug-report' | 'general';
  aiToolRelated?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  responses: TicketResponse[];
}

export interface TicketResponse {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorType: 'customer' | 'admin';
  message: string;
  attachments?: string[];
  timestamp: string;
}

export interface AIUsageMetrics {
  customerId: string;
  toolId: string;
  toolName: string;
  usageCount: number;
  creditsSpent: number;
  lastUsed: string;
  averageRating?: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'support' | 'manager';
  avatar?: string;
  departments: string[];
  permissions: string[];
}

export interface CRMStats {
  totalCustomers: number;
  activeCustomers: number;
  totalTickets: number;
  openTickets: number;
  totalCreditsUsed: number;
  revenueThisMonth: number;
  topAITools: Array<{
    name: string;
    usage: number;
    revenue: number;
  }>;
  customerGrowth: Array<{
    month: string;
    customers: number;
    revenue: number;
  }>;
}