import { useState, useEffect } from 'react';
import { ResumeData, Template } from '../types/resume';
import { ResumePreview } from './ResumePreview';
import { ResumeEditor } from './ResumeEditor';
import { AIAssistant } from './AIAssistant';
import { TemplateSelector } from './TemplateSelector';
import { ExportOptions } from './ExportOptions';

interface ResumeBuilderProps {
  resumeId?: string;
  template?: string;
  aiAssistance?: boolean;
}

export const ResumeBuilder: React.FC<ResumeBuilderProps> = ({
  resumeId,
  template = 'modern',
  aiAssistance = true
}) => {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [currentSection, setCurrentSection] = useState('personal_info');
  const [isLoading, setIsLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [autoSave, setAutoSave] = useState(true);

  useEffect(() => {
    if (resumeId) {
      loadResume(resumeId);
    } else {
      createNewResume();
    }
  }, [resumeId]);

  const loadResume = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/resumes/${id}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setResumeData(data);
        loadTemplate(data.template_id);
      }
    } catch (error) {
      console.error('Error loading resume:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewResume = async () => {
    const newResumeData: Partial<ResumeData> = {
      title: 'New Resume',
      template_id: template,
      target_industry: '',
      target_role: '',
      experience_level: 'mid',
    };

    try {
      const response = await fetch('/api/resumes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(newResumeData),
      });

      if (response.ok) {
        const data = await response.json();
        setResumeData(data);
        loadTemplate(template);
      }
    } catch (error) {
      console.error('Error creating resume:', error);
    }
  };

  const loadTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/templates/${templateId}/`);
      if (response.ok) {
        const templateData = await response.json();
        setSelectedTemplate(templateData);
      }
    } catch (error) {
      console.error('Error loading template:', error);
    }
  };

  const updateResumeData = async (section: string, data: any) => {
    if (!resumeData) return;

    const updatedData = {
      ...resumeData,
      [section]: data,
    };

    setResumeData(updatedData);

    // Auto-save if enabled
    if (autoSave) {
      await saveResume(updatedData);
    }

    // Get AI suggestions for the updated section
    if (aiAssistance) {
      await getAISuggestions(section, data);
    }
  };

  const saveResume = async (data: ResumeData) => {
    if (!data.id) return;

    try {
      const response = await fetch(`/api/resumes/${data.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save resume');
      }
    } catch (error) {
      console.error('Error saving resume:', error);
    }
  };

  const getAISuggestions = async (section: string, data: any) => {
    try {
      const response = await fetch('/api/ai/generate-content/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          section,
          context: data,
          target_industry: resumeData?.target_industry,
          target_role: resumeData?.target_role,
        }),
      });

      if (response.ok) {
        const suggestions = await response.json();
        setAiSuggestions(suggestions.content);
      }
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
    }
  };

  const handleTemplateChange = (newTemplate: Template) => {
    setSelectedTemplate(newTemplate);
    if (resumeData) {
      updateResumeData('template_id', newTemplate.id);
    }
  };

  const handleExport = async (format: 'pdf' | 'docx' | 'html') => {
    if (!resumeData?.id) return;

    try {
      const response = await fetch(`/api/resumes/${resumeData.id}/export/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ format }),
      });

      if (response.ok) {
        const result = await response.json();
        // Handle download
        window.open(result.download_url, '_blank');
      }
    } catch (error) {
      console.error('Error exporting resume:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg">Loading resume...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {resumeData?.title || 'Resume Builder'}
              </h1>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Auto-save:</span>
                <button
                  onClick={() => setAutoSave(!autoSave)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoSave ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoSave ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <ExportOptions onExport={handleExport} />
              <TemplateSelector
                selectedTemplate={selectedTemplate}
                onTemplateChange={handleTemplateChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Panel */}
          <div className="space-y-6">
            <ResumeEditor
              resumeData={resumeData}
              currentSection={currentSection}
              onSectionChange={setCurrentSection}
              onDataUpdate={updateResumeData}
            />

            {aiAssistance && (
              <AIAssistant
                suggestions={aiSuggestions}
                currentSection={currentSection}
                onApplySuggestion={(suggestion) => {
                  // Apply AI suggestion to current section
                  updateResumeData(currentSection, suggestion);
                }}
              />
            )}
          </div>

          {/* Preview Panel */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Live Preview</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPreviewZoom(Math.max(50, previewZoom - 10))}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="text-sm text-gray-500">{previewZoom}%</span>
                  <button
                    onClick={() => setPreviewZoom(Math.min(150, previewZoom + 10))}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>

              <ResumePreview
                resumeData={resumeData}
                template={selectedTemplate}
                zoom={previewZoom}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
