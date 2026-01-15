import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

import Logo from '../assets/logo.svg';
import { Eye, EyeOff } from 'lucide-react';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [mounted, setMounted] = useState(true);

    React.useEffect(() => {
        return () => setMounted(false);
    }, []);



    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            console.log("Attempting login...");
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                // Check if it's an abort error (often benign in Supabase/React StrictMode)
                if (error.name === 'AbortError' || error.message?.includes('aborted')) {
                    console.warn("Login request aborted (benign).");
                } else {
                    console.error("Login Error:", error);
                    setError(error.message);
                }
                setLoading(false);
                return;
            }
            console.log("Login successful");
            // Successful login will trigger onAuthStateChange in store.ts, which redirects.
            // We set a safety local timeout to stop showing "Authenticating..." if navigation 
            // doesn't happen within 10 seconds (something went wrong).
            setTimeout(() => {
                if (mounted) setLoading(false);
            }, 10000);
        } catch (err: any) {
            console.error("Unexpected Login Error:", err);

            // Handle AbortError caused by React StrictMode or request cancellation
            if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
                console.warn("Login request was aborted (likely benign).");
                setLoading(false);
                return;
            }

            // Handle 404 specifically for Auth Hooks
            if (err?.status === 404 || err?.message?.includes('404')) {
                setError("System Error: Auth Hook missing. Please disable 'Auth Hooks' in Supabase Dashboard.");
            } else {
                setError(err.message || "An unexpected error occurred");
            }
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Pattern Overlay if needed, handled by body but extra overlay here for vignetting */}
            {/* <div className="absolute inset-0 bg-black/40 pointer-events-none" /> */}

            <div className="z-10 w-full max-w-md flex flex-col items-center">
                {/* Logo Section */}
                <div className="mb-12 transform hover:scale-105 transition-transform duration-500">
                    <img
                        src={Logo}
                        alt="Lucky Sabong"
                        className="w-64 h-auto drop-shadow-2xl"
                    />
                </div>

                {error && (
                    <div className="w-full bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm text-center backdrop-blur-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="w-full space-y-6">
                    <div className="space-y-2">
                        <label className="text-gray-300 text-xs font-semibold uppercase tracking-wider ml-1">
                            Mobile Number or Email
                        </label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#2a1a1a]/80 border border-[#3d2b2b] text-white px-4 py-3 rounded-lg focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all placeholder-gray-500"
                                placeholder="Ex: 0910XXXXXXX"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-gray-300 text-xs font-semibold uppercase tracking-wider ml-1">
                            Password
                        </label>
                        <div className="relative group">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#2a1a1a]/80 border border-[#3d2b2b] text-white px-4 py-3 rounded-lg focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all placeholder-gray-500"
                                placeholder="Password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[#ff4b1f] to-[#ff9068] hover:from-[#ff9068] hover:to-[#ff4b1f] text-white font-bold py-3.5 px-4 rounded-lg shadow-lg shadow-orange-900/40 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wide mt-4"
                        style={{
                            background: 'linear-gradient(90deg, #F95424 0%, #FCAF33 100%)'
                        }}
                    >
                        {loading ? 'Authenticating...' : 'Play with Mobile/Email'}
                    </button>
                </form>

                {/* Footer Payment Methods */}
                <div className="mt-16 flex flex-col items-center space-y-3 opacity-60 hover:opacity-100 transition-opacity">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-light">
                        Cash-in and withdraw using:
                    </p>
                    <div className="flex items-center space-x-4">
                        <span className="text-blue-400 font-bold text-lg tracking-tight">GCash</span>
                        <span className="text-green-500 font-bold text-lg tracking-tight">maya</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

