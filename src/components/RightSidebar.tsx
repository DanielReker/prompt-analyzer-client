import { Box, Paper, Typography/*, Button*/ } from '@mui/material';
import React from 'react';

const RightSidebar: React.FC = () => {
    return (
        <Box sx={{
            width: { xs: '100%', md: 300 },
            bgcolor: 'background.paper',
            height: { xs: 'auto', md: '100vh' },
            borderLeft: { xs: 'none', md: '1px solid #eee' },
            position: { xs: 'relative', md: 'fixed' },
            right: 0,
            top: 0,
            zIndex: 1000,
            p: 0,
            boxShadow: { xs: 0, md: 2 }
        }}>
            <Box sx={{ 
                p: { xs: 2, md: 3 },
                display: { xs: 'none', md: 'block' }
            }}>
                <Paper elevation={2} sx={{ 
                    p: { xs: 1.5, md: 2 }, 
                    mb: { xs: 2, md: 3 }, 
                    borderRadius: 1, 
                    bgcolor: '#f5faff' 
                }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ 
                        mb: 1,
                        fontSize: { xs: '0.9rem', md: '1rem' }
                    }}>
                        How It Works
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{
                        fontSize: { xs: '0.8rem', md: '0.875rem' }
                    }}>
                        1. Complete daily challenges.<br/>
                        2. Improve your prompts.<br/>
                        3. Earn gems and track your progress!
                    </Typography>
                </Paper>
            </Box>
        </Box>
    );
};

export default RightSidebar; 