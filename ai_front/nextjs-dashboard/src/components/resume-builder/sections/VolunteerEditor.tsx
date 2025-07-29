import React, { useState, useEffect } from 'react';
import { VolunteerExperience } from '../../../types/resume';

interface VolunteerEditorProps {
  data: VolunteerExperience[];
  onUpdate: (data: VolunteerExperience[]) => void;
}

export const VolunteerEditor: React.FC<VolunteerEditorProps> = ({
  data,
  onUpdate,
}) => {
  const [experiences, setExperiences] = useState<VolunteerExperience[]>(data || []);

  const volunteerTypes = [
    { value: 'community', label: 'Community Service', icon: '🏘️' },
    { value: 'education', label: 'Education & Mentoring', icon: '📚' },
    { value: 'environment', label: 'Environmental', icon: '🌱' },
    { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
    { value: 'social', label: 'Social Services', icon: '🤝' },
    { value: 'arts', label: 'Arts & Culture', icon: '🎨' },
    { value: 'sports', label: 'Sports & Recreation', icon: '⚽' },
    { value: 'religious', label: 'Religious', icon: '⛪' },
    { value: 'disaster', label: 'Disaster Relief', icon: '🚨' },
    { value: 'other', label: 'Other', icon: '💼' },
  ];

  useEffect(() => {
    onUpdate(experiences);
  }, [experiences, onUpdate]);

  const addExperience = () => {
    const newExperience: VolunteerExperience = {
      id: Date.now().toString(),
      organization: '',
      role: '',
      type: 'community',
      startDate: '',
      endDate: '',
      isCurrentRole: false,
      location: '',
      description: '',
      achievements: [],
      skills: [],
      hoursPerWeek: '',
      totalHours: '',
      website: '',
    };

    setExperiences(prev => [...prev, newExperience]);
  };

  const updateExperience = (id: string, field: keyof VolunteerExperience, value: any) => {
    setExperiences(prev => prev.map(exp =>
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const removeExperience = (id: string) => {
    setExperiences(prev => prev.filter(exp => exp.id !== id));
  };

  const addAchievement = (experienceId: string) => {
    const experience = experiences.find(exp => exp.id === experienceId);
    if (!experience) return;

    const newAchievements = [...(experience.achievements || []), ''];
    updateExperience(experienceId, 'achievements', newAchievements);
  };

  const updateAchievement = (experienceId: string, index: number, value: string) => {
    const experience = experiences.find(exp => exp.id === experienceId);
    if (!experience) return;

    const newAchievements = [...(experience.achievements || [])];
    newAchievements[index] = value;
    updateExperience(experienceId, 'achievements', newAchievements);
  };

  const removeAchievement = (experienceId: string, index: number) => {
    const experience = experiences.find(exp => exp.id === experienceId);
    if (!experience) return;

    const newAchievements = experience.achievements?.filter((_, i) => i !== index) || [];
    updateExperience(experienceId, 'achievements', newAchievements);
  };

  const addSkill = (experienceId: string, skill: string) => {
    const experience = experiences.find(exp => exp.id === experienceId);
    if (!experience || !skill.trim()) return;

    const currentSkills = experience.skills || [];
    if (!currentSkills.includes(skill.trim())) {
      updateExperience(experienceId, 'skills', [...currentSkills, skill.trim()]);
    }
  };

  const removeSkill = (experienceId: string, skillIndex: number) => {
    const experience = experiences.find(exp => exp.id === experienceId);
    if (!experience) return;

    const newSkills = experience.skills?.filter((_, i) => i !== skillIndex) || [];
    updateExperience(experienceId, 'skills', newSkills);
  };

  const calculateDuration = (startDate: string, endDate: string, isCurrent: boolean) => {
    if (!startDate) return '';

    const start = new Date(startDate);
    const end = isCurrent ? new Date() : new Date(endDate || startDate);

    const months = (end.getFullYear() - start.getFullYear()) * 12 +
                   (end.getMonth() - start.getMonth());

    if (months < 1) return '< 1 month';
    if (months < 12) return `${months} month${months > 1 ? 's' : ''}`;

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    let duration = `${years} year${years > 1 ? 's' : ''}`;
    if (remainingMonths > 0) {
      duration += ` ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
    }

    return duration;
  };

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-purple-900 mb-2">
          🤝 Volunteer Experience
        </h3>
        <p className="text-purple-700 text-sm">
          Showcase your community involvement and volunteer work to demonstrate your values and commitment.
        </p>
      </div>

      {/* Add Experience Button */}
      <button
        onClick={addExperience}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-colors"
      >
        + Add Volunteer Experience
      </button>

      {/* Experiences List */}
      {experiences.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <span className="text-4xl mb-2 block">🤝</span>
          <p className="text-gray-600 mb-4">No volunteer experience added yet</p>
          <p className="text-sm text-gray-500">
            Add volunteer work to show your community involvement and values
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {experiences.map((experience, index) => (
            <div key={experience.id} className="bg-white p-6 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">
                  Volunteer Experience #{index + 1}
                </h4>
                <button
                  onClick={() => removeExperience(experience.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Basic Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization *
                  </label>
                  <input
                    type="text"
                    value={experience.organization}
                    onChange={(e) => updateExperience(experience.id, 'organization', e.target.value)}
                    placeholder="Enter organization name"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role/Position *
                  </label>
                  <input
                    type="text"
                    value={experience.role}
                    onChange={(e) => updateExperience(experience.id, 'role', e.target.value)}
                    placeholder="Enter your volunteer role"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type of Volunteer Work
                  </label>
                  <select
                    value={experience.type}
                    onChange={(e) => updateExperience(experience.id, 'type', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {volunteerTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={experience.location}
                    onChange={(e) => updateExperience(experience.id, 'location', e.target.value)}
                    placeholder="City, State/Country"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Dates */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={experience.startDate}
                    onChange={(e) => updateExperience(experience.id, 'startDate', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={experience.endDate}
                    onChange={(e) => updateExperience(experience.id, 'endDate', e.target.value)}
                    disabled={experience.isCurrentRole}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>

                {/* Time Commitment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hours per Week
                  </label>
                  <input
                    type="text"
                    value={experience.hoursPerWeek}
                    onChange={(e) => updateExperience(experience.id, 'hoursPerWeek', e.target.value)}
                    placeholder="e.g., 5-10 hours"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Hours (Optional)
                  </label>
                  <input
                    type="text"
                    value={experience.totalHours}
                    onChange={(e) => updateExperience(experience.id, 'totalHours', e.target.value)}
                    placeholder="e.g., 200+ hours"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Current Role Toggle */}
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  checked={experience.isCurrentRole}
                  onChange={(e) => {
                    updateExperience(experience.id, 'isCurrentRole', e.target.checked);
                    if (e.target.checked) {
                      updateExperience(experience.id, 'endDate', '');
                    }
                  }}
                  className="rounded text-purple-600"
                />
                <span className="text-sm text-gray-700">I currently volunteer here</span>
              </div>

              {/* Duration Display */}
              {experience.startDate && (
                <div className="mb-4 p-2 bg-purple-50 rounded text-sm text-purple-700">
                  Duration: {calculateDuration(experience.startDate, experience.endDate, experience.isCurrentRole)}
                </div>
              )}

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={experience.description}
                  onChange={(e) => updateExperience(experience.id, 'description', e.target.value)}
                  placeholder="Describe your volunteer role, responsibilities, and impact..."
                  className="w-full h-24 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Achievements */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Key Achievements & Impact
                  </label>
                  <button
                    onClick={() => addAchievement(experience.id)}
                    className="text-sm text-purple-600 hover:text-purple-800"
                  >
                    + Add Achievement
                  </button>
                </div>
                <div className="space-y-2">
                  {experience.achievements?.map((achievement, achIndex) => (
                    <div key={achIndex} className="flex items-start space-x-2">
                      <span className="text-purple-600 mt-2">•</span>
                      <input
                        type="text"
                        value={achievement}
                        onChange={(e) => updateAchievement(experience.id, achIndex, e.target.value)}
                        placeholder="Describe a specific achievement or impact..."
                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => removeAchievement(experience.id, achIndex)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills Developed */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills Developed
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {experience.skills?.map((skill, skillIndex) => (
                    <span
                      key={skillIndex}
                      className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(experience.id, skillIndex)}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Add a skill you developed..."
                    className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addSkill(experience.id, (e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Website (Optional)
                </label>
                <input
                  type="url"
                  value={experience.website}
                  onChange={(e) => updateExperience(experience.id, 'website', e.target.value)}
                  placeholder="https://organization-website.com"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Volunteer Summary */}
      {experiences.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Volunteer Experience Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-purple-600">{experiences.length}</div>
              <div className="text-xs text-gray-600">Organizations</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">
                {experiences.filter(exp => exp.isCurrentRole).length}
              </div>
              <div className="text-xs text-gray-600">Current</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600">
                {experiences.reduce((sum, exp) => sum + (exp.achievements?.length || 0), 0)}
              </div>
              <div className="text-xs text-gray-600">Achievements</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-orange-600">
                {new Set(experiences.flatMap(exp => exp.skills || [])).size}
              </div>
              <div className="text-xs text-gray-600">Skills Developed</div>
            </div>
          </div>
        </div>
      )}

      {/* Volunteer Tips */}
      <div className="bg-purple-50 p-4 rounded-lg">
        <h4 className="font-medium text-purple-900 mb-2">💡 Volunteer Experience Tips</h4>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>• Quantify your impact with specific numbers and results</li>
          <li>• Highlight leadership roles and special responsibilities</li>
          <li>• Connect volunteer skills to your career objectives</li>
          <li>• Include long-term commitments to show dedication</li>
          <li>• Mention any awards or recognition received</li>
        </ul>
      </div>
    </div>
  );
};
