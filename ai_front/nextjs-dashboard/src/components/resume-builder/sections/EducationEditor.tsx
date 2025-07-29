import React, { useState } from 'react';
import { Education } from '../../../types/resume';

interface EducationEditorProps {
  data: Education[];
  onUpdate: (data: Education[]) => void;
}

export const EducationEditor: React.FC<EducationEditorProps> = ({
  data,
  onUpdate,
}) => {
  const [education, setEducation] = useState<Education[]>(data || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const degreeTypes = [
    { value: 'high_school', label: 'High School Diploma' },
    { value: 'associate', label: 'Associate Degree' },
    { value: 'bachelor', label: "Bachelor's Degree" },
    { value: 'master', label: "Master's Degree" },
    { value: 'doctorate', label: 'Doctorate/PhD' },
    { value: 'certificate', label: 'Certificate' },
    { value: 'other', label: 'Other' },
  ];

  const addEducation = () => {
    const newEducation: Education = {
      institution: '',
      degree: 'bachelor',
      field_of_study: '',
      location: '',
      start_date: '',
      end_date: '',
      is_current: false,
      gpa: undefined,
      honors: '',
      relevant_coursework: [],
      achievements: [],
      order: education.length,
    };
    const updatedEducation = [...education, newEducation];
    setEducation(updatedEducation);
    setEditingIndex(education.length);
    onUpdate(updatedEducation);
  };

  const updateEducation = (index: number, field: keyof Education, value: any) => {
    const updatedEducation = education.map((edu, i) =>
      i === index ? { ...edu, [field]: value } : edu
    );
    setEducation(updatedEducation);
    onUpdate(updatedEducation);
  };

  const removeEducation = (index: number) => {
    const updatedEducation = education.filter((_, i) => i !== index);
    setEducation(updatedEducation);
    setEditingIndex(null);
    onUpdate(updatedEducation);
  };

  const addCoursework = (eduIndex: number) => {
    const edu = education[eduIndex];
    const updatedCoursework = [...(edu.relevant_coursework || []), ''];
    updateEducation(eduIndex, 'relevant_coursework', updatedCoursework);
  };

  const updateCoursework = (eduIndex: number, courseIndex: number, value: string) => {
    const edu = education[eduIndex];
    const updatedCoursework = (edu.relevant_coursework || []).map((course, i) =>
      i === courseIndex ? value : course
    );
    updateEducation(eduIndex, 'relevant_coursework', updatedCoursework);
  };

  const removeCoursework = (eduIndex: number, courseIndex: number) => {
    const edu = education[eduIndex];
    const updatedCoursework = (edu.relevant_coursework || []).filter((_, i) => i !== courseIndex);
    updateEducation(eduIndex, 'relevant_coursework', updatedCoursework);
  };

  return (
    <div className="space-y-6">
      {education.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-4">🎓</div>
          <p className="text-gray-500 mb-4">No education added yet</p>
          <button
            onClick={addEducation}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Your Education
          </button>
        </div>
      ) : (
        education.map((edu, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Education Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {edu.degree && degreeTypes.find(d => d.value === edu.degree)?.label}
                      {edu.field_of_study && ` in ${edu.field_of_study}`}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {edu.institution} {edu.end_date && `• ${edu.end_date}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  <button
                    onClick={() => removeEducation(index)}
                    className="p-2 text-red-400 hover:text-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Education Form */}
            {editingIndex === index && (
              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Institution <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="University of Example"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Degree Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {degreeTypes.map(degree => (
                        <option key={degree.value} value={degree.value}>
                          {degree.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Field of Study <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={edu.field_of_study}
                      onChange={(e) => updateEducation(index, 'field_of_study', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Computer Science"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={edu.location}
                      onChange={(e) => updateEducation(index, 'location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Boston, MA"
                    />
                  </div>
                </div>

                {/* Dates and Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="month"
                      value={edu.start_date}
                      onChange={(e) => updateEducation(index, 'start_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {!edu.is_current && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                      </label>
                      <input
                        type="month"
                        value={edu.end_date}
                        onChange={(e) => updateEducation(index, 'end_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}

                  <div className="flex items-center">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={edu.is_current}
                        onChange={(e) => updateEducation(index, 'is_current', e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span>Currently studying here</span>
                    </label>
                  </div>
                </div>

                {/* Academic Performance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GPA (Optional)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      value={edu.gpa || ''}
                      onChange={(e) => updateEducation(index, 'gpa', parseFloat(e.target.value) || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="3.75"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Honors/Awards
                    </label>
                    <input
                      type="text"
                      value={edu.honors}
                      onChange={(e) => updateEducation(index, 'honors', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Magna Cum Laude, Dean's List"
                    />
                  </div>
                </div>

                {/* Relevant Coursework */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Relevant Coursework
                    </label>
                    <button
                      onClick={() => addCoursework(index)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      + Add Course
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(edu.relevant_coursework || []).map((course, courseIndex) => (
                      <div key={courseIndex} className="flex items-center space-x-3">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={course}
                            onChange={(e) => updateCoursework(index, courseIndex, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Data Structures and Algorithms"
                          />
                        </div>
                        <button
                          onClick={() => removeCoursework(index, courseIndex)}
                          className="p-2 text-red-400 hover:text-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Academic Achievements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Achievements (Optional)
                  </label>
                  <textarea
                    value={edu.achievements.join('\n')}
                    onChange={(e) => updateEducation(index, 'achievements', e.target.value.split('\n').filter(a => a.trim()))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Research projects, publications, leadership roles, etc. (one per line)"
                  />
                </div>
              </div>
            )}
          </div>
        ))
      )}

      {/* Add Education Button */}
      {education.length > 0 && (
        <button
          onClick={addEducation}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          + Add Another Education
        </button>
      )}
    </div>
  );
};
