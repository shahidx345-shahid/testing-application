"use client"

import { ProtectedPage } from "@/components/protected-page"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"

function SubscriptionRefundPolicyContent() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            <main className="flex-1 overflow-y-auto flex flex-col">
                <DashboardHeader title="Subscription & Refund Policy" onMenuClick={() => setIsMobileMenuOpen(true)} />
                <div className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10">
                    <div className="max-w-4xl mx-auto space-y-6">

                        <div className="mb-8">
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Subscription & Refund Policy</h1>
                            <p className="text-slate-600">Last updated: January 8, 2026</p>
                        </div>

                        <Card className="border-none shadow-sm rounded-2xl">
                            <CardContent className="p-6 md:p-8 prose prose-slate max-w-none">

                                <h2>Premium Subscription</h2>

                                <h3>1. Subscription Plans</h3>
                                <p>Save2740 offers the following subscription options:</p>
                                <ul>
                                    <li><strong>Free Plan:</strong> Basic features, multipliers up to 5x, limited achievements</li>
                                    <li><strong>Premium Monthly:</strong> $4.99/month - All features, unlimited multipliers, group challenges, priority support</li>
                                    <li><strong>Premium Annual:</strong> $49.99/year (Save 17%) - All Premium features with annual billing</li>
                                </ul>

                                <h3>2. Premium Features</h3>
                                <p>Premium subscribers get access to:</p>
                                <ul>
                                    <li>Multipliers from 1x to 10x (vs 1x-5x on free)</li>
                                    <li>Unlimited group challenge participation</li>
                                    <li>Unlimited free withdrawals (vs 3/month on free)</li>
                                    <li>Advanced analytics and insights</li>
                                    <li>Priority customer support (24-hour response time)</li>
                                    <li>Exclusive badges and achievements</li>
                                    <li>Early access to new features</li>
                                    <li>Ad-free experience</li>
                                </ul>

                                <h3>3. Billing</h3>
                                <ul>
                                    <li><strong>Recurring Charges:</strong> Subscriptions renew automatically until canceled</li>
                                    <li><strong>Payment Method:</strong> Charged to your default payment method on file</li>
                                    <li><strong>Billing Cycle:</strong> Monthly subscribers billed every 30 days, annual every 365 days</li>
                                    <li><strong>Price Changes:</strong> We'll notify you 30 days before any price changes</li>
                                    <li><strong>Failed Payments:</strong> If billing fails, we'll retry 3 times over 7 days before suspending premium access</li>
                                </ul>

                                <h3>4. Free Trial</h3>
                                <ul>
                                    <li>New users may receive a 7-day free trial</li>
                                    <li>Cancel anytime during trial to avoid charges</li>
                                    <li>After trial, standard subscription fees apply unless canceled</li>
                                    <li>One free trial per user (based on email and payment method)</li>
                                </ul>

                                <h3>5. Cancellation</h3>
                                <p><strong>How to Cancel:</strong></p>
                                <ul>
                                    <li>Go to Settings → Subscription → Cancel Subscription</li>
                                    <li>Or email support@save2740.app with "Cancel Subscription" in the subject</li>
                                    <li>Cancellation takes effect at the end of the current billing period</li>
                                    <li>You retain premium access until the paid period ends</li>
                                    <li>After cancellation, you'll revert to the free plan</li>
                                </ul>

                                <p><strong>No Partial Refunds:</strong> If you cancel mid-period, you won't receive a prorated refund, but you'll keep premium access through the end of your billing period.</p>

                                <h2>Refund Policy</h2>

                                <h3>6. Subscription Refunds</h3>
                                <p><strong>General Policy:</strong> Subscription fees are non-refundable except in the following cases:</p>

                                <h4>Eligible for Refund:</h4>
                                <ul>
                                    <li><strong>Billing Error:</strong> Charged incorrectly (wrong amount, duplicate charge)</li>
                                    <li><strong>Technical Issue:</strong> Premium features unavailable for 3+ consecutive days</li>
                                    <li><strong>First-Time Subscribers:</strong> Request within 48 hours of first charge (one-time courtesy)</li>
                                    <li><strong>Unauthorized Charge:</strong> Account was compromised</li>
                                </ul>

                                <h4>Not Eligible for Refund:</h4>
                                <ul>
                                    <li>Changed your mind after using premium features</li>
                                    <li>Forgot to cancel before renewal</li>
                                    <li>Didn't use premium features (voluntary choice)</li>
                                    <li>Account suspended due to policy violations</li>
                                </ul>

                                <h3>7. Wallet Contributions Refund Policy</h3>
                                <p><strong>Important:</strong> Savings challenge contributions are NOT refundable once processed. This includes:</p>
                                <ul>
                                    <li>Daily, weekly, or monthly challenge contributions</li>
                                    <li>Group contribution deposits</li>
                                    <li>Manual wallet deposits</li>
                                </ul>

                                <p><strong>Alternative:</strong> You can withdraw your wallet balance at any time (subject to our withdrawal policy). Your savings remain accessible, just not refundable through the payment method.</p>

                                <p><strong>Exception:</strong> Duplicate or erroneous charges due to technical errors will be refunded within 5-7 business days.</p>

                                <h3>8. Group Challenge Refunds</h3>
                                <ul>
                                    <li>Group contributions are locked until cycle completion</li>
                                    <li>No refunds while the group cycle is active</li>
                                    <li>If a group member defaults, remaining members may vote to dissolve the group and reclaim prorated contributions</li>
                                    <li>Admin fees are non-refundable even if group dissolves</li>
                                </ul>

                                <h3>9. How to Request a Refund</h3>
                                <p>If you believe you're eligible for a refund:</p>
                                <ol>
                                    <li>Email refunds@save2740.app within 30 days of the charge</li>
                                    <li>Include:
                                        <ul>
                                            <li>Your account email</li>
                                            <li>Transaction ID or date of charge</li>
                                            <li>Reason for refund request</li>
                                            <li>Supporting documentation (if applicable)</li>
                                        </ul>
                                    </li>
                                    <li>We'll review and respond within 5 business days</li>
                                    <li>Approved refunds processed within 7-10 business days</li>
                                </ol>

                                <h3>10. Refund Methods</h3>
                                <ul>
                                    <li>Refunds issued to original payment method</li>
                                    <li>If original method unavailable, credited to wallet balance</li>
                                    <li>Processing time varies by payment method (3-10 business days)</li>
                                </ul>

                                <h3>11. Chargebacks</h3>
                                <p>
                                    <strong>Important:</strong> Filing a chargeback without contacting us first may result in account suspension. We're committed to resolving issues fairly - please contact support before disputing charges with your bank.
                                </p>
                                <p>
                                    If you file a chargeback:
                                </p>
                                <ul>
                                    <li>Your account will be suspended pending investigation</li>
                                    <li>You may be required to provide documentation</li>
                                    <li>If chargeback is unjustified, account may be permanently terminated</li>
                                    <li>Outstanding wallet balance may be forfeited</li>
                                </ul>

                                <h3>12. Promotional Offers</h3>
                                <ul>
                                    <li>Promotional pricing and discounts are not retroactive</li>
                                    <li>Offers cannot be combined unless explicitly stated</li>
                                    <li>Promo codes expire as indicated</li>
                                    <li>We reserve the right to modify or cancel promotions</li>
                                </ul>

                                <h3>13. Changes to Subscription Plans</h3>
                                <p>
                                    We may modify subscription tiers, features, or pricing with 30 days' notice. Existing subscribers will be grandfathered on their current pricing for 6 months after changes.
                                </p>

                                <h3>14. Account Credits</h3>
                                <p>
                                    In lieu of refunds, we may offer account credits:
                                </p>
                                <ul>
                                    <li>Credits applied to future subscription fees or wallet deposits</li>
                                    <li>Credits do not expire</li>
                                    <li>Non-transferable and cannot be exchanged for cash</li>
                                    <li>Remaining credits forfeited if account is closed</li>
                                </ul>

                                <h3>15. Contact Us</h3>
                                <p>For subscription or refund questions:</p>
                                <p>
                                    Email: refunds@save2740.app (for refund requests)<br />
                                    Support: support@save2740.app (for billing questions)<br />
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

export default function SubscriptionRefundPolicyPage() {
    return (
        <ProtectedPage>
            <SubscriptionRefundPolicyContent />
        </ProtectedPage>
    )
}
