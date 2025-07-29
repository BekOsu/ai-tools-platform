import React, { useState, useEffect } from 'react';
import { Skill } from '../../../types/resume';

interface SkillsEditorProps {
  data: Skill[];
  onUpdate: (data: Skill[]) => void;
  targetIndustry?: string;
  targetRole?: string;
}

export const SkillsEditor: React.FC<SkillsEditorProps> = ({
  data,
  onUpdate,
  targetIndustry,
  targetRole,
}) => {
  const [skills, setSkills] = useState<Skill[]>(data || []);
  const [newSkillName, setNewSkillName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Skill['category']>('technical');
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const skillCategories = [
    { id: 'technical', name: 'Technical Skills', icon: '💻', color: 'blue' },
    { id: 'soft', name: 'Soft Skills', icon: '🤝', color: 'green' },
    { id: 'tools', name: 'Tools & Software', icon: '🛠️', color: 'purple' },
    { id: 'language', name: 'Languages', icon: '🌍', color: 'orange' },
    { id: 'industry', name: 'Industry-Specific', icon: '🏢', color: 'red' },
    { id: 'certifications', name: 'Certifications', icon: '🏆', color: 'yellow' },
  ] as const;

  const proficiencyLevels = [
    { value: 1, label: 'Beginner', description: 'Basic understanding' },
    { value: 2, label: 'Intermediate', description: 'Some experience' },
    { value: 3, label: 'Advanced', description: 'Significant experience' },
    { value: 4, label: 'Expert', description: 'Extensive experience' },
    { value: 5, label: 'Master', description: 'Industry leader' },
  ] as const;

  useEffect(() => {
    if (targetIndustry && targetRole) {
      loadAISuggestions();
    }
  }, [targetIndustry, targetRole]);

  const loadAISuggestions = async () => {
    if (!targetIndustry || !targetRole) return;

    setIsLoadingSuggestions(true);
    try {
      const response = await fetch('/api/ai/suggest-skills/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          industry: targetIndustry,
          role: targetRole,
        }),
      });

      if (response.ok) {
        const suggestions = await response.json();
        setAiSuggestions([
          ...(suggestions.technical_skills || []),
          ...(suggestions.soft_skills || []),
          ...(suggestions.tools_software || []),
        ]);
      }
    } catch (error) {
      console.error('Error loading AI suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const addSkill = () => {
    if (!newSkillName.trim()) return;

    const newSkill: Skill = {
      name: newSkillName.trim(),
      category: selectedCategory,
      proficiency: 3,
      is_featured: false,
      ai_suggested: false,
      market_demand: 0,
      order: skills.length,
    };

    const updatedSkills = [...skills, newSkill];
    setSkills(updatedSkills);
    setNewSkillName('');
    onUpdate(updatedSkills);
  };

  const addSuggestedSkill = (suggestion: any) => {
    const newSkill: Skill = {
      name: suggestion.name,
      category: suggestion.category || 'technical',
      proficiency: 3,
      is_featured: false,
      ai_suggested: true,
      market_demand: suggestion.market_demand || suggestion.importance || 0,
      order: skills.length,
    };

    const updatedSkills = [...skills, newSkill];
    setSkills(updatedSkills);
    onUpdate(updatedSkills);

    // Remove from suggestions
    setAiSuggestions(aiSuggestions.filter(s => s.name !== suggestion.name));
  };

  const updateSkill = (index: number, field: keyof Skill, value: any) => {
    const updatedSkills = skills.map((skill, i) =>
      i === index ? { ...skill, [field]: value } : skill
    );
    setSkills(updatedSkills);
    onUpdate(updatedSkills);
  };

  const removeSkill = (index: number) => {
    const updatedSkills = skills.filter((_, i) => i !== index);
    setSkills(updatedSkills);
    onUpdate(updatedSkills);
  };

  const toggleFeatured = (index: number) => {
    updateSkill(index, 'is_featured', !skills[index].is_featured);
  };

  const getSkillsByCategory = (category: Skill['category']) => {
    return skills.filter(skill => skill.category === category);
  };

  const getCategoryColor = (category: string) => {
    const categoryInfo = skillCategories.find(cat => cat.id === category);
    return categoryInfo?.color || 'gray';
  };

  const getProficiencyColor = (level: number) => {
    const colors = ['gray', 'red', 'yellow', 'blue', 'green', 'purple'];
    return colors[level] || 'gray';
  };

  return (
    <div className="space-y-8">
      {/* Add New Skill */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Skill</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Skill['category'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {skillCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Skill Name</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter skill name..."
              />
              <button
                onClick={addSkill}
                disabled={!newSkillName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Suggestions */}
      {(targetIndustry || targetRole) && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              🤖 AI Skill Suggestions
              {targetIndustry && targetRole && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  for {targetRole} in {targetIndustry}
                </span>
              )}
            </h3>
            <button
              onClick={loadAISuggestions}
              disabled={isLoadingSuggestions}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              {isLoadingSuggestions ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {isLoadingSuggestions ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-600 border-t-transparent"></div>
              <span className="ml-3 text-gray-600">Getting personalized suggestions...</span>
            </div>
          ) : aiSuggestions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {aiSuggestions.slice(0, 12).map((suggestion, index) => (
                <div
                  key={index}
                  className="bg-white p-3 rounded-lg border border-purple-200 hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{suggestion.name}</h4>
                      {suggestion.importance && (
                        <div className="flex items-center space-x-1 mt-1">
                          <span className="text-xs text-gray-500">Importance:</span>
                          <div className="flex space-x-0.5">
                            {[1, 2, 3, 4, 5].map(i => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                  i <= suggestion.importance ? 'bg-purple-500' : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      {suggestion.trend && (
                        <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${
                          suggestion.trend === 'rising' ? 'bg-green-100 text-green-700' :
                          suggestion.trend === 'stable' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {suggestion.trend}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => addSuggestedSkill(suggestion)}
                      className="ml-2 p-1.5 text-purple-600 hover:bg-purple-100 rounded"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Set your target industry and role to get personalized skill suggestions
            </div>
          )}
        </div>
      )}

      {/* Skills by Category */}
      <div className="space-y-6">
        {skillCategories.map(category => {
          const categorySkills = getSkillsByCategory(category.id);
          if (categorySkills.length === 0) return null;

          return (
            <div key={category.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <span className="text-xl">{category.icon}</span>
                    <span>{category.name}</span>
                    <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                      {categorySkills.length}
                    </span>
                  </h3>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categorySkills.map((skill, index) => {
                    const skillIndex = skills.findIndex(s => s === skill);
                    return (
                      <div
                        key={skillIndex}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          skill.is_featured 
                            ? 'border-yellow-300 bg-yellow-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-gray-900">{skill.name}</h4>
                              {skill.ai_suggested && (
                                <span className="px-1.5 py-0.5 text-xs bg-purple-100 text-purple-600 rounded">
                                  AI
                                </span>
                              )}
                              {skill.is_featured && (
                                <span className="text-yellow-500">⭐</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => toggleFeatured(skillIndex)}
                              className={`p-1 rounded ${
                                skill.is_featured 
                                  ? 'text-yellow-500 hover:text-yellow-600' 
                                  : 'text-gray-400 hover:text-yellow-500'
                              }`}
                              title={skill.is_featured ? 'Remove from featured' : 'Add to featured'}
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            </button>

                            <button
                              onClick={() => removeSkill(skillIndex)}
                              className="p-1 text-red-400 hover:text-red-600"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Proficiency Level */}
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Proficiency Level
                          </label>
                          <select
                            value={skill.proficiency}
                            onChange={(e) => updateSkill(skillIndex, 'proficiency', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {proficiencyLevels.map(level => (
                              <option key={level.value} value={level.value}>
                                {level.label} - {level.description}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Proficiency Visual */}
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Level:</span>
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map(level => (
                              <div
                                key={level}
                                className={`w-4 h-2 rounded-full ${
                                  level <= skill.proficiency 
                                    ? `bg-${getProficiencyColor(skill.proficiency)}-500` 
                                    : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {proficiencyLevels.find(l => l.value === skill.proficiency)?.label}
                          </span>
                        </div>

                        {/* Years of Experience */}
                        {skill.years_experience !== undefined && (
                          <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Years of Experience
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="50"
                              value={skill.years_experience || ''}
                              onChange={(e) => updateSkill(skillIndex, 'years_experience', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="0"
                            />
                          </div>
                        )}

                        {/* Market Demand Indicator */}
                        {skill.market_demand > 0 && (
                          <div className="mt-2 flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Market Demand:</span>
                            <div className="flex space-x-0.5">
                              {[1, 2, 3, 4, 5].map(level => (
                                <div
                                  key={level}
                                  className={`w-2 h-2 rounded-full ${
                                    level <= skill.market_demand ? 'bg-green-500' : 'bg-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {skills.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-4">⚡</div>
          <p className="text-gray-500 mb-4">No skills added yet</p>
          <p className="text-sm text-gray-400">Add your technical and soft skills to showcase your expertise</p>
        </div>
      )}

      {/* Skills Summary */}
      {skills.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{skills.length}</div>
              <div className="text-sm text-gray-600">Total Skills</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {skills.filter(s => s.is_featured).length}
              </div>
              <div className="text-sm text-gray-600">Featured</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {skills.filter(s => s.ai_suggested).length}
              </div>
              <div className="text-sm text-gray-600">AI Suggested</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {skills.filter(s => s.proficiency >= 4).length}
              </div>
              <div className="text-sm text-gray-600">Expert Level</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
