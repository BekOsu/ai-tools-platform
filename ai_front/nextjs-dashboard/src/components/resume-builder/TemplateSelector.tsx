import React, { useState, useEffect } from 'react';
import { Template } from '../../types/resume';

interface TemplateSelectorProps {
  selectedTemplate: Template | null;
  onTemplateChange: (template: Template) => void;
  templates?: Template[];
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateChange,
  templates: propTemplates,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Default templates if none provided
  const defaultTemplates: Template[] = [
    {
      id: 'modern',
      name: 'Modern Professional',
      type: 'modern',
      description: 'Clean, contemporary design perfect for tech and creative roles',
      preview_url: '/templates/modern-preview.png',
      color_schemes: ['blue', 'green', 'purple', 'red'],
      features: ['ATS-friendly', 'Clean layout', 'Modern typography'],
      layout: {
        columns: 2,
        sections: [],
        spacing: { margin: 16, padding: 24, line_height: 1.6, section_gap: 32 },
        colors: { primary: '#2563eb', secondary: '#64748b', accent: '#3b82f6', text: '#1f2937', background: '#ffffff' }
      }
    },
    {
      id: 'classic',
      name: 'Classic Professional',
      type: 'classic',
      description: 'Traditional format suitable for conservative industries',
      preview_url: '/templates/classic-preview.png',
      color_schemes: ['black', 'navy', 'dark-gray'],
      features: ['Traditional format', 'Professional appearance', 'Wide compatibility'],
      layout: {
        columns: 1,
        sections: [],
        spacing: { margin: 20, padding: 16, line_height: 1.5, section_gap: 24 },
        colors: { primary: '#1f2937', secondary: '#374151', accent: '#4b5563', text: '#111827', background: '#ffffff' }
      }
    },
    {
      id: 'creative',
      name: 'Creative Portfolio',
      type: 'creative',
      description: 'Eye-catching design for creative professionals',
      preview_url: '/templates/creative-preview.png',
      color_schemes: ['orange', 'teal', 'pink', 'yellow'],
      features: ['Creative layout', 'Visual elements', 'Portfolio integration'],
      layout: {
        columns: 2,
        sections: [],
        spacing: { margin: 12, padding: 20, line_height: 1.7, section_gap: 28 },
        colors: { primary: '#f97316', secondary: '#fb923c', accent: '#fdba74', text: '#1f2937', background: '#ffffff' }
      }
    },
    {
      id: 'minimal',
      name: 'Minimal Clean',
      type: 'minimal',
      description: 'Minimalist design focusing on content clarity',
      preview_url: '/templates/minimal-preview.png',
      color_schemes: ['gray', 'black', 'blue-gray'],
      features: ['Minimal design', 'Focus on content', 'Easy to read'],
      layout: {
        columns: 1,
        sections: [],
        spacing: { margin: 24, padding: 32, line_height: 1.8, section_gap: 40 },
        colors: { primary: '#6b7280', secondary: '#9ca3af', accent: '#d1d5db', text: '#374151', background: '#ffffff' }
      }
    },
    {
      id: 'executive',
      name: 'Executive Leadership',
      type: 'executive',
      description: 'Sophisticated design for senior-level positions',
      preview_url: '/templates/executive-preview.png',
      color_schemes: ['navy', 'charcoal', 'burgundy'],
      features: ['Executive styling', 'Leadership focus', 'Professional imagery'],
      layout: {
        columns: 2,
        sections: [],
        spacing: { margin: 20, padding: 28, line_height: 1.6, section_gap: 36 },
        colors: { primary: '#1e40af', secondary: '#3730a3', accent: '#4338ca', text: '#1f2937', background: '#ffffff' }
      }
    }
  ];

  useEffect(() => {
    if (propTemplates) {
      setTemplates(propTemplates);
    } else {
      loadTemplates();
    }
  }, [propTemplates]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/templates/');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      } else {
        // Fallback to default templates
        setTemplates(defaultTemplates);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      setTemplates(defaultTemplates);
    } finally {
      setIsLoading(false);
    }
  };

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case 'modern':
        return '🚀';
      case 'classic':
        return '📄';
      case 'creative':
        return '🎨';
      case 'minimal':
        return '✨';
      case 'executive':
        return '👔';
      default:
        return '📝';
    }
  };

  const getColorPreview = (colorScheme: string) => {
    const colorMap: Record<string, string> = {
      blue: '#3b82f6',
      green: '#10b981',
      purple: '#8b5cf6',
      red: '#ef4444',
      black: '#1f2937',
      navy: '#1e40af',
      'dark-gray': '#374151',
      orange: '#f97316',
      teal: '#14b8a6',
      pink: '#ec4899',
      yellow: '#eab308',
      gray: '#6b7280',
      'blue-gray': '#64748b',
      charcoal: '#374151',
      burgundy: '#991b1b'
    };
    return colorMap[colorScheme] || '#3b82f6';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <span className="text-lg">{getTemplateIcon(selectedTemplate?.type || 'modern')}</span>
        <span className="font-medium">{selectedTemplate?.name || 'Select Template'}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-w-4xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Choose Template</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3">Loading templates...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => {
                      onTemplateChange(template);
                      setIsOpen(false);
                    }}
                    className={`
                      group cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 hover:shadow-lg
                      ${selectedTemplate?.id === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    {/* Template Preview */}
                    <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-4 overflow-hidden relative">
                      <div className="absolute inset-4">
                        {/* Mock resume preview based on template type */}
                        <div className={`
                          w-full h-full bg-white rounded shadow-sm p-3 text-xs
                          ${template.type === 'modern' ? 'bg-gradient-to-b from-blue-50' : ''}
                          ${template.type === 'creative' ? 'bg-gradient-to-br from-orange-50' : ''}
                        `}>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-lg">{getTemplateIcon(template.type)}</span>
                            <div className="flex-1">
                              <div className="h-2 bg-gray-300 rounded mb-1"></div>
                              <div className="h-1 bg-gray-200 rounded w-2/3"></div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-1 bg-gray-200 rounded"></div>
                            <div className="h-1 bg-gray-200 rounded w-4/5"></div>
                            <div className="h-1 bg-gray-200 rounded w-3/5"></div>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <div className="h-1 bg-gray-300 rounded"></div>
                              <div className="h-1 bg-gray-200 rounded w-3/4"></div>
                            </div>
                            <div className="space-y-1">
                              <div className="h-1 bg-gray-300 rounded"></div>
                              <div className="h-1 bg-gray-200 rounded w-2/3"></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {selectedTemplate?.id === template.id && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Template Info */}
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {template.name}
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {template.description}
                        </p>
                      </div>

                      {/* Color Schemes */}
                      <div>
                        <div className="text-xs font-medium text-gray-700 mb-2">Color Options</div>
                        <div className="flex space-x-2">
                          {template.color_schemes.slice(0, 4).map((color, index) => (
                            <div
                              key={index}
                              className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: getColorPreview(color) }}
                              title={color}
                            />
                          ))}
                          {template.color_schemes.length > 4 && (
                            <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white shadow-sm flex items-center justify-center text-xs text-gray-600">
                              +{template.color_schemes.length - 4}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Features */}
                      <div>
                        <div className="text-xs font-medium text-gray-700 mb-2">Features</div>
                        <div className="flex flex-wrap gap-1">
                          {template.features.slice(0, 3).map((feature, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Template Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {templates.length} templates available
                </div>
                <div className="flex items-center space-x-3">
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Create Custom Template
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
