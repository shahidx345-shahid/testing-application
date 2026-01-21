/**
 * useReferrals Hook
 * Fetches referral data for the authenticated user
 */

import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

export interface ReferralData {
    referralCode: string;
    referralLink: string;
    friendsInvited: number;
    qualifiedReferrals: number;
    totalEarnings: number;
    pendingEarnings: number;
}



export function useReferrals() {
    const [data, setData] = useState<ReferralData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReferrals = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiClient.get<{
                referralCode: string;
                totalReferrals: number;
                totalEarnings: number;
                pendingEarnings: number;
            }>('/api/referrals/stats');

            if (response.success && response.data) {
                // Map backend response to frontend ReferralData interface
                const mappedData: ReferralData = {
                    referralCode: response.data.referralCode,
                    referralLink: `${typeof window !== 'undefined' ? window.location.origin : ''}/signup?ref=${response.data.referralCode}`,
                    friendsInvited: response.data.totalReferrals,
                    qualifiedReferrals: response.data.totalReferrals, // Assuming all are qualified for now
                    totalEarnings: response.data.totalEarnings,
                    pendingEarnings: response.data.pendingEarnings,
                };
                setData(mappedData);
            } else {
                setError(response.error?.error || 'Failed to fetch referral data');
            }
        } catch (err) {
            console.error('[useReferrals] Error:', err);
            setError('Failed to load referral data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReferrals();
    }, [fetchReferrals]);

    const refetch = useCallback(() => {
        fetchReferrals();
    }, [fetchReferrals]);

    return {
        data,
        loading,
        error,
        refetch,
        referralCode: data?.referralCode || '',
        referralLink: data?.referralLink || '',
        friendsInvited: data?.friendsInvited || 0,
        qualifiedReferrals: data?.qualifiedReferrals || 0,
        totalEarnings: data?.totalEarnings || 0,
        pendingEarnings: data?.pendingEarnings || 0,
    };
}
