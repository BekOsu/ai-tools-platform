import React, { useState, useEffect } from 'react';
import { ResumeData, Template } from '../../types/resume';

interface ResumePreviewProps {
  resumeData: ResumeData | null;
  template: Template | null;
  zoom: number;
  device?: 'desktop' | 'tablet' | 'mobile';
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  resumeData,
  template,
  zoom,
  device = 'desktop'
}) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!resumeData || !template) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-4">📄</div>
          <p className="text-gray-500">Resume preview will appear here</p>
        </div>
      </div>
    );
  }

  const getDeviceClass = () => {
    switch (device) {
      case 'tablet':
        return 'max-w-md';
      case 'mobile':
        return 'max-w-sm';
      default:
        return 'max-w-2xl';
    }
  };

  const renderModernTemplate = () => (
    <div className="bg-white shadow-lg" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">
              {resumeData.personal_info?.full_name || 'Your Name'}
            </h1>
            <p className="text-xl text-blue-100 mb-4">
              {resumeData.target_role || 'Professional Title'}
            </p>
            {resumeData.personal_info?.professional_summary && (
              <p className="text-blue-50 leading-relaxed max-w-2xl">
                {resumeData.personal_info.professional_summary}
              </p>
            )}
          </div>
          {resumeData.personal_info?.profile_photo && (
            <div className="ml-8">
              <img
                src={resumeData.personal_info.profile_photo}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-blue-50 px-8 py-4 border-b">
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-700">
          {resumeData.personal_info?.email && (
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{resumeData.personal_info.email}</span>
            </div>
          )}
          {resumeData.personal_info?.phone && (
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{resumeData.personal_info.phone}</span>
            </div>
          )}
          {resumeData.personal_info?.location && (
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{resumeData.personal_info.location}</span>
            </div>
          )}
          {resumeData.personal_info?.linkedin && (
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span>{resumeData.personal_info.linkedin}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Experience */}
          {resumeData.experiences && resumeData.experiences.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-blue-600 pb-2">
                Professional Experience
              </h2>
              <div className="space-y-6">
                {resumeData.experiences.map((exp, index) => (
                  <div key={index} className="relative">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{exp.position}</h3>
                        <p className="text-blue-600 font-medium">{exp.company}</p>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        <p>{exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}</p>
                        {exp.location && <p>{exp.location}</p>}
                      </div>
                    </div>
                    <div className="text-gray-700 leading-relaxed">
                      <p className="mb-3">{exp.description}</p>
                      {exp.achievements && exp.achievements.length > 0 && (
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {exp.achievements.map((achievement, i) => (
                            <li key={i}>{achievement}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {resumeData.projects && resumeData.projects.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-blue-600 pb-2">
                Key Projects
              </h2>
              <div className="space-y-4">
                {resumeData.projects.slice(0, 3).map((project, index) => (
                  <div key={index} className="border-l-4 border-blue-200 pl-4">
                    <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                    <p className="text-gray-700 mb-2">{project.description}</p>
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Skills */}
          {resumeData.skills && resumeData.skills.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-blue-600 pb-2">
                Skills
              </h2>
              <div className="space-y-4">
                {['technical', 'soft', 'tools'].map(category => {
                  const categorySkills = resumeData.skills.filter(skill => skill.category === category);
                  if (categorySkills.length === 0) return null;

                  return (
                    <div key={category}>
                      <h3 className="font-semibold text-gray-800 mb-2 capitalize">
                        {category === 'technical' ? 'Technical Skills' :
                         category === 'soft' ? 'Soft Skills' : 'Tools & Software'}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {categorySkills.map((skill, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full"
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Education */}
          {resumeData.education && resumeData.education.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-blue-600 pb-2">
                Education
              </h2>
              <div className="space-y-4">
                {resumeData.education.map((edu, index) => (
                  <div key={index}>
                    <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                    <p className="text-blue-600">{edu.field_of_study}</p>
                    <p className="text-gray-700">{edu.institution}</p>
                    <p className="text-sm text-gray-600">{edu.end_date}</p>
                    {edu.gpa && (
                      <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {resumeData.certifications && resumeData.certifications.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-blue-600 pb-2">
                Certifications
              </h2>
              <div className="space-y-3">
                {resumeData.certifications.map((cert, index) => (
                  <div key={index}>
                    <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                    <p className="text-blue-600 text-sm">{cert.issuing_organization}</p>
                    <p className="text-gray-600 text-sm">{cert.issue_date}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {resumeData.languages && resumeData.languages.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-blue-600 pb-2">
                Languages
              </h2>
              <div className="space-y-2">
                {resumeData.languages.map((lang, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-900">{lang.name}</span>
                    <span className="text-gray-600 text-sm capitalize">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );

  const renderTemplate = () => {
    switch (template?.type) {
      case 'modern':
        return renderModernTemplate();
      case 'classic':
        // Would implement classic template
        return renderModernTemplate();
      case 'creative':
        // Would implement creative template
        return renderModernTemplate();
      default:
        return renderModernTemplate();
    }
  };

  return (
    <div className={`${getDeviceClass()} mx-auto overflow-hidden`}>
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        {renderTemplate()}
      </div>
    </div>
  );
};
