"use client";

import { useEffect, useState } from 'react'

export default function BillingSummary() {
  const [plan, setPlan] = useState({ name: '', nextPayment: '', amount: '' })
  const [invoices, setInvoices] = useState<{ id: number; date: string; amount: string; status: string }[]>([])

  useEffect(() => {
    fetch('/api/billing/summary')
      .then(res => res.json())
      .then(data => {
        setPlan(data.billing.plan)
        setInvoices(data.billing.invoices)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="bg-white border border-gray-300 rounded-md p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-4">Billing</h3>
      <p className="text-sm text-gray-600 mb-2">Plan: {plan.name}</p>
      <p className="text-sm text-gray-600 mb-4">
        Next payment: {plan.nextPayment} ({plan.amount})
      </p>
      <div className="space-y-1 text-sm">
        {invoices.map((inv) => (
          <div
            key={inv.id}
            className="flex justify-between border-b border-gray-100 pb-1"
          >
            <span>{inv.date}</span>
            <span>{inv.amount}</span>
            <span className={inv.status === "Paid" ? "text-green-600" : "text-red-600"}>{inv.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
