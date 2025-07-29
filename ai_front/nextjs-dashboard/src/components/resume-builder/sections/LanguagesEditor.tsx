import React, { useState, useEffect } from 'react';
import { Language } from '../../../types/resume';

interface LanguagesEditorProps {
  data: Language[];
  onUpdate: (data: Language[]) => void;
}

export const LanguagesEditor: React.FC<LanguagesEditorProps> = ({
  data,
  onUpdate,
}) => {
  const [languages, setLanguages] = useState<Language[]>(data || []);
  const [newLanguage, setNewLanguage] = useState('');

  const proficiencyLevels = [
    { value: 'native', label: 'Native', description: 'Native or bilingual proficiency', color: 'green' },
    { value: 'fluent', label: 'Fluent', description: 'Full professional proficiency', color: 'blue' },
    { value: 'advanced', label: 'Advanced', description: 'Professional working proficiency', color: 'purple' },
    { value: 'intermediate', label: 'Intermediate', description: 'Limited working proficiency', color: 'orange' },
    { value: 'basic', label: 'Basic', description: 'Elementary proficiency', color: 'gray' },
  ];

  const commonLanguages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian',
    'Chinese (Mandarin)', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Dutch', 'Swedish'
  ];

  useEffect(() => {
    onUpdate(languages);
  }, [languages, onUpdate]);

  const addLanguage = (languageName?: string) => {
    const name = languageName || newLanguage.trim();
    if (!name || languages.some(lang => lang.name.toLowerCase() === name.toLowerCase())) return;

    const newLang: Language = {
      id: Date.now().toString(),
      name,
      proficiency: 'intermediate',
      isNative: false,
      certifications: [],
    };

    setLanguages(prev => [...prev, newLang]);
    setNewLanguage('');
  };

  const updateLanguage = (id: string, field: keyof Language, value: any) => {
    setLanguages(prev => prev.map(lang =>
      lang.id === id ? { ...lang, [field]: value } : lang
    ));
  };

  const removeLanguage = (id: string) => {
    setLanguages(prev => prev.filter(lang => lang.id !== id));
  };

  const addCertification = (languageId: string) => {
    updateLanguage(languageId, 'certifications', [
      ...(languages.find(l => l.id === languageId)?.certifications || []),
      { name: '', level: '', issuingOrganization: '', dateObtained: '' }
    ]);
  };

  const updateCertification = (languageId: string, certIndex: number, field: string, value: string) => {
    const language = languages.find(l => l.id === languageId);
    if (!language) return;

    const updatedCerts = [...(language.certifications || [])];
    updatedCerts[certIndex] = { ...updatedCerts[certIndex], [field]: value };
    updateLanguage(languageId, 'certifications', updatedCerts);
  };

  const removeCertification = (languageId: string, certIndex: number) => {
    const language = languages.find(l => l.id === languageId);
    if (!language) return;

    const updatedCerts = language.certifications?.filter((_, i) => i !== certIndex) || [];
    updateLanguage(languageId, 'certifications', updatedCerts);
  };

  const getProficiencyColor = (proficiency: string) => {
    const level = proficiencyLevels.find(p => p.value === proficiency);
    return level?.color || 'gray';
  };

  const getProficiencyWidth = (proficiency: string) => {
    const widths = { basic: 20, intermediate: 40, advanced: 60, fluent: 80, native: 100 };
    return widths[proficiency as keyof typeof widths] || 0;
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-green-900 mb-2">
          🌍 Languages
        </h3>
        <p className="text-green-700 text-sm">
          Showcase your language skills with proficiency levels and certifications.
        </p>
      </div>

      {/* Add Language Section */}
      <div className="bg-white p-4 border border-gray-200 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Add Language</h4>

        {/* Custom Language Input */}
        <div className="flex space-x-2 mb-3">
          <input
            type="text"
            value={newLanguage}
            onChange={(e) => setNewLanguage(e.target.value)}
            placeholder="Enter language name..."
            className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
          />
          <button
            onClick={() => addLanguage()}
            disabled={!newLanguage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Add
          </button>
        </div>

        {/* Common Languages */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Quick add common languages:</p>
          <div className="flex flex-wrap gap-2">
            {commonLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => addLanguage(lang)}
                disabled={languages.some(l => l.name.toLowerCase() === lang.toLowerCase())}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Languages List */}
      {languages.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <span className="text-4xl mb-2 block">🌍</span>
          <p className="text-gray-600 mb-4">No languages added yet</p>
          <p className="text-sm text-gray-500">
            Add languages to showcase your multilingual abilities
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {languages.map((language) => (
            <div key={language.id} className="bg-white p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-gray-900">{language.name}</h4>
                    {language.isNative && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Native
                      </span>
                    )}
                  </div>

                  {/* Proficiency Visual */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {proficiencyLevels.find(p => p.value === language.proficiency)?.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {proficiencyLevels.find(p => p.value === language.proficiency)?.description}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`bg-${getProficiencyColor(language.proficiency)}-500 h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${getProficiencyWidth(language.proficiency)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeLanguage(language.id)}
                  className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  ×
                </button>
              </div>

              {/* Proficiency Level Selection */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
                {proficiencyLevels.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => updateLanguage(language.id, 'proficiency', level.value)}
                    className={`p-2 text-sm rounded border transition-colors ${
                      language.proficiency === level.value
                        ? `border-${level.color}-500 bg-${level.color}-50 text-${level.color}-700`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>

              {/* Native Speaker Toggle */}
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  checked={language.isNative}
                  onChange={(e) => {
                    updateLanguage(language.id, 'isNative', e.target.checked);
                    if (e.target.checked) {
                      updateLanguage(language.id, 'proficiency', 'native');
                    }
                  }}
                  className="rounded text-blue-600"
                />
                <span className="text-sm text-gray-700">Native speaker</span>
              </div>

              {/* Certifications */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900">Language Certifications</h5>
                  <button
                    onClick={() => addCertification(language.id)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add Certification
                  </button>
                </div>

                {language.certifications && language.certifications.length > 0 ? (
                  <div className="space-y-3">
                    {language.certifications.map((cert, certIndex) => (
                      <div key={certIndex} className="bg-gray-50 p-3 rounded border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={cert.name}
                            onChange={(e) => updateCertification(language.id, certIndex, 'name', e.target.value)}
                            placeholder="Certification name (e.g., TOEFL, IELTS)"
                            className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <input
                            type="text"
                            value={cert.level}
                            onChange={(e) => updateCertification(language.id, certIndex, 'level', e.target.value)}
                            placeholder="Level/Score (e.g., C2, 8.5)"
                            className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <input
                            type="text"
                            value={cert.issuingOrganization}
                            onChange={(e) => updateCertification(language.id, certIndex, 'issuingOrganization', e.target.value)}
                            placeholder="Issuing organization"
                            className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <div className="flex space-x-2">
                            <input
                              type="date"
                              value={cert.dateObtained}
                              onChange={(e) => updateCertification(language.id, certIndex, 'dateObtained', e.target.value)}
                              className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              onClick={() => removeCertification(language.id, certIndex)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No certifications added. Add language certifications to strengthen your profile.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Languages Summary */}
      {languages.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Languages Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-blue-600">{languages.length}</div>
              <div className="text-xs text-gray-600">Total Languages</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">
                {languages.filter(l => l.isNative || l.proficiency === 'native').length}
              </div>
              <div className="text-xs text-gray-600">Native</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-purple-600">
                {languages.filter(l => ['fluent', 'advanced'].includes(l.proficiency)).length}
              </div>
              <div className="text-xs text-gray-600">Professional</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-orange-600">
                {languages.reduce((sum, lang) => sum + (lang.certifications?.length || 0), 0)}
              </div>
              <div className="text-xs text-gray-600">Certifications</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
