'use client'

import { CheckCircleIcon, XCircleIcon, ClockIcon, CreditCardIcon } from '@heroicons/react/24/solid'

interface PaymentStatusProps {
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  amount: number
  currency?: string
  transactionId?: string
  paidAt?: Date | null
  className?: string
}

const statusConfig = {
  PENDING: {
    icon: ClockIcon,
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    iconColor: 'text-yellow-600',
    label: 'Payment Pending',
    description: 'Payment is being processed'
  },
  COMPLETED: {
    icon: CheckCircleIcon,
    color: 'text-green-600 bg-green-50 border-green-200',
    iconColor: 'text-green-600',
    label: 'Payment Successful',
    description: 'Payment completed successfully'
  },
  FAILED: {
    icon: XCircleIcon,
    color: 'text-red-600 bg-red-50 border-red-200',
    iconColor: 'text-red-600',
    label: 'Payment Failed',
    description: 'Payment could not be processed'
  },
  REFUNDED: {
    icon: CreditCardIcon,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600',
    label: 'Payment Refunded',
    description: 'Payment has been refunded'
  }
}

export default function PaymentStatus({
  status,
  amount,
  currency = 'INR',
  transactionId,
  paidAt,
  className = ''
}: PaymentStatusProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (date: Date | null) => {
    if (!date) return null
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  return (
    <div className={`border rounded-lg p-4 ${config.color} ${className}`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-6 w-6 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{config.label}</h3>
          <p className="text-sm opacity-80 mt-1">{config.description}</p>

          <div className="mt-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Amount:</span>
              <span className="text-sm font-semibold">{formatAmount(amount, currency)}</span>
            </div>

            {transactionId && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Transaction ID:</span>
                <span className="text-xs font-mono bg-white/50 px-2 py-1 rounded">
                  {transactionId}
                </span>
              </div>
            )}

            {paidAt && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Paid At:</span>
                <span className="text-sm">{formatDate(paidAt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}