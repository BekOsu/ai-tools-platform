import React, { useState } from 'react';

interface ExportOptionsProps {
  onExport: (format: 'pdf' | 'docx' | 'html') => void;
  isExporting?: boolean;
}

export const ExportOptions: React.FC<ExportOptionsProps> = ({
  onExport,
  isExporting = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'docx' | 'html'>('pdf');

  const exportOptions = [
    {
      format: 'pdf' as const,
      name: 'PDF Document',
      description: 'Best for sharing and printing',
      icon: '📄',
      features: ['Print-ready', 'Universal compatibility', 'Preserves formatting'],
      recommended: true
    },
    {
      format: 'docx' as const,
      name: 'Word Document',
      description: 'Editable Microsoft Word format',
      icon: '📝',
      features: ['Editable text', 'Microsoft Word', 'Easy to modify'],
      recommended: false
    },
    {
      format: 'html' as const,
      name: 'Web Page',
      description: 'Interactive web version',
      icon: '🌐',
      features: ['Interactive links', 'Web optimized', 'Responsive design'],
      recommended: false
    }
  ];

  const handleExport = (format: 'pdf' | 'docx' | 'html') => {
    setSelectedFormat(format);
    onExport(format);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export</span>
            <svg
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Export Resume</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {exportOptions.map((option) => (
                <div
                  key={option.format}
                  onClick={() => handleExport(option.format)}
                  className={`
                    group cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 hover:shadow-md relative
                    ${selectedFormat === option.format
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  {option.recommended && (
                    <div className="absolute -top-2 -right-2 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                      Recommended
                    </div>
                  )}

                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">{option.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {option.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {option.description}
                      </p>

                      <div className="space-y-1">
                        {option.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2 text-xs text-gray-600">
                            <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Export Buttons */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm font-medium text-gray-700 mb-3">Quick Export</div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleExport('pdf')}
                  className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded text-sm font-medium hover:bg-red-200 transition-colors"
                >
                  📄 PDF
                </button>
                <button
                  onClick={() => handleExport('docx')}
                  className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200 transition-colors"
                >
                  📝 Word
                </button>
                <button
                  onClick={() => handleExport('html')}
                  className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded text-sm font-medium hover:bg-green-200 transition-colors"
                >
                  🌐 Web
                </button>
              </div>
            </div>

            {/* Export Settings */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm font-medium text-gray-700 mb-3">Export Settings</div>
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                  <span className="text-sm text-gray-600">Include contact information</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                  <span className="text-sm text-gray-600">Optimize for ATS scanning</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded text-blue-600" />
                  <span className="text-sm text-gray-600">Include AI optimization notes</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
