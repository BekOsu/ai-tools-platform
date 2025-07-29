import React, { useState, useEffect } from 'react';
import type { Award } from '../../../types/resume';

interface AwardsEditorProps {
  data: Award[];
  onUpdate: (data: Award[]) => void;
}

export const AwardsEditor: React.FC<AwardsEditorProps> = ({
  data,
  onUpdate,
}) => {
  const [awards, setAwards] = useState<Award[]>(data || []);
  const [editingId, setEditingId] = useState<string | null>(null);

  const awardCategories = [
    { value: 'academic', label: 'Academic Excellence', icon: '🎓', color: 'blue' },
    { value: 'professional', label: 'Professional Achievement', icon: '💼', color: 'green' },
    { value: 'leadership', label: 'Leadership', icon: '👑', color: 'purple' },
    { value: 'innovation', label: 'Innovation & Creativity', icon: '💡', color: 'yellow' },
    { value: 'service', label: 'Community Service', icon: '🤝', color: 'pink' },
    { value: 'athletic', label: 'Athletic/Sports', icon: '🏆', color: 'orange' },
    { value: 'research', label: 'Research & Publications', icon: '📚', color: 'indigo' },
    { value: 'technical', label: 'Technical Excellence', icon: '⚡', color: 'cyan' },
    { value: 'sales', label: 'Sales & Performance', icon: '📈', color: 'red' },
    { value: 'other', label: 'Other', icon: '🌟', color: 'gray' },
  ];

  const prestigeLevels = [
    { value: 'international', label: 'International', description: 'Global recognition', color: 'red' },
    { value: 'national', label: 'National', description: 'Country-wide recognition', color: 'blue' },
    { value: 'regional', label: 'Regional', description: 'State/province level', color: 'green' },
    { value: 'local', label: 'Local', description: 'City/community level', color: 'purple' },
    { value: 'organizational', label: 'Organizational', description: 'Company/institution level', color: 'gray' },
  ];

  const currencies = [
    { value: 'USD', label: 'USD ($)', symbol: '$' },
    { value: 'EUR', label: 'EUR (€)', symbol: '€' },
    { value: 'GBP', label: 'GBP (£)', symbol: '£' },
    { value: 'CAD', label: 'CAD (C$)', symbol: 'C$' },
    { value: 'AUD', label: 'AUD (A$)', symbol: 'A$' },
    { value: 'JPY', label: 'JPY (¥)', symbol: '¥' },
  ];

  useEffect(() => {
    onUpdate(awards);
  }, [awards, onUpdate]);

  const addAward = () => {
    const newAward: Award = {
      id: Date.now().toString(),
      title: '',
      issuer: '',
      date: '',
      category: 'professional',
      prestige_level: 'organizational',
      description: '',
      is_recurring: false,
      is_featured: false,
    };
    setAwards([...awards, newAward]);
    setEditingId(newAward.id!);
  };

  const updateAward = (id: string, field: keyof Award, value: any) => {
    setAwards(awards.map(award => 
      award.id === id ? { ...award, [field]: value } : award
    ));
  };

  const removeAward = (id: string) => {
    setAwards(awards.filter(award => award.id !== id));
    if (editingId === id) {
      setEditingId(null);
    }
  };

  const duplicateAward = (award: Award) => {
    const newAward: Award = {
      ...award,
      id: Date.now().toString(),
      title: `${award.title} (Copy)`,
    };
    setAwards([...awards, newAward]);
  };

  const getCategoryInfo = (category: string) => {
    return awardCategories.find(cat => cat.value === category) || awardCategories[0];
  };

  const getPrestigeInfo = (level: string) => {
    return prestigeLevels.find(p => p.value === level) || prestigeLevels[4];
  };

  const getAwardsByCategory = () => {
    const grouped = awards.reduce((acc, award) => {
      const category = award.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(award);
      return acc;
    }, {} as Record<string, Award[]>);

    return grouped;
  };

  const getAwardsStats = () => {
    const total = awards.length;
    const featured = awards.filter(a => a.is_featured).length;
    const withMonetaryValue = awards.filter(a => a.monetary_value && a.monetary_value > 0).length;
    const totalValue = awards.reduce((sum, award) => {
      return sum + (award.monetary_value || 0);
    }, 0);
    const recurring = awards.filter(a => a.is_recurring).length;

    return { total, featured, withMonetaryValue, totalValue, recurring };
  };

  const AwardForm: React.FC<{ award: Award }> = ({ award }) => (
    <div className="space-y-6 p-6 bg-gray-50 rounded-lg border">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {award.title || 'New Award'}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => updateAward(award.id!, 'is_featured', !award.is_featured)}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              award.is_featured
                ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                : 'bg-gray-100 text-gray-600 border-gray-300'
            } border`}
          >
            {award.is_featured ? '⭐ Featured' : 'Feature'}
          </button>
          <button
            onClick={() => setEditingId(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Award Title *
            </label>
            <input
              type="text"
              value={award.title}
              onChange={(e) => updateAward(award.id!, 'title', e.target.value)}
              placeholder="e.g., Employee of the Year, Dean's List"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issuing Organization *
            </label>
            <input
              type="text"
              value={award.issuer}
              onChange={(e) => updateAward(award.id!, 'issuer', e.target.value)}
              placeholder="e.g., Microsoft, Harvard University"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Received *
            </label>
            <input
              type="month"
              value={award.date}
              onChange={(e) => updateAward(award.id!, 'date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Category and Prestige */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={award.category}
              onChange={(e) => updateAward(award.id!, 'category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {awardCategories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.icon} {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prestige Level
            </label>
            <select
              value={award.prestige_level}
              onChange={(e) => updateAward(award.id!, 'prestige_level', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {prestigeLevels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label} - {level.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Award URL (Optional)
            </label>
            <input
              type="url"
              value={award.url || ''}
              onChange={(e) => updateAward(award.id!, 'url', e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={award.description}
          onChange={(e) => updateAward(award.id!, 'description', e.target.value)}
          placeholder="Describe the significance of this award, what it recognizes, and any achievements..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Monetary Value */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monetary Value (Optional)
          </label>
          <input
            type="number"
            value={award.monetary_value || ''}
            onChange={(e) => updateAward(award.id!, 'monetary_value', parseFloat(e.target.value) || undefined)}
            placeholder="10000"
            min="0"
            step="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <select
            value={award.currency || 'USD'}
            onChange={(e) => updateAward(award.id!, 'currency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {currencies.map(currency => (
              <option key={currency.value} value={currency.value}>
                {currency.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Competition Size (Optional)
          </label>
          <input
            type="number"
            value={award.competition_size || ''}
            onChange={(e) => updateAward(award.id!, 'competition_size', parseInt(e.target.value) || undefined)}
            placeholder="100"
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Selection Ratio and Recurrence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Selection Ratio (Optional)
          </label>
          <input
            type="text"
            value={award.selection_ratio || ''}
            onChange={(e) => updateAward(award.id!, 'selection_ratio', e.target.value)}
            placeholder="e.g., Top 1%, 1 of 100"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id={`recurring-${award.id}`}
              checked={award.is_recurring}
              onChange={(e) => updateAward(award.id!, 'is_recurring', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={`recurring-${award.id}`} className="ml-2 text-sm text-gray-700">
              Recurring Award
            </label>
          </div>

          {award.is_recurring && (
            <input
              type="text"
              value={award.recurrence_frequency || ''}
              onChange={(e) => updateAward(award.id!, 'recurrence_frequency', e.target.value)}
              placeholder="e.g., Annual, Quarterly"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t">
        <button
          onClick={() => duplicateAward(award)}
          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
        >
          Duplicate
        </button>
        <button
          onClick={() => removeAward(award.id!)}
          className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
        >
          Remove Award
        </button>
      </div>
    </div>
  );

  const AwardCard: React.FC<{ award: Award }> = ({ award }) => {
    const categoryInfo = getCategoryInfo(award.category);
    const prestigeInfo = getPrestigeInfo(award.prestige_level);

    return (
      <div className="p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${categoryInfo.color}-100 text-${categoryInfo.color}-800`}>
                {categoryInfo.icon} {categoryInfo.label}
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${prestigeInfo.color}-100 text-${prestigeInfo.color}-800`}>
                {prestigeInfo.label}
              </span>
              {award.is_featured && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  ⭐ Featured
                </span>
              )}
            </div>

            <h4 className="text-lg font-semibold text-gray-900 mb-1">
              {award.title}
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              {award.issuer} • {new Date(award.date).toLocaleDateString()}
            </p>

            {award.description && (
              <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                {award.description}
              </p>
            )}

            <div className="flex items-center space-x-4 text-xs text-gray-500">
              {award.monetary_value && (
                <span>
                  💰 {currencies.find(c => c.value === award.currency)?.symbol || '$'}{award.monetary_value.toLocaleString()}
                </span>
              )}
              {award.selection_ratio && (
                <span>🎯 {award.selection_ratio}</span>
              )}
              {award.is_recurring && (
                <span>🔄 {award.recurrence_frequency || 'Recurring'}</span>
              )}
            </div>
          </div>

          <div className="flex space-x-2 ml-4">
            <button
              onClick={() => setEditingId(award.id!)}
              className="text-gray-400 hover:text-blue-600 transition-colors"
            >
              ✏️
            </button>
            <button
              onClick={() => removeAward(award.id!)}
              className="text-gray-400 hover:text-red-600 transition-colors"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    );
  };

  const stats = getAwardsStats();
  const groupedAwards = getAwardsByCategory();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Awards & Honors</h2>
          <p className="text-sm text-gray-600 mt-1">
            Showcase your achievements, recognitions, and honors
          </p>
        </div>
        <button
          onClick={addAward}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          Add Award
        </button>
      </div>

      {/* Statistics */}
      {awards.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs text-blue-600">Total Awards</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.featured}</div>
            <div className="text-xs text-yellow-600">Featured</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{stats.withMonetaryValue}</div>
            <div className="text-xs text-green-600">With Value</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">${stats.totalValue.toLocaleString()}</div>
            <div className="text-xs text-purple-600">Total Value</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.recurring}</div>
            <div className="text-xs text-orange-600">Recurring</div>
          </div>
        </div>
      )}

      {/* Editing Form */}
      {editingId && (
        <AwardForm award={awards.find(a => a.id === editingId)!} />
      )}

      {/* Awards List */}
      {awards.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No awards added yet</h3>
          <p className="text-gray-600 mb-4">
            Start building your awards section to showcase your achievements and recognitions.
          </p>
          <button
            onClick={addAward}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Add Your First Award
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedAwards).map(([category, categoryAwards]) => {
            const categoryInfo = getCategoryInfo(category);
            return (
              <div key={category}>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <span className={`w-8 h-8 rounded-full bg-${categoryInfo.color}-100 text-${categoryInfo.color}-600 flex items-center justify-center text-sm mr-3`}>
                    {categoryInfo.icon}
                  </span>
                  {categoryInfo.label} ({categoryAwards.length})
                </h3>
                <div className="grid gap-4">
                  {categoryAwards
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(award => (
                      <AwardCard key={award.id} award={award} />
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">💡 Tips for Awards Section</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Include quantifiable achievements (monetary value, competition size)</li>
          <li>• Focus on awards relevant to your target industry or role</li>
          <li>• Use the "Featured" option to highlight your most impressive awards</li>
          <li>• Include selection ratios to show exclusivity (e.g., "Top 1%")</li>
          <li>• Add URLs to verify prestigious awards when possible</li>
        </ul>
      </div>
    </div>
  );
};
