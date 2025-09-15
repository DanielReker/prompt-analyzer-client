import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, Box, Typography, Chip, useTheme, useMediaQuery } from '@mui/material';
import { LocalFireDepartment as FireIcon, TrendingUp as TrendingIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivity: string | null;
  isActiveToday: boolean;
  completedTasks: number;
  totalTasks: number;
  streakPercentage: number;
}

interface QuickStreakNotificationProps {
  open: boolean;
  onClose: () => void;
  streakData: StreakData | null;
  taskScore: number;
  isNewRecord?: boolean;
  autoHideDuration?: number;
}

const QuickStreakNotification: React.FC<QuickStreakNotificationProps> = ({
  open,
  onClose,
  streakData,
  taskScore,
  isNewRecord = false,
  autoHideDuration = 4000
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    if (open && (isNewRecord || (streakData?.currentStreak && streakData.currentStreak % 7 === 0))) {
      setShowFireworks(true);
      const timer = setTimeout(() => setShowFireworks(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [open, isNewRecord, streakData]);

  const getStreakEmoji = (streak: number) => {
    if (streak === 0) return "🥶";
    if (streak < 3) return "🔥";
    if (streak < 7) return "🔥🔥";
    if (streak < 14) return "🔥🔥🔥";
    if (streak < 30) return "🔥🔥🔥🔥";
    return "🔥🔥🔥🔥🔥";
  };

  const getStreakMessage = (streak: number, score: number) => {
    if (isNewRecord) {
      return `🏆 New Record! ${streak} day streak!`;
    }
    if (streak === 1) {
      return `🎉 Great start! Day ${streak} - keep it going!`;
    }
    if (streak % 7 === 0) {
      return `🚀 ${streak} days! You're on fire!`;
    }
    if (score >= 90) {
      return `⭐ Excellent! Day ${streak} complete!`;
    }
    if (score >= 80) {
      return `👏 Great job! Day ${streak} done!`;
    }
    return `💪 Day ${streak} complete - keep building!`;
  };

  const getStreakColor = (streak: number) => {
    if (streak === 0) return theme.palette.info.main;
    if (streak < 7) return theme.palette.error.main;
    if (streak < 14) return theme.palette.warning.main;
    if (streak < 30) return theme.palette.success.main;
    return theme.palette.primary.main;
  };

  if (!streakData) return null;

  return (
    <>
      {/* Fireworks Effect */}
      <AnimatePresence>
        {showFireworks && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              zIndex: 9999
            }}
          >
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  scale: 0,
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  opacity: 1
                }}
                animate={{ 
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: 2,
                  delay: Math.random() * 1,
                  ease: "easeOut"
                }}
                style={{
                  position: 'absolute',
                  fontSize: '24px',
                  color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][i % 5]
                }}
              >
                {['🎉', '⭐', '🔥', '🏆', '💫', '✨'][i % 6]}
              </motion.div>
            ))}
          </Box>
        )}
      </AnimatePresence>

      <Snackbar
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={onClose}
        anchorOrigin={{ 
          vertical: isMobile ? 'top' : 'bottom', 
          horizontal: 'center' 
        }}
        sx={{
          '& .MuiSnackbar-root': {
            position: 'fixed',
            zIndex: 9998
          }
        }}
      >
        <Alert
          onClose={onClose}
          severity="success"
          variant="filled"
          sx={{
            background: `linear-gradient(135deg, ${getStreakColor(streakData.currentStreak)}, ${getStreakColor(streakData.currentStreak)}88)`,
            color: 'white',
            borderRadius: 3,
            minWidth: isMobile ? '90vw' : '400px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            '& .MuiAlert-icon': {
              color: 'white'
            },
            '& .MuiAlert-action': {
              color: 'white'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <motion.div
              animate={{ 
                scale: [1, 1.3, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 1.5,
                repeat: 2
              }}
            >
              <Typography variant="h5">
                {getStreakEmoji(streakData.currentStreak)}
              </Typography>
            </motion.div>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}>
                {getStreakMessage(streakData.currentStreak, taskScore)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.8rem', md: '0.9rem' } }}>
                Score: {taskScore}% • Total tasks: {streakData.completedTasks}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              icon={<FireIcon sx={{ fontSize: '16px !important' }} />}
              label={`${streakData.currentStreak} days`}
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 'bold',
                '& .MuiChip-icon': {
                  color: 'white'
                }
              }}
            />
            
            {isNewRecord && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                <Chip
                  icon={<TrendingIcon sx={{ fontSize: '16px !important' }} />}
                  label="NEW RECORD!"
                  size="small"
                  sx={{
                    bgcolor: '#FFD700',
                    color: '#1a1a1a',
                    fontWeight: 'bold',
                    '& .MuiChip-icon': {
                      color: '#1a1a1a'
                    }
                  }}
                />
              </motion.div>
            )}
            
            {streakData.currentStreak > 0 && streakData.currentStreak === streakData.longestStreak && !isNewRecord && (
              <Chip
                label="Matching best!"
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            )}
          </Box>
        </Alert>
      </Snackbar>
    </>
  );
};

export default QuickStreakNotification;