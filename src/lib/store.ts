import { create } from 'zustand';
import { supabase } from './supabase';
import type { Profile } from '../types';
import type { Session } from '@supabase/supabase-js';

interface AuthState {
    session: Session | null;
    profile: Profile | null;
    loading: boolean;
    initialized: boolean;
    initialize: () => Promise<void>;
    signOut: () => Promise<void>;
    setSession: (session: Session | null) => void;
    refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    session: null,
    profile: null,
    loading: true,
    initialized: false,

    setSession: async (session) => {
        if (!session) {
            set({ session: null, profile: null });
            return;
        }

        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            set({ session, profile: profile as Profile });
        } catch (error) {
            console.error("Error setting session profile:", error);
            set({ session, profile: null });
        }
    },

    initialize: async () => {
        if (get().initialized) return;

        // Start loading
        set({ initialized: true, loading: true });

        // Safety timeout - reduced to 3s and ensures loading is cleared
        const timeoutId = setTimeout(() => {
            if (get().loading) {
                console.warn("Auth initialization timed out, forcing load completion.");
                set({ loading: false });
            }
        }, 3000);

        try {
            // 1. Get initial session immediately
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError) throw sessionError;

            if (session) {
                // 2. Fetch profile immediately if session exists
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (profileError) {
                    console.error("Initial profile fetch error:", profileError);
                    set({ session, profile: null, loading: false });
                } else {
                    set({ session, profile: profile as Profile, loading: false });
                }
            } else {
                set({ session: null, profile: null, loading: false });
            }

            // Clear timeout as we've handled the initial state
            clearTimeout(timeoutId);

            // 3. Listen for future changes
            supabase.auth.onAuthStateChange(async (_event, session) => {
                console.log("Auth state changed:", _event, session?.user?.id);

                const currentSession = get().session;
                const currentProfile = get().profile;

                try {
                    if (session) {
                        // OPTIMIZATION: Skip fetch if it's the same user (e.g. token refresh)
                        if (currentProfile && currentSession?.user.id === session.user.id) {
                            set({ session, loading: false });
                            return;
                        }

                        const { data: profile, error } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', session.user.id)
                            .single();

                        if (error) {
                            console.error("Profile fetch error on change:", error);
                            set({ session, profile: null, loading: false });
                        } else {
                            set({ session, profile: profile as Profile, loading: false });
                        }
                    } else {
                        set({ session: null, profile: null, loading: false });
                    }
                } catch (error) {
                    console.error("Auth change handling error:", error);
                    set({ loading: false });
                }
            });
        } catch (error) {
            console.error("Initial auth error:", error);
            set({ session: null, profile: null, loading: false });
            clearTimeout(timeoutId);
        }
    },

    signOut: async () => {
        try {
            await supabase.auth.signOut();
        } finally {
            // Force reset everything
            set({ session: null, profile: null, loading: false });
        }
    },

    refreshProfile: async () => {
        const session = get().session;
        if (!session) return;

        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (!error && profile) {
                set({ profile: profile as Profile });
            }
        } catch (error) {
            console.error("Manual profile refresh error:", error);
        }
    }
}));
