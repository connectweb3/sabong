import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import { Copy, Check, Users, Shield, Clock, UserPlus } from 'lucide-react';
import { CreateUserModal } from '../../components/modals/CreateUserModal';
import type { Profile } from '../../types';
import clsx from 'clsx';

export const AgentDashboard = () => {
    const { session, profile } = useAuthStore();
    const [stats, setStats] = useState({ loaders: 0, users: 0 });
    const [copied, setCopied] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [requests, setRequests] = useState<any[]>([]);
    const [pendingApprovals, setPendingApprovals] = useState<Profile[]>([]);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        if (session?.user.id) {
            fetchDownlineStats();
            fetchPendingRequests();
            fetchPendingApprovals();
        }
    }, [session]);

    const fetchDownlineStats = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('role, status')
            .eq('created_by', session?.user.id);

        if (data) {
            const counts = data.reduce((acc, curr) => {
                if (curr.role === 'loader') acc.loaders++;
                if (curr.role === 'user' && curr.status === 'active') acc.users++;
                return acc;
            }, { loaders: 0, users: 0 });
            setStats(counts);
        }
    };

    const fetchPendingRequests = async () => {
        const { data } = await supabase
            .from('transaction_requests')
            .select('*, profiles(username)')
            .eq('upline_id', session?.user.id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });
        if (data) setRequests(data);
    };

    const fetchPendingApprovals = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('created_by', session?.user.id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });
        if (data) setPendingApprovals(data as Profile[]);
    };

    const handleAction = async (requestId: string, status: 'approved' | 'rejected') => {
        setActionLoading(requestId);
        try {
            const { error } = await supabase
                .from('transaction_requests')
                .update({ status })
                .eq('id', requestId);

            if (error) throw error;

            alert(`Request ${status} successfully!`);
            fetchPendingRequests();
            fetchDownlineStats();
            useAuthStore.getState().refreshProfile();
        } catch (err: any) {
            console.error('Action error:', err);
            alert(err.message || 'Failed to update request');
        } finally {
            setActionLoading(null);
        }
    };

    const handleApproval = async (userId: string, status: 'active' | 'banned') => {
        setActionLoading(userId);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ status })
                .eq('id', userId);

            if (error) throw error;

            alert(`User ${status === 'active' ? 'Approved' : 'Rejected'} successfully!`);
            fetchPendingApprovals();
            fetchDownlineStats();
        } catch (err: any) {
            console.error('Approval error:', err);
            alert(err.message || 'Failed to update user status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleCopyLink = () => {
        if (!profile?.referral_code) {
            alert('Referral code still generating or missing. Please refresh.');
            return;
        }
        const link = `${window.location.origin}/register?ref=${profile.referral_code}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Shield className="w-8 h-8 text-red-600" />
                    Agent Dashboard
                </h1>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-red-900/20 active:scale-95 text-sm"
                >
                    <UserPlus className="w-4 h-4" />
                    New Player
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
                    <h3 className="text-neutral-400 text-sm font-medium flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-500" />
                        Active Loaders
                    </h3>
                    <p className="text-3xl font-bold text-white mt-2">{stats.loaders}</p>
                </div>
                <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
                    <h3 className="text-neutral-400 text-sm font-medium flex items-center gap-2">
                        <Users className="w-4 h-4 text-red-500" />
                        Total Players
                    </h3>
                    <p className="text-3xl font-bold text-white mt-2">{stats.users}</p>
                </div>
                <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
                    <h3 className="text-neutral-400 text-sm font-medium flex items-center gap-2 font-display uppercase tracking-widest">
                        Credits
                    </h3>
                    <p className="text-3xl font-bold text-yellow-500 mt-2">₱ {profile?.credits?.toLocaleString() || '0.00'}</p>
                </div>
            </div>

            {/* Account Approvals */}
            <div className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden shadow-2xl">
                <div className="p-4 bg-blue-600/10 border-b border-blue-500/20 flex justify-between items-center">
                    <h3 className="text-blue-500 font-black uppercase text-sm tracking-widest flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        Pending Account Approvals
                    </h3>
                    <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {pendingApprovals.length} New
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#111] text-neutral-500 text-[10px] uppercase font-bold tracking-widest">
                            <tr>
                                <th className="p-4">User Details</th>
                                <th className="p-4">Contact</th>
                                <th className="p-4">Facebook</th>
                                <th className="p-4">Joined</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-700">
                            {pendingApprovals.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-neutral-500 italic">No new registrations to approve.</td>
                                </tr>
                            ) : (
                                pendingApprovals.map((user) => (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-white">{user.username}</div>
                                            <div className="text-[10px] text-neutral-500 uppercase">{user.role}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-neutral-300 text-sm">
                                                <div className="p-1 px-2 bg-neutral-900 rounded border border-neutral-700 font-mono">
                                                    {user.phone_number || 'No Phone'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {user.facebook_url ? (
                                                <a
                                                    href={user.facebook_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs font-bold bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20"
                                                >
                                                    View Profile
                                                </a>
                                            ) : (
                                                <span className="text-neutral-600 text-xs italic">N/A</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-xs text-neutral-500">{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleApproval(user.id, 'active')}
                                                    disabled={!!actionLoading}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs font-bold disabled:opacity-50 transition-all"
                                                >
                                                    {actionLoading === user.id ? '...' : 'Approve'}
                                                </button>
                                                <button
                                                    onClick={() => handleApproval(user.id, 'banned')}
                                                    disabled={!!actionLoading}
                                                    className="bg-neutral-700 hover:bg-red-900 text-white px-3 py-1 rounded-lg text-xs font-bold disabled:opacity-50 transition-all"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pending Requests */}
            <div className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden shadow-2xl">
                <div className="p-4 bg-orange-600/10 border-b border-orange-500/20">
                    <h3 className="text-orange-500 font-black uppercase text-sm tracking-widest flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Pending Player Requests
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#111] text-neutral-500 text-[10px] uppercase font-bold tracking-widest">
                            <tr>
                                <th className="p-4">Player</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Date</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-700">
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-neutral-500 italic">No pending requests from your players.</td>
                                </tr>
                            ) : (
                                requests.map((req) => (
                                    <tr key={req.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-bold text-white">{req.profiles?.username}</td>
                                        <td className="p-4">
                                            <span className={clsx(
                                                "px-2 py-0.5 rounded text-[10px] font-black uppercase",
                                                req.type === 'cash_in' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                            )}>
                                                {req.type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="p-4 font-mono font-bold text-yellow-500">₱ {req.amount.toLocaleString()}</td>
                                        <td className="p-4 text-xs text-neutral-500">{new Date(req.created_at).toLocaleString()}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleAction(req.id, 'approved')}
                                                    disabled={!!actionLoading}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-bold disabled:opacity-50"
                                                >
                                                    {actionLoading === req.id ? '...' : 'Approve'}
                                                </button>
                                                <button
                                                    onClick={() => handleAction(req.id, 'rejected')}
                                                    disabled={!!actionLoading}
                                                    className="bg-neutral-700 hover:bg-neutral-600 text-white px-3 py-1 rounded text-xs font-bold disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
                <h3 className="text-white font-bold mb-4">Your Referral Link</h3>
                <div className="flex gap-2">
                    <input
                        type="text"
                        readOnly
                        value={profile?.referral_code ? `${window.location.origin}/register?ref=${profile.referral_code}` : 'Generating...'}
                        className="bg-neutral-900 border border-neutral-700 text-neutral-400 px-4 py-2 rounded-lg flex-1 text-sm"
                    />
                    <button
                        onClick={handleCopyLink}
                        className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                </div>
                <p className="text-neutral-500 text-xs mt-2">Players who register using this link will automatically be associated with your account for commissions.</p>
            </div>

            {session && (
                <CreateUserModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={() => {
                        fetchDownlineStats();
                        setIsCreateModalOpen(false);
                    }}
                    creatorId={session.user.id}
                    allowedRoles={['user']}
                    title="Create New Player"
                />
            )}
        </div>
    );
};
