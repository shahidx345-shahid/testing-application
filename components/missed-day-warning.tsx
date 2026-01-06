"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, X, Calendar } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"

/**
 * MissedDayWarning Component
 * Shows alert when user hasn't made their daily savings contribution
 */
export function MissedDayWarning() {
  const { data } = useWallet()
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    if (!data || isDismissed) {
      setIsVisible(false)
      return
    }

    const lastSavingDate = data.lastDailySavingDate
      ? new Date(data.lastDailySavingDate)
      : null

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const lastDate = lastSavingDate
      ? new Date(lastSavingDate)
      : new Date(today.getTime() - 24 * 60 * 60 * 1000)

    lastDate.setHours(0, 0, 0, 0)

    const isMissed = today.getTime() > lastDate.getTime()

    setIsVisible(isMissed)
  }, [data, isDismissed])

  if (!isVisible) return null

  const hoursLeft = 24 - new Date().getHours()
  const dailyAmount = data?.dailySavingAmount || 27.4

  return (
    <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 max-w-sm animate-in slide-in-from-top-2">
      <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-200 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <AlertTriangle className="w-6 h-6 text-white flex-shrink-0 mt-0.5 animate-pulse" />
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">
                Don't Break Your Streak!
              </h3>
              <p className="text-white/90 text-xs sm:text-sm mt-1">
                You haven't contributed today yet.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-white hover:bg-white/20 p-1 rounded transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {/* Streak info */}
            <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-semibold text-slate-600 uppercase">
                  Current Streak
                </span>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {data?.currentStreak || 0}
              </p>
              <p className="text-xs text-slate-600 mt-1">days</p>
            </div>

            {/* Time left */}
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
              <div className="text-xs font-semibold text-slate-600 uppercase mb-2">
                Time Left
              </div>
              <p className="text-2xl font-bold text-amber-600">{hoursLeft}</p>
              <p className="text-xs text-slate-600 mt-1">hours</p>
            </div>
          </div>

          {/* Amount to save */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-3 border border-emerald-200">
            <p className="text-xs font-semibold text-slate-600 uppercase mb-1">
              Amount to Save
            </p>
            <p className="text-3xl font-bold text-emerald-600">
              ${dailyAmount.toFixed(2)}
            </p>
          </div>

          {/* Action button */}
          <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105">
            Contribute Now
          </button>

          {/* Encouragement */}
          <p className="text-xs text-slate-600 text-center italic">
            Keep your streak alive and stay on track with your savings goal!
          </p>
        </div>
      </div>
    </div>
  )
}
