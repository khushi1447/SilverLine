'use client'

import { CheckCircleIcon, XCircleIcon, ClockIcon, CreditCardIcon } from '@heroicons/react/24/solid'

interface PaymentStatusProps {
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED'
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
  PROCESSING: {
    icon: ClockIcon,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600',
    label: 'Payment Processing',
    description: 'Payment is currently processing'
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
  CANCELLED: {
    icon: XCircleIcon,
    color: 'text-gray-600 bg-gray-50 border-gray-200',
    iconColor: 'text-gray-600',
    label: 'Payment Cancelled',
    description: 'Payment was cancelled'
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

  return (
    <div className={`border rounded-lg p-4 flex items-start gap-3 ${config.color} ${className}`}>
      <Icon className={`h-6 w-6 ${config.iconColor}`} />
      <div className="flex-1">
        <div className="font-semibold">{config.label}</div>
        <div className="text-sm">{config.description}</div>
        <div className="mt-2 text-sm">
          <span className="font-medium">Amount:</span> {formatAmount(amount, currency)}
        </div>
        {transactionId && (
          <div className="text-sm">
            <span className="font-medium">Transaction ID:</span> {transactionId}
          </div>
        )}
        {paidAt && (
          <div className="text-sm">
            <span className="font-medium">Paid At:</span> {new Date(paidAt).toLocaleString('en-IN')}
          </div>
        )}
      </div>
    </div>
  )
}