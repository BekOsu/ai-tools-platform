"use client";

import { useEffect, useState } from 'react'

export default function UsageAnalytics() {
  const [usage, setUsage] = useState<{ month: string; credits: number }[]>([])

  useEffect(() => {
    fetch('/api/analytics/usage')
      .then(res => res.json())
      .then(data => setUsage(data.usage || []))
      .catch(() => {})
  }, [])

  return (
    <div className="bg-white border border-gray-300 rounded-md p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-4">Usage Analytics</h3>
      <div className="space-y-2">
        {usage.map((u) => (
          <div key={u.month} className="flex items-center space-x-2 text-sm">
            <span className="w-12 text-gray-600">{u.month}</span>
            <div className="flex-1 bg-gray-100 rounded h-2">
              <div
                className="bg-blue-600 h-2 rounded"
                style={{ width: `${u.credits}%` }}
              />
            </div>
            <span className="w-10 text-right text-gray-600">{u.credits}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
