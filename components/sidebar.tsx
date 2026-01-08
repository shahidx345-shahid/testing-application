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

// Custom Dashboard Icon Component
const DashboardIcon = ({ className }: { className?: string }) => (
  <div className={className}>
    <Image
      src="/dashboard-icon.png"
      alt="Dashboard"
      width={24}
      height={24}
      priority
    />
  </div>
)

// Custom Wallet Icon Component
const WalletIcon = ({ className }: { className?: string }) => (
  <div className={className}>
    <Image
      src="/wallet-icon.png"
      alt="Wallet"
      width={24}
      height={24}
      priority
    />
  </div>
)

// Custom Transaction Icon Component
const TransactionIcon = ({ className }: { className?: string }) => (
  <div className={className}>
    <Image
      src="/transaction-icon.png"
      alt="Transaction"
      width={24}
      height={24}
      priority
    />
  </div>
)

// Custom Achievements Icon Component
const AchievementsIcon = ({ className }: { className?: string }) => (
  <div className={className}>
    <Image
      src="/achievements-icon.png"
      alt="Achievements"
      width={24}
      height={24}
    />
  </div>
)

// Custom Saver Pockets Icon Component
const SaverPocketsIcon = ({ className }: { className?: string }) => (
  <div className={className}>
    <Image
      src="/saver-pockets-icon.png"
      alt="Saver Pockets"
      width={24}
      height={24}
    />
  </div>
)

// Custom Referrals Icon Component
const ReferralsIcon = ({ className }: { className?: string }) => (
  <div className={className}>
    <Image
      src="/referrals-icon.png"
      alt="Referrals"
      width={24}
      height={24}
    />
  </div>
)

// Custom Subscription Icon Component
const SubscriptionIcon = ({ className }: { className?: string }) => (
  <div className={className}>
    <Image
      src="/subscription-icon.png"
      alt="Subscription"
      width={24}
      height={24}
    />
  </div>
)

// Custom Group Contribution Icon Component (SVG)
const GroupContributionIcon = ({ className }: { className?: string }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="9" cy="7" r="4" fill="currentColor"></circle>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
)

const navItems = [
  { icon: DashboardIcon, label: "Dashboard", href: "/", isDashboard: true },
  { icon: WalletIcon, label: "My Wallet", href: "/my-wallet", isWallet: true },
  { icon: TransactionIcon, label: "Transactions", href: "/wallet-transactions" },
  { icon: AchievementsIcon, label: "Achievements", href: "/achievements" },
  { icon: SaverPocketsIcon, label: "Saver Pockets", href: "/saver-pockets" },
  { icon: ReferralsIcon, label: "Referrals", href: "/referrals" },
  { icon: GroupContributionIcon, label: "Group Contribution", href: "/group-contribution" },
  { icon: SubscriptionIcon, label: "Subscription", href: "/subscription" },
]

interface SidebarProps {
  onClose?: () => void
}

interface UserData {
  firstName: string
  lastName: string
  email: string
}

export function Sidebar({ onClose }: SidebarProps) {
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
    <div className="w-full lg:w-64 bg-white h-full flex flex-col border-r border-slate-100">
      {/* Header Section - Fixed */}
      <div className="flex-shrink-0 p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
            <div style={{ width: '140px', height: '56px', overflow: 'hidden' }}>
              <img
                src="/logo.png"
                alt="Save2740 Logo"
                className="h-10 sm:h-12 md:h-14 w-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <nav
        id="sidebar-nav"
        className="flex-1 overflow-y-auto hide-scrollbar px-3 sm:px-4 md:px-6 space-y-0.5 sm:space-y-1 md:space-y-2 pb-4"
        onScroll={(e) => {
          const target = e.target as HTMLElement;
          sessionStorage.setItem('sidebar-scroll', target.scrollTop.toString());
        }}
        ref={(el) => {
          if (el) {
            // Restore scroll position immediately on mount
            const savedScroll = sessionStorage.getItem('sidebar-scroll');
            if (savedScroll) {
              el.scrollTop = parseInt(savedScroll, 10);
            }
          }
        }}
      >
        {navItems.map((item, index) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              prefetch={true}
              className={cn(
                "flex items-center gap-3 px-1 sm:px-1.5 md:px-2 py-1.5 sm:py-2 md:py-3 rounded-lg md:rounded-xl transition-colors text-xs sm:text-sm md:text-base",
                isActive ? "bg-emerald-50 text-brand-green font-medium shadow-sm" : "text-slate-500",
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {item.isDashboard ? (
                <item.icon className="w-4 h-4 sm:w-5 md:w-5 h-4 md:h-5 shrink-0" />
              ) : (
                <item.icon className="w-4 h-4 sm:w-5 md:w-5 h-4 md:h-5 shrink-0" />
              )}
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}

        {/* Useful Links Section */}
        <div className="pt-4 mt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider px-2 sm:px-3 md:px-4 mb-2">
            Useful Links
          </h3>
          <div className="space-y-1">
            <Link
              href="/privacy-policy"
              onClick={onClose}
              prefetch={true}
              className="flex items-center px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-600 hover:text-brand-green transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-conditions"
              onClick={onClose}
              prefetch={true}
              className="flex items-center px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-600 hover:text-brand-green transition-colors"
            >
              Terms & Conditions
            </Link>
            <Link
              href="/savings-challenge-disclaimer"
              onClick={onClose}
              prefetch={true}
              className="flex items-center px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-600 hover:text-brand-green transition-colors"
            >
              Savings Challenge Disclaimer
            </Link>
            <Link
              href="/subscription-refund-policy"
              onClick={onClose}
              prefetch={true}
              className="flex items-center px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-600 hover:text-brand-green transition-colors"
            >
              Subscription & Refund Policy
            </Link>
            <Link
              href="/affiliate-referral-policy"
              onClick={onClose}
              prefetch={true}
              className="flex items-center px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-600 hover:text-brand-green transition-colors"
            >
              Affiliate / Referral Policy
            </Link>
          </div>
        </div>
      </nav>

      {/* Footer Section - Fixed at Bottom */}
      <div className="flex-shrink-0 p-3 sm:p-4 md:p-6 border-t border-slate-100 space-y-3 sm:space-y-4">
        <img
          src="/kyc-button.png"
          alt="KYC Required"
          className="h-auto max-h-12 object-contain"
        />

        <div className="space-y-3 sm:space-y-4">
          <img
            src="/profile-section.png"
            alt="User Profile"
            className="h-auto max-h-12 object-contain cursor-pointer"
            onClick={() => window.location.href = '/profile'}
          />

          <button
            onClick={() => setLogoutOpen(true)}
            className="flex items-center justify-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg md:rounded-xl transition-all text-sm sm:text-base text-red-600 hover:bg-red-50 w-full font-medium border border-red-200 hover:border-red-300"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Logout</span>
          </button>
        </div>

        <LogoutModal open={logoutOpen} onOpenChange={setLogoutOpen} />
      </div>
    </div>
  )
}
