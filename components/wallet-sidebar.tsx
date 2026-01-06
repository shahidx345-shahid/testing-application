"use client"

import { useState, useEffect } from "react"
import {
  Gem,
  CheckCircle2,
  UtensilsCrossed,
  Grid2x2,
  Users,
  Lock,
  ShieldCheck,
  Settings,
  X,
  CreditCard,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { WalletBalance } from "@/components/wallet-balance"
import { LogoutModal } from "@/components/logout-modal"
import Image from "next/image"

// Custom Wallet Icon Component
const WalletIcon = ({ className }: { className?: string }) => (
  <img
    src="/wallet-icon.png"
    alt="Wallet"
    width={24}
    height={24}
    className={className}
  />
)

// Custom Dashboard Icon Component
const DashboardIcon = ({ className }: { className?: string }) => (
  <img
    src="/dashboard-icon.png"
    alt="Dashboard"
    width={24}
    height={24}
    className={className}
  />
)

// Custom Transaction Icon Component
const TransactionIcon = ({ className }: { className?: string }) => (
  <img
    src="/transaction-icon.png"
    alt="Transaction"
    width={24}
    height={24}
    className={className}
  />
)

// Custom Achievements Icon Component
const AchievementsIcon = ({ className }: { className?: string }) => (
  <img
    src="/achievements-icon.png"
    alt="Achievements"
    width={24}
    height={24}
    className={className}
  />
)

// Custom Saver Pockets Icon Component
const SaverPocketsIcon = ({ className }: { className?: string }) => (
  <img
    src="/saver-pockets-icon.png"
    alt="Saver Pockets"
    width={24}
    height={24}
    className={className}
  />
)

// Custom Referrals Icon Component
const ReferralsIcon = ({ className }: { className?: string }) => (
  <img
    src="/referrals-icon.png"
    alt="Referrals"
    width={24}
    height={24}
    className={className}
  />
)

// Custom Subscription Icon Component
const SubscriptionIcon = ({ className }: { className?: string }) => (
  <img
    src="/subscription-icon.png"
    alt="Subscription"
    width={24}
    height={24}
    className={className}
  />
)

// Wallet-first arrangement
const navItems = [
  { icon: DashboardIcon, label: "Dashboard", href: "/", isDashboard: true },
  { icon: WalletIcon, label: "My Wallet", href: "/my-wallet", isWallet: true },
  { icon: TransactionIcon, label: "Transactions", href: "/wallet-transactions" },
  { icon: AchievementsIcon, label: "Achievements", href: "/achievements" },
  { icon: SaverPocketsIcon, label: "Saver Pockets", href: "/saver-pockets" },
  { icon: ReferralsIcon, label: "Referrals", href: "/referrals" },
  { icon: SubscriptionIcon, label: "Subscription", href: "/subscription" },
]

interface WalletSidebarProps {
  onClose?: () => void
}

interface UserData {
  firstName: string
  lastName: string
  email: string
}

export function WalletSidebar({ onClose }: WalletSidebarProps) {
  const pathname = usePathname()
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data.user) {
            setUser(data.data.user)
          }
        }
      } catch (error) {
        console.error("Failed to fetch user:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return (
    <div className="w-full lg:w-64 bg-white h-full flex flex-col border-r border-slate-100 p-3 sm:p-4 md:p-6">
      <div className="flex items-center justify-between mb-6 sm:mb-8 md:mb-10">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <img
            src="/logo.png"
            alt="Save2740 Logo"
            className="h-10 sm:h-12 md:h-14 w-auto"
          />
        </div>
        <button onClick={onClose} className="lg:hidden p-1.5 sm:p-2 text-slate-500 shrink-0 rounded transition-colors">
          <X className="w-5 h-5 sm:w-5 md:w-6 h-5 md:h-6" />
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 sm:space-y-1 md:space-y-2">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 rounded-lg md:rounded-xl transition-colors text-xs sm:text-sm md:text-base",
                isActive ? "bg-emerald-50 text-brand-green font-medium shadow-sm" : "text-slate-500",
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {item.isWallet ? (
                <item.icon className="w-4 h-4 sm:w-5 md:w-5 h-4 md:h-5 shrink-0" />
              ) : (
                <item.icon className="w-4 h-4 sm:w-5 md:w-5 h-4 md:h-5 shrink-0" />
              )}
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto space-y-3 sm:space-y-4 md:space-y-6 pt-6 sm:pt-8 md:pt-10">
        <img
          src="/kyc-button.png"
          alt="KYC Required"
          className="w-fit h-auto"
        />

        <div className="pt-3 sm:pt-4 md:pt-6 border-t border-slate-100 flex flex-col gap-3 sm:gap-4">
          <img
            src="/profile-section.png"
            alt="User Profile"
            className="w-full h-auto"
          />

          <button
            onClick={() => setLogoutOpen(true)}
            className="flex items-center gap-3 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 rounded-lg md:rounded-xl transition-colors text-xs sm:text-sm md:text-base text-slate-500 w-full"
          >
            <LogOut className="w-4 h-4 sm:w-5 md:w-5 h-4 md:h-5 shrink-0" />
            <span className="truncate">Logout</span>
          </button>
        </div>

        <LogoutModal open={logoutOpen} onOpenChange={setLogoutOpen} />
      </div>
    </div>
  )
}
