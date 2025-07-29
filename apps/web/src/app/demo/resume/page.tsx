'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  FiDownload, FiEye, FiCheck, FiClock, FiAlertCircle, FiPlus, FiTrash2, FiStar,
  FiZap, FiBrain, FiTarget, FiTrendingUp, FiFileText, FiSettings, FiMagic,
  FiBarChart, FiRefreshCw, FiLightbulb, FiSearch, FiUpload, FiCopy
} from 'react-icons/fi';

// Enhanced interfaces with AI features
interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
  summary: string;
  professionalTitle?: string;
  careerLevel?: 'entry' | 'mid' | 'senior' | 'executive';
}

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  achievements: string[];
  skills?: string[];
  industry?: string;
  location?: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  achievements: string[];
  relevant_coursework?: string[];
}

interface Skill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  category: string;
  yearsOfExperience?: number;
  endorsed?: boolean;
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  startDate: string;
  endDate?: string;
  url?: string;
  github?: string;
  impact?: string;
  teamSize?: number;
}

interface ResumeData {
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  languages: Array<{ name: string; proficiency: string }>;
  certifications: Array<{ name: string; issuer: string; date: string; url?: string; expiryDate?: string }>;
  template: string;
  theme: string;
  targetJob?: {
    title: string;
    company?: string;
    description?: string;
    requirements?: string[];
    industry?: string;
  };
  aiOptimized?: boolean;
  lastOptimized?: string;
}

interface ResumeJob {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  filePath?: string;
  metadata: {
    template: string;
    theme: string;
    format: string;
    createdAt: string;
    completedAt?: string;
    aiOptimized?: boolean;
    atsScore?: number;
  };
  error?: string;
  aiEnhancements?: {
    suggestedImprovements: string[];
    keywordMatches: number;
    readabilityScore: number;
    industryAlignment: number;
  };
}

interface AIGenerationResult {
  type: string;
  generated_content: string;
  context_used: any;
  options_applied: any;
  ai_provider: string;
}

interface ATSScoreResult {
  ats_score: number;
  breakdown: any;
  recommendations: string[];
  keyword_analysis: any;
  formatting_score: any;
}

interface JobParseResult {
  parsed_job: {
    job_title: string;
    company: string;
    required_skills: string[];
    preferred_skills: string[];
    experience_level: string;
    industry: string;
    key_responsibilities: string[];
    qualifications: string[];
    keywords: string[];
    salary_range?: string;
    location: string;
    employment_type: string;
  };
  original_description: string;
  parsing_method: string;
}

interface SmartSuggestion {
  type: string;
  category: string;
  priority: string;
  message: string;
  action: string;
}

export default function EnhancedResumeDemoPage() {
  // Core state
  const [activeTab, setActiveTab] = useState('ai-wizard');
  const [loading, setLoading] = useState(false);
  const [resumeJob, setResumeJob] = useState<ResumeJob | null>(null);

  // AI Features state
  const [aiGenerating, setAiGenerating] = useState(false);
  const [atsScore, setAtsScore] = useState<ATSScoreResult | null>(null);
  const [parsedJob, setParsedJob] = useState<JobParseResult | null>(null);
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);
  const [aiContent, setAiContent] = useState<string>('');

  // Form state
  const [selectedTemplate, setSelectedTemplate] = useState('modern_pro');
  const [selectedTheme, setSelectedTheme] = useState('blue');
  const [jobDescription, setJobDescription] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetIndustry, setTargetIndustry] = useState('technology');

  // Resume Data State with AI enhancements
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/sarahjohnson',
      github: 'github.com/sarahjohnson',
      summary: 'Innovative AI/ML Engineer with 6+ years of experience building scalable machine learning systems and leading cross-functional teams. Expertise in deep learning, natural language processing, and cloud architecture. Proven track record of delivering AI solutions that drove $2M+ in revenue growth.',
      professionalTitle: 'Senior AI/ML Engineer',
      careerLevel: 'senior'
    },
    experience: [
      {
        id: '1',
        company: 'TechCorp AI',
        position: 'Senior AI/ML Engineer',
        startDate: '2022-01',
        endDate: '2024-07',
        current: false,
        description: 'Led development of next-generation AI recommendation systems serving 10M+ users daily.',
        achievements: [
          'Architected and deployed ML pipeline that increased user engagement by 45%',
          'Led team of 8 engineers in developing real-time recommendation engine',
          'Reduced model inference latency by 60% through optimization techniques',
          'Implemented A/B testing framework that improved conversion rates by 23%'
        ],
        skills: ['Python', 'TensorFlow', 'PyTorch', 'AWS', 'Kubernetes'],
        industry: 'Technology',
        location: 'San Francisco, CA'
      }
    ],
    education: [
      {
        id: '1',
        institution: 'Stanford University',
        degree: 'Master of Science',
        fieldOfStudy: 'Computer Science',
        startDate: '2016-09',
        endDate: '2018-06',
        gpa: '3.9',
        achievements: ['Thesis on Deep Learning for NLP', 'Teaching Assistant for ML Course'],
        relevant_coursework: ['Machine Learning', 'Deep Learning', 'Natural Language Processing']
      }
    ],
    skills: [
      { name: 'Python', level: 'Expert', category: 'Programming', yearsOfExperience: 6, endorsed: true },
      { name: 'Machine Learning', level: 'Expert', category: 'AI/ML', yearsOfExperience: 6, endorsed: true },
      { name: 'TensorFlow', level: 'Advanced', category: 'AI/ML', yearsOfExperience: 5, endorsed: true },
      { name: 'PyTorch', level: 'Advanced', category: 'AI/ML', yearsOfExperience: 4, endorsed: true },
      { name: 'AWS', level: 'Advanced', category: 'Cloud', yearsOfExperience: 5, endorsed: true },
      { name: 'Kubernetes', level: 'Intermediate', category: 'DevOps', yearsOfExperience: 3, endorsed: false },
      { name: 'Leadership', level: 'Advanced', category: 'Soft Skills', yearsOfExperience: 4, endorsed: true },
      { name: 'Data Science', level: 'Expert', category: 'Analytics', yearsOfExperience: 6, endorsed: true }
    ],
    projects: [
      {
        id: '1',
        name: 'AI-Powered Code Review Assistant',
        description: 'Built an intelligent code review system using transformer models that automatically detects bugs and suggests improvements.',
        technologies: ['Python', 'Transformers', 'Docker', 'FastAPI'],
        startDate: '2023-03',
        endDate: '2023-09',
        url: 'https://codeassist.ai',
        github: 'https://github.com/sarahjohnson/ai-code-assistant',
        impact: 'Reduced code review time by 40% for development teams',
        teamSize: 3
      }
    ],
    languages: [
      { name: 'English', proficiency: 'Native' },
      { name: 'Spanish', proficiency: 'Professional' },
      { name: 'Mandarin', proficiency: 'Conversational' }
    ],
    certifications: [
      {
        name: 'AWS Certified Machine Learning - Specialty',
        issuer: 'Amazon Web Services',
        date: '2023-08',
        url: 'https://aws.amazon.com/certification/',
        expiryDate: '2026-08'
      }
    ],
    template: selectedTemplate,
    theme: selectedTheme,
    targetJob: {
      title: 'Principal AI Engineer',
      company: 'OpenAI',
      industry: 'Artificial Intelligence'
    },
    aiOptimized: true,
    lastOptimized: new Date().toISOString()
  });

  // Enhanced Templates with AI scoring
  const templates = [
    {
      id: 'modern_pro',
      name: 'Modern Professional',
      description: 'Clean, ATS-friendly design perfect for corporate roles',
      category: 'professional',
      atsScore: 95,
      aiOptimized: true,
      bestFor: ['Business', 'Finance', 'Consulting', 'Technology']
    },
    {
      id: 'tech_minimalist',
      name: 'Tech Minimalist',
      description: 'Clean, code-friendly design for technical roles',
      category: 'technical',
      atsScore: 92,
      aiOptimized: true,
      bestFor: ['Software Development', 'Engineering', 'Data Science']
    },
    {
      id: 'creative_designer',
      name: 'Creative Designer',
      description: 'Visually striking template for creative professionals',
      category: 'creative',
      atsScore: 75,
      aiOptimized: false,
      bestFor: ['Design', 'Marketing', 'Media']
    },
    {
      id: 'executive_premium',
      name: 'Executive Premium',
      description: 'Sophisticated template for C-level positions',
      category: 'executive',
      atsScore: 88,
      aiOptimized: true,
      bestFor: ['Executive', 'Senior Management', 'Board Positions']
    }
  ];

  const themes = [
    { id: 'blue', name: 'Professional Blue', color: '#2563eb', description: 'Trust and reliability' },
    { id: 'green', name: 'Success Green', color: '#059669', description: 'Growth and innovation' },
    { id: 'purple', name: 'Creative Purple', color: '#7c3aed', description: 'Creativity and vision' },
    { id: 'gray', name: 'Elegant Gray', color: '#374151', description: 'Sophistication and balance' }
  ];

  // AI Content Generation
  const generateAIContent = async (type: string, context: any = {}) => {
    setAiGenerating(true);
    try {
      const response = await fetch('http://localhost:8006/api/resume/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          context: {
            ...context,
            experience: resumeData.experience,
            skills: resumeData.skills,
            targetJob: resumeData.targetJob
          },
          options: {
            tone: 'professional',
            industry: targetIndustry,
            length: 'medium'
          }
        })
      });

      const data: AIGenerationResult = await response.json();
      setAiContent(data.generated_content);
      return data.generated_content;
    } catch (error) {
      console.error('AI generation failed:', error);
      return null;
    } finally {
      setAiGenerating(false);
    }
  };

  // Parse Job Description
  const parseJobDescription = async () => {
    if (!jobDescription.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8006/api/resume/parse-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription })
      });

      const data: JobParseResult = await response.json();
      setParsedJob(data);

      // Auto-set target role and industry
      setTargetRole(data.parsed_job.job_title);
      setTargetIndustry(data.parsed_job.industry.toLowerCase());

      // Update target job in resume data
      setResumeData(prev => ({
        ...prev,
        targetJob: {
          title: data.parsed_job.job_title,
          company: data.parsed_job.company,
          description: jobDescription,
          requirements: data.parsed_job.required_skills,
          industry: data.parsed_job.industry
        }
      }));
    } catch (error) {
      console.error('Job parsing failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate ATS Score
  const calculateATSScore = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8006/api/resume/ats-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeData,
          jobDescription: jobDescription || undefined
        })
      });

      const data: ATSScoreResult = await response.json();
      setAtsScore(data);
    } catch (error) {
      console.error('ATS scoring failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get Smart Suggestions
  const getSmartSuggestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8006/api/resume/smart-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeData,
          targetIndustry,
          careerLevel: resumeData.personalInfo.careerLevel
        })
      });

      const data = await response.json();
      setSmartSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Smart suggestions failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate suggestions on load
  useEffect(() => {
    calculateATSScore();
    getSmartSuggestions();
  }, [resumeData.template, resumeData.theme]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header with AI Badge */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            🚀 AI Resume Builder
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <FiBrain className="w-4 h-4" />
              AI-Powered
            </span>
          </h1>
        </div>
        <p className="text-xl text-gray-600">
          Create professional resumes with advanced AI optimization, real-time ATS scoring, and intelligent job matching
        </p>

        {/* AI Features Highlight */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <FiZap className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">AI Content Generation</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <FiTarget className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">ATS Optimization</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
            <FiTrendingUp className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Smart Scoring</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
            <FiLightbulb className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Intelligent Suggestions</span>
          </div>
        </div>
      </div>

      {/* Enhanced Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {[
          { id: 'ai-wizard', label: 'AI Wizard', icon: <FiMagic className="w-4 h-4" />, badge: 'NEW' },
          { id: 'job-parser', label: 'Job Parser', icon: <FiSearch className="w-4 h-4" />, badge: 'AI' },
          { id: 'builder', label: 'Resume Builder', icon: <FiFileText className="w-4 h-4" /> },
          { id: 'templates', label: 'Templates', icon: <FiSettings className="w-4 h-4" /> },
          { id: 'ats-analysis', label: 'ATS Analysis', icon: <FiBarChart className="w-4 h-4" />, badge: 'PRO' },
          { id: 'ai-suggestions', label: 'Smart Tips', icon: <FiLightbulb className="w-4 h-4" />, badge: 'AI' },
          { id: 'preview', label: 'Preview & Download', icon: <FiDownload className="w-4 h-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.badge && (
              <span className={`absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-bold rounded-full ${
                tab.badge === 'NEW' ? 'bg-green-500 text-white' :
                tab.badge === 'AI' ? 'bg-blue-500 text-white' :
                'bg-purple-500 text-white'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* AI Wizard Tab */}
      {activeTab === 'ai-wizard' && (
        <div className="space-y-8">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-full">
                <FiMagic className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">AI Resume Wizard</h3>
                <p className="text-gray-600">Let AI help you create the perfect resume in minutes</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* AI Content Generation */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <FiZap className="w-4 h-4 text-yellow-500" />
                  AI Content Generation
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => generateAIContent('summary')}
                    disabled={aiGenerating}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {aiGenerating ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <FiBrain className="w-4 h-4" />}
                    Generate Summary
                  </Button>
                  <Button
                    onClick={() => generateAIContent('achievement', { currentText: 'Led development team' })}
                    disabled={aiGenerating}
                    variant="outline"
                  >
                    Improve Achievements
                  </Button>
                  <Button
                    onClick={() => generateAIContent('cover_letter')}
                    disabled={aiGenerating}
                    variant="outline"
                  >
                    Create Cover Letter
                  </Button>
                  <Button
                    onClick={() => generateAIContent('interview_prep')}
                    disabled={aiGenerating}
                    variant="outline"
                  >
                    Interview Questions
                  </Button>
                </div>

                {aiContent && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-gray-900">AI Generated Content</h5>
                      <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(aiContent)}>
                        <FiCopy className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{aiContent}</p>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <FiBarChart className="w-4 h-4 text-green-500" />
                  Resume Health Score
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {atsScore?.ats_score || 0}%
                    </div>
                    <div className="text-sm text-gray-600">ATS Score</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {smartSuggestions.filter(s => s.priority === 'high').length}
                    </div>
                    <div className="text-sm text-gray-600">Priority Actions</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {resumeData.skills.length}
                    </div>
                    <div className="text-sm text-gray-600">Skills Listed</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-orange-600 mb-1">
                      {resumeData.experience.reduce((acc, exp) => acc + exp.achievements.length, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Achievements</div>
                  </div>
                </div>

                <Button
                  onClick={calculateATSScore}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {loading ? <FiRefreshCw className="w-4 h-4 animate-spin mr-2" /> : <FiTarget className="w-4 h-4 mr-2" />}
                  Refresh ATS Analysis
                </Button>
              </div>
            </div>
          </Card>

          {/* AI Suggestions Preview */}
          {smartSuggestions.length > 0 && (
            <Card className="p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiLightbulb className="w-5 h-5 text-yellow-500" />
                Top AI Recommendations
              </h4>
              <div className="space-y-3">
                {smartSuggestions.slice(0, 3).map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      suggestion.priority === 'high' ? 'bg-red-500' :
                      suggestion.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{suggestion.message}</div>
                      <div className="text-gray-600 text-xs mt-1">{suggestion.action}</div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      suggestion.priority === 'high' ? 'bg-red-100 text-red-800' :
                      suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {suggestion.priority}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => setActiveTab('ai-suggestions')}
                variant="outline"
                className="mt-4"
              >
                View All Suggestions ({smartSuggestions.length})
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* Job Parser Tab */}
      {activeTab === 'job-parser' && (
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-100 rounded-full">
                <FiSearch className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">AI Job Description Parser</h3>
                <p className="text-gray-600">Paste any job description and get instant optimization insights</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Paste the job description here... AI will automatically extract requirements, skills, and keywords to optimize your resume."
                />
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={parseJobDescription}
                  disabled={loading || !jobDescription.trim()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? <FiRefreshCw className="w-4 h-4 animate-spin mr-2" /> : <FiBrain className="w-4 h-4 mr-2" />}
                  Parse with AI
                </Button>
                <Button
                  onClick={() => setJobDescription('')}
                  variant="outline"
                >
                  Clear
                </Button>
              </div>
            </div>
          </Card>

          {/* Parsed Results */}
          {parsedJob && (
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiTarget className="w-5 h-5 text-blue-500" />
                  Job Analysis
                </h4>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Position:</span>
                    <p className="text-gray-900 font-medium">{parsedJob.parsed_job.job_title}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Company:</span>
                    <p className="text-gray-900">{parsedJob.parsed_job.company}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Industry:</span>
                    <p className="text-gray-900">{parsedJob.parsed_job.industry}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Experience Level:</span>
                    <p className="text-gray-900 capitalize">{parsedJob.parsed_job.experience_level}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Location:</span>
                    <p className="text-gray-900">{parsedJob.parsed_job.location}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiStar className="w-5 h-5 text-yellow-500" />
                  Required Skills
                </h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600 mb-2 block">Must Have:</span>
                    <div className="flex flex-wrap gap-2">
                      {parsedJob.parsed_job.required_skills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  {parsedJob.parsed_job.preferred_skills.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-600 mb-2 block">Nice to Have:</span>
                      <div className="flex flex-wrap gap-2">
                        {parsedJob.parsed_job.preferred_skills.map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-600 mb-2 block">Keywords for ATS:</span>
                  <div className="flex flex-wrap gap-2">
                    {parsedJob.parsed_job.keywords.slice(0, 10).map((keyword, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Resume Builder Tab */}
      {activeTab === 'builder' && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            <div className="space-y-4">
              <Input
                label="Full Name"
                value={resumeData.personalInfo.fullName}
                onChange={(e) => setResumeData(prev => ({
                  ...prev,
                  personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                }))}
                placeholder="John Smith"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Email"
                  type="email"
                  value={resumeData.personalInfo.email}
                  onChange={(e) => setResumeData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, email: e.target.value }
                  }))}
                  placeholder="john@email.com"
                />
                <Input
                  label="Phone"
                  value={resumeData.personalInfo.phone}
                  onChange={(e) => setResumeData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, phone: e.target.value }
                  }))}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <Input
                label="Location"
                value={resumeData.personalInfo.location}
                onChange={(e) => setResumeData(prev => ({
                  ...prev,
                  personalInfo: { ...prev.personalInfo, location: e.target.value }
                }))}
                placeholder="San Francisco, CA"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="LinkedIn (optional)"
                  value={resumeData.personalInfo.linkedin || ''}
                  onChange={(e) => setResumeData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, linkedin: e.target.value }
                  }))}
                  placeholder="linkedin.com/in/username"
                />
                <Input
                  label="GitHub (optional)"
                  value={resumeData.personalInfo.github || ''}
                  onChange={(e) => setResumeData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, github: e.target.value }
                  }))}
                  placeholder="github.com/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Summary
                </label>
                <textarea
                  value={resumeData.personalInfo.summary}
                  onChange={(e) => setResumeData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, summary: e.target.value }
                  }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief summary of your professional background and key strengths..."
                />
              </div>
            </div>
          </Card>

          {/* Experience Section */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Work Experience</h3>
              <Button onClick={addExperience} size="sm">
                <FiPlus className="w-4 h-4 mr-1" />
                Add Experience
              </Button>
            </div>
            <div className="space-y-6">
              {resumeData.experience.map((exp, index) => (
                <div key={exp.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium text-gray-900">Experience #{index + 1}</h4>
                    <button
                      onClick={() => removeExperience(exp.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <Input
                      label="Company"
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                      placeholder="Company Name"
                    />
                    <Input
                      label="Position"
                      value={exp.position}
                      onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                      placeholder="Job Title"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <Input
                      label="Start Date"
                      type="month"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                    />
                    <Input
                      label="End Date"
                      type="month"
                      value={exp.endDate}
                      onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                      disabled={exp.current}
                    />
                    <div className="flex items-center pt-6">
                      <input
                        type="checkbox"
                        checked={exp.current}
                        onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                        className="mr-2"
                      />
                      <label className="text-sm text-gray-700">Current Role</label>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Description
                    </label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe your role and responsibilities..."
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Key Achievements
                      </label>
                      <button
                        onClick={() => addAchievement(exp.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        + Add Achievement
                      </button>
                    </div>
                    {exp.achievements.map((achievement, achIndex) => (
                      <div key={achIndex} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={achievement}
                          onChange={(e) => {
                            const newAchievements = [...exp.achievements];
                            newAchievements[achIndex] = e.target.value;
                            updateExperience(exp.id, 'achievements', newAchievements);
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Quantifiable achievement or impact..."
                        />
                        <button
                          onClick={() => {
                            const newAchievements = exp.achievements.filter((_, i) => i !== achIndex);
                            updateExperience(exp.id, 'achievements', newAchievements);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div>
          <h3 className="text-lg font-semibold mb-6">Choose Template & Theme</h3>

          {/* Template Selection */}
          <div className="mb-8">
            <h4 className="font-medium mb-4">Templates</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {templates.map(template => (
                <Card
                  key={template.id}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedTemplate === template.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="aspect-[3/4] bg-gray-200 rounded mb-3 flex items-center justify-center">
                    <span className="text-gray-500">Preview</span>
                  </div>
                  <h5 className="font-medium mb-1">{template.name}</h5>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Theme Selection */}
          <div>
            <h4 className="font-medium mb-4">Color Themes</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {themes.map(theme => (
                <Card
                  key={theme.id}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedTheme === theme.id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedTheme(theme.id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: theme.color }}
                    />
                    <span className="font-medium">{theme.name}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Optimization Tab */}
      {activeTab === 'optimization' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">AI Resume Optimization</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Role (optional)
                </label>
                <Input
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description (optional)
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Paste the job description to optimize for specific keywords..."
                />
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <Button onClick={optimizeResume} loading={loading}>
                <FiStar className="w-4 h-4 mr-2" />
                Optimize Resume
              </Button>
              <Button onClick={analyzeResume} variant="outline" loading={loading}>
                📊 Analyze Resume
              </Button>
            </div>
          </Card>

          {optimization && (
            <Card className="p-6">
              <h4 className="text-lg font-semibold mb-4">Optimization Results</h4>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {optimization.atsScore}%
                  </div>
                  <div className="text-sm text-gray-600">ATS Score</div>
                </div>
                <div className="col-span-2">
                  <h5 className="font-medium mb-3">Suggestions</h5>
                  <div className="space-y-2">
                    {optimization.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                        <FiAlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-sm">{suggestion.message}</div>
                          <div className="text-xs text-gray-600">{suggestion.improvement}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Analysis Tab */}
      {activeTab === 'analysis' && analysis && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Resume Analysis</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {analysis.overall_score}%
                </div>
                <div className="text-gray-600">Overall Score</div>
              </div>

              <div className="space-y-4">
                {Object.entries(analysis.sections).map(([section, data]) => (
                  <div key={section} className="flex justify-between items-center">
                    <span className="capitalize font-medium">
                      {section.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${data.score}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{data.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Recommendations</h4>
              <div className="space-y-2">
                {analysis.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                    <FiCheck className="w-4 h-4 text-blue-600 mt-0.5" />
                    <span className="text-sm">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Preview & Download Tab */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Generate & Download Resume</h3>
            <div className="flex gap-4 mb-6">
              <Button onClick={() => generateResume('pdf')} loading={loading}>
                📄 Generate PDF
              </Button>
              <Button onClick={() => generateResume('html')} variant="outline" loading={loading}>
                🌐 Generate HTML
              </Button>
            </div>

            {resumeJob && (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {resumeJob.status === 'processing' && <FiClock className="w-4 h-4 text-yellow-600" />}
                    {resumeJob.status === 'completed' && <FiCheck className="w-4 h-4 text-green-600" />}
                    {resumeJob.status === 'failed' && <FiAlertCircle className="w-4 h-4 text-red-600" />}
                    <span className="font-medium capitalize">{resumeJob.status}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {resumeJob.metadata.template} • {resumeJob.metadata.theme} • {resumeJob.metadata.format.toUpperCase()}
                  </div>
                </div>

                {resumeJob.status === 'completed' && (
                  <div className="flex gap-2">
                    <Button onClick={downloadResume}>
                      <FiDownload className="w-4 h-4 mr-2" />
                      Download Resume
                    </Button>
                    <Button variant="outline">
                      <FiEye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                )}

                {resumeJob.status === 'failed' && (
                  <div className="text-red-600 text-sm">
                    Error: {resumeJob.error || 'Generation failed'}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ATS Analysis Tab */}
      {activeTab === 'ats-analysis' && (
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-100 rounded-full">
                <FiBarChart className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">ATS Analysis & Scoring</h3>
                <p className="text-gray-600">Comprehensive analysis of your resume's ATS compatibility</p>
              </div>
            </div>

            {atsScore && (
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Overall Score */}
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        stroke={atsScore.ats_score >= 80 ? "#10b981" : atsScore.ats_score >= 60 ? "#f59e0b" : "#ef4444"}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 50}`}
                        strokeDashoffset={`${2 * Math.PI * 50 * (1 - atsScore.ats_score / 100)}`}
                        className="transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{atsScore.ats_score}%</div>
                        <div className="text-xs text-gray-600">ATS Score</div>
                      </div>
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${
                    atsScore.ats_score >= 80 ? 'text-green-600' :
                    atsScore.ats_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {atsScore.ats_score >= 80 ? 'Excellent' :
                     atsScore.ats_score >= 60 ? 'Good' : 'Needs Improvement'}
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="lg:col-span-2">
                  <h4 className="font-semibold text-gray-900 mb-4">Score Breakdown</h4>
                  <div className="space-y-4">
                    {Object.entries(atsScore.breakdown).map(([category, score]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {category.replace(/_/g, ' ')}
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${
                                score >= 80 ? 'bg-green-500' :
                                score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(score, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold w-8">{score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Keyword Analysis */}
            {atsScore?.keyword_analysis && Object.keys(atsScore.keyword_analysis).length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiTarget className="w-5 h-5 text-blue-500" />
                  Keyword Matching Analysis
                </h4>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {atsScore.keyword_analysis.match_rate}%
                    </div>
                    <div className="text-sm text-gray-600">Match Rate</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {atsScore.keyword_analysis.matched_keywords}
                    </div>
                    <div className="text-sm text-gray-600">Matched Keywords</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-orange-600 mb-1">
                      {atsScore.keyword_analysis.missing_keywords?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Missing Keywords</div>
                  </div>
                </div>

                {atsScore.keyword_analysis.missing_keywords?.length > 0 && (
                  <div className="mt-4">
                    <h5 className="font-medium text-gray-900 mb-2">Missing Keywords to Add:</h5>
                    <div className="flex flex-wrap gap-2">
                      {atsScore.keyword_analysis.missing_keywords.slice(0, 10).map((keyword: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Recommendations */}
            {atsScore?.recommendations && atsScore.recommendations.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiLightbulb className="w-5 h-5 text-yellow-500" />
                  ATS Optimization Recommendations
                </h4>
                <div className="space-y-3">
                  {atsScore.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-yellow-700 text-xs font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">{rec}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Smart Suggestions Tab */}
      {activeTab === 'ai-suggestions' && (
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-orange-100 rounded-full">
                <FiLightbulb className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">AI-Powered Smart Suggestions</h3>
                <p className="text-gray-600">Personalized recommendations based on your industry and career level</p>
              </div>
            </div>

            <div className="flex gap-4 mb-6">
              <Button
                onClick={getSmartSuggestions}
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {loading ? <FiRefreshCw className="w-4 h-4 animate-spin mr-2" /> : <FiBrain className="w-4 h-4 mr-2" />}
                Generate New Suggestions
              </Button>

              <select
                value={targetIndustry}
                onChange={(e) => setTargetIndustry(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="technology">Technology</option>
                <option value="finance">Finance</option>
                <option value="healthcare">Healthcare</option>
                <option value="marketing">Marketing</option>
                <option value="education">Education</option>
                <option value="consulting">Consulting</option>
              </select>
            </div>

            {smartSuggestions.length > 0 && (
              <div className="space-y-6">
                {/* Priority Actions */}
                {smartSuggestions.filter(s => s.priority === 'high').length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FiAlertCircle className="w-5 h-5 text-red-500" />
                      High Priority Actions ({smartSuggestions.filter(s => s.priority === 'high').length})
                    </h4>
                    <div className="grid gap-4">
                      {smartSuggestions.filter(s => s.priority === 'high').map((suggestion, index) => (
                        <div key={index} className="border border-red-200 bg-red-50 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900 mb-1">{suggestion.message}</h5>
                              <p className="text-sm text-gray-600 mb-3">{suggestion.action}</p>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                                  {suggestion.type}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                                  {suggestion.category}
                                </span>
                              </div>
                            </div>
                            <Button size="sm" variant="outline" className="border-red-200 text-red-700 hover:bg-red-100">
                              Apply
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Medium Priority */}
                {smartSuggestions.filter(s => s.priority === 'medium').length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FiClock className="w-5 h-5 text-yellow-500" />
                      Medium Priority ({smartSuggestions.filter(s => s.priority === 'medium').length})
                    </h4>
                    <div className="grid gap-4">
                      {smartSuggestions.filter(s => s.priority === 'medium').map((suggestion, index) => (
                        <div key={index} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900 mb-1">{suggestion.message}</h5>
                              <p className="text-sm text-gray-600 mb-3">{suggestion.action}</p>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                                  {suggestion.type}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                                  {suggestion.category}
                                </span>
                              </div>
                            </div>
                            <Button size="sm" variant="outline" className="border-yellow-200 text-yellow-700 hover:bg-yellow-100">
                              Apply
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Low Priority */}
                {smartSuggestions.filter(s => s.priority === 'low').length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FiCheck className="w-5 h-5 text-green-500" />
                      Optional Improvements ({smartSuggestions.filter(s => s.priority === 'low').length})
                    </h4>
                    <div className="grid gap-4">
                      {smartSuggestions.filter(s => s.priority === 'low').map((suggestion, index) => (
                        <div key={index} className="border border-green-200 bg-green-50 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900 mb-1">{suggestion.message}</h5>
                              <p className="text-sm text-gray-600 mb-3">{suggestion.action}</p>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                  {suggestion.type}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                                  {suggestion.category}
                                </span>
                              </div>
                            </div>
                            <Button size="sm" variant="outline" className="border-green-200 text-green-700 hover:bg-green-100">
                              Apply
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {smartSuggestions.length === 0 && !loading && (
              <div className="text-center py-12">
                <FiLightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Suggestions Available</h4>
                <p className="text-gray-600 mb-4">Click "Generate New Suggestions" to get personalized recommendations for your resume.</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Add missing helper functions */}
      {/* (These would be defined outside the JSX but inside the component) */}
    </div>
  );

  // Helper functions
  function addExperience() {
    const newExp: Experience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      achievements: []
    };
    setResumeData(prev => ({ ...prev, experience: [...prev.experience, newExp] }));
  }

  function removeExperience(id: string) {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  }

  function updateExperience(id: string, field: string, value: any) {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  }

  function addAchievement(expId: string) {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === expId ? { ...exp, achievements: [...exp.achievements, ''] } : exp
      )
    }));
  }

  // Generate Resume functions
  const generateResume = async (format: 'pdf' | 'html' = 'pdf') => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8006/api/resume/generate?format=${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...resumeData, template: selectedTemplate, theme: selectedTheme })
      });

      const data = await response.json();
      if (data.jobId) {
        setResumeJob({
          id: data.jobId,
          status: 'processing',
          metadata: {
            template: selectedTemplate,
            theme: selectedTheme,
            format,
            createdAt: new Date().toISOString()
          }
        });
        pollJobStatus(data.jobId);
      }
    } catch (error) {
      console.error('Resume generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const pollJobStatus = async (jobId: string) => {
    const maxAttempts = 30;
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`http://localhost:8006/api/resume/job/${jobId}`);
        const job = await response.json();
        setResumeJob(job);

        if (job.status === 'completed' || job.status === 'failed') {
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        }
      } catch (error) {
        console.error('Failed to check job status:', error);
      }
    };

    poll();
  };

  const downloadResume = async () => {
    if (!resumeJob?.id) return;

    try {
      const response = await fetch(`http://localhost:8006/api/resume/download/${resumeJob.id}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume_${resumeJob.id}.${resumeJob.metadata.format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  // Placeholder functions for missing functionality
  const optimizeResume = async () => {
    // Implementation would go here
    console.log('Optimize resume functionality');
  };

  const analyzeResume = async () => {
    // Implementation would go here
    console.log('Analyze resume functionality');
  };
}
