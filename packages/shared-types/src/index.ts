// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  credits: number;
  subscription: 'free' | 'premium' | 'enterprise';
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  user: User;
  token: string;
  expiresAt: string;
}

// Trading Types
export interface MarketData {
  id: string;
  symbol: string;
  price: number;
  volume: number;
  change: number;
  changePercent: number;
  timestamp: string;
  source: string;
}

export interface HistoricalData {
  id: string;
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
}

export interface TradingSignal {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL' | 'HOLD';
  algorithm: string;
  confidence: number;
  price: number;
  timestamp: string;
  indicators: TechnicalIndicator[];
}

// Resume Types
export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  awards: Award[];
  volunteer: VolunteerExperience[];
  references: Reference[];
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  achievements: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  gpa?: number;
  honors?: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  startDate: string;
  endDate?: string;
  url?: string;
  github?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native';
}

export interface Award {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description?: string;
}

export interface VolunteerExperience {
  id: string;
  organization: string;
  role: string;
  startDate: string;
  endDate?: string;
  description: string;
}

export interface Reference {
  id: string;
  name: string;
  position: string;
  company: string;
  email: string;
  phone?: string;
  relationship: string;
}

export interface ResumeTemplate {
  id: string;
  name: string;
  category: string;
  previewImage: string;
  isPremium: boolean;
  templateData: any;
}

// AI Service Types
export interface CodeGenerationRequest {
  language: string;
  prompt: string;
  context?: string;
  framework?: string;
  style?: 'functional' | 'object-oriented' | 'procedural';
}

export interface CodeGenerationResponse {
  code: string;
  explanation: string;
  suggestions: string[];
  language: string;
  framework?: string;
}

export interface ImageProcessingRequest {
  operation: 'resize' | 'crop' | 'filter' | 'enhance' | 'generate';
  imageUrl?: string;
  prompt?: string;
  parameters: Record<string, any>;
}

export interface ImageProcessingResponse {
  processedImageUrl: string;
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
  processingTime: number;
}

export interface TextAnalysisRequest {
  text: string;
  operations: ('sentiment' | 'summary' | 'keywords' | 'entities' | 'topics')[];
  language?: string;
}

export interface TextAnalysisResponse {
  sentiment?: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
    confidence: number;
  };
  summary?: string;
  keywords?: string[];
  entities?: {
    text: string;
    type: string;
    confidence: number;
  }[];
  topics?: {
    topic: string;
    score: number;
  }[];
}

export interface AudioSynthesisRequest {
  text: string;
  voice: string;
  speed: number;
  pitch: number;
  format: 'mp3' | 'wav' | 'ogg';
}

export interface AudioSynthesisResponse {
  audioUrl: string;
  duration: number;
  format: string;
  size: number;
}

// Service Health Types
export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  version: string;
  uptime: number;
  lastCheck: string;
  dependencies: ServiceDependency[];
  metrics: ServiceMetrics;
}

export interface ServiceDependency {
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  responseTime?: number;
  lastCheck: string;
}

export interface ServiceMetrics {
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  memoryUsage: number;
  cpuUsage: number;
}

// Analytics Types
export interface UsageAnalytics {
  totalRequests: number;
  requestsByService: Record<string, number>;
  requestsByUser: Record<string, number>;
  errorsByService: Record<string, number>;
  averageResponseTime: number;
  period: {
    start: string;
    end: string;
  };
}

// WebSocket Types
export interface WebSocketMessage<T = any> {
  type: string;
  data: T;
  timestamp: string;
  id?: string;
}

export interface TradingWebSocketMessage extends WebSocketMessage {
  type: 'market_data' | 'trading_signal' | 'portfolio_update';
  data: MarketData | TradingSignal | any;
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  path?: string;
  method?: string;
}

// Configuration Types
export interface ServiceConfig {
  name: string;
  port: number;
  host: string;
  environment: 'development' | 'staging' | 'production';
  database?: DatabaseConfig;
  redis?: RedisConfig;
  external: ExternalApiConfig;
}

export interface DatabaseConfig {
  url: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

export interface RedisConfig {
  url: string;
  host: string;
  port: number;
  password?: string;
  database: number;
}

export interface ExternalApiConfig {
  openai?: {
    apiKey: string;
    model: string;
  };
  claude?: {
    apiKey: string;
    model: string;
  };
  alphaVantage?: {
    apiKey: string;
  };
  yahooFinance?: {
    enabled: boolean;
  };
}