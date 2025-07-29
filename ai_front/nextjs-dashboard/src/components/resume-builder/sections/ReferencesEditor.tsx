import React, { useState, useEffect } from 'react';
import { Reference } from '../../../types/resume';

interface ReferencesEditorProps {
  data: Reference[];
  onUpdate: (data: Reference[]) => void;
}

export const ReferencesEditor: React.FC<ReferencesEditorProps> = ({
  data,
  onUpdate,
}) => {
  const [references, setReferences] = useState<Reference[]>(data || []);
  const [showAvailableOnRequest, setShowAvailableOnRequest] = useState(false);

  const referenceTypes = [
    { value: 'supervisor', label: 'Supervisor/Manager', icon: '👔' },
    { value: 'colleague', label: 'Colleague', icon: '🤝' },
    { value: 'client', label: 'Client', icon: '💼' },
    { value: 'mentor', label: 'Mentor', icon: '🎓' },
    { value: 'academic', label: 'Academic', icon: '📚' },
    { value: 'personal', label: 'Personal', icon: '👤' },
  ];

  useEffect(() => {
    onUpdate(references);
  }, [references, onUpdate]);

  const addReference = () => {
    const newReference: Reference = {
      id: Date.now().toString(),
      name: '',
      title: '',
      company: '',
      email: '',
      phone: '',
      relationship: 'supervisor',
      yearsKnown: '',
      canContact: true,
      notes: '',
    };

    setReferences(prev => [...prev, newReference]);
  };

  const updateReference = (id: string, field: keyof Reference, value: any) => {
    setReferences(prev => prev.map(ref =>
      ref.id === id ? { ...ref, [field]: value } : ref
    ));
  };

  const removeReference = (id: string) => {
    setReferences(prev => prev.filter(ref => ref.id !== id));
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-indigo-900 mb-2">
          📋 References
        </h3>
        <p className="text-indigo-700 text-sm">
          Provide professional references who can vouch for your skills and work ethic.
        </p>
      </div>

      {/* References Option Toggle */}
      <div className="bg-white p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Reference Display Option</h4>
            <p className="text-sm text-gray-600">Choose how to present your references</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowAvailableOnRequest(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !showAvailableOnRequest
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              List References
            </button>
            <button
              onClick={() => setShowAvailableOnRequest(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showAvailableOnRequest
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              "Available on Request"
            </button>
          </div>
        </div>
      </div>

      {!showAvailableOnRequest && (
        <>
          {/* Add Reference Button */}
          <button
            onClick={addReference}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            + Add Reference
          </button>

          {/* References List */}
          {references.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <span className="text-4xl mb-2 block">📋</span>
              <p className="text-gray-600 mb-4">No references added yet</p>
              <p className="text-sm text-gray-500">
                Add professional references to strengthen your application
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {references.map((reference, index) => (
                <div key={reference.id} className="bg-white p-6 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">
                      Reference #{index + 1}
                    </h4>
                    <button
                      onClick={() => removeReference(reference.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      ×
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Basic Information */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={reference.name}
                        onChange={(e) => updateReference(reference.id, 'name', e.target.value)}
                        placeholder="Enter full name"
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Job Title *
                      </label>
                      <input
                        type="text"
                        value={reference.title}
                        onChange={(e) => updateReference(reference.id, 'title', e.target.value)}
                        placeholder="Enter job title"
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company/Organization *
                      </label>
                      <input
                        type="text"
                        value={reference.company}
                        onChange={(e) => updateReference(reference.id, 'company', e.target.value)}
                        placeholder="Enter company name"
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Relationship
                      </label>
                      <select
                        value={reference.relationship}
                        onChange={(e) => updateReference(reference.id, 'relationship', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {referenceTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Contact Information */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={reference.email}
                        onChange={(e) => updateReference(reference.id, 'email', e.target.value)}
                        placeholder="Enter email address"
                        className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          reference.email && !validateEmail(reference.email)
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300'
                        }`}
                      />
                      {reference.email && !validateEmail(reference.email) && (
                        <p className="text-xs text-red-600 mt-1">Please enter a valid email address</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={reference.phone}
                        onChange={(e) => updateReference(reference.id, 'phone', e.target.value)}
                        placeholder="Enter phone number"
                        className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          reference.phone && !validatePhone(reference.phone)
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300'
                        }`}
                      />
                      {reference.phone && !validatePhone(reference.phone) && (
                        <p className="text-xs text-red-600 mt-1">Please enter a valid phone number</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Years Known
                      </label>
                      <input
                        type="text"
                        value={reference.yearsKnown}
                        onChange={(e) => updateReference(reference.id, 'yearsKnown', e.target.value)}
                        placeholder="e.g., 3 years, 2018-2021"
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={reference.canContact}
                        onChange={(e) => updateReference(reference.id, 'canContact', e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Okay to contact</span>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={reference.notes}
                      onChange={(e) => updateReference(reference.id, 'notes', e.target.value)}
                      placeholder="Any additional context about your relationship or their role..."
                      className="w-full h-20 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Reference Status */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <span className={`w-2 h-2 rounded-full ${
                          reference.name && reference.title && reference.company && reference.email
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        }`}></span>
                        <span className="text-xs text-gray-600">
                          {reference.name && reference.title && reference.company && reference.email
                            ? 'Complete'
                            : 'Incomplete'
                          }
                        </span>
                      </div>
                      {!reference.canContact && (
                        <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                          Contact restricted
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* References Summary */}
          {references.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">References Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-blue-600">{references.length}</div>
                  <div className="text-xs text-gray-600">Total References</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-green-600">
                    {references.filter(r => r.name && r.title && r.company && r.email).length}
                  </div>
                  <div className="text-xs text-gray-600">Complete</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-orange-600">
                    {references.filter(r => r.canContact).length}
                  </div>
                  <div className="text-xs text-gray-600">Contactable</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-purple-600">
                    {references.filter(r => r.relationship === 'supervisor').length}
                  </div>
                  <div className="text-xs text-gray-600">Supervisors</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {showAvailableOnRequest && (
        <div className="bg-white p-6 border border-gray-200 rounded-lg text-center">
          <span className="text-4xl mb-3 block">📞</span>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            References Available Upon Request
          </h4>
          <p className="text-gray-600 text-sm">
            Your resume will show "References available upon request" instead of listing specific contacts.
          </p>
        </div>
      )}

      {/* Reference Guidelines */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">💡 Reference Best Practices</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Always ask permission before listing someone as a reference</li>
          <li>• Provide your references with your current resume and job description</li>
          <li>• Choose references who can speak to different aspects of your work</li>
          <li>• Include a mix of supervisors, colleagues, and clients when possible</li>
          <li>• Keep your references updated on your job search progress</li>
        </ul>
      </div>
    </div>
  );
};
