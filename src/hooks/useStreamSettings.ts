import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useStreamSettings = () => {
    // Default fallback to test stream
    const [streamUrl, setStreamUrl] = useState<string>('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();

        // Subscribe to changes
        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'app_settings',
                    filter: 'key=eq.stream_url',
                },
                (payload) => {
                    console.log('Stream URL updated:', payload.new.value);
                    setStreamUrl(payload.new.value);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('app_settings')
                .select('value')
                .eq('key', 'stream_url')
                .single();

            if (data) {
                setStreamUrl(data.value);
            } else if (error && error.code !== 'PGRST116') {
                console.error('Error fetching stream settings:', error);
            }
        } catch (err) {
            console.error('Unexpected error fetching settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStreamUrl = async (newUrl: string) => {
        try {
            const { error } = await supabase
                .from('app_settings')
                .upsert({ key: 'stream_url', value: newUrl, updated_at: new Date().toISOString() });

            if (error) throw error;
            setStreamUrl(newUrl); // Optimistic update
            return { error: null };
        } catch (error: any) {
            console.error('Error updating stream url:', error);
            return { error };
        }
    };

    return { streamUrl, loading, updateStreamUrl };
};
