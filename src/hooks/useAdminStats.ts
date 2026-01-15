import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface AdminStats {
    totalUsers: number;
    totalActiveUsers: number; // Placeholder for now, maybe recent login
    totalBetsToday: number;
    systemGGR: number;
    roleCounts: {
        master_agent: number;
        agent: number;
        loader: number;
        user: number;
    };
    roleCredits: {
        master_agent: number;
        agent: number;
        loader: number;
        user: number;
    };
}

export const useAdminStats = () => {
    const [stats, setStats] = useState<AdminStats>({
        totalUsers: 0,
        totalActiveUsers: 0,
        totalBetsToday: 0,
        systemGGR: 0,
        roleCounts: { master_agent: 0, agent: 0, loader: 0, user: 0 },
        roleCredits: { master_agent: 0, agent: 0, loader: 0, user: 0 },
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const fetchStats = async () => {
            try {
                // 1. Fetch Profiles to calculate Role Counts and Credits
                const { data: profiles, error: profilesError } = await supabase
                    .from('profiles')
                    .select('role, credits');

                if (profilesError) throw profilesError;

                const roleCounts = { master_agent: 0, agent: 0, loader: 0, user: 0 };
                const roleCredits = { master_agent: 0, agent: 0, loader: 0, user: 0 };
                let totalUsers = 0;

                profiles.forEach(p => {
                    const r = p.role as keyof typeof roleCounts;
                    if (roleCounts[r] !== undefined) {
                        roleCounts[r]++;
                        roleCredits[r] += Number(p.credits) || 0;
                    }
                    totalUsers++;
                });

                // 2. Fetch Bets (Simple count for now, optimization needed for large scale)
                // In a real app, use a timescale db or aggregated table
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const { count: betsCount, error: betsError } = await supabase
                    .from('bets')
                    .select('*', { count: 'exact', head: true })
                    .gte('created_at', today.toISOString());

                if (betsError) throw betsError;

                if (!mounted) return;

                // 3. System GGR (Total Bets - Total Payouts)
                // This is heavy, ideally done via RPC. Doing a simplified version here or placeholder
                // For now, let's just sum all profile credits as "System Liabilities" or similar
                // Or if we strictly want GGR, we need to sum bets.
                // Let's stick to Profile Credits as a "System Money" indicator for now to avoid heavy query on bets table

                setStats({
                    totalUsers,
                    totalActiveUsers: totalUsers, // Placeholder
                    totalBetsToday: betsCount || 0,
                    systemGGR: 0, // Pending implementation of separate transaction table aggregation
                    roleCounts,
                    roleCredits
                });

            } catch (err: any) {
                if (!mounted) return;

                // Ignore AbortError which happens on strict mode double-invoke or fast navigation
                if (err.name === 'AbortError' || err.message?.includes('AbortError')) {
                    console.log('Fetch aborted');
                    return;
                }
                console.error("Error fetching admin stats:", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchStats();

        return () => {
            mounted = false;
        };
    }, []);

    return { stats, loading };
};
