import React, { useState, useEffect } from 'react';
import { PersonalInfo } from '../../../types/resume';

interface PersonalInfoEditorProps {
  data?: PersonalInfo;
  onUpdate: (data: PersonalInfo) => void;
}

export const PersonalInfoEditor: React.FC<PersonalInfoEditorProps> = ({
  data,
  onUpdate,
}) => {
  const [formData, setFormData] = useState<PersonalInfo>({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    portfolio: '',
    professional_summary: '',
    profile_photo: '',
    nationality: '',
    date_of_birth: '',
    ...data,
  });

  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  useEffect(() => {
    if (data) {
      setFormData({ ...formData, ...data });
    }
  }, [data]);

  const handleInputChange = (field: keyof PersonalInfo, value: string) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    onUpdate(updatedData);
  };

  const generateAISummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const response = await fetch('/api/ai/generate-content/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          section: 'summary',
          context: {
            name: formData.full_name,
            experience_level: 'mid', // This would come from resume data
            target_industry: '', // This would come from resume data
            target_role: '', // This would come from resume data
            skills: [], // This would come from skills data
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        handleInputChange('professional_summary', result.content);
      }
    } catch (error) {
      console.error('Error generating AI summary:', error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="john.doe@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="New York, NY"
            />
          </div>
        </div>
      </div>

      {/* Professional Links */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LinkedIn Profile
            </label>
            <input
              type="url"
              value={formData.linkedin}
              onChange={(e) => handleInputChange('linkedin', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://linkedin.com/in/johndoe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GitHub Profile
            </label>
            <input
              type="url"
              value={formData.github}
              onChange={(e) => handleInputChange('github', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://github.com/johndoe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Personal Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://johndoe.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Portfolio URL
            </label>
            <input
              type="url"
              value={formData.portfolio}
              onChange={(e) => handleInputChange('portfolio', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://portfolio.johndoe.com"
            />
          </div>
        </div>
      </div>

      {/* Professional Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Professional Summary</h3>
          <button
            onClick={generateAISummary}
            disabled={isGeneratingSummary}
            className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            {isGeneratingSummary ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>AI Generate</span>
              </>
            )}
          </button>
        </div>
        <textarea
          value={formData.professional_summary}
          onChange={(e) => handleInputChange('professional_summary', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Write a compelling professional summary that highlights your key qualifications and value proposition..."
        />
        <div className="mt-2 text-sm text-gray-500">
          {formData.professional_summary.length}/500 characters
        </div>
      </div>

      {/* Profile Photo */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Photo (Optional)</h3>
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            {formData.profile_photo ? (
              <img
                src={formData.profile_photo}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="profile-photo"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // In a real implementation, you'd upload this to your backend
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    handleInputChange('profile_photo', e.target?.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            <label
              htmlFor="profile-photo"
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Upload Photo
            </label>
            <p className="text-sm text-gray-500 mt-2">
              JPG, PNG up to 5MB. Professional headshot recommended.
            </p>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information (Optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nationality
            </label>
            <input
              type="text"
              value={formData.nationality}
              onChange={(e) => handleInputChange('nationality', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="American"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Privacy Note</p>
              <p>Personal information like nationality and date of birth are optional and may not be required or recommended in some regions due to anti-discrimination laws.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
