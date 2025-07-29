export interface UsageEntry { month: string; credits: number }
export const usageData: UsageEntry[] = [
  { month: 'Jan', credits: 25 },
  { month: 'Feb', credits: 40 },
  { month: 'Mar', credits: 32 },
  { month: 'Apr', credits: 28 },
]

export interface BillingInfo {
  plan: { name: string; nextPayment: string; amount: string }
  invoices: { id: number; date: string; amount: string; status: string }[]
}

export const billing: BillingInfo = {
  plan: { name: 'Pro', nextPayment: '2024-05-20', amount: '$29.00' },
  invoices: [
    { id: 1, date: '2024-04-20', amount: '$29.00', status: 'Paid' },
    { id: 2, date: '2024-03-20', amount: '$29.00', status: 'Paid' },
  ],
}
