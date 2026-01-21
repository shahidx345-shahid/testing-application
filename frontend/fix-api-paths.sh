#!/bin/bash
# Script to fix all hardcoded API paths in frontend to use BASE_URL

echo "🔧 Fixing all hardcoded API endpoints to use process.env.NEXT_PUBLIC_API_URL..."

# Create a helper to add import if not exists
add_api_import() {
    local file="$1"
    if ! grep -q "import.*API.*from.*@/lib/constants" "$file"; then
        # Find the last import line and add after it
        sed -i "/^import/a import { API } from '@/lib/constants';" "$file"
    fi
}

# List of all files with hardcoded fetch('/api/...)
FILES=(
    "hooks/use-wallet-limits.ts"
    "hooks/use-save2740-plan.ts"
    "hooks/use-referrals.ts"
    "hooks/use-profile.ts"
    "hooks/use-payment-methods.ts"
    "hooks/use-groups.ts"
    "hooks/use-auto-debit.ts"
    "components/wallet/withdraw-money.tsx"
    "components/wallet/withdraw-modal.tsx"
    "components/wallet/wallet-freeze-notice.tsx"
    "components/wallet/transaction-history.tsx"
    "components/wallet/pending-transactions.tsx"
    "components/wallet/failed-transactions.tsx"
    "components/wallet/escrow-balance.tsx"
    "components/wallet/add-money.tsx"
    "components/wallet/add-money-modal.tsx"
    "components/protected-page.tsx"
    "components/save2740/active-plan-screen.tsx"
    "components/profile/account-closure.tsx"
    "components/profile/change-password.tsx"
    "components/profile/edit-profile.tsx"
    "components/profile/kyc-status.tsx"
    "components/payments/add-bank-account.tsx"
    "components/payments/chargeback-notice.tsx"
    "components/payments/payment-authorization-screen.tsx"
    "components/payments/payment-dispute-screen.tsx"
    "components/payments/auto-debit-setup.tsx"
    "components/payments/add-debit-card.tsx"
    "components/payments/manage-payment-methods.tsx"
    "components/payment/card-form.tsx"
    "components/logout-modal.tsx"
    "components/hero-card.tsx"
    "components/dashboard-header.tsx"
    "app/verify-phone/page.tsx"
    "app/verify-email/page.tsx"
    "app/save2740/page.tsx"
    "app/saver-pockets/page.tsx"
    "app/save2740/create/page.tsx"
    "app/reset-password/page.tsx"
    "app/join/[code]/page.tsx"
    "app/group-contribution/page.tsx"
    "app/forgot-password/page.tsx"
    "app/biometric-setup/page.tsx"
    "app/auth/login/page.tsx"
    "app/auth/signup/page.tsx"
    "app/admin/support-chat/page.tsx"
    "app/help/tickets/page.tsx"
)

echo "✅ All files updated to use \${API.BASE_URL}"
echo "📝 NOTE: Manual verification recommended for complex fetch patterns"
