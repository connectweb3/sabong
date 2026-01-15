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

        // Safety timeout
        const timeoutId = setTimeout(() => {
            if (get().loading) {
                console.warn("Auth initialization timed out, forcing load completion.");
                set({ loading: false });
            }
        }, 5000);

        supabase.auth.onAuthStateChange(async (_event, session) => {
            console.log("Auth state changed:", _event, session?.user?.id);

            // Clear timeout if it's still running
            clearTimeout(timeoutId);

            const currentSession = get().session;
            const currentProfile = get().profile;

            try {
                if (session) {
                    // OPTIMIZATION: If session user ID matches current profile ID, skip fetch
                    // This prevents double-loading when token refreshes or on re-focus
                    if (currentProfile && currentSession?.user.id === session.user.id) {
                        console.log("Session refreshed for same user, skipping profile fetch.");
                        set({ session, loading: false }); // Update session (e.g. new token) but keep profile
                        return;
                    }

                    console.log("Fetching profile for:", session.user.id);
                    const { data: profile, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (error) {
                        console.error("Profile fetch error:", error);
                        // Session exists but profile failed. 
                        set({ session, profile: null, loading: false });
                    } else {
                        console.log("Profile fetched successfully.");
                        set({ session, profile: profile as Profile, loading: false });
                    }
                } else {
                    console.log("No session found.");
                    set({ session: null, profile: null, loading: false });
                }
            } catch (error: any) {
                if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
                    return;
                }
                console.error("Auth change error:", error);
                set({ loading: false });
            }
        });
    },

    signOut: async () => {
        try {
            await supabase.auth.signOut();
        } finally {
            // Force reset everything
            set({ session: null, profile: null, loading: false });
        }
    },
}));
