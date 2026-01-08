"use client"

import { ProtectedPage } from "@/components/protected-page"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"
import { AlertTriangle } from "lucide-react"

function SavingsChallengeDisclaimerContent() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            <main className="flex-1 overflow-y-auto flex flex-col">
                <DashboardHeader title="Savings Challenge Disclaimer" onMenuClick={() => setIsMobileMenuOpen(true)} />
                <div className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10">
                    <div className="max-w-4xl mx-auto space-y-6">

                        <div className="mb-8">
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Savings Challenge Disclaimer</h1>
                            <p className="text-slate-600">Last updated: January 8, 2026</p>
                        </div>

                        <Card className="border-2 border-orange-200 bg-orange-50 rounded-2xl">
                            <CardContent className="p-6 flex items-start gap-3">
                                <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-2">Important Notice</h3>
                                    <p className="text-slate-700 text-sm">
                                        Please read this disclaimer carefully before participating in any Save2740 savings challenge. By enrolling, you acknowledge and accept these terms.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm rounded-2xl">
                            <CardContent className="p-6 md:p-8 prose prose-slate max-w-none">

                                <h2>1. No Guaranteed Returns</h2>
                                <p>
                                    Save2740 is a <strong>savings tool</strong>, not an investment platform. We do not offer, promise, or guarantee any returns on your savings beyond the principal amount you deposit. Your savings do not earn interest or investment returns.
                                </p>
                                <p>
                                    <strong>What you save is what you get.</strong> If you save $27.40/day for 365 days, you will have approximately $10,000 in your wallet (minus any applicable fees).
                                </p>

                                <h2>2. Not Financial Advice</h2>
                                <p>
                                    Save2740 does not provide financial, investment, or tax advice. The savings challenges are educational tools to help build saving habits. You should:
                                </p>
                                <ul>
                                    <li>Consult with a qualified financial advisor regarding your financial goals</li>
                                    <li>Ensure you can afford the challenge amount without financial hardship</li>
                                    <li>Consider your personal financial circumstances before enrolling</li>
                                    <li>Understand the tax implications of your savings (consult a tax professional)</li>
                                </ul>

                                <h2>3. Personal Responsibility</h2>
                                <p>
                                    <strong>You are solely responsible for:</strong>
                                </p>
                                <ul>
                                    <li>Determining whether a savings challenge is appropriate for your financial situation</li>
                                    <li>Ensuring sufficient funds in your payment method for automatic deductions</li>
                                    <li>Managing your budget to accommodate challenge contributions</li>
                                    <li>Monitoring your progress and wallet balance</li>
                                    <li>Understanding and accepting the risks of automated payments</li>
                                </ul>

                                <h2>4. Payment Risks</h2>
                                <p>
                                    Automatic payments carry certain risks:
                                </p>
                                <ul>
                                    <li><strong>Overdraft Fees:</strong> If your bank account has insufficient funds, you may incur overdraft fees from your bank. Save2740 is not responsible for these fees.</li>
                                    <li><strong>Failed Payments:</strong> If payments fail repeatedly, your challenge may be paused or terminated</li>
                                    <li><strong>Payment Method Issues:</strong> Expired cards or closed accounts can cause payment failures</li>
                                    <li><strong>Bank Delays:</strong> Some transfers may take 1-3 business days to complete</li>
                                </ul>

                                <h2>5. Streak and Challenge Commitment</h2>
                                <ul>
                                    <li>Streaks are motivational tools and do not affect your actual savings amount</li>
                                    <li>Missed days will reset your streak but your money remains safe</li>
                                    <li>You can pause or cancel challenges, but may lose streak progress</li>
                                    <li>Challenge completion is voluntary - you can withdraw at any time</li>
                                </ul>

                                <h2>6. Group Contribution Risks</h2>
                                <p>
                                    Group challenges involve additional considerations:
                                </p>
                                <ul>
                                    <li><strong>Member Dependency:</strong> Payout depends on all members completing their contributions</li>
                                    <li><strong>Default Risk:</strong> If a member fails to contribute, it may delay or affect group payouts</li>
                                    <li><strong>No Early Withdrawal:</strong> Group funds are locked until the full cycle completes</li>
                                    <li><strong>Know Your Group:</strong> Only join groups with people you trust</li>
                                    <li><strong>No Guarantees:</strong> Save2740 cannot guarantee group member performance</li>
                                </ul>

                                <h2>7. Withdrawal Limitations</h2>
                                <ul>
                                    <li>Withdrawals require identity verification (KYC) for amounts over $1,000</li>
                                    <li>Processing time is typically 1-3 business days (may be longer for large amounts)</li>
                                    <li>We reserve the right to delay suspicious withdrawals for security review</li>
                                    <li>Withdrawal fees apply after the first 3 free withdrawals per month</li>
                                    <li>Group challenge funds cannot be withdrawn until cycle completion</li>
                                </ul>

                                <h2>8. Service Availability</h2>
                                <p>
                                    While we strive for 24/7 availability:
                                </p>
                                <ul>
                                    <li>Service may be temporarily unavailable due to maintenance or technical issues</li>
                                    <li>We are not liable for losses resulting from service interruptions</li>
                                    <li>Scheduled maintenance will be announced in advance when possible</li>
                                    <li>Emergency maintenance may occur without prior notice</li>
                                </ul>

                                <h2>9. No FDIC Insurance</h2>
                                <p>
                                    <strong>Important:</strong> Funds in your Save2740 wallet are <strong>not FDIC insured</strong>. While we use banking partners and secure processors, your savings are held in a stored value account, not a traditional bank account.
                                </p>
                                <p>
                                    We implement strict security measures and work with regulated partners, but you should be aware that wallet balances are not covered by federal deposit insurance.
                                </p>

                                <h2>10. Tax Implications</h2>
                                <ul>
                                    <li>You are responsible for reporting any applicable taxes on your savings</li>
                                    <li>Referral bonuses may be considered taxable income</li>
                                    <li>Interest (if any) on wallet balances may be taxable</li>
                                    <li>Consult a tax professional for guidance on your specific situation</li>
                                    <li>Save2740 may issue tax forms (e.g., 1099) where required by law</li>
                                </ul>

                                <h2>11. Change of Terms</h2>
                                <p>
                                    We reserve the right to:
                                </p>
                                <ul>
                                    <li>Modify challenge parameters with 30 days' notice</li>
                                    <li>Adjust fees with advance notification</li>
                                    <li>Discontinue challenges or features</li>
                                    <li>Change eligibility requirements</li>
                                </ul>
                                <p>
                                    Active challenges will be honored under the terms in effect when you enrolled, unless changes are required by law.
                                </p>

                                <h2>12. Limitation of Liability</h2>
                                <p>
                                    Save2740's liability is limited to the amount in your wallet balance. We are not liable for:
                                </p>
                                <ul>
                                    <li>Indirect, incidental, or consequential damages</li>
                                    <li>Lost profits or savings opportunities</li>
                                    <li>Emotional distress or frustration</li>
                                    <li>Third-party actions (bank fees, payment processor issues)</li>
                                    <li>Force majeure events beyond our control</li>
                                </ul>

                                <h2>13. User Acknowledgment</h2>
                                <p>
                                    By participating in Save2740 challenges, you acknowledge that you:
                                </p>
                                <ul>
                                    <li className="flex items-start gap-2">
                                        <span>✓</span>
                                        <span>Have read and understood this disclaimer in full</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span>✓</span>
                                        <span>Understand that savings do not earn guaranteed returns</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span>✓</span>
                                        <span>Accept responsibility for your financial decisions</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span>✓</span>
                                        <span>Understand the risks of automated payments and group challenges</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span>✓</span>
                                        <span>Have consulted financial advisors if needed</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span>✓</span>
                                        <span>Can afford the challenge without financial hardship</span>
                                    </li>
                                </ul>

                                <h2>14. Questions or Concerns</h2>
                                <p>
                                    If you have questions about this disclaimer or the challenges:
                                </p>
                                <p>
                                    Email: legal@save2740.app<br />
                                    Support: support@save2740.app<br />
                                    Phone: 1-800-SAVE-274
                                </p>

                            </CardContent>
                        </Card>

                    </div>
                </div>
            </main>

            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetContent side="left" className="p-0 w-64 border-none">
                    <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
                </SheetContent>
            </Sheet>
        </div>
    )
}

export default function SavingsChallengeDisclaimerPage() {
    return (
        <ProtectedPage>
            <SavingsChallengeDisclaimerContent />
        </ProtectedPage>
    )
}
