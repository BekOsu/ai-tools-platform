// Mock CRM Data for Development
import { Customer, SupportTicket, CRMStats, AIUsageMetrics } from '@/types/crm';

export const mockCustomers: Customer[] = [
  {
    id: 'cust-001',
    name: 'John Smith',
    email: 'john.smith@techcorp.com',
    company: 'TechCorp Solutions',
    phone: '+1 (555) 123-4567',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    status: 'active',
    plan: 'pro',
    credits: 45.50,
    creditsUsed: 154.50,
    aiToolsUsed: ['code-playground', 'ai-data-analyst', 'seo-blog-generator'],
    joinDate: '2024-10-15',
    lastActive: '2025-01-27',
    totalSessions: 47,
    supportTickets: [],
    preferences: {
      notifications: true,
      theme: 'light',
      language: 'en'
    }
  },
  {
    id: 'cust-002',
    name: 'Sarah Johnson',
    email: 'sarah.j@startup.io',
    company: 'Startup Labs',
    phone: '+1 (555) 234-5678',
    status: 'active',
    plan: 'enterprise',
    credits: 250.75,
    creditsUsed: 89.25,
    aiToolsUsed: ['code-playground', 'customer-support-chatbot', 'ai-resume-builder'],
    joinDate: '2024-09-22',
    lastActive: '2025-01-28',
    totalSessions: 132,
    supportTickets: [],
    preferences: {
      notifications: true,
      theme: 'light',
      language: 'en'
    }
  },
  {
    id: 'cust-003',
    name: 'Michael Chen',
    email: 'mchen@designstudio.com',
    company: 'Creative Design Studio',
    status: 'trial',
    plan: 'free',
    credits: 5.00,
    creditsUsed: 15.00,
    aiToolsUsed: ['image-enhancer', 'background-remover'],
    joinDate: '2025-01-20',
    lastActive: '2025-01-26',
    totalSessions: 8,
    supportTickets: [],
    preferences: {
      notifications: false,
      theme: 'dark',
      language: 'en'
    }
  },
  {
    id: 'cust-004',
    name: 'Emily Rodriguez',
    email: 'emily.r@marketpro.com',
    company: 'MarketPro Agency',
    status: 'inactive',
    plan: 'pro',
    credits: 12.30,
    creditsUsed: 67.70,
    aiToolsUsed: ['seo-blog-generator', 'ai-content-writer'],
    joinDate: '2024-08-10',
    lastActive: '2025-01-15',
    totalSessions: 23,
    supportTickets: [],
    preferences: {
      notifications: true,
      theme: 'light',
      language: 'en'
    }
  }
];

export const mockSupportTickets: SupportTicket[] = [
  {
    id: 'ticket-001',
    customerId: 'cust-001',
    customerName: 'John Smith',
    customerEmail: 'john.smith@techcorp.com',
    title: 'Code Playground not loading properly',
    description: 'When I try to access the code playground, it shows a blank screen and doesn\'t load the Monaco editor.',
    status: 'open',
    priority: 'high',
    category: 'technical',
    aiToolRelated: 'code-playground',
    assignedTo: 'support-001',
    createdAt: '2025-01-27T10:30:00Z',
    updatedAt: '2025-01-27T10:30:00Z',
    responses: []
  },
  {
    id: 'ticket-002',
    customerId: 'cust-002',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.j@startup.io',
    title: 'Credits not updating after usage',
    description: 'I used the AI Data Analyst tool multiple times today, but my credit balance hasn\'t been updated to reflect the usage.',
    status: 'in-progress',
    priority: 'medium',
    category: 'billing',
    aiToolRelated: 'ai-data-analyst',
    assignedTo: 'support-002',
    createdAt: '2025-01-26T14:15:00Z',
    updatedAt: '2025-01-27T09:45:00Z',
    responses: [
      {
        id: 'resp-001',
        ticketId: 'ticket-002',
        authorId: 'support-002',
        authorName: 'Mike Support',
        authorType: 'admin',
        message: 'Hi Sarah, I\'m looking into this issue. Can you please provide the timestamps of when you used the tool?',
        timestamp: '2025-01-27T09:45:00Z'
      }
    ]
  },
  {
    id: 'ticket-003',
    customerId: 'cust-003',
    customerName: 'Michael Chen',
    customerEmail: 'mchen@designstudio.com',
    title: 'Feature Request: Batch Image Processing',
    description: 'Would love to see a feature that allows uploading multiple images at once for background removal instead of processing them one by one.',
    status: 'open',
    priority: 'low',
    category: 'feature-request',
    aiToolRelated: 'background-remover',
    createdAt: '2025-01-25T16:20:00Z',
    updatedAt: '2025-01-25T16:20:00Z',
    responses: []
  }
];

export const mockCRMStats: CRMStats = {
  totalCustomers: 1247,
  activeCustomers: 892,
  totalTickets: 156,
  openTickets: 23,
  totalCreditsUsed: 12450.75,
  revenueThisMonth: 15680.50,
  topAITools: [
    { name: 'Code Playground', usage: 3420, revenue: 4250.00 },
    { name: 'AI Content Writer', usage: 2890, revenue: 3210.50 },
    { name: 'SEO Blog Generator', usage: 2340, revenue: 2890.25 },
    { name: 'AI Data Analyst', usage: 1980, revenue: 2650.75 },
    { name: 'Image Enhancer', usage: 1560, revenue: 1890.00 }
  ],
  customerGrowth: [
    { month: 'Sep', customers: 145, revenue: 8900.00 },
    { month: 'Oct', customers: 198, revenue: 12400.50 },
    { month: 'Nov', customers: 234, revenue: 14200.75 },
    { month: 'Dec', customers: 287, revenue: 16800.25 },
    { month: 'Jan', customers: 324, revenue: 18950.00 }
  ]
};

export const mockAIUsageMetrics: AIUsageMetrics[] = [
  {
    customerId: 'cust-001',
    toolId: 'code-playground',
    toolName: 'Code Playground',
    usageCount: 45,
    creditsSpent: 67.50,
    lastUsed: '2025-01-27T15:30:00Z',
    averageRating: 4.8
  },
  {
    customerId: 'cust-001',
    toolId: 'ai-data-analyst',
    toolName: 'AI Data Analyst',
    usageCount: 12,
    creditsSpent: 48.00,
    lastUsed: '2025-01-26T11:20:00Z',
    averageRating: 4.6
  },
  {
    customerId: 'cust-002',
    toolId: 'customer-support-chatbot',
    toolName: 'Customer Support Chatbot',
    usageCount: 89,
    creditsSpent: 123.45,
    lastUsed: '2025-01-28T09:15:00Z',
    averageRating: 4.9
  }
];