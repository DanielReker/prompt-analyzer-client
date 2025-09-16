import React, { createContext, useContext, ReactNode } from 'react';
import { useStreakData, StreakData } from '../hooks/useStreakData';

interface StreakContextType {
    streakData: StreakData | null;
    loading: boolean;
    error: string | null;
    refreshStreakData: () => void;
}

const StreakContext = createContext<StreakContextType | undefined>(undefined);

interface StreakProviderProps {
    children: ReactNode;
}

export const StreakProvider: React.FC<StreakProviderProps> = ({ children }) => {
    const streakHook = useStreakData();

    return (
        <StreakContext.Provider value={streakHook}>
            {children}
        </StreakContext.Provider>
    );
};

export const useStreak = () => {
    const context = useContext(StreakContext);
    if (context === undefined) {
        throw new Error('useStreak must be used within a StreakProvider');
    }
    return context;
};

export default StreakContext; 