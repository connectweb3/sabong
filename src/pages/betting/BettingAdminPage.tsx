import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Match, MatchStatus, MatchWinner } from '../../types';
import { Swords, Plus, Trophy, Lock, PlayCircle, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

export const BettingAdminPage = () => {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Form State
    const [meronName, setMeronName] = useState('');
    const [walaName, setWalaName] = useState('');

    useEffect(() => {
        fetchMatches();

        // Realtime subscription
        const channel = supabase
            .channel('matches_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => {
                fetchMatches();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchMatches = async () => {
        const { data, error } = await supabase
            .from('matches')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error("Error fetching matches:", error);
        if (data) setMatches(data as Match[]);
        setLoading(false);
    };

    const handleCreateMatch = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.from('matches').insert({
            meron_name: meronName,
            wala_name: walaName,
            status: 'open'
        });

        if (error) {
            alert('Error creating match: ' + error.message);
        } else {
            setIsCreateModalOpen(false);
            setMeronName('');
            setWalaName('');
        }
    };

    const updateMatchStatus = async (id: string, status: MatchStatus) => {
        const { error } = await supabase
            .from('matches')
            .update({ status })
            .eq('id', id);

        if (error) alert('Error updating status: ' + error.message);
    };

    const declareWinner = async (id: string, winner: MatchWinner) => {
        if (!confirm(`Are you sure you want to declare ${winner?.toUpperCase()} as the winner? This will trigger payouts.`)) return;

        const { error } = await supabase
            .from('matches')
            .update({
                status: 'finished',
                winner: winner
            })
            .eq('id', id);

        if (error) alert('Error declaring winner: ' + error.message);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Swords className="w-8 h-8 text-red-500" />
                    Betting Console
                </h1>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Create Match
                </button>
            </div>

            {/* Match List */}
            <div className="grid gap-6">
                {loading ? (
                    <div className="text-center text-neutral-500 py-10">Loading matches...</div>
                ) : matches.length === 0 ? (
                    <div className="text-center text-neutral-500 py-10 bg-neutral-800 rounded-xl border border-neutral-700">
                        No matches found. Create one to start.
                    </div>
                ) : (
                    matches.map(match => (
                        <div key={match.id} className="bg-neutral-800 rounded-xl border border-neutral-700 p-6 shadow-lg">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                {/* Teams */}
                                <div className="flex items-center gap-8 w-full md:w-auto justify-center">
                                    <div className="text-center">
                                        <h3 className="text-red-500 font-bold text-xl uppercase tracking-wider">Meron</h3>
                                        <p className="text-white text-2xl font-black mt-1">{match.meron_name}</p>
                                    </div>
                                    <div className="text-neutral-500 font-bold text-sm">VS</div>
                                    <div className="text-center">
                                        <h3 className="text-blue-500 font-bold text-xl uppercase tracking-wider">Wala</h3>
                                        <p className="text-white text-2xl font-black mt-1">{match.wala_name}</p>
                                    </div>
                                </div>

                                {/* Status & Controls */}
                                <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                                    <div className="flex items-center gap-2">
                                        <span className={clsx(
                                            "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
                                            match.status === 'open' ? "bg-green-500/20 text-green-500" :
                                                match.status === 'closed' ? "bg-red-500/20 text-red-500" :
                                                    match.status === 'ongoing' ? "bg-yellow-500/20 text-yellow-500 animate-pulse" :
                                                        "bg-neutral-600 text-neutral-300"
                                        )}>
                                            {match.status}
                                        </span>
                                    </div>

                                    {/* Control Buttons */}
                                    <div className="flex gap-2 flex-wrap justify-end">
                                        {match.status === 'open' && (
                                            <>
                                                <button onClick={() => updateMatchStatus(match.id, 'closed')} className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 text-white rounded text-sm flex items-center gap-1">
                                                    <Lock className="w-3 h-3" /> Close Betting
                                                </button>
                                                <button onClick={() => updateMatchStatus(match.id, 'ongoing')} className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm flex items-center gap-1">
                                                    <PlayCircle className="w-3 h-3" /> Start Fight
                                                </button>
                                            </>
                                        )}
                                        {match.status === 'closed' && (
                                            <button onClick={() => updateMatchStatus(match.id, 'open')} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">
                                                Re-open Betting
                                            </button>
                                        )}
                                        {match.status === 'ongoing' && (
                                            <>
                                                <span className="text-neutral-400 text-sm mr-2">Declare Winner:</span>
                                                <button onClick={() => declareWinner(match.id, 'meron')} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-bold">MERON</button>
                                                <button onClick={() => declareWinner(match.id, 'wala')} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-bold">WALA</button>
                                                <button onClick={() => declareWinner(match.id, 'draw')} className="px-3 py-1 bg-neutral-600 hover:bg-neutral-700 text-white rounded text-sm font-bold">DRAW</button>
                                                <button onClick={() => updateMatchStatus(match.id, 'cancelled')} className="px-3 py-1 bg-neutral-800 border border-neutral-600 text-neutral-400 hover:text-white rounded text-sm">Cancel</button>
                                            </>
                                        )}
                                        {match.status === 'finished' && (
                                            <div className="flex items-center gap-2 text-yellow-500 font-bold">
                                                <Trophy className="w-5 h-5" />
                                                Winner: {match.winner?.toUpperCase()}
                                            </div>
                                        )}
                                        {match.status === 'cancelled' && (
                                            <div className="flex items-center gap-2 text-neutral-400">
                                                <AlertCircle className="w-5 h-5" />
                                                Match Cancelled
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-neutral-800 rounded-2xl border border-neutral-700 w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Create New Match</h2>
                        <form onSubmit={handleCreateMatch} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-1">Meron (Red) Name</label>
                                <input
                                    type="text"
                                    value={meronName}
                                    onChange={e => setMeronName(e.target.value)}
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-white focus:border-red-500 outline-none"
                                    placeholder="e.g. Red Dragon"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-1">Wala (Blue) Name</label>
                                <input
                                    type="text"
                                    value={walaName}
                                    onChange={e => setWalaName(e.target.value)}
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                                    placeholder="e.g. Blue Thunder"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-2 bg-neutral-700 text-neutral-300 rounded hover:bg-neutral-600">Cancel</button>
                                <button type="submit" className="flex-1 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-bold">Create Match</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
