import React, { useState, useEffect } from 'react';
import { AISuggestion } from '../../types/resume';

interface AIAssistantProps {
  suggestions: AISuggestion[];
  currentSection: string;
  onApplySuggestion: (suggestion: AISuggestion) => void;
  onDismissSuggestion: (suggestionId: string) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  suggestions,
  currentSection,
  onApplySuggestion,
  onDismissSuggestion,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'analysis' | 'optimization'>('suggestions');
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredSuggestions = suggestions.filter(
    suggestion => suggestion.section === currentSection
  );

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'content':
        return '✍️';
      case 'formatting':
        return '📝';
      case 'keyword':
        return '🔍';
      case 'structure':
        return '🏗️';
      default:
        return '💡';
    }
  };

  const getSuggestionColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
            <p className="text-sm text-gray-500">
              {filteredSuggestions.length} suggestions for {currentSection}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg
            className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <>
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-1 px-4">
              {[
                { id: 'suggestions', name: 'Suggestions', count: filteredSuggestions.length },
                { id: 'analysis', name: 'Analysis', count: 0 },
                { id: 'optimization', name: 'Optimize', count: 0 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    px-4 py-3 text-sm font-medium border-b-2 transition-colors
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.name}
                  {tab.count > 0 && (
                    <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {activeTab === 'suggestions' && (
              <div className="space-y-4">
                {filteredSuggestions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">🤖</div>
                    <p className="text-gray-500 mb-4">No suggestions available yet</p>
                    <button
                      onClick={() => setIsGenerating(true)}
                      disabled={isGenerating}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2 mx-auto"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <span>Generate AI Suggestions</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  filteredSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className={`p-4 rounded-lg border-2 ${getSuggestionColor(suggestion.confidence)}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getSuggestionIcon(suggestion.type)}</span>
                          <div>
                            <h4 className="font-semibold">{suggestion.title}</h4>
                            <p className="text-sm opacity-75">{suggestion.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="px-2 py-1 text-xs font-medium rounded-full bg-white bg-opacity-50">
                            {Math.round(suggestion.confidence * 100)}%
                          </div>
                        </div>
                      </div>

                      {/* Content Preview */}
                      <div className="mb-3">
                        <div className="text-sm font-medium mb-2">Suggested improvement:</div>
                        <div className="bg-white bg-opacity-50 p-3 rounded border text-sm">
                          {suggestion.suggested_content}
                        </div>
                      </div>

                      {/* Reasoning */}
                      <div className="mb-4">
                        <div className="text-sm font-medium mb-1">Why this helps:</div>
                        <p className="text-sm opacity-75">{suggestion.reasoning}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onApplySuggestion(suggestion)}
                          className="px-3 py-1.5 bg-white text-sm font-medium rounded border hover:bg-gray-50 transition-colors"
                        >
                          Apply Suggestion
                        </button>
                        <button
                          onClick={() => onDismissSuggestion(suggestion.id)}
                          className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📊</div>
                  <p className="text-gray-500 mb-4">Resume Analysis</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-semibold text-gray-900">ATS Score</div>
                      <div className="text-2xl font-bold text-green-600">85%</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-semibold text-gray-900">Readability</div>
                      <div className="text-2xl font-bold text-blue-600">92%</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'optimization' && (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🎯</div>
                  <p className="text-gray-500 mb-4">Job Optimization</p>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Paste Job Description
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
