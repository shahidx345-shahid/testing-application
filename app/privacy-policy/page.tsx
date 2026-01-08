"use client"

import { ProtectedPage } from "@/components/protected-page"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"

function PrivacyPolicyContent() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            <main className="flex-1 overflow-y-auto flex flex-col">
                <DashboardHeader title="Privacy Policy" onMenuClick={() => setIsMobileMenuOpen(true)} />
                <div className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10">
                    <div className="max-w-4xl mx-auto space-y-6">

                        <div className="mb-8">
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
                            <p className="text-slate-600">Last updated: January 8, 2026</p>
                        </div>

                        <Card className="border-none shadow-sm rounded-2xl">
                            <CardContent className="p-6 md:p-8 prose prose-slate max-w-none">
                                <h2>1. Information We Collect</h2>

                                <h3>Personal Information</h3>
                                <ul>
                                    <li>Name, email address, and contact information</li>
                                    <li>Date of birth (for age verification)</li>
                                    <li>Government-issued ID (for KYC verification)</li>
                                    <li>Bank account and payment method details</li>
                                    <li>Residential address</li>
                                </ul>

                                <h3>Financial Information</h3>
                                <ul>
                                    <li>Transaction history and wallet balance</li>
                                    <li>Savings challenge progress and streak data</li>
                                    <li>Payment method details (securely tokenized)</li>
                                    <li>Withdrawal requests and history</li>
                                </ul>

                                <h3>Usage Information</h3>
                                <ul>
                                    <li>Device information (type, OS, browser)</li>
                                    <li>IP address and location data</li>
                                    <li>App usage patterns and feature engagement</li>
                                    <li>Communication preferences</li>
                                </ul>

                                <h2>2. How We Use Your Information</h2>
                                <p>We use your information to:</p>
                                <ul>
                                    <li><strong>Provide Services:</strong> Process contributions, manage challenges, handle withdrawals</li>
                                    <li><strong>Verify Identity:</strong> Comply with KYC/AML regulations</li>
                                    <li><strong>Communicate:</strong> Send notifications, updates, and support responses</li>
                                    <li><strong>Improve Service:</strong> Analyze usage patterns and optimize features</li>
                                    <li><strong>Prevent Fraud:</strong> Detect and prevent fraudulent activity</li>
                                    <li><strong>Marketing:</strong> Send promotional offers (with your consent)</li>
                                </ul>

                                <h2>3. Information Sharing</h2>
                                <p>We share your information only with:</p>

                                <h3>Service Providers</h3>
                                <ul>
                                    <li><strong>Payment Processors:</strong> Stripe, Plaid (for secure transactions)</li>
                                    <li><strong>Cloud Hosting:</strong> AWS, Vercel (for data storage)</li>
                                    <li><strong>Analytics:</strong> Google Analytics, Mixpanel (anonymized data)</li>
                                    <li><strong>Customer Support:</strong> Zendesk, Intercom</li>
                                </ul>

                                <h3>Legal Obligations</h3>
                                <ul>
                                    <li>Law enforcement when legally required</li>
                                    <li>Regulatory authorities for compliance</li>
                                    <li>Court orders and legal proceedings</li>
                                </ul>

                                <p><strong>We never sell your personal information to third parties.</strong></p>

                                <h2>4. Data Security</h2>
                                <p>We protect your data using:</p>
                                <ul>
                                    <li><strong>Encryption:</strong> 256-bit SSL/TLS for data in transit</li>
                                    <li><strong>Secure Storage:</strong> Encrypted databases with access controls</li>
                                    <li><strong>Payment Security:</strong> PCI-DSS compliant payment processing</li>
                                    <li><strong>SOC 2 Certification:</strong> Independently audited security controls</li>
                                    <li><strong>Two-Factor Authentication:</strong> Optional 2FA for account access</li>
                                    <li><strong>Regular Audits:</strong> Quarterly security assessments</li>
                                </ul>

                                <h2>5. Your Privacy Rights</h2>
                                <p>You have the right to:</p>
                                <ul>
                                    <li><strong>Access:</strong> Request a copy of your data</li>
                                    <li><strong>Correction:</strong> Update inaccurate information</li>
                                    <li><strong>Deletion:</strong> Request account and data deletion</li>
                                    <li><strong>Portability:</strong> Export your data in CSV format</li>
                                    <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
                                    <li><strong>Object:</strong> Object to certain data processing</li>
                                </ul>
                                <p>To exercise these rights, contact: privacy@save2740.app</p>

                                <h2>6. Cookies and Tracking</h2>
                                <p>We use cookies and similar technologies for:</p>
                                <ul>
                                    <li><strong>Essential Cookies:</strong> Login sessions and security</li>
                                    <li><strong>Analytics Cookies:</strong> Usage statistics and performance</li>
                                    <li><strong>Preference Cookies:</strong> Remember your settings</li>
                                </ul>
                                <p>You can manage cookie preferences in your browser settings.</p>

                                <h2>7. Data Retention</h2>
                                <ul>
                                    <li><strong>Active Accounts:</strong> Data retained as long as account is active</li>
                                    <li><strong>Closed Accounts:</strong> Data retained for 7 years for legal/tax compliance</li>
                                    <li><strong>Transaction Records:</strong> Retained for 10 years per financial regulations</li>
                                    <li><strong>Marketing Data:</strong> Deleted upon unsubscribe request</li>
                                </ul>

                                <h2>8. Children's Privacy</h2>
                                <p>
                                    Save2740 is not intended for users under 18. We do not knowingly collect information from minors. If we discover a minor has created an account, we will delete it immediately.
                                </p>

                                <h2>9. International Users</h2>
                                <p>
                                    Save2740 is based in the United States. By using our Service, you consent to the transfer of your data to the US. We comply with applicable data protection laws including GDPR for EU users.
                                </p>

                                <h2>10. Third-Party Links</h2>
                                <p>
                                    Our Service may contain links to third-party websites. We are not responsible for their privacy practices. Please review their privacy policies separately.
                                </p>

                                <h2>11. Changes to Privacy Policy</h2>
                                <p>
                                    We may update this Privacy Policy from time to time. We'll notify you of material changes via email or in-app notification. Continued use constitutes acceptance of changes.
                                </p>

                                <h2>12. Contact Us</h2>
                                <p>For privacy-related questions:</p>
                                <p>
                                    Email: privacy@save2740.app<br />
                                    Data Protection Officer: dpo@save2740.app<br />
                                    Address: Save2740 Inc., 123 Finance Street, San Francisco, CA 94105
                                </p>

                                <h2>13. State-Specific Rights</h2>

                                <h3>California Residents (CCPA)</h3>
                                <ul>
                                    <li>Right to know what personal information is collected</li>
                                    <li>Right to delete personal information</li>
                                    <li>Right to opt-out of data sales (we don't sell data)</li>
                                    <li>Right to non-discrimination for exercising rights</li>
                                </ul>

                                <h3>GDPR (EU Residents)</h3>
                                <ul>
                                    <li>Legal basis for processing: Contract performance and legitimate interest</li>
                                    <li>Right to lodge a complaint with supervisory authority</li>
                                    <li>Right to withdraw consent</li>
                                </ul>
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

export default function PrivacyPolicyPage() {
    return (
        <ProtectedPage>
            <PrivacyPolicyContent />
        </ProtectedPage>
    )
}
