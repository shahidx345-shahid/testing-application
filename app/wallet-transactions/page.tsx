"use client"

import { ProtectedPage } from "@/components/protected-page"

import { useState } from "react"
import { Download, Filter, Search, Eye } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface Transaction {
  id: string
  type: "credit" | "debit"
  description: string
  amount: number
  fee: number
  date: string
  time: string
  status: "completed" | "pending" | "failed"
  method: string
  transactionId: string
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    type: "credit",
    description: "Top Up Wallet",
    amount: 500.0,
    fee: 14.5,
    date: "Dec 30, 2025",
    time: "2:45 PM",
    status: "completed",
    method: "Debit Card •••• 4242",
    transactionId: "TXN-2025-001",
  },
  {
    id: "2",
    type: "debit",
    description: "Daily Savings Deduction",
    amount: 27.4,
    fee: 0,
    date: "Dec 30, 2025",
    time: "12:00 AM",
    status: "completed",
    method: "Wallet",
    transactionId: "TXN-2025-002",
  },
  {
    id: "3",
    type: "credit",
    description: "Referral Bonus",
    amount: 50.0,
    fee: 0,
    date: "Dec 28, 2025",
    time: "3:20 PM",
    status: "completed",
    method: "System",
    transactionId: "TXN-2025-003",
  },
  {
    id: "4",
    type: "debit",
    description: "Daily Savings Deduction",
    amount: 27.4,
    fee: 0,
    date: "Dec 28, 2025",
    time: "12:00 AM",
    status: "completed",
    method: "Wallet",
    transactionId: "TXN-2025-004",
  },
  {
    id: "5",
    type: "credit",
    description: "Top Up Wallet",
    amount: 1000.0,
    fee: 29.0,
    date: "Dec 25, 2025",
    time: "10:15 AM",
    status: "completed",
    method: "Bank Account •••• 6789",
    transactionId: "TXN-2025-005",
  },
  {
    id: "6",
    type: "debit",
    description: "Withdrawal",
    amount: 274.0,
    fee: 0,
    date: "Dec 20, 2025",
    time: "11:30 AM",
    status: "completed",
    method: "ACH Transfer",
    transactionId: "TXN-2025-006",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200"
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200"
    case "failed":
      return "bg-red-50 text-red-700 border-red-200"
    default:
      return ""
  }
}

const getStatusText = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function TransactionHistoryPageContent() {
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "credit" | "debit">("all")
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterType === "all" || t.type === filterType
    return matchesSearch && matchesFilter
  })

  const totalIn = transactions
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + t.amount, 0)
  const totalOut = transactions
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + t.amount, 0)

  const handleExport = () => {
    const csv = [
      ["Date", "Description", "Type", "Amount", "Fee", "Total", "Status"],
      ...filteredTransactions.map((t) => [
        `${t.date} ${t.time}`,
        t.description,
        t.type.toUpperCase(),
        `$${t.amount.toFixed(2)}`,
        `$${t.fee.toFixed(2)}`,
        `$${(t.amount + t.fee).toFixed(2)}`,
        t.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "wallet-transactions.csv"
    a.click()
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Transaction History</h1>
          <p className="text-slate-600">View all your wallet transactions and details</p>
        </div>

        {/* Summary Cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-600 mb-2">Total Added</p>
              <p className="text-2xl font-bold text-emerald-600">${totalIn.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-600 mb-2">Total Spent</p>
              <p className="text-2xl font-bold text-red-600">${totalOut.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-600 mb-2">Net Change</p>
              <p className="text-2xl font-bold text-brand-green">${(totalIn - totalOut).toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
              </div>

              {/* Filter Buttons and Export */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex gap-2">
                  {[
                    { label: "All", value: "all" },
                    { label: "Deposits", value: "credit" },
                    { label: "Spent", value: "debit" },
                  ].map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setFilterType(filter.value as any)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === filter.value
                          ? "bg-brand-green text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleExport}
                  className="ml-auto flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardContent className="p-0">
            {filteredTransactions.length > 0 ? (
              <div className="overflow-x-auto hide-scrollbar">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date & Time</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Description</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 hidden sm:table-cell">Method</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Amount</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700 hidden md:table-cell">Status</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-slate-900">{transaction.date}</p>
                          <p className="text-xs text-slate-500">{transaction.time}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{transaction.description}</p>
                            <p className="text-xs text-slate-500">{transaction.transactionId}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <p className="text-sm text-slate-600">{transaction.method}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className={`text-sm font-semibold ${transaction.type === "credit" ? "text-emerald-600" : "text-red-600"}`}>
                            {transaction.type === "credit" ? "+" : "-"}${transaction.amount.toFixed(2)}
                          </p>
                          {transaction.fee > 0 && (
                            <p className="text-xs text-slate-500">Fee: ${transaction.fee.toFixed(2)}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center hidden md:table-cell">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                            {getStatusText(transaction.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setSelectedTransaction(transaction)}
                            className="text-brand-green hover:text-brand-green/80 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <p className="text-slate-600">No transactions found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction Detail Modal */}
        {selectedTransaction && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Transaction Details</h2>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Description</span>
                    <span className="font-semibold text-slate-900">{selectedTransaction.description}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Transaction ID</span>
                    <span className="font-mono text-sm text-slate-900">{selectedTransaction.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Date & Time</span>
                    <span className="font-semibold text-slate-900">{selectedTransaction.date} {selectedTransaction.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Amount</span>
                    <span className={`font-bold ${selectedTransaction.type === "credit" ? "text-emerald-600" : "text-red-600"}`}>
                      {selectedTransaction.type === "credit" ? "+" : "-"}${selectedTransaction.amount.toFixed(2)}
                    </span>
                  </div>
                  {selectedTransaction.fee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Fee</span>
                      <span className="font-semibold text-slate-900">${selectedTransaction.fee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 pt-4 flex justify-between">
                    <span className="font-semibold text-slate-900">Total</span>
                    <span className={`font-bold text-lg ${selectedTransaction.type === "credit" ? "text-emerald-600" : "text-red-600"}`}>
                      {selectedTransaction.type === "credit" ? "+" : "-"}${(selectedTransaction.amount + selectedTransaction.fee).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Method</span>
                    <span className="font-semibold text-slate-900">{selectedTransaction.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedTransaction.status)}`}>
                      {getStatusText(selectedTransaction.status)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                  >
                    Close
                  </button>
                  <button className="flex-1 px-4 py-2 flex items-center justify-center gap-2 bg-brand-green text-white rounded-lg font-medium hover:bg-brand-green/90 transition-colors">
                    <Download className="w-4 h-4" />
                    Receipt
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TransactionHistoryPage() {
  return (
    <ProtectedPage>
      <TransactionHistoryPageContent />
    </ProtectedPage>
  )
}
