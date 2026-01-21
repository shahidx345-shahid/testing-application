"use client";

import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/use-profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Mail, MessageSquare, Shield, Globe, Loader2 } from "lucide-react";
import { API } from "@/lib/constants";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AccountSettings() {
    const { profile, refetch } = useProfile();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [settings, setSettings] = useState({
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        twoFactorAuth: false,
        marketingEmails: true,
        securityAlerts: true,
        language: "English",
        currency: "USD"
    });

    useEffect(() => {
        if (profile?.preferences) {
            setSettings(prev => ({
                ...prev,
                emailNotifications: profile.preferences?.notifications?.email ?? true,
                smsNotifications: profile.preferences?.notifications?.sms ?? false,
                pushNotifications: profile.preferences?.notifications?.push ?? true,
                marketingEmails: profile.preferences?.notifications?.marketing ?? true,
                securityAlerts: profile.preferences?.notifications?.security ?? true,
                language: profile.preferences?.language || "English",
                currency: profile.preferences?.currency || "USD"
            }));
        }
        // Map 2FA separately since it's likely on the user root or not yet implemented backend-side
        // For now, we'll keep it local defaults or map if available
    }, [profile]);

    const saveSettings = async (newSettings: typeof settings) => {
        setMessage(null);
        setLoading(true);

        // Map settings to API structure
        const apiData = {
            preferences: {
                notifications: {
                    email: newSettings.emailNotifications,
                    sms: newSettings.smsNotifications,
                    push: newSettings.pushNotifications,
                    marketing: newSettings.marketingEmails,
                    security: newSettings.securityAlerts
                },
                language: newSettings.language,
                currency: newSettings.currency
            }
        };

        try {
            const response = await fetch(`${API.BASE_URL}/api/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token') || ''}`
                },
                body: JSON.stringify(apiData),
            });

            if (!response.ok) {
                throw new Error("Failed to save settings");
            }

            refetch();
            setMessage({ type: 'success', text: 'Settings saved successfully' });

            // Clear success message after 3 seconds
            setTimeout(() => setMessage(null), 3000);

        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to save settings' });
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (key: keyof typeof settings) => {
        const newSettings = { ...settings, [key]: !settings[key] };
        setSettings(newSettings);
        saveSettings(newSettings); // Auto-save on toggle
    };

    const handleChange = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSavePreferences = () => {
        saveSettings(settings); // Explicit save for dropdowns
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {message && (
                <Alert className={message.type === 'success' ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    <AlertDescription className={message.type === 'success' ? "text-green-700" : "text-red-700"}>
                        {message.text}
                    </AlertDescription>
                </Alert>
            )}

            {/* Notifications */}
            <Card className="border-0 bg-white rounded-2xl sm:rounded-3xl shadow-lg">
                <CardHeader className="px-4 sm:px-6">
                    <CardTitle className="text-lg sm:text-2xl font-bold flex items-center gap-2">
                        <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-brand-green" />
                        Notification Preferences
                    </CardTitle>
                    <CardDescription className="text-sm">Manage how you receive updates and alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-6 px-4 sm:px-6">
                    <div className="flex flex-row items-center justify-between gap-2 p-2.5 sm:p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-start sm:items-center gap-3 flex-1">
                            <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mt-0.5 sm:mt-0 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <Label htmlFor="email" className="text-sm sm:text-base font-medium cursor-pointer block">Email Notifications</Label>
                                <p className="text-xs sm:text-sm text-gray-500">Receive account updates via email</p>
                            </div>
                        </div>
                        <Switch
                            id="email"
                            checked={settings.emailNotifications}
                            onCheckedChange={() => handleToggle("emailNotifications")}
                            disabled={loading}
                            className="shrink-0 scale-75 sm:scale-100 origin-right data-[state=checked]:bg-brand-green"
                        />
                    </div>

                    <div className="flex flex-row items-center justify-between gap-2 p-2.5 sm:p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-start sm:items-center gap-3 flex-1">
                            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mt-0.5 sm:mt-0 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <Label htmlFor="sms" className="text-sm sm:text-base font-medium cursor-pointer block">SMS Notifications</Label>
                                <p className="text-xs sm:text-sm text-gray-500">Get text messages for important events</p>
                            </div>
                        </div>
                        <Switch
                            id="sms"
                            checked={settings.smsNotifications}
                            onCheckedChange={() => handleToggle("smsNotifications")}
                            disabled={loading}
                            className="shrink-0 scale-75 sm:scale-100 origin-right data-[state=checked]:bg-brand-green"
                        />
                    </div>

                    <div className="flex flex-row items-center justify-between gap-2 p-2.5 sm:p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-start sm:items-center gap-3 flex-1">
                            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mt-0.5 sm:mt-0 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <Label htmlFor="push" className="text-sm sm:text-base font-medium cursor-pointer block">Push Notifications</Label>
                                <p className="text-xs sm:text-sm text-gray-500">Browser notifications for updates</p>
                            </div>
                        </div>
                        <Switch
                            id="push"
                            checked={settings.pushNotifications}
                            onCheckedChange={() => handleToggle("pushNotifications")}
                            disabled={loading}
                            className="shrink-0 scale-75 sm:scale-100 origin-right data-[state=checked]:bg-brand-green"
                        />
                    </div>

                    <div className="flex flex-row items-center justify-between gap-2 p-2.5 sm:p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-start sm:items-center gap-3 flex-1">
                            <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mt-0.5 sm:mt-0 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <Label htmlFor="marketing" className="text-sm sm:text-base font-medium cursor-pointer block">Marketing Emails</Label>
                                <p className="text-xs sm:text-sm text-gray-500">Tips, offers, and product updates</p>
                            </div>
                        </div>
                        <Switch
                            id="marketing"
                            checked={settings.marketingEmails}
                            onCheckedChange={() => handleToggle("marketingEmails")}
                            disabled={loading}
                            className="shrink-0 scale-75 sm:scale-100 origin-right data-[state=checked]:bg-brand-green"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Security */}
            <Card className="border-0 bg-white rounded-2xl sm:rounded-3xl shadow-lg">
                <CardHeader className="px-4 sm:px-6">
                    <CardTitle className="text-lg sm:text-2xl font-bold flex items-center gap-2">
                        <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-brand-green" />
                        Security Settings
                    </CardTitle>
                    <CardDescription className="text-sm">Enhance your account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                    <div className="flex flex-row items-center justify-between gap-2 p-2.5 sm:p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                        <div className="flex items-start sm:items-center gap-3 flex-1">
                            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-brand-green mt-0.5 sm:mt-0 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <Label htmlFor="2fa" className="text-sm sm:text-base font-medium cursor-pointer block">Two-Factor Authentication</Label>
                                <p className="text-xs sm:text-sm text-gray-600">Add an extra layer of security</p>
                            </div>
                        </div>
                        <Switch
                            id="2fa"
                            checked={settings.twoFactorAuth}
                            onCheckedChange={() => handleToggle("twoFactorAuth")}
                            disabled={true} // Disabled for now as it requires complex backend implementation
                            className="shrink-0 scale-75 sm:scale-100 origin-right data-[state=checked]:bg-brand-green"
                        />
                        {/* <Badge>Coming Soon</Badge> would be nice here */}
                    </div>

                    <div className="flex flex-row items-center justify-between gap-2 p-2.5 sm:p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-start sm:items-center gap-3 flex-1">
                            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mt-0.5 sm:mt-0 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <Label htmlFor="security" className="text-sm sm:text-base font-medium cursor-pointer block">Security Alerts</Label>
                                <p className="text-xs sm:text-sm text-gray-500">Get notified of suspicious activity</p>
                            </div>
                        </div>
                        <Switch
                            id="security"
                            checked={settings.securityAlerts}
                            onCheckedChange={() => handleToggle("securityAlerts")}
                            disabled={loading}
                            className="shrink-0 scale-75 sm:scale-100 origin-right data-[state=checked]:bg-brand-green"
                        />
                    </div>

                    <Button variant="outline" className="w-full sm:w-auto border-gray-300 text-sm sm:text-base">
                        View Active Sessions
                    </Button>
                </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="border-0 bg-white rounded-2xl sm:rounded-3xl shadow-lg">
                <CardHeader className="px-4 sm:px-6">
                    <CardTitle className="text-lg sm:text-2xl font-bold flex items-center gap-2">
                        <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-brand-green" />
                        Preferences
                    </CardTitle>
                    <CardDescription className="text-sm">Customize your experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                    <div className="space-y-2">
                        <Label>Language</Label>
                        <select
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white"
                            value={settings.language}
                            onChange={(e) => handleChange("language", e.target.value)}
                        >
                            <option value="English">English</option>
                            <option value="Spanish">Spanish</option>
                            <option value="French">French</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label>Currency</Label>
                        <select
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white"
                            value={settings.currency}
                            onChange={(e) => handleChange("currency", e.target.value)}
                        >
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                        </select>
                    </div>

                    <div className="pt-4">
                        <Button
                            className="w-full md:w-auto bg-brand-green hover:bg-brand-green/90"
                            onClick={handleSavePreferences}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Save Preferences
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
