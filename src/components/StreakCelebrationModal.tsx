import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Fade,
  Slide,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Close as CloseIcon,
  LocalFireDepartment as FireIcon,
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingIcon,
  WhatsApp,
  Twitter,
  Facebook
} from '@mui/icons-material';
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

interface CelebrationModalProps {
  open: boolean;
  onClose: () => void;
  taskScore: number;
  streakData: StreakData | null;
  taskName: string;
  isNewStreakRecord?: boolean;
  onShareStreak?: () => void;
  onNextChallenge?: () => void;
}

const StreakCelebrationModal: React.FC<CelebrationModalProps> = ({
  open,
  onClose,
  taskScore,
  streakData,
  taskName,
  isNewStreakRecord = false,
  onNextChallenge
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [showConfetti, setShowConfetti] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      // Animate in steps
      const timer1 = setTimeout(() => setAnimationStep(1), 300);
      const timer2 = setTimeout(() => setAnimationStep(2), 600);
      const timer3 = setTimeout(() => setAnimationStep(3), 900);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [open]);

  const getStreakEmoji = (streak: number) => {
    if (streak === 0) return "🥶";
    if (streak < 3) return "🔥";
    if (streak < 7) return "🔥🔥";
    if (streak < 14) return "🔥🔥🔥";
    if (streak < 30) return "🔥🔥🔥🔥";
    return "🔥🔥🔥🔥🔥";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getStreakTitle = (streak: number) => {
    if (streak === 1) return "🎉 Great Start!";
    if (streak < 7) return "🔥 Building Momentum!";
    if (streak < 14) return "🚀 On Fire!";
    if (streak < 30) return "⚡ Unstoppable!";
    return "👑 Legendary Streak!";
  };

  const getStreakMessage = (streak: number) => {
    if (streak === 1) return "You've started your journey! Keep going to build an amazing streak.";
    if (streak < 7) return "You're building great habits! Each day makes you stronger.";
    if (streak < 14) return "Your consistency is paying off! You're becoming a prompt master.";
    if (streak < 30) return "Incredible dedication! Your skills are reaching new heights.";
    return "You're absolutely incredible! This is legendary consistency.";
  };

  const shareText = `🔥 Just completed "${taskName}" and scored ${taskScore}%! \n\nMy current streak: ${streakData?.currentStreak || 0} days! \n\nJoin me on Prompt Pal! 💪`;

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(shareText)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`
  };

  if (!streakData) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }
      }}
    >
      {/* Confetti Animation */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              zIndex: 1
            }}
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  y: -50, 
                  x: Math.random() * 400, 
                  rotate: 0,
                  opacity: 1 
                }}
                animate={{ 
                  y: 600, 
                  rotate: 360,
                  opacity: 0 
                }}
                transition={{ 
                  duration: 3, 
                  delay: Math.random() * 2,
                  ease: "easeOut" 
                }}
                style={{
                  position: 'absolute',
                  fontSize: '20px',
                  color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][i % 5]
                }}
              >
                {['🎉', '⭐', '🔥', '🏆', '💫'][i % 5]}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <DialogContent sx={{ p: 0, position: 'relative', zIndex: 2 }}>
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: 'white',
            zIndex: 3,
            bgcolor: 'rgba(255,255,255,0.1)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box sx={{ p: 3, textAlign: 'center', pt: 5 }}>
          {/* Main Celebration Header */}
          <Slide direction="down" in={animationStep >= 0} mountOnEnter>
            <Box sx={{ mb: 3 }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  delay: 0.2,
                  type: "spring",
                  stiffness: 200,
                  damping: 10 
                }}
              >
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                  🎊 Challenge Complete! 🎊
                </Typography>
              </motion.div>
              
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                {taskName}
              </Typography>

              {/* Score Display */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.15)',
                    border: '3px solid rgba(255,255,255,0.3)',
                    mb: 3
                  }}
                >
                  <Typography variant="h2" fontWeight="bold" color={getScoreColor(taskScore)}>
                    {taskScore}%
                  </Typography>
                </Box>
              </motion.div>
            </Box>
          </Slide>

          {/* Streak Section */}
          <Fade in={animationStep >= 1}>
            <Card 
              sx={{ 
                mb: 3, 
                bgcolor: 'rgba(255,255,255,0.1)', 
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                  >
                    <Typography variant="h2" sx={{ mr: 2 }}>
                      {getStreakEmoji(streakData.currentStreak)}
                    </Typography>
                  </motion.div>
                  <Box textAlign="left">
                    <Typography variant="h4" fontWeight="bold" color="white">
                      {streakData.currentStreak}
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.8)">
                      Day Streak
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                  {getStreakTitle(streakData.currentStreak)}
                </Typography>
                
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                  {getStreakMessage(streakData.currentStreak)}
                </Typography>

                {/* New Record Badge */}
                {isNewStreakRecord && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, type: "spring" }}
                  >
                    <Chip
                      icon={<TrophyIcon />}
                      label="🏆 NEW RECORD!"
                      sx={{
                        bgcolor: '#FFD700',
                        color: '#1a1a1a',
                        fontWeight: 'bold',
                        mb: 2
                      }}
                    />
                  </motion.div>
                )}

                {/* Progress to Next Milestone */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Progress to {Math.ceil((streakData.currentStreak + 1) / 7) * 7} days
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(streakData.currentStreak % 7) * (100 / 7)}
                    sx={{
                      mt: 1,
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: '#FFD700',
                        borderRadius: 4
                      }
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Fade>

          {/* Stats Row */}
          <Fade in={animationStep >= 2}>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Card sx={{ flex: 1, bgcolor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <CardContent sx={{ p: 2, textAlign: 'center' }}>
                  <TrendingIcon sx={{ fontSize: 32, mb: 1, color: '#4ECDC4' }} />
                  <Typography variant="h6" fontWeight="bold">
                    {streakData.longestStreak}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Best Streak
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ flex: 1, bgcolor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <CardContent sx={{ p: 2, textAlign: 'center' }}>
                  <TrophyIcon sx={{ fontSize: 32, mb: 1, color: '#FFD700' }} />
                  <Typography variant="h6" fontWeight="bold">
                    {streakData.completedTasks}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Total Tasks
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Fade>

          {/* Action Buttons */}
          <Fade in={animationStep >= 3}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Share Section */}
              <Box>
                <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                  Share your achievement:
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
                  <IconButton
                    onClick={() => window.open(shareUrls.twitter, '_blank')}
                    sx={{ 
                      bgcolor: '#1DA1F2', 
                      color: 'white',
                      '&:hover': { bgcolor: '#1a91da' }
                    }}
                  >
                    <Twitter />
                  </IconButton>
                  <IconButton
                    onClick={() => window.open(shareUrls.facebook, '_blank')}
                    sx={{ 
                      bgcolor: '#4267B2', 
                      color: 'white',
                      '&:hover': { bgcolor: '#365899' }
                    }}
                  >
                    <Facebook />
                  </IconButton>
                  <IconButton
                    onClick={() => window.open(shareUrls.whatsapp, '_blank')}
                    sx={{ 
                      bgcolor: '#25D366', 
                      color: 'white',
                      '&:hover': { bgcolor: '#20b954' }
                    }}
                  >
                    <WhatsApp />
                  </IconButton>
                </Box>
              </Box>

              {/* Main Actions */}
              <Button
                variant="contained"
                size="large"
                onClick={onNextChallenge}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontWeight: 'bold',
                  py: 1.5,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)'
                  }
                }}
                startIcon={<FireIcon />}
              >
                Continue Streak - Next Challenge!
              </Button>

              <Button
                variant="outlined"
                onClick={onClose}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.5)',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Close
              </Button>
            </Box>
          </Fade>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default StreakCelebrationModal;