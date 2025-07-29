import {
  ResumeData,
  Award,
  Experience,
  Education,
  Skill,
  Project,
  Certification,
  Language,
  VolunteerExperience,
  Reference,
  ProfessionalSummary,
  PersonalInfo
} from '../types/resume';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ResumeApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Resume Management
  async getResumes(): Promise<ResumeData[]> {
    return this.request<ResumeData[]>('/resumes/');
  }

  async getResume(id: string): Promise<ResumeData> {
    return this.request<ResumeData>(`/resumes/${id}/`);
  }

  async createResume(data: Partial<ResumeData>): Promise<ResumeData> {
    return this.request<ResumeData>('/resumes/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateResume(id: string, data: Partial<ResumeData>): Promise<ResumeData> {
    return this.request<ResumeData>(`/resumes/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteResume(id: string): Promise<void> {
    return this.request<void>(`/resumes/${id}/`, {
      method: 'DELETE',
    });
  }

  async duplicateResume(id: string): Promise<ResumeData> {
    return this.request<ResumeData>(`/resumes/${id}/duplicate/`, {
      method: 'POST',
    });
  }

  // Personal Info
  async getPersonalInfo(resumeId: string): Promise<PersonalInfo> {
    return this.request<PersonalInfo>(`/resumes/${resumeId}/personal-info/`);
  }

  async updatePersonalInfo(resumeId: string, data: PersonalInfo): Promise<PersonalInfo> {
    return this.request<PersonalInfo>(`/resumes/${resumeId}/personal-info/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Professional Summary
  async getProfessionalSummary(resumeId: string): Promise<ProfessionalSummary> {
    return this.request<ProfessionalSummary>(`/resumes/${resumeId}/professional-summary/`);
  }

  async updateProfessionalSummary(resumeId: string, data: ProfessionalSummary): Promise<ProfessionalSummary> {
    return this.request<ProfessionalSummary>(`/resumes/${resumeId}/professional-summary/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Experience
  async getExperiences(resumeId: string): Promise<Experience[]> {
    return this.request<Experience[]>(`/resumes/${resumeId}/experiences/`);
  }

  async createExperience(resumeId: string, data: Omit<Experience, 'id'>): Promise<Experience> {
    return this.request<Experience>(`/resumes/${resumeId}/experiences/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateExperience(resumeId: string, id: string, data: Partial<Experience>): Promise<Experience> {
    return this.request<Experience>(`/resumes/${resumeId}/experiences/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteExperience(resumeId: string, id: string): Promise<void> {
    return this.request<void>(`/resumes/${resumeId}/experiences/${id}/`, {
      method: 'DELETE',
    });
  }

  async bulkUpdateExperiences(resumeId: string, experiences: Experience[]): Promise<Experience[]> {
    return this.request<Experience[]>(`/resumes/${resumeId}/experiences/bulk-update/`, {
      method: 'POST',
      body: JSON.stringify({ experiences }),
    });
  }

  // Education
  async getEducation(resumeId: string): Promise<Education[]> {
    return this.request<Education[]>(`/resumes/${resumeId}/education/`);
  }

  async createEducation(resumeId: string, data: Omit<Education, 'id'>): Promise<Education> {
    return this.request<Education>(`/resumes/${resumeId}/education/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEducation(resumeId: string, id: string, data: Partial<Education>): Promise<Education> {
    return this.request<Education>(`/resumes/${resumeId}/education/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteEducation(resumeId: string, id: string): Promise<void> {
    return this.request<void>(`/resumes/${resumeId}/education/${id}/`, {
      method: 'DELETE',
    });
  }

  // Skills
  async getSkills(resumeId: string): Promise<Skill[]> {
    return this.request<Skill[]>(`/resumes/${resumeId}/skills/`);
  }

  async createSkill(resumeId: string, data: Omit<Skill, 'id'>): Promise<Skill> {
    return this.request<Skill>(`/resumes/${resumeId}/skills/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSkill(resumeId: string, id: string, data: Partial<Skill>): Promise<Skill> {
    return this.request<Skill>(`/resumes/${resumeId}/skills/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteSkill(resumeId: string, id: string): Promise<void> {
    return this.request<void>(`/resumes/${resumeId}/skills/${id}/`, {
      method: 'DELETE',
    });
  }

  async bulkUpdateSkills(resumeId: string, skills: Skill[]): Promise<Skill[]> {
    return this.request<Skill[]>(`/resumes/${resumeId}/skills/bulk-update/`, {
      method: 'POST',
      body: JSON.stringify({ skills }),
    });
  }

  // Awards (NEW)
  async getAwards(resumeId: string): Promise<Award[]> {
    return this.request<Award[]>(`/resumes/${resumeId}/awards/`);
  }

  async createAward(resumeId: string, data: Omit<Award, 'id'>): Promise<Award> {
    return this.request<Award>(`/resumes/${resumeId}/awards/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAward(resumeId: string, id: string, data: Partial<Award>): Promise<Award> {
    return this.request<Award>(`/resumes/${resumeId}/awards/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAward(resumeId: string, id: string): Promise<void> {
    return this.request<void>(`/resumes/${resumeId}/awards/${id}/`, {
      method: 'DELETE',
    });
  }

  async duplicateAward(resumeId: string, id: string): Promise<Award> {
    return this.request<Award>(`/resumes/${resumeId}/awards/${id}/duplicate/`, {
      method: 'POST',
    });
  }

  async bulkUpdateAwards(resumeId: string, awards: Award[]): Promise<Award[]> {
    return this.request<Award[]>(`/resumes/${resumeId}/awards/bulk-update/`, {
      method: 'POST',
      body: JSON.stringify({ awards }),
    });
  }

  async getAwardStatistics(resumeId: string): Promise<{
    total_awards: number;
    featured_awards: number;
    awards_with_monetary_value: number;
    total_monetary_value: number;
    recurring_awards: number;
    by_category: Record<string, number>;
    by_prestige_level: Record<string, number>;
  }> {
    return this.request(`/resumes/${resumeId}/awards/statistics/`);
  }

  // Projects
  async getProjects(resumeId: string): Promise<Project[]> {
    return this.request<Project[]>(`/resumes/${resumeId}/projects/`);
  }

  async createProject(resumeId: string, data: Omit<Project, 'id'>): Promise<Project> {
    return this.request<Project>(`/resumes/${resumeId}/projects/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(resumeId: string, id: string, data: Partial<Project>): Promise<Project> {
    return this.request<Project>(`/resumes/${resumeId}/projects/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(resumeId: string, id: string): Promise<void> {
    return this.request<void>(`/resumes/${resumeId}/projects/${id}/`, {
      method: 'DELETE',
    });
  }

  // Certifications
  async getCertifications(resumeId: string): Promise<Certification[]> {
    return this.request<Certification[]>(`/resumes/${resumeId}/certifications/`);
  }

  async createCertification(resumeId: string, data: Omit<Certification, 'id'>): Promise<Certification> {
    return this.request<Certification>(`/resumes/${resumeId}/certifications/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCertification(resumeId: string, id: string, data: Partial<Certification>): Promise<Certification> {
    return this.request<Certification>(`/resumes/${resumeId}/certifications/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCertification(resumeId: string, id: string): Promise<void> {
    return this.request<void>(`/resumes/${resumeId}/certifications/${id}/`, {
      method: 'DELETE',
    });
  }

  // Languages
  async getLanguages(resumeId: string): Promise<Language[]> {
    return this.request<Language[]>(`/resumes/${resumeId}/languages/`);
  }

  async createLanguage(resumeId: string, data: Omit<Language, 'id'>): Promise<Language> {
    return this.request<Language>(`/resumes/${resumeId}/languages/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLanguage(resumeId: string, id: string, data: Partial<Language>): Promise<Language> {
    return this.request<Language>(`/resumes/${resumeId}/languages/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteLanguage(resumeId: string, id: string): Promise<void> {
    return this.request<void>(`/resumes/${resumeId}/languages/${id}/`, {
      method: 'DELETE',
    });
  }

  // Volunteer Experience
  async getVolunteerExperiences(resumeId: string): Promise<VolunteerExperience[]> {
    return this.request<VolunteerExperience[]>(`/resumes/${resumeId}/volunteer-experiences/`);
  }

  async createVolunteerExperience(resumeId: string, data: Omit<VolunteerExperience, 'id'>): Promise<VolunteerExperience> {
    return this.request<VolunteerExperience>(`/resumes/${resumeId}/volunteer-experiences/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateVolunteerExperience(resumeId: string, id: string, data: Partial<VolunteerExperience>): Promise<VolunteerExperience> {
    return this.request<VolunteerExperience>(`/resumes/${resumeId}/volunteer-experiences/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteVolunteerExperience(resumeId: string, id: string): Promise<void> {
    return this.request<void>(`/resumes/${resumeId}/volunteer-experiences/${id}/`, {
      method: 'DELETE',
    });
  }

  // References
  async getReferences(resumeId: string): Promise<Reference[]> {
    return this.request<Reference[]>(`/resumes/${resumeId}/references/`);
  }

  async createReference(resumeId: string, data: Omit<Reference, 'id'>): Promise<Reference> {
    return this.request<Reference>(`/resumes/${resumeId}/references/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReference(resumeId: string, id: string, data: Partial<Reference>): Promise<Reference> {
    return this.request<Reference>(`/resumes/${resumeId}/references/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteReference(resumeId: string, id: string): Promise<void> {
    return this.request<void>(`/resumes/${resumeId}/references/${id}/`, {
      method: 'DELETE',
    });
  }

  // AI Integration
  async generateAIContent(resumeId: string, data: {
    section: string;
    context: any;
    target_industry?: string;
    target_role?: string;
    writing_style?: string;
  }): Promise<{ generated_content: string; section: string }> {
    return this.request(`/resumes/${resumeId}/ai/generate-content/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async optimizeForJob(resumeId: string, data: {
    job_title: string;
    company_name?: string;
    job_description: string;
  }): Promise<any> {
    return this.request(`/resumes/${resumeId}/ai/optimize-job/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Analytics
  async getAnalytics(resumeId: string): Promise<any> {
    return this.request(`/resumes/${resumeId}/analytics/`);
  }

  async trackView(resumeId: string): Promise<void> {
    return this.request(`/resumes/${resumeId}/analytics/track-view/`, {
      method: 'POST',
    });
  }

  // Export
  async exportResume(resumeId: string, format: 'pdf' | 'docx' | 'html'): Promise<{
    download_url: string;
    format: string;
    expires_at: string;
  }> {
    return this.request(`/resumes/${resumeId}/export/`, {
      method: 'POST',
      body: JSON.stringify({ format }),
    });
  }

  // Templates
  async getTemplates(): Promise<any[]> {
    return this.request('/templates/');
  }
}

export const resumeApi = new ResumeApiService();
export default resumeApi;
