import { useState, useEffect, useCallback } from 'react';
import { School, PlatformConfig } from '../types.ts';
import { getSchools } from '../services/schoolService.ts';
import { getPlatformConfig, updatePlatformConfig as updatePlatformConfigService } from '../services/platformService.ts';

const useSchoolData = () => {
    const [schools, setSchools] = useState<School[]>([]);
    const [platformConfig, setPlatformConfig] = useState<PlatformConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [schoolsData, platformConfigData] = await Promise.all([
                getSchools(),
                getPlatformConfig()
            ]);
            setSchools(schoolsData);
            setPlatformConfig(platformConfigData);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to load initial application data. ${errorMessage}`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updatePlatformConfig = useCallback(async (action: React.SetStateAction<PlatformConfig>) => {
        setIsLoading(true);
        setError(null);
        const newConfig = action instanceof Function ? action(platformConfig!) : action;
        if (!newConfig) {
            setIsLoading(false);
            return;
        };
        
        try {
            const updatedConfig = await updatePlatformConfigService(newConfig);
            setPlatformConfig(updatedConfig);
            return updatedConfig;
        } catch (err) {
             const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
             setError(`Failed to save configuration. ${errorMessage}`);
             console.error(err);
             throw err; // Re-throw so the caller knows it failed
        } finally {
            setIsLoading(false);
        }
    }, [platformConfig]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { schools, platformConfig, isLoading, error, refreshData: fetchData, updatePlatformConfig };
};

export default useSchoolData;