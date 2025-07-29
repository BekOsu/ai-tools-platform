import React, { useState } from 'react';
import { Certification } from '../../../types/resume';

interface CertificationsEditorProps {
  data: Certification[];
  onUpdate: (data: Certification[]) => void;
}

export const CertificationsEditor: React.FC<CertificationsEditorProps> = ({
  data,
  onUpdate,
}) => {
  const [certifications, setCertifications] = useState<Certification[]>(data || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addCertification = () => {
    const newCertification: Certification = {
      name: '',
      issuing_organization: '',
      credential_id: '',
      credential_url: '',
      issue_date: '',
      expiration_date: '',
      does_not_expire: false,
      order: certifications.length,
    };
    const updatedCertifications = [...certifications, newCertification];
    setCertifications(updatedCertifications);
    setEditingIndex(certifications.length);
    onUpdate(updatedCertifications);
  };

  const updateCertification = (index: number, field: keyof Certification, value: any) => {
    const updatedCertifications = certifications.map((cert, i) =>
      i === index ? { ...cert, [field]: value } : cert
    );
    setCertifications(updatedCertifications);
    onUpdate(updatedCertifications);
  };

  const removeCertification = (index: number) => {
    const updatedCertifications = certifications.filter((_, i) => i !== index);
    setCertifications(updatedCertifications);
    setEditingIndex(null);
    onUpdate(updatedCertifications);
  };

  return (
    <div className="space-y-6">
      {certifications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-4">🏆</div>
          <p className="text-gray-500 mb-4">No certifications added yet</p>
          <button
            onClick={addCertification}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Certification
          </button>
        </div>
      ) : (
        certifications.map((cert, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Certification Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 font-semibold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {cert.name || 'Certification Name'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {cert.issuing_organization} {cert.issue_date && `• ${cert.issue_date}`}
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
                    onClick={() => removeCertification(index)}
                    className="p-2 text-red-400 hover:text-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Certification Form */}
            {editingIndex === index && (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certification Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => updateCertification(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="AWS Certified Solutions Architect"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Issuing Organization <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={cert.issuing_organization}
                      onChange={(e) => updateCertification(index, 'issuing_organization', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Amazon Web Services"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Credential ID
                    </label>
                    <input
                      type="text"
                      value={cert.credential_id}
                      onChange={(e) => updateCertification(index, 'credential_id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="ABC123XYZ"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Credential URL
                    </label>
                    <input
                      type="url"
                      value={cert.credential_url}
                      onChange={(e) => updateCertification(index, 'credential_url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://credentials.example.com/verify/abc123"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Issue Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="month"
                      value={cert.issue_date}
                      onChange={(e) => updateCertification(index, 'issue_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {!cert.does_not_expire && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiration Date
                      </label>
                      <input
                        type="month"
                        value={cert.expiration_date}
                        onChange={(e) => updateCertification(index, 'expiration_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={cert.does_not_expire}
                      onChange={(e) => updateCertification(index, 'does_not_expire', e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>This certification does not expire</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        ))
      )}

      {/* Add Certification Button */}
      {certifications.length > 0 && (
        <button
          onClick={addCertification}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          + Add Another Certification
        </button>
      )}
    </div>
  );
};