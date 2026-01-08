"use client"

import { ProtectedPage } from "@/components/protected-page"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"

function AffiliateReferralPolicyContent() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            <main className="flex-1 overflow-y-auto flex flex-col">
                <DashboardHeader title="Affiliate / Referral Policy" onMenuClick={() => setIsMobileMenuOpen(true)} />
                <div className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10">
                    <div className="max-w-4xl mx-auto space-y-6">

                        <div className="mb-8">
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Affiliate / Referral Policy</h1>
                            <p className="text-slate-600">Last updated: January 8, 2026</p>
                        </div>

                        <Card className="border-none shadow-sm rounded-2xl">
                            <CardContent className="p-6 md:p-8 prose prose-slate max-w-none">

                                <h2>Referral Program Overview</h2>
                                <p>
                                    Save2740's Referral Program rewards users for inviting friends and family to join our savings community. Earn bonuses when your referrals complete qualifying actions.
                                </p>

                                <h3>1. How It Works</h3>
                                <ol>
                                    <li><strong>Get Your Link:</strong> Find your unique referral link in the Referrals section of your account</li>
                                    <li><strong>Share:</strong> Send your link to friends via email, social media, or messaging apps</li>
                                    <li><strong>Earn:</strong> When someone signs up using your link and completes qualifying actions, you both earn bonuses</li>
                                </ol>

                                <h3>2. Referral Rewards</h3>
                                <p><strong>Standard Rewards:</strong></p>
                                <ul>
                                    <li><strong>Referrer:</strong> $10 bonus when referred user completes their first week of savings</li>
                                    <li><strong>Referred User:</strong> $5 welcome bonus upon signup + first week completion</li>
                                </ul>

                                <p><strong>Premium Subscriber Rewards:</strong></p>
                                <ul>
                                    <li><strong>Referrer:</strong> $15 per qualified referral</li>
                                    <li><strong>Referred User:</strong> $10 welcome bonus</li>
                                </ul>

                                <p><strong>Qualifying Actions (for bonuses to pay out):</strong></p>
                                <ul>
                                    <li>Referred user must create an account using your link</li>
                                    <li>Verify their email address</li>
                                    <li>Connect a payment method</li>
                                    <li>Complete at least 7 consecutive days of savings contributions</li>
                                    <li>Have minimum $50 in wallet balance after first week</li>
                                </ul>

                                <h3>3. Bonus Payout</h3>
                                <ul>
                                    <li>Bonuses credited to wallet within 48 hours of qualification</li>
                                    <li>Minimum wallet balance required to withdraw: $10</li>
                                    <li>Bonuses can be used for challenges, withdrawn, or kept as savings</li>
                                    <li>Tax forms (1099) issued if total annual bonuses exceed $600</li>
                                </ul>

                                <h3>4. Referral Limits</h3>
                                <ul>
                                    <li><strong>Free Users:</strong> Up to 10 successful referrals per month</li>
                                    <li><strong>Premium Users:</strong> Unlimited referrals</li>
                                    <li>Annual cap: $5,000 in total referral bonuses per calendar year</li>
                                </ul>

                                <h3>5. Prohibited Practices</h3>
                                <p>The following are strictly prohibited and will result in account suspension and forfeiture of bonuses:</p>
                                <ul>
                                    <li><strong>Self-Referrals:</strong> Referring yourself or creating fake accounts</li>
                                    <li><strong>Spam:</strong> Mass unsolicited emails, automated bots, or spam comments</li>
                                    <li><strong>False Advertising:</strong> Misrepresenting Save2740 or making unrealistic promises</li>
                                    <li><strong>Paid Advertising (Without Approval):</strong> Running paid ads without written permission</li>
                                    <li><strong>Incentivized Signups:</strong> Offering external incentives (cash, gifts) for using your link</li>
                                    <li><strong>Domain Squatting:</strong> Registering domains similar to Save2740 to mislead users</li>
                                    <li><strong>Trademark Misuse:</strong> Using Save2740 trademarks without permission</li>
                                </ul>

                                <h3>6. Promotional Campaigns</h3>
                                <p>We occasionally run limited-time promotions with enhanced rewards:</p>
                                <ul>
                                    <li>Promotions announced via email and in-app notifications</li>
                                    <li>Promotional bonus amounts and terms vary</li>
                                    <li>Promotions may have additional eligibility requirements</li>
                                    <li>Standard program terms apply unless explicitly stated otherwise</li>
                                </ul>

                                <h2>Affiliate Program</h2>

                                <h3>7. Who Can Join</h3>
                                <p>The Save2740 Affiliate Program is invite-only for:</p>
                                <ul>
                                    <li>Financial bloggers and content creators</li>
                                    <li>Personal finance influencers</li>
                                    <li>Financial coaches and advisors</li>
                                    <li>Budgeting and savings platforms</li>
                                </ul>
                                <p>To apply: email affiliates@save2740.app with your platform details and audience demographics.</p>

                                <h3>8. Affiliate Commission Structure</h3>
                                <ul>
                                    <li><strong>Per Signup:</strong> $3 for each verified signup</li>
                                    <li><strong>Per Active User:</strong> $20 when user completes 30 days of consecutive saving</li>
                                    <li><strong>Premium Conversion:</strong> 20% of first month's subscription fee ($1) when referred user upgrades to Premium</li>
                                    <li><strong>Recurring:</strong> 5% recurring commission on premium subscriptions for 12 months</li>
                                </ul>

                                <h3>9. Affiliate Requirements</h3>
                                <p>Affiliates must:</p>
                                <ul>
                                    <li>Clearly disclose affiliate relationship in compliance with FTC guidelines</li>
                                    <li>Use approved promotional materials or get content pre-approved</li>
                                    <li>Maintain brand integrity - no misleading claims</li>
                                    <li>Provide monthly traffic/conversion reports</li>
                                    <li>Not engage in prohibited marketing practices</li>
                                </ul>

                                <h3>10. Affiliate Payouts</h3>
                                <ul>
                                    <li><strong>Minimum Payout:</strong> $100</li>
                                    <li><strong>Payment Schedule:</strong> Monthly (NET-30)</li>
                                    <li><strong>Payment Methods:</strong> Bank transfer, PayPal, or check</li>
                                    <li><strong>Tax Forms:</strong> W-9 required for US affiliates, W-8BEN for international</li>
                                </ul>

                                <h3>11. Affiliate Tracking</h3>
                                <ul>
                                    <li>30-day cookie duration for attribut ion</li>
                                    <li>Last-click attribution model</li>
                                    <li>Real-time dashboard for tracking referrals and earnings</li>
                                    <li>Monthly detailed reports provided</li>
                                </ul>

                                <h3>12. Termination</h3>
                                <p>We may terminate participation for:</p>
                                <ul>
                                    <li>Violation of program policies</li>
                                    <li>Fraudulent activity or manipulation</li>
                                    <li>Brand damage or misrepresentation</li>
                                    <li>Inactivity (no referrals) for 6+ months</li>
                                </ul>
                                <p>Upon termination:</p>
                                <ul>
                                    <li>Pending commissions &gt;$100 will be paid out</li>
                                    <li>Unpaid amounts &lt;$100 may be forfeited</li>
                                    <li>Access to affiliate dashboard revoked</li>
                                </ul>

                                <h3>13. Intellectual Property</h3>
                                <ul>
                                    <li>Affiliates granted limited license to use Save2740 name and logos</li>
                                    <li>All promotional materials remain Save2740 property</li>
                                    <li>May not modify logos or create derivative works</li>
                                    <li>License terminates upon program exit</li>
                                </ul>

                                <h3>14. Compliance</h3>
                                <p>All participants must comply with:</p>
                                <ul>
                                    <li><strong>FTC Endorsement Guidelines:</strong> Disclose affiliate relationships</li>
                                    <li><strong>CAN-SPAM Act:</strong> No unsolicited commercial emails</li>
                                    <li><strong>GDPR:</strong> Respect EU user privacy rights</li>
                                    <li><strong>CCPA:</strong> Comply with California privacy laws</li>
                                    <li><strong>Local Laws:</strong> All applicable regulations in your jurisdiction</li>
                                </ul>

                                <h3>15. Program Changes</h3>
                                <p>
                                    Save2740 reserves the right to modify, suspend, or terminate the referral/affiliate programs at any time with 30 days' notice. Changes to commission structures will not affect earnings already accrued.
                                </p>

                                <h3>16. Contact</h3>
                                <p>For program questions:</p>
                                <p>
                                    Referral Program: support@save2740.app<br />
                                    Affiliate Program: affiliates@save2740.app<br />
                                    Affiliate Applications: Apply via affiliates@save2740.app
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

export default function AffiliateReferralPolicyPage() {
    return (
        <ProtectedPage>
            <AffiliateReferralPolicyContent />
        </ProtectedPage>
    )
}
