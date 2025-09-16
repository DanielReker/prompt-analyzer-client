import { Box } from '@mui/material';
import { ReactNode } from 'react';
import LeftSidebar from './LeftSidebar';

interface BaseLayoutProps {
    name: string;
    onLogout: () => void;
    children: ReactNode;
}

export default function BaseLayout({ name, onLogout, children }: BaseLayoutProps) {
    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <LeftSidebar 
                userName={name}
                onLogout={onLogout}
            />
            <Box sx={{ 
                flexGrow: 1, 
                // No left margin on mobile (sidebar slides over content)
                // Left margin on desktop to account for fixed sidebar
                ml: { xs: 0, md: '280px' },
                // Top padding on mobile to account for hamburger menu
                pt: { xs: '80px', md: 0 },
                minHeight: '100vh',
                transition: 'margin-left 0.3s ease-in-out'
            }}>
                {children}
            </Box>
        </Box>
    );
} 