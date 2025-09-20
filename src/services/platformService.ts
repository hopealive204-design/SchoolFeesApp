import { getSupabase } from '../supabaseClient.ts';
import { PlatformConfig } from '../types.ts';
import { mockPlatformConfig } from './mockData.ts';

// In-memory store for offline mode
let offlinePlatformConfig = JSON.parse(JSON.stringify(mockPlatformConfig));

export const getPlatformConfig = async (): Promise<PlatformConfig> => {
    const supabase = getSupabase();
    if (!supabase) {
        console.log("Running in offline mode. Returning mock platform config.");
        return Promise.resolve(JSON.parse(JSON.stringify(offlinePlatformConfig)));
    }
    const { data, error } = await supabase.from('platform_config').select('data').limit(1).single();
    if (error) throw new Error("Failed to load platform configuration.");
    return data.data as PlatformConfig;
};

export const updatePlatformConfig = async (newConfig: PlatformConfig): Promise<PlatformConfig> => {
    const supabase = getSupabase();
    if (!supabase) {
        console.log("Offline mode: Updating platform config.");
        offlinePlatformConfig = newConfig;
        return offlinePlatformConfig;
    }
    const { data, error } = await supabase.from('platform_config').update({ data: newConfig }).eq('id', 1).select().single();
    if (error) throw error;
    return data.data as PlatformConfig;
};