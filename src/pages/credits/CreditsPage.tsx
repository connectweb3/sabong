import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import { Wallet, ArrowUpCircle, ArrowDownCircle, Clock, CheckCircle2, XCircle, History } from 'lucide-react';
import type { Profile, Transaction } from '../../types';
import clsx from 'clsx';

interface TransactionRequest {
    id: string;
    amount: number;
    type: 'cash_in' | 'cash_out';
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

export const CreditsPage = () => {
    const { session, profile } = useAuthStore();
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState<TransactionRequest[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [activeTab, setActiveTab] = useState<'requests' | 'history'>('requests');

    useEffect(() => {
        if (session?.user.id) {
            fetchRequests();
            fetchTransactions();
        }
    }, [session]);

    const fetchRequests = async () => {
        const { data } = await supabase
            .from('transaction_requests')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setRequests(data);
    };

    const fetchTransactions = async () => {
        const { data } = await supabase
            .from('transactions')
            .select('*')
            .or(`sender_id.eq.${session?.user.id},receiver_id.eq.${session?.user.id}`)
            .order('created_at', { ascending: false })
            .limit(20);
        if (data) setTransactions(data);
    };

    const handleRequest = async (type: 'cash_in' | 'cash_out') => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        if (type === 'cash_out' && (profile?.credits || 0) < Number(amount)) {
            alert('Insufficient balance for withdrawal');
            return;
        }

        setLoading(true);
        try {
            // Find the upline (who recruited this user)
            const { data: userData } = await supabase
                .from('profiles')
                .select('created_by')
                .eq('id', session?.user.id)
                .single();

            if (!userData?.created_by) {
                // If no creator, maybe default to an admin? 
                // For this app, let's assume players always have an upline or handle as error.
                alert('No upline found to handle this request. Please contact support.');
                setLoading(false);
                return;
            }

            const { error } = await supabase
                .from('transaction_requests')
                .insert({
                    user_id: session?.user.id,
                    upline_id: userData.created_by,
                    amount: Number(amount),
                    type,
                    status: 'pending'
                });

            if (error) throw error;

            setAmount('');
            alert('Request submitted successfully. Waiting for upline approval.');
            fetchRequests();
        } catch (err: any) {
            console.error('Request error:', err);
            alert(err.message || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Wallet className="w-8 h-8 text-yellow-500" />
                        Credits Management
                    </h1>
                    <p className="text-neutral-400 mt-1">Manage your balance and view transaction history</p>
                </div>
                <div className="bg-neutral-800 p-6 rounded-2xl border border-neutral-700 shadow-xl min-w-[240px]">
                    <span className="text-neutral-400 text-sm font-medium uppercase tracking-wider">Current Balance</span>
                    <p className="text-3xl font-black text-white mt-1">₱ {profile?.credits?.toLocaleString() || '0.00'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-neutral-800 p-6 rounded-2xl border border-neutral-700 shadow-xl">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <ArrowUpCircle className="w-5 h-5 text-green-500" />
                        Cash In
                    </h3>
                    <p className="text-neutral-400 text-sm mb-6">Enter amount to request a load from your upline agent.</p>
                    <div className="space-y-4">
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">₱</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-4 pl-8 text-white focus:border-yellow-500 outline-none transition-all placeholder-neutral-600"
                                placeholder="0.00"
                            />
                        </div>
                        <button
                            onClick={() => handleRequest('cash_in')}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            Request Cash In
                        </button>
                    </div>
                </div>

                <div className="bg-neutral-800 p-6 rounded-2xl border border-neutral-700 shadow-xl">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <ArrowDownCircle className="w-5 h-5 text-red-500" />
                        Cash Out
                    </h3>
                    <p className="text-neutral-400 text-sm mb-6">Request a withdrawal of your credits from your upline agent.</p>
                    <div className="space-y-4">
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">₱</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-4 pl-8 text-white focus:border-yellow-500 outline-none transition-all placeholder-neutral-600"
                                placeholder="0.00"
                            />
                        </div>
                        <button
                            onClick={() => handleRequest('cash_out')}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            Request Cash Out
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-neutral-800 rounded-2xl border border-neutral-700 shadow-xl overflow-hidden">
                <div className="flex border-b border-neutral-700 bg-neutral-900/50">
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={clsx(
                            "flex-1 px-6 py-4 text-sm font-bold transition-all border-b-2",
                            activeTab === 'requests' ? "text-yellow-500 border-yellow-500" : "text-neutral-400 border-transparent hover:text-white"
                        )}
                    >
                        Pending Requests
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={clsx(
                            "flex-1 px-6 py-4 text-sm font-bold transition-all border-b-2",
                            activeTab === 'history' ? "text-yellow-500 border-yellow-500" : "text-neutral-400 border-transparent hover:text-white"
                        )}
                    >
                        Success Transactions
                    </button>
                </div>

                <div className="p-0">
                    {activeTab === 'requests' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#111] text-neutral-500 text-xs uppercase tracking-widest">
                                    <tr>
                                        <th className="p-4">Type</th>
                                        <th className="p-4">Amount</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-700">
                                    {requests.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-neutral-500">No pending requests found.</td>
                                        </tr>
                                    ) : (
                                        requests.map((req) => (
                                            <tr key={req.id} className="hover:bg-neutral-700/30 transition-colors">
                                                <td className="p-4">
                                                    <span className={clsx(
                                                        "px-2 py-1 rounded text-[10px] font-black uppercase",
                                                        req.type === 'cash_in' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                                    )}>
                                                        {req.type.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-mono font-bold text-white">₱ {req.amount.toLocaleString()}</td>
                                                <td className="p-4">
                                                    <span className={clsx(
                                                        "flex items-center gap-1.5 text-xs font-bold",
                                                        req.status === 'pending' ? "text-yellow-500" :
                                                            req.status === 'approved' ? "text-green-500" : "text-red-500"
                                                    )}>
                                                        {req.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                                                        {req.status === 'approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                        {req.status === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
                                                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-xs text-neutral-500">
                                                    {new Date(req.created_at).toLocaleDateString()} {new Date(req.created_at).toLocaleTimeString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#111] text-neutral-500 text-xs uppercase tracking-widest">
                                    <tr>
                                        <th className="p-4">Type</th>
                                        <th className="p-4">Amount</th>
                                        <th className="p-4">From/To</th>
                                        <th className="p-4">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-700">
                                    {transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-neutral-500">No transaction history found.</td>
                                        </tr>
                                    ) : (
                                        transactions.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-neutral-700/30 transition-colors">
                                                <td className="p-4">
                                                    <span className={clsx(
                                                        "px-2 py-1 rounded text-[10px] font-black uppercase",
                                                        tx.type === 'load' ? "bg-green-500/10 text-green-500" :
                                                            tx.type === 'withdraw' ? "bg-red-500/10 text-red-500" :
                                                                "bg-blue-500/10 text-blue-500"
                                                    )}>
                                                        {tx.type}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-mono font-bold text-white">₱ {tx.amount.toLocaleString()}</td>
                                                <td className="p-4 text-xs text-neutral-400">
                                                    {tx.sender_id === session?.user.id ? 'Outgoing' : 'Incoming'}
                                                </td>
                                                <td className="p-4 text-xs text-neutral-500">
                                                    {new Date(tx.created_at).toLocaleDateString()} {new Date(tx.created_at).toLocaleTimeString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
