import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { X, UserPlus, Loader } from 'lucide-react';
import type { UserRole } from '../../types';

// We need a separate client instance to sign up a new user without logging out the current admin
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const tempSupabase = createClient(supabaseUrl, supabaseKey);

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    adminId: string;
}

export const CreateUserModal = ({ isOpen, onClose, onSuccess, adminId }: CreateUserModalProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [role, setRole] = useState<UserRole>('user');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Sign Up the new user using the temporary client
            // We pass metadata so the database trigger can create the profile
            const { data, error: signUpError } = await tempSupabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username,
                        role,
                        created_by: adminId
                    }
                }
            });

            if (signUpError) throw signUpError;

            if (data.user) {
                // Success!
                // Clear form
                setEmail('');
                setPassword('');
                setUsername('');
                setRole('user');
                onSuccess();
                onClose();
                alert('User created successfully!');
            }
        } catch (err: any) {
            console.error("Creation error:", err);
            setError(err.message || 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-neutral-800 rounded-xl border border-neutral-700 w-full max-w-md shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-neutral-700 flex justify-between items-center bg-neutral-900/50">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-red-500" />
                        Create New Account
                    </h3>
                    <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-1">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                                placeholder="johndoe123"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                                placeholder="john@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-1">Role</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(['user', 'agent', 'master_agent', 'loader', 'admin'] as UserRole[]).map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setRole(r)}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium capitalize border transition-all ${role === r
                                            ? 'bg-red-600 border-red-500 text-white'
                                            : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:border-neutral-500'
                                            }`}
                                    >
                                        {r.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading && <Loader className="w-4 h-4 animate-spin" />}
                                Create Account
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
