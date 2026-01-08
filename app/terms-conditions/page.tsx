"use client"

import { ProtectedPage } from "@/components/protected-page"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"

function TermsContent() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            <main className="flex-1 overflow-y-auto flex flex-col">
                <DashboardHeader title="Terms & Conditions" onMenuClick={() => setIsMobileMenuOpen(true)} />
                <div className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10">
                    <div className="max-w-4xl mx-auto space-y-6">

                        <div className="mb-8">
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Terms & Conditions</h1>
                            <p className="text-slate-600">Last updated: January 8, 2026</p>
                        </div>

                        <Card className="border-none shadow-sm rounded-2xl">
                            <CardContent className="p-6 md:p-8 prose prose-slate max-w-none">
                                <h2>1. Acceptance of Terms</h2>
                                <p>
                                    By accessing and using Save2740 ("Service"), you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our Service.
                                </p>

                                <h2>2. Description of Service</h2>
                                <p>
                                    Save2740 is a savings challenge platform that helps users save money through automated daily, weekly, or monthly contributions. The Service includes:
                                </p>
                                <ul>
                                    <li>Automated savings challenges ($27.40 daily challenge and variations)</li>
                                    <li>Secure wallet for storing savings</li>
                                    <li>Group contribution features</li>
                                    <li>Referral program</li>
                                    <li>Achievement tracking and streak monitoring</li>
                                </ul>

                                <h2>3. Eligibility</h2>
                                <p>You must be at least 18 years old to use Save2740. By using the Service, you represent that you:</p>
                                <ul>
                                    <li>Are at least 18 years of age</li>
                                    <li>Have the legal capacity to enter into binding contracts</li>
                                    <li>Are not prohibited from using the Service under applicable laws</li>
                                </ul>

                                <h2>4. Account Registration</h2>
                                <p>To use Save2740, you must create an account and provide accurate information:</p>
                                <ul>
                                    <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                                    <li>You must provide accurate, current, and complete information</li>
                                    <li>You must update your information to keep it accurate</li>
                                    <li>You are responsible for all activities under your account</li>
                                    <li>One person may only create one account</li>
                                </ul>

                                <h2>5. Savings Challenges</h2>
                                <p><strong>Challenge Commitments:</strong></p>
                                <ul>
                                    <li>By enrolling in a savings challenge, you commit to making regular contributions</li>
                                    <li>You authorize Save2740 to initiate automatic withdrawals from your connected payment method</li>
                                    <li>Failed payments may result in penalties or challenge termination</li>
                                    <li>You can pause or cancel challenges subject to our policies</li>
                                </ul>

                                <h2>6. Payment Terms</h2>
                                <p><strong>Auto-Debit Authorization:</strong></p>
                                <ul>
                                    <li>You authorize Save2740 to charge your connected payment method for challenge contributions</li>
                                    <li>Charges occur based on your selected frequency (daily, weekly, or monthly)</li>
                                    <li>You must maintain sufficient funds in your payment method</li>
                                    <li>Failed payments will be retried once after 24 hours</li>
                                </ul>

                                <p><strong>Fees:</strong></p>
                                <ul>
                                    <li>First 3 withdrawals per month are free</li>
                                    <li>Additional withdrawals: $1.50 per transaction</li>
                                    <li>Premium subscription: $4.99/month (optional)</li>
                                    <li>No hidden fees - all charges are disclosed upfront</li>
                                </ul>

                                <h2>7. Wallet & Withdrawals</h2>
                                <ul>
                                    <li>Your savings are stored in a secure wallet</li>
                                    <li>Withdrawals typically process in 1-3 business days</li>
                                    <li>KYC verification required for withdrawals over $1,000</li>
                                    <li>We reserve the right to delay suspicious withdrawals for security review</li>
                                </ul>

                                <h2>8. Group Contributions</h2>
                                <ul>
                                    <li>Group challenges are binding commitments among 5-10 participants</li>
                                    <li>Payouts occur only after full rotation cycle completion</li>
                                    <li>Leaving a group before cycle completion may result in penalties</li>
                                    <li>Members are responsible for honoring their group commitments</li>
                                </ul>

                                <h2>9. Referral Program</h2>
                                <ul>
                                    <li>Referral bonuses are paid when referred users complete their first week</li>
                                    <li>Fraudulent referrals (fake accounts, self-referrals) are prohibited</li>
                                    <li>We reserve the right to void fraudulent referral bonuses</li>
                                    <li>Referral terms may change with notice</li>
                                </ul>

                                <h2>10. Prohibited Activities</h2>
                                <p>You agree not to:</p>
                                <ul>
                                    <li>Violate any laws or regulations</li>
                                    <li>Create multiple accounts or share your account</li>
                                    <li>Engage in fraudulent activity or money laundering</li>
                                    <li>Manipulate or exploit the Service</li>
                                    <li>Use bots or automated systems</li>
                                    <li>Harass other users or staff</li>
                                    <li>Reverse engineer or compromise the Service</li>
                                </ul>

                                <h2>11. Termination</h2>
                                <p>We may suspend or terminate your account if you:</p>
                                <ul>
                                    <li>Violate these Terms</li>
                                    <li>Engage in fraudulent activity</li>
                                    <li>Create chargebacks or payment disputes in bad faith</li>
                                    <li>Remain inactive for over 12 months with zero balance</li>
                                </ul>
                                <p>You may terminate your account at any time by withdrawing all funds and contacting support.</p>

                                <h2>12. Disclaimer of Warranties</h2>
                                <p>
                                    THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. Save2740 does not guarantee uninterrupted access, error-free operation, or specific financial outcomes. Your savings results depend on your personal commitment and circumstances.
                                </p>

                                <h2>13. Limitation of Liability</h2>
                                <p>
                                    Save2740's liability is limited to the amount you paid in the past 12 months. We are not liable for indirect, incidental, or consequential damages.
                                </p>

                                <h2>14. Dispute Resolution</h2>
                                <ul>
                                    <li><strong>Governing Law:</strong> These Terms are governed by the laws of California, USA</li>
                                    <li><strong>Arbitration:</strong> Disputes will be resolved through binding arbitration</li>
                                    <li><strong>Class Action Waiver:</strong> You agree to resolve disputes individually, not as part of a class action</li>
                                </ul>

                                <h2>15. Changes to Terms</h2>
                                <p>
                                    We may update these Terms from time to time. Material changes will be notified via email or in-app notification. Continued use after changes constitutes acceptance.
                                </p>

                                <h2>16. Contact Us</h2>
                                <p>For questions about these Terms, contact us at:</p>
                                <p>
                                    Email: legal@save2740.app<br />
                                    Address: Save2740 Inc., 123 Finance Street, San Francisco, CA 94105
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

export default function TermsConditionsPage() {
    return (
        <ProtectedPage>
            <TermsContent />
        </ProtectedPage>
    )
}
