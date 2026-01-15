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
        set({ initialized: true, loading: true });

        // Safety timeout: stop loading after 5 seconds if auth doesn't respond
        setTimeout(() => {
            if (get().loading) {
                console.warn("Auth initialization timed out, forcing load completion.");
                set({ loading: false });
            }
        }, 5000);

        // Listen for changes
        // "onAuthStateChange" fires immediately with the initial session, 
        // so we don't need a separate getSession call (which causes AbortErrors).
        supabase.auth.onAuthStateChange(async (_event, session) => {
            console.log("Auth state changed:", _event, session?.user?.id);
            try {
                if (session) {
                    console.log("Fetching profile for:", session.user.id);
                    const { data: profile, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (error) {
                        console.error("Profile fetch error:", error);
                        // If fetching profile fails, we still have a session, but no profile
                        // We must set loading to false
                        set({ session, profile: null, loading: false });
                    } else {
                        console.log("Profile fetched:", profile);
                        set({ session, profile: profile as Profile, loading: false });
                    }
                } else {
                    console.log("No session.");
                    set({ session: null, profile: null, loading: false });
                }
            } catch (error) {
                console.error("Auth change error (caught):", error);
                set({ loading: false });

                if (session) {
                    set({ session });
                } else {
                    set({ session: null, profile: null });
                }
            }
        });
    },

    signOut: async () => {
        await supabase.auth.signOut();
        set({ session: null, profile: null });
    },
}));
