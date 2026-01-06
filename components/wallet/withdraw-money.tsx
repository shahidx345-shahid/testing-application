/**
 * Withdraw Money Component
 * Form for withdrawing funds from wallet
 */

'use client'

import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/components/ui/use-toast'
import { useWallet } from '@/hooks/use-wallet'
import { Loader2, AlertCircle, AlertTriangle, Clock, DollarSign } from 'lucide-react'

interface ValidationErrors {
  [key: string]: string
}

const MIN_WITHDRAWAL = 10
const MAX_WITHDRAWAL = 10000

export function WithdrawMoney() {
  const { toast } = useToast()
  const { data: wallet } = useWallet()
  const [processing, setProcessing] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [success, setSuccess] = useState(false)
  const [successData, setSuccessData] = useState<any>(null)
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethodId: '',
    description: '',
    twoFactorCode: '',
  })

  const availableBalance = wallet?.balance ?? 0

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}
    const amount = parseFloat(formData.amount)

    if (!formData.amount) {
      newErrors.amount = 'Amount is required'
    } else if (isNaN(amount)) {
      newErrors.amount = 'Amount must be a valid number'
    } else if (amount < MIN_WITHDRAWAL) {
      newErrors.amount = `Minimum withdrawal is $${MIN_WITHDRAWAL}`
    } else if (amount > MAX_WITHDRAWAL) {
      newErrors.amount = `Maximum withdrawal is $${MAX_WITHDRAWAL}`
    } else if (amount > availableBalance) {
      newErrors.amount = 'Insufficient available balance'
    }

    if (!formData.paymentMethodId) {
      newErrors.paymentMethodId = 'Please select a withdrawal destination'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const updated = { ...prev }
        delete updated[name]
        return updated
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive',
      })
      return
    }

    setProcessing(true)

    try {
      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          paymentMethodId: formData.paymentMethodId,
          description: formData.description || 'Wallet withdrawal',
          twoFactorCode: formData.twoFactorCode,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to process withdrawal')
      }

      const result = await response.json()
      setSuccessData(result)
      setSuccess(true)
      setFormData({
        amount: '',
        paymentMethodId: '',
        description: '',
        twoFactorCode: '',
      })

      toast({
        title: 'Success',
        description: 'Withdrawal processed successfully',
      })
    } catch (error) {
      console.error('Error processing withdrawal:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to process withdrawal'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  // Success screen
  if (success && successData) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <Clock className="h-12 w-12 text-brand-green mx-auto mb-4" />
            <CardTitle className="text-brand-green">Withdrawal Pending</CardTitle>
            <CardDescription className="text-brand-green/80">
              Your withdrawal is being processed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Withdrawal Amount</p>
              <p className="text-4xl font-bold text-brand-green">
                ${parseFloat(formData.amount).toFixed(2)}
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID</span>
                <span className="font-mono text-gray-900">{successData.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className="font-semibold text-brand-green">Pending (3 days)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Arrival</span>
                <span className="font-semibold">
                  {new Date(successData.estimatedDelivery).toLocaleDateString()}
                </span>
              </div>
            </div>

            <Alert className="bg-green-100 border-green-300">
              <AlertCircle className="h-4 w-4 text-brand-green/90" />
              <AlertDescription className="text-brand-green/90 text-sm">
                {successData.message}
              </AlertDescription>
            </Alert>

            <Alert className="bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 text-sm">
                Bank transfers typically take 2-3 business days. We'll notify you when it arrives.
              </AlertDescription>
            </Alert>

            <Button
              className="w-full"
              onClick={() => {
                setSuccess(false)
                setSuccessData(null)
              }}
            >
              Make Another Withdrawal
            </Button>

            <Button variant="outline" className="w-full">
              View Transaction History
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdraw from Wallet</CardTitle>
        <CardDescription>Transfer money to your bank account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Balance */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Available Balance</p>
            <p className="text-3xl font-bold text-gray-900">
              ${availableBalance.toFixed(2)}
            </p>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Withdrawal Amount *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min={MIN_WITHDRAWAL}
                max={Math.min(MAX_WITHDRAWAL, availableBalance)}
                value={formData.amount}
                onChange={handleChange}
                disabled={processing}
                placeholder="0.00"
                className={`pl-8 ${errors.amount ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-red-500">{errors.amount}</p>
            )}
            <p className="text-xs text-gray-500">
              Min: ${MIN_WITHDRAWAL} • Max: ${Math.min(MAX_WITHDRAWAL, availableBalance).toFixed(2)}
            </p>
          </div>

          {/* Destination Account */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethodId">Destination Account *</Label>
            <select
              id="paymentMethodId"
              name="paymentMethodId"
              value={formData.paymentMethodId}
              onChange={handleChange}
              disabled={processing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select where to withdraw</option>
              <option value="bank_1">Chase Bank •••• 4242</option>
              <option value="bank_2">Bank of America •••• 8765</option>
            </select>
            {errors.paymentMethodId && (
              <p className="text-xs text-red-500">{errors.paymentMethodId}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={processing}
              placeholder="What is this withdrawal for?"
            />
          </div>



          {/* Processing Info */}
          <Alert className="bg-amber-50 border-amber-200">
            <Clock className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 text-sm">
              Bank transfers take 2-3 business days to complete. Weekend deposits will be processed on Monday.
            </AlertDescription>
          </Alert>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={processing || availableBalance < MIN_WITHDRAWAL}
          >
            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {processing ? 'Processing...' : `Withdraw $${formData.amount || '0.00'}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
