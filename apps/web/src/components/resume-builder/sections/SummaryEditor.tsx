import React, { useState, useEffect } from 'react';
import { Summary } from '../../../types/resume';

interface SummaryEditorProps {
  data: Summary;
  onUpdate: (data: Summary) => void;
  userProfile?: {
    targetRole?: string;
    targetIndustry?: string;
    experience?: any[];
    skills?: any[];
  };
}

export const SummaryEditor: React.FC<SummaryEditorProps> = ({
  data,
  onUpdate,
  userProfile,
}) => {
  const [summary, setSummary] = useState<Summary>(data || {
    type: 'summary',
    content: '',
    keyStrengths: [],
    careerGoals: '',
  });
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('professional');

  const summaryTemplates = [
    {
      id: 'professional',
      name: 'Professional',
      description: 'Formal and detailed',
      icon: '👔',
    },
    {
      id: 'creative',
      name: 'Creative',
      description: 'Engaging and dynamic',
      icon: '🎨',
    },
    {
      id: 'executive',
      name: 'Executive',
      description: 'Leadership focused',
      icon: '🏆',
    },
    {
      id: 'technical',
      name: 'Technical',
      description: 'Skills and expertise',
      icon: '💻',
    },
  ];

  useEffect(() => {
    onUpdate(summary);
  }, [summary, onUpdate]);

  useEffect(() => {
    if (userProfile?.targetRole && userProfile?.targetIndustry) {
      generateAISuggestions();
    }
  }, [userProfile?.targetRole, userProfile?.targetIndustry]);

  const generateAISuggestions = async () => {
    if (!userProfile?.targetRole || !userProfile?.targetIndustry) return;

    setIsLoadingSuggestions(true);
    try {
      const response = await fetch('/api/ai/generate-summary/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: userProfile.targetRole,
          targetIndustry: userProfile.targetIndustry,
          experience: userProfile.experience || [],
          skills: userProfile.skills || [],
          template: selectedTemplate,
        }),
      });

      if (response.ok) {
        const suggestions = await response.json();
        setAiSuggestions(suggestions.suggestions || []);
      }
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const updateSummary = (field: keyof Summary, value: any) => {
    setSummary(prev => ({ ...prev, [field]: value }));
  };

  const addKeyStrength = () => {
    const newStrengths = [...(summary.keyStrengths || []), ''];
    updateSummary('keyStrengths', newStrengths);
  };

  const updateKeyStrength = (index: number, value: string) => {
    const newStrengths = [...(summary.keyStrengths || [])];
    newStrengths[index] = value;
    updateSummary('keyStrengths', newStrengths);
  };

  const removeKeyStrength = (index: number) => {
    const newStrengths = summary.keyStrengths?.filter((_, i) => i !== index) || [];
    updateSummary('keyStrengths', newStrengths);
  };

  const applySuggestion = (suggestion: string) => {
    updateSummary('content', suggestion);
  };

  const wordCount = summary.content?.split(/\s+/).filter(word => word.length > 0).length || 0;
  const recommendedRange = { min: 50, max: 150 };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          📝 Professional Summary
        </h3>
        <p className="text-blue-700 text-sm">
          Create a compelling professional summary that highlights your key strengths and career objectives.
        </p>
      </div>

      {/* Summary Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Summary Type
        </label>
        <div className="flex space-x-2">
          <button
            onClick={() => updateSummary('type', 'summary')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              summary.type === 'summary'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Professional Summary
          </button>
          <button
            onClick={() => updateSummary('type', 'objective')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              summary.type === 'objective'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Career Objective
          </button>
        </div>
      </div>

      {/* Template Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Writing Style
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {summaryTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                setSelectedTemplate(template.id);
                generateAISuggestions();
              }}
              className={`p-3 rounded-lg border text-center transition-colors ${
                selectedTemplate === template.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">{template.icon}</div>
              <div className="font-medium text-sm">{template.name}</div>
              <div className="text-xs text-gray-500">{template.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-lg">🤖</span>
            <h4 className="font-medium text-gray-900">AI-Generated Suggestions</h4>
          </div>
          <div className="space-y-2">
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} className="bg-white p-3 rounded border">
                <p className="text-sm text-gray-700 mb-2">{suggestion}</p>
                <button
                  onClick={() => applySuggestion(suggestion)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Use This Suggestion
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Content */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            {summary.type === 'objective' ? 'Career Objective' : 'Professional Summary'}
          </label>
          <div className="flex items-center space-x-2">
            <span className={`text-xs ${
              wordCount < recommendedRange.min ? 'text-red-600' :
              wordCount > recommendedRange.max ? 'text-orange-600' :
              'text-green-600'
            }`}>
              {wordCount} words
            </span>
            <button
              onClick={generateAISuggestions}
              disabled={isLoadingSuggestions}
              className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              {isLoadingSuggestions ? 'Generating...' : '✨ AI Assist'}
            </button>
          </div>
        </div>
        <textarea
          value={summary.content || ''}
          onChange={(e) => updateSummary('content', e.target.value)}
          placeholder={`Write a compelling ${summary.type === 'objective' ? 'career objective' : 'professional summary'} that highlights your key strengths and goals...`}
          className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <div className="mt-1 text-xs text-gray-500">
          Recommended: {recommendedRange.min}-{recommendedRange.max} words
        </div>
      </div>

      {/* Key Strengths */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Key Strengths
          </label>
          <button
            onClick={addKeyStrength}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            + Add Strength
          </button>
        </div>
        <div className="space-y-2">
          {summary.keyStrengths?.map((strength, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={strength}
                onChange={(e) => updateKeyStrength(index, e.target.value)}
                placeholder="Enter a key strength..."
                className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => removeKeyStrength(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                ×
              </button>
            </div>
          ))}
          {(!summary.keyStrengths || summary.keyStrengths.length === 0) && (
            <p className="text-sm text-gray-500 italic">
              Add key strengths to highlight your most valuable skills and attributes.
            </p>
          )}
        </div>
      </div>

      {/* Career Goals */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Career Goals (Optional)
        </label>
        <textarea
          value={summary.careerGoals || ''}
          onChange={(e) => updateSummary('careerGoals', e.target.value)}
          placeholder="Describe your short-term and long-term career aspirations..."
          className="w-full h-20 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <div className="mt-1 text-xs text-gray-500">
          Optional: Brief description of your career aspirations and goals.
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Summary Analysis</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-blue-600">{wordCount}</div>
            <div className="text-xs text-gray-600">Total Words</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">
              {summary.keyStrengths?.length || 0}
            </div>
            <div className="text-xs text-gray-600">Key Strengths</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-purple-600">
              {summary.content ? 'Complete' : 'Pending'}
            </div>
            <div className="text-xs text-gray-600">Status</div>
          </div>
        </div>
      </div>
    </div>
  );
};
