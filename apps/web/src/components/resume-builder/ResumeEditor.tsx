import React, { useState } from 'react';
import { ResumeData, SectionType } from '../../types/resume';
import { PersonalInfoEditor } from './sections/PersonalInfoEditor';
import { ExperienceEditor } from './sections/ExperienceEditor';
import { EducationEditor } from './sections/EducationEditor';
import { SkillsEditor } from './sections/SkillsEditor';
import { ProjectsEditor } from './sections/ProjectsEditor';
import { CertificationsEditor } from './sections/CertificationsEditor';
import { LanguagesEditor } from './sections/LanguagesEditor';
import { AwardsEditor } from './sections/AwardsEditor';
import { VolunteerEditor } from './sections/VolunteerEditor';
import { ReferencesEditor } from './sections/ReferencesEditor';
import { SummaryEditor } from './sections/SummaryEditor';

interface ResumeEditorProps {
  resumeData: ResumeData | null;
  currentSection: string;
  onSectionChange: (section: string) => void;
  onDataUpdate: (section: string, data: any) => void;
}

const sections = [
  { id: 'personal_info', name: 'Personal Info', icon: '👤', required: true, category: 'core' },
  { id: 'professional_summary', name: 'Summary', icon: '📝', required: false, category: 'core' },
  { id: 'experience', name: 'Experience', icon: '💼', required: true, category: 'core' },
  { id: 'education', name: 'Education', icon: '🎓', required: true, category: 'core' },
  { id: 'skills', name: 'Skills', icon: '⚡', required: true, category: 'core' },
  { id: 'projects', name: 'Projects', icon: '🚀', required: false, category: 'additional' },
  { id: 'certifications', name: 'Certifications', icon: '🏆', required: false, category: 'additional' },
  { id: 'awards', name: 'Awards & Honors', icon: '🏅', required: false, category: 'additional' },
  { id: 'languages', name: 'Languages', icon: '🌍', required: false, category: 'additional' },
  { id: 'volunteer_experiences', name: 'Volunteer Work', icon: '🤝', required: false, category: 'additional' },
  { id: 'references', name: 'References', icon: '📋', required: false, category: 'additional' },
];

export const ResumeEditor: React.FC<ResumeEditorProps> = ({
  resumeData,
  currentSection,
  onSectionChange,
  onDataUpdate,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set([currentSection])
  );

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
    onSectionChange(sectionId);
  };

  const getSectionProgress = (sectionId: string): number => {
    if (!resumeData) return 0;

    switch (sectionId) {
      case 'personal_info':
        const personalInfo = resumeData.personal_info;
        if (!personalInfo) return 0;
        const personalFields = ['full_name', 'email', 'phone', 'location'];
        const filledPersonal = personalFields.filter(field =>
          personalInfo[field as keyof typeof personalInfo]
        ).length;
        return (filledPersonal / personalFields.length) * 100;

      case 'experience':
        return resumeData.experiences?.length > 0 ? 100 : 0;

      case 'education':
        return resumeData.education?.length > 0 ? 100 : 0;

      case 'skills':
        return resumeData.skills?.length > 0 ? 100 : 0;

      case 'projects':
        return resumeData.projects?.length > 0 ? 100 : 0;

      case 'certifications':
        return resumeData.certifications?.length > 0 ? 100 : 0;

      case 'languages':
        return resumeData.languages?.length > 0 ? 100 : 0;

      case 'awards':
        return resumeData.awards?.length > 0 ? 100 : 0;

      case 'volunteer_experiences':
        return resumeData.volunteer_experiences?.length > 0 ? 100 : 0;

      case 'references':
        return resumeData.references?.length > 0 ? 100 : 0;

      case 'professional_summary':
        return resumeData.professional_summary?.content ? 100 : 0;

      default:
        return 0;
    }
  };

  const renderSectionEditor = (sectionId: string) => {
    if (!resumeData) return null;

    switch (sectionId) {
      case 'personal_info':
        return (
          <PersonalInfoEditor
            data={resumeData.personal_info || {
              full_name: '',
              email: '',
              phone: '',
              location: '',
              website: '',
              linkedin: '',
              github: '',
              portfolio: '',
              professional_summary: '',
            }}
            onUpdate={(data) => onDataUpdate('personal_info', data)}
          />
        );

      case 'professional_summary':
        return (
          <SummaryEditor
            data={resumeData.professional_summary || {
              content: '',
              style: 'professional',
              word_count: 0,
              key_strengths: [],
            }}
            onUpdate={(data) => onDataUpdate('professional_summary', data)}
          />
        );

      case 'experience':
        return (
          <ExperienceEditor
            data={resumeData.experiences || []}
            onUpdate={(data) => onDataUpdate('experiences', data)}
          />
        );

      case 'education':
        return (
          <EducationEditor
            data={resumeData.education || []}
            onUpdate={(data) => onDataUpdate('education', data)}
          />
        );

      case 'skills':
        return (
          <SkillsEditor
            data={resumeData.skills || []}
            onUpdate={(data) => onDataUpdate('skills', data)}
          />
        );

      case 'projects':
        return (
          <ProjectsEditor
            data={resumeData.projects || []}
            onUpdate={(data) => onDataUpdate('projects', data)}
          />
        );

      case 'certifications':
        return (
          <CertificationsEditor
            data={resumeData.certifications || []}
            onUpdate={(data) => onDataUpdate('certifications', data)}
          />
        );

      case 'awards':
        return (
          <AwardsEditor
            data={resumeData.awards || []}
            onUpdate={(data) => onDataUpdate('awards', data)}
          />
        );

      case 'languages':
        return (
          <LanguagesEditor
            data={resumeData.languages || []}
            onUpdate={(data) => onDataUpdate('languages', data)}
          />
        );

      case 'volunteer_experiences':
        return (
          <VolunteerEditor
            data={resumeData.volunteer_experiences || []}
            onUpdate={(data) => onDataUpdate('volunteer_experiences', data)}
          />
        );

      case 'references':
        return (
          <ReferencesEditor
            data={resumeData.references || []}
            onUpdate={(data) => onDataUpdate('references', data)}
          />
        );

      default:
        return <div className="p-4 text-gray-500">Section not implemented yet.</div>;
    }
  };

  const coreSection = sections.filter(s => s.category === 'core');
  const additionalSections = sections.filter(s => s.category === 'additional');

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume Progress</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sections.map((section) => {
            const progress = getSectionProgress(section.id);
            const isActive = currentSection === section.id;
            return (
              <div
                key={section.id}
                className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                  isActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onSectionChange(section.id)}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">{section.icon}</span>
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {section.name}
                  </span>
                  {section.required && (
                    <span className="text-red-500 text-xs">*</span>
                  )}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Core Sections */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm mr-3">
            🔧
          </span>
          Core Sections
        </h3>
        {coreSection.map((section) => {
          const isExpanded = expandedSections.has(section.id);
          const progress = getSectionProgress(section.id);

          return (
            <div key={section.id} className="bg-white rounded-lg border border-gray-200">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{section.icon}</span>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {section.name}
                      {section.required && <span className="text-red-500 ml-1">*</span>}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {progress === 100 && (
                    <span className="text-green-500 text-sm">✓ Complete</span>
                  )}
                  <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-200">
                  {renderSectionEditor(section.id)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Additional Sections */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm mr-3">
            ✨
          </span>
          Additional Sections
        </h3>
        {additionalSections.map((section) => {
          const isExpanded = expandedSections.has(section.id);
          const progress = getSectionProgress(section.id);

          return (
            <div key={section.id} className="bg-white rounded-lg border border-gray-200">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{section.icon}</span>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{section.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            progress === 100 ? 'bg-green-500' : 'bg-purple-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {progress === 100 && (
                    <span className="text-green-500 text-sm">✓ Complete</span>
                  )}
                  <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-200">
                  {renderSectionEditor(section.id)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          💡 Resume Building Tips
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Required Sections:</h5>
            <ul className="space-y-1">
              <li>• Complete all core sections first</li>
              <li>• Add quantifiable achievements</li>
              <li>• Use action verbs and keywords</li>
              <li>• Keep information current and relevant</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Optional Sections:</h5>
            <ul className="space-y-1">
              <li>• Add sections relevant to your field</li>
              <li>• Include awards and certifications</li>
              <li>• Showcase volunteer work and projects</li>
              <li>• Feature language skills if relevant</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
