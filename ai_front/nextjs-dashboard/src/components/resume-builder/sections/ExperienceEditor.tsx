import React, { useState } from 'react';
import { Experience } from '../../../types/resume';

interface ExperienceEditorProps {
  data: Experience[];
  onUpdate: (data: Experience[]) => void;
}

export const ExperienceEditor: React.FC<ExperienceEditorProps> = ({
  data,
  onUpdate,
}) => {
  const [experiences, setExperiences] = useState<Experience[]>(data || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isEnhancing, setIsEnhancing] = useState<number | null>(null);

  const addExperience = () => {
    const newExperience: Experience = {
      company: '',
      position: '',
      location: '',
      start_date: '',
      end_date: '',
      is_current: false,
      description: '',
      achievements: [],
      ai_suggestions: [],
      keywords_optimized: [],
      order: experiences.length,
    };
    const updatedExperiences = [...experiences, newExperience];
    setExperiences(updatedExperiences);
    setEditingIndex(experiences.length);
    onUpdate(updatedExperiences);
  };

  const updateExperience = (index: number, field: keyof Experience, value: any) => {
    const updatedExperiences = experiences.map((exp, i) =>
      i === index ? { ...exp, [field]: value } : exp
    );
    setExperiences(updatedExperiences);
    onUpdate(updatedExperiences);
  };

  const removeExperience = (index: number) => {
    const updatedExperiences = experiences.filter((_, i) => i !== index);
    setExperiences(updatedExperiences);
    setEditingIndex(null);
    onUpdate(updatedExperiences);
  };

  const enhanceWithAI = async (index: number) => {
    setIsEnhancing(index);
    try {
      const experience = experiences[index];
      const response = await fetch('/api/ai/generate-content/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          section: 'experience',
          context: {
            position: experience.position,
            company: experience.company,
            description: experience.description,
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        updateExperience(index, 'description', result.enhanced_description);
        updateExperience(index, 'achievements', result.achievements || []);
        updateExperience(index, 'keywords_optimized', result.keywords_added || []);
        updateExperience(index, 'ai_suggestions', result.suggestions || []);
      }
    } catch (error) {
      console.error('Error enhancing experience:', error);
    } finally {
      setIsEnhancing(null);
    }
  };

  const addAchievement = (expIndex: number) => {
    const experience = experiences[expIndex];
    const updatedAchievements = [...(experience.achievements || []), ''];
    updateExperience(expIndex, 'achievements', updatedAchievements);
  };

  const updateAchievement = (expIndex: number, achIndex: number, value: string) => {
    const experience = experiences[expIndex];
    const updatedAchievements = (experience.achievements || []).map((ach, i) =>
      i === achIndex ? value : ach
    );
    updateExperience(expIndex, 'achievements', updatedAchievements);
  };

  const removeAchievement = (expIndex: number, achIndex: number) => {
    const experience = experiences[expIndex];
    const updatedAchievements = (experience.achievements || []).filter((_, i) => i !== achIndex);
    updateExperience(expIndex, 'achievements', updatedAchievements);
  };

  return (
    <div className="space-y-6">
      {experiences.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-4">💼</div>
          <p className="text-gray-500 mb-4">No work experience added yet</p>
          <button
            onClick={addExperience}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Your First Job
          </button>
        </div>
      ) : (
        experiences.map((experience, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Experience Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {experience.position || 'Job Title'}
                      {experience.company && ` at ${experience.company}`}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {experience.start_date} - {experience.is_current ? 'Present' : experience.end_date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => enhanceWithAI(index)}
                    disabled={isEnhancing === index}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 text-sm"
                  >
                    {isEnhancing === index ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-purple-700 border-t-transparent"></div>
                        <span>Enhancing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>AI Enhance</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  <button
                    onClick={() => removeExperience(index)}
                    className="p-2 text-red-400 hover:text-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Experience Form */}
            {editingIndex === index && (
              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={experience.position}
                      onChange={(e) => updateExperience(index, 'position', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Software Engineer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={experience.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tech Company Inc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={experience.location}
                      onChange={(e) => updateExperience(index, 'location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="San Francisco, CA"
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={experience.is_current}
                        onChange={(e) => updateExperience(index, 'is_current', e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span>I currently work here</span>
                    </label>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="month"
                      value={experience.start_date}
                      onChange={(e) => updateExperience(index, 'start_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {!experience.is_current && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                      </label>
                      <input
                        type="month"
                        value={experience.end_date}
                        onChange={(e) => updateExperience(index, 'end_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>

                {/* Job Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description
                  </label>
                  <textarea
                    value={experience.description}
                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe your role, responsibilities, and key activities..."
                  />
                </div>

                {/* Key Achievements */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Key Achievements
                    </label>
                    <button
                      onClick={() => addAchievement(index)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      + Add Achievement
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(experience.achievements || []).map((achievement, achIndex) => (
                      <div key={achIndex} className="flex items-center space-x-3">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={achievement}
                            onChange={(e) => updateAchievement(index, achIndex, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Increased team productivity by 25% through process optimization"
                          />
                        </div>
                        <button
                          onClick={() => removeAchievement(index, achIndex)}
                          className="p-2 text-red-400 hover:text-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  {(!experience.achievements || experience.achievements.length === 0) && (
                    <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
                      💡 Tip: Add quantifiable achievements with numbers, percentages, or specific outcomes to make your experience more impactful.
                    </div>
                  )}
                </div>

                {/* AI Suggestions */}
                {experience.ai_suggestions && experience.ai_suggestions.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">AI Suggestions</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      {experience.ai_suggestions.map((suggestion, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="text-blue-600">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}

      {/* Add Experience Button */}
      {experiences.length > 0 && (
        <button
          onClick={addExperience}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          + Add Another Experience
        </button>
      )}
    </div>
  );
};
