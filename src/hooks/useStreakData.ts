// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { API_BASE } from '../config';
// import { SecureAuth } from '../components/SecureAuth';

// export interface StreakData {
//     currentStreak: number;
//     longestStreak: number;
//     lastActivity: string | null;
//     isActiveToday: boolean;
//     completedTasks: number;
//     totalTasks: number;
//     streakPercentage: number;
// }

// interface CachedStreakData extends StreakData {
//     timestamp: number;
//     userId: string;
// }

// const CACHE_KEY = 'ppa_streak_cache';
// const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// const getCachedStreakData = (userId: string): StreakData | null => {
//     try {
//         const cached = localStorage.getItem(CACHE_KEY);
//         if (!cached) return null;

//         const parsedCache: CachedStreakData = JSON.parse(cached);
        
//         // Check if cache is for the same user and still valid
//         if (parsedCache.userId !== userId) {
//             localStorage.removeItem(CACHE_KEY);
//             return null;
//         }

//         const now = Date.now();
//         if (now - parsedCache.timestamp > CACHE_DURATION) {
//             localStorage.removeItem(CACHE_KEY);
//             return null;
//         }

//         // Return the streak data without the cache metadata
//         // eslint-disable-next-line @typescript-eslint/no-unused-vars
//         const { timestamp: _ts, userId: _uid, ...streakData } = parsedCache;
//         return streakData;
//     } catch (error) {
//         console.warn('Failed to read streak cache:', error);
//         localStorage.removeItem(CACHE_KEY);
//         return null;
//     }
// };

// const setCachedStreakData = (userId: string, streakData: StreakData): void => {
//     try {
//         const cacheData: CachedStreakData = {
//             ...streakData,
//             timestamp: Date.now(),
//             userId
//         };
//         localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
//     } catch (error) {
//         console.warn('Failed to cache streak data:', error);
//     }
// };

// export const useStreakData = () => {
//     const [streakData, setStreakData] = useState<StreakData | null>(null);
//     const [loading, setLoading] = useState(false); // Start with false since we'll try cache first
//     const [error, setError] = useState<string | null>(null);
//     const [currentUserId, setCurrentUserId] = useState<string | null>(null);

//     const fetchStreakData = async (useCache = true) => {
//         try {
//             const authData = SecureAuth.getAuth();
//             if (!authData) {
//                 console.warn('🔐 No auth data found for streak fetch');
//                 setError('User not authenticated');
//                 setStreakData(null);
//                 setCurrentUserId(null);
//                 setLoading(false);
//                 return;
//             }

//             // Check if user has changed
//             if (currentUserId && currentUserId !== authData.userId) {
//                 console.log('👤 User changed, clearing previous streak data');
//                 setStreakData(null);
//                 localStorage.removeItem(CACHE_KEY);
//             }

//             setCurrentUserId(authData.userId);

//             // Try to load from cache first
//             if (useCache) {
//                 const cachedData = getCachedStreakData(authData.userId);
//                 if (cachedData) {
//                     console.log('📊 Loading streak data from cache:', cachedData);
//                     setStreakData(cachedData);
//                     setError(null);
//                     setLoading(false);
                    
//                     // Continue to fetch fresh data in background without showing loading
//                     fetchFreshData(authData.userId);
//                     return;
//                 }
//             }

//             // No cache available, show loading and fetch
//             setLoading(true);
//             await fetchFreshData(authData.userId);

//         } catch (err) {
//             console.error('❌ Error in fetchStreakData:', err);
//             setError('Failed to load streak data');
//             setLoading(false);
            
//             // Set default data on error
//             setStreakData({
//                 currentStreak: 0,
//                 longestStreak: 0,
//                 lastActivity: null,
//                 isActiveToday: false,
//                 completedTasks: 0,
//                 totalTasks: 0,
//                 streakPercentage: 0
//             });
//         }
//     };

//     const fetchFreshData = async (userId: string) => {
//         try {
//             setError(null);
//             console.log('📊 Fetching fresh streak data for user:', userId);

//             // Fetch streak data
//             const [streakResponse, completedTasksResponse] = await Promise.all([
//                 axios.get(`${API_BASE}/users/${userId}/streak`),
//                 axios.get(`${API_BASE}/users/${userId}/completed-tasks`)
//             ]);

//             console.log('🏆 Fresh Streak API Response:', streakResponse.data);
//             console.log('✅ Fresh Completed Tasks API Response:', completedTasksResponse.data);

//             const streak = streakResponse.data.data || {
//                 currentStreak: 0,
//                 longestStreak: 0,
//                 lastActivity: null,
//                 isActiveToday: false
//             };

//             const completedTasks = completedTasksResponse.data.data || [];
//             const completedCount = Array.isArray(completedTasks) ? completedTasks.length : 0;

//             // Calculate streak percentage (current vs longest)
//             const streakPercentage = streak.longestStreak > 0 
//                 ? Math.round((streak.currentStreak / streak.longestStreak) * 100)
//                 : 0;

//             const newStreakData = {
//                 currentStreak: streak.currentStreak || 0,
//                 longestStreak: streak.longestStreak || 0,
//                 lastActivity: streak.lastActivity,
//                 isActiveToday: streak.isActiveToday || false,
//                 completedTasks: completedCount,
//                 totalTasks: 0, // We can calculate this if needed
//                 streakPercentage
//             };

//             console.log('📈 Setting fresh streak data:', newStreakData);
//             setStreakData(newStreakData);
            
//             // Cache the fresh data
//             setCachedStreakData(userId, newStreakData);

//         } catch (err) {
//             console.error('❌ Error fetching fresh streak data:', err);
            
//             // Only set error if we don't have cached data already
//             if (!streakData) {
//                 setError('Failed to load streak data');
//                 setStreakData({
//                     currentStreak: 0,
//                     longestStreak: 0,
//                     lastActivity: null,
//                     isActiveToday: false,
//                     completedTasks: 0,
//                     totalTasks: 0,
//                     streakPercentage: 0
//                 });
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchStreakData();
//     }, []); // Initial fetch

//     // Add a periodic check to detect user changes
//     useEffect(() => {
//         const checkUserChange = () => {
//             const authData = SecureAuth.getAuth();
//             const newUserId = authData?.userId || null;
            
//             if (currentUserId !== newUserId) {
//                 console.log('🔄 User change detected, refreshing streak data');
//                 fetchStreakData();
//             }
//         };

//         // Check for user changes every 2 seconds
//         const interval = setInterval(checkUserChange, 2000);
        
//         return () => clearInterval(interval);
//     }, [currentUserId]);

//     const refreshStreakData = async () => {
//         console.log('🔄 Refreshing streak data...');
//         setLoading(true);
//         const authData = SecureAuth.getAuth();
//         if (!authData) {
//             setLoading(false);
//             return;
//         }

//         try {
//             // First, sync the streak to ensure backend is up to date
//             console.log('🔄 Syncing streak with backend...');
//             await axios.post(`${API_BASE}/users/${authData.userId}/sync-streak`);
            
//             // Then fetch fresh data
//             await fetchFreshData(authData.userId);
            
//             console.log('✅ Streak data refreshed successfully');
//         } catch (error) {
//             console.error('❌ Error refreshing streak data:', error);
//             // Fallback to regular fetch if sync fails
//             await fetchFreshData(authData.userId);
//         }
//     };

//     // Clear cache when user signs out (optional utility)
//     const clearStreakCache = () => {
//         localStorage.removeItem(CACHE_KEY);
//     };

//     return {
//         streakData,
//         loading,
//         error,
//         refreshStreakData,
//         clearStreakCache
//     };
// };

// export default useStreakData;

import { useState, useEffect, useCallback } from 'react';
import { SecureAuth } from '../components/SecureAuth';

export interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastActivity: string | null;
    isActiveToday: boolean;
    completedTasks: number;
    totalTasks: number;
    streakPercentage: number;
}

interface CachedStreakData extends StreakData {
    timestamp: number;
    userId: string;
}

const CACHE_KEY = 'ppa_streak_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedStreakData = (userId: string): StreakData | null => {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;

        const parsedCache: CachedStreakData = JSON.parse(cached);
        
        if (parsedCache.userId !== userId) {
            localStorage.removeItem(CACHE_KEY);
            return null;
        }

        const now = Date.now();
        if (now - parsedCache.timestamp > CACHE_DURATION) {
            localStorage.removeItem(CACHE_KEY);
            return null;
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { timestamp, userId: cachedUserId, ...streakData } = parsedCache;
        return streakData;
    } catch (error) {
        console.warn('Failed to read streak cache:', error);
        localStorage.removeItem(CACHE_KEY);
        return null;
    }
};

const setCachedStreakData = (userId: string, streakData: StreakData): void => {
    try {
        const cacheData: CachedStreakData = {
            ...streakData,
            timestamp: Date.now(),
            userId
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
        console.warn('Failed to cache streak data:', error);
    }
};

const generateMockStreakData = (userId: string): StreakData => {
    const userIdHash = userId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const currentStreak = (userIdHash % 14) + 1;
    const longestStreak = Math.max(currentStreak, (userIdHash % 30) + 5);
    const completedTasks = (userIdHash % 50) + 10;
    
    return {
        currentStreak,
        longestStreak,
        lastActivity: new Date().toISOString(),
        isActiveToday: true,
        completedTasks,
        totalTasks: completedTasks + (userIdHash % 10),
        streakPercentage: Math.round((currentStreak / longestStreak) * 100)
    };
};

export const useStreakData = () => {
    const [streakData, setStreakData] = useState<StreakData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const fetchStreakData = useCallback(async (useCache = true) => {
        try {
            const authData = SecureAuth.getAuth();
            if (!authData) {
                console.warn('No auth data found for streak fetch');
                setError('User not authenticated');
                setStreakData(null);
                setCurrentUserId(null);
                setLoading(false);
                return;
            }

            if (currentUserId && currentUserId !== authData.userId) {
                console.log('User changed, clearing previous streak data');
                setStreakData(null);
                localStorage.removeItem(CACHE_KEY);
            }

            setCurrentUserId(authData.userId);

            if (useCache) {
                const cachedData = getCachedStreakData(authData.userId);
                if (cachedData) {
                    console.log('Loading streak data from cache:', cachedData);
                    setStreakData(cachedData);
                    setError(null);
                    setLoading(false);
                    return;
                }
            }

            setLoading(true);
            console.log('Generating mock streak data for user:', authData.userId);
            
            setTimeout(() => {
                const mockData = generateMockStreakData(authData.userId);
                console.log('Mock streak data generated:', mockData);
                
                setStreakData(mockData);
                setError(null);
                setCachedStreakData(authData.userId, mockData);
                setLoading(false);
            }, 500);

        } catch (err) {
            console.error('Error in fetchStreakData:', err);
            setError('Failed to load streak data');
            setLoading(false);
            
            const authData = SecureAuth.getAuth();
            if (authData) {
                const fallbackData = generateMockStreakData(authData.userId);
                setStreakData(fallbackData);
            }
        }
    }, [currentUserId]);

    useEffect(() => {
        fetchStreakData();
    }, [fetchStreakData]);

    useEffect(() => {
        const checkUserChange = () => {
            const authData = SecureAuth.getAuth();
            const newUserId = authData?.userId || null;
            
            if (currentUserId !== newUserId) {
                console.log('User change detected, refreshing streak data');
                fetchStreakData();
            }
        };

        const interval = setInterval(checkUserChange, 2000);
        return () => clearInterval(interval);
    }, [currentUserId, fetchStreakData]);

    const refreshStreakData = useCallback(async () => {
        console.log('Refreshing streak data...');
        setLoading(true);
        const authData = SecureAuth.getAuth();
        if (!authData) {
            setLoading(false);
            return;
        }

        try {
            const currentData = streakData || generateMockStreakData(authData.userId);
            const updatedData = {
                ...currentData,
                currentStreak: currentData.currentStreak + 1,
                longestStreak: Math.max(currentData.longestStreak, currentData.currentStreak + 1),
                completedTasks: currentData.completedTasks + 1,
                isActiveToday: true,
                lastActivity: new Date().toISOString()
            };
            
            updatedData.streakPercentage = Math.round((updatedData.currentStreak / updatedData.longestStreak) * 100);
            
            console.log('Mock streak data updated:', updatedData);
            setStreakData(updatedData);
            setCachedStreakData(authData.userId, updatedData);
            setLoading(false);
            
        } catch (error) {
            console.error('Error refreshing streak data:', error);
            setLoading(false);
        }
    }, [streakData]);

    const clearStreakCache = useCallback(() => {
        localStorage.removeItem(CACHE_KEY);
        console.log('Streak cache cleared');
    }, []);

    return {
        streakData,
        loading,
        error,
        refreshStreakData,
        clearStreakCache
    };
};

export default useStreakData;