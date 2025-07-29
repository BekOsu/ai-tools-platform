// Core Resume Data Types
export interface ResumeData {
  id?: string;
  title: string;
  template_id: string;
  user?: User;
  created_at?: string;
  updated_at?: string;
  ai_score: number;
  ats_score: number;
  readability_score: number;
  target_industry: string;
  target_role: string;
  experience_level: 'entry' | 'mid' | 'senior' | 'executive';
  color_scheme: ColorScheme;
  font_settings: FontSettings;
  layout_settings: LayoutSettings;
  is_public: boolean;
  is_featured: boolean;
  personal_info?: PersonalInfo;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  awards: Award[];
  volunteer_experiences: VolunteerExperience[];
  references: Reference[];
  professional_summary?: ProfessionalSummary;
  analytics?: ResumeAnalytics;
}

export interface PersonalInfo {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  portfolio: string;
  professional_summary: string;
  profile_photo?: string;
  nationality?: string;
  date_of_birth?: string;
}

export interface Experience {
  id?: string;
  company: string;
  position: string;
  location: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description: string;
  achievements: string[];
  technologies: string[];
}

export interface Education {
  id?: string;
  institution: string;
  degree: string;
  field_of_study: string;
  location: string;
  start_date: string;
  end_date?: string;
  gpa?: string;
  honors?: string;
  relevant_coursework: string[];
  activities: string[];
}

export interface Skill {
  id?: string;
  name: string;
  category: 'technical' | 'soft' | 'language' | 'tools' | 'frameworks' | 'industry';
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years_experience?: number;
  is_featured: boolean;
}

export interface Project {
  id?: string;
  title: string;
  description: string;
  technologies: string[];
  start_date: string;
  end_date?: string;
  is_ongoing: boolean;
  github_url?: string;
  live_url?: string;
  achievements: string[];
  role: string;
}

export interface Certification {
  id?: string;
  name: string;
  issuing_organization: string;
  issue_date: string;
  expiration_date?: string;
  credential_id?: string;
  credential_url?: string;
  is_featured: boolean;
}

export interface Language {
  id?: string;
  name: string;
  proficiency: 'basic' | 'conversational' | 'business' | 'fluent' | 'native';
  is_native: boolean;
  certifications: LanguageCertification[];
}

export interface LanguageCertification {
  name: string;
  score: string;
  date: string;
  level: string;
}

export interface Award {
  id?: string;
  title: string;
  issuer: string;
  date: string;
  category: 'academic' | 'professional' | 'leadership' | 'innovation' | 'service' | 'athletic' | 'research' | 'technical' | 'sales' | 'other';
  prestige_level: 'international' | 'national' | 'regional' | 'local' | 'organizational';
  description: string;
  monetary_value?: number;
  currency?: string;
  competition_size?: number;
  selection_ratio?: string;
  is_recurring: boolean;
  recurrence_frequency?: string;
  url?: string;
  is_featured: boolean;
}

export interface VolunteerExperience {
  id?: string;
  organization: string;
  role: string;
  location: string;
  start_date: string;
  end_date?: string;
  is_ongoing: boolean;
  category: 'community' | 'education' | 'healthcare' | 'environment' | 'animals' | 'arts' | 'sports' | 'religious' | 'humanitarian' | 'other';
  description: string;
  achievements: string[];
  skills_gained: string[];
  hours_per_week?: number;
  total_hours?: number;
  website?: string;
}

export interface Reference {
  id?: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  relationship: 'supervisor' | 'colleague' | 'client' | 'mentor' | 'professor' | 'other';
  years_known: number;
  okay_to_contact: boolean;
  description?: string;
}

export interface ProfessionalSummary {
  id?: string;
  content: string;
  style: 'professional' | 'creative' | 'executive' | 'technical';
  word_count: number;
  key_strengths: string[];
  career_goals?: string;
  target_role?: string;
  target_industry?: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
}

export interface FontSettings {
  heading_font: string;
  body_font: string;
  font_size: 'small' | 'medium' | 'large';
}

export interface LayoutSettings {
  layout: 'modern' | 'classic' | 'creative' | 'minimal';
  spacing: 'compact' | 'normal' | 'spacious';
  show_icons: boolean;
  show_progress_bars: boolean;
}

export interface ResumeAnalytics {
  views: number;
  downloads: number;
  ai_optimizations: number;
  last_updated: string;
  keyword_matches: number;
  estimated_read_time: number;
}

// Template Types
export interface Template {
  id: string;
  name: string;
  type: 'modern' | 'classic' | 'creative' | 'minimal' | 'professional' | 'tech' | 'executive' | 'academic';
  description: string;
  preview_url: string;
  color_schemes: string[];
  features: string[];
  layout: LayoutConfig;
}

export interface LayoutConfig {
  columns: number;
  sections: SectionLayout[];
  spacing_config: SpacingConfig;
  colors: ColorConfig;
}

export interface SectionLayout {
  id: string;
  name: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  required: boolean;
}

export interface SpacingConfig {
  margin: number;
  padding: number;
  line_height: number;
  section_gap: number;
}

export interface ColorConfig {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
}

// AI Types
export interface AISuggestion {
  id: string;
  type: 'content' | 'formatting' | 'keyword' | 'structure';
  section: string;
  title: string;
  description: string;
  original_content: string;
  suggested_content: string;
  confidence: number;
  reasoning: string;
}

// Utility Types
export type SectionType = 'personal_info' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications' | 'languages' | 'awards' | 'volunteer_experiences' | 'references' | 'professional_summary';

export type ValidationError = {
  field: string;
  message: string;
};

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export type ThemeMode = 'light' | 'dark' | 'auto';
